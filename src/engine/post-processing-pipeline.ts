import * as THREE from 'three';

export type GraphicsQualityPreset = 'ultra' | 'balanced' | 'performance';

export interface GraphicsSettingsState {
  readonly quality: GraphicsQualityPreset;
  readonly motionBlurEnabled: boolean;
  readonly motionBlurStrength: number;
  readonly ambientOcclusionEnabled: boolean;
  readonly bloomEnabled: boolean;
  readonly pixelRatio: number;
}

const POST_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const POST_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform sampler2D tColor;
  uniform sampler2D tDepth;

  uniform vec2 uResolution;
  uniform vec2 uTexelSize;
  uniform float uNear;
  uniform float uFar;
  uniform float uIsOrtho;
  uniform float uExposure;

  uniform mat4 uCurrInvViewProj;
  uniform mat4 uPrevViewProj;
  uniform float uMotionBlurEnabled;
  uniform float uShutterScale;
  uniform float uAoIntensity;
  uniform float uBloomIntensity;
  uniform float uSharpenIntensity;

  varying vec2 vUv;

  float interleavedGradientNoise(vec2 screenPos) {
    vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
    return fract(magic.z * fract(dot(screenPos, magic.xy)));
  }

  float readLinearDepth(vec2 uv) {
    float d = texture2D(tDepth, clamp(uv, 0.0, 1.0)).r;
    if (uIsOrtho > 0.5) {
      return mix(uNear, uFar, d);
    }
    float zNdc = d * 2.0 - 1.0;
    return (2.0 * uNear * uFar) / max(1e-5, uFar + uNear - zNdc * (uFar - uNear));
  }

  vec3 acesFilmicToneMapping(vec3 color, float exposure) {
    const mat3 ACESInputMat = mat3(
      vec3(0.59719, 0.07600, 0.02840),
      vec3(0.35458, 0.90834, 0.13383),
      vec3(0.04823, 0.01566, 0.83777)
    );
    const mat3 ACESOutputMat = mat3(
      vec3( 1.60475, -0.10208, -0.00327),
      vec3(-0.53108,  1.10813, -0.07276),
      vec3(-0.07367, -0.00605,  1.07602)
    );
    vec3 exposed = color * exposure;
    float peak = max(exposed.r, max(exposed.g, exposed.b));
    float minCh = min(exposed.r, min(exposed.g, exposed.b));
    float chroma = (peak - minCh) / max(0.001, peak);
    vec3 pureHue = exposed / max(0.001, peak);

    vec3 aces = ACESInputMat * exposed;
    vec3 a = aces * (aces + 0.0245786) - 0.000090537;
    vec3 b = aces * (0.983729 * aces + 0.4329510) + 0.238081;
    aces = clamp(ACESOutputMat * (a / b), 0.0, 1.0);

    // Preserve rich multi-colored chroma on bright emissive fairy lights & practicals
    // while giving the very center of intense bulbs a subtle warm-bright filament core
    float emissiveChromaWeight = smoothstep(0.52, 0.88, chroma) * smoothstep(0.95, 1.85, peak);
    vec3 vividEmissive = mix(pureHue * min(1.0, peak * 0.82), vec3(1.0, 0.97, 0.92), 0.22);
    return clamp(mix(aces, vividEmissive, emissiveChromaWeight * 0.68), 0.0, 1.0);
  }

  vec3 linearToSrgb(vec3 value) {
    return mix(
      pow(max(value, vec3(0.0)), vec3(0.41666)) * 1.055 - vec3(0.055),
      value * 12.92,
      vec3(lessThanEqual(value, vec3(0.0031308)))
    );
  }

  // Smooth deterministic symmetric-pair depth curvature AO (zero screen-space dithering)
  float computeContactAO(vec2 uv, float centerLinZ, float noise) {
    if (uAoIntensity <= 0.001 || centerLinZ >= 38.0) {
      return 1.0;
    }

    float radiusPx = clamp(22.0 / max(1.4, centerLinZ), 2.0, 12.0);
    vec2 aspectStep = uTexelSize * radiusPx;
    float occlusion = 0.0;

    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float angle = fi * 0.52359878; // 30-degree symmetric pairs covering 180 degrees
      float ringScale = (i == 0 || i == 2 || i == 4) ? 0.55 : 1.0;
      vec2 dir = vec2(cos(angle), sin(angle)) * aspectStep * ringScale;

      float zPlus = readLinearDepth(uv + dir);
      float zMinus = readLinearDepth(uv - dir);

      float pairAvgZ = 0.5 * (zPlus + zMinus);
      float delta = centerLinZ - pairAvgZ;
      float maxSpan = max(abs(zPlus - centerLinZ), abs(zMinus - centerLinZ));

      float rangeCheck = smoothstep(0.68, 0.08, maxSpan);
      float crease = smoothstep(0.018, 0.20, delta) * rangeCheck;
      occlusion += crease;
    }

    float distanceFade = 1.0 - smoothstep(26.0, 38.0, centerLinZ);
    float ao = 1.0 - (occlusion / 6.0) * 0.85 * uAoIntensity * distanceFade;
    return clamp(ao, 0.58, 1.0);
  }

  vec3 extractBrightHighlight(vec2 uv) {
    vec3 c = texture2D(tColor, clamp(uv, 0.0, 1.0)).rgb;
    float peak = max(c.r, max(c.g, c.b));
    float minCh = min(c.r, min(c.g, c.b));
    float chroma = (peak - minCh) / max(0.001, peak);
    // Saturated emissives (fairy lights, star topper, neon) bloom at a lower threshold
    // while neutral snow & painted flats require high intensity so they never blow out
    float lowKnee = mix(1.90, 1.05, smoothstep(0.42, 0.85, chroma));
    float highKnee = mix(3.25, 2.15, smoothstep(0.42, 0.85, chroma));
    float knee = smoothstep(lowKnee, highKnee, peak);
    return c * knee;
  }

  vec3 computeWarmBloom(vec2 uv) {
    if (uBloomIntensity <= 0.001) {
      return vec3(0.0);
    }
    vec2 r1 = uTexelSize * 3.5;
    vec2 r2 = uTexelSize * 9.5;

    vec3 sum = extractBrightHighlight(uv) * 0.20;
    sum += extractBrightHighlight(uv + vec2( r1.x,  r1.y)) * 0.12;
    sum += extractBrightHighlight(uv + vec2(-r1.x,  r1.y)) * 0.12;
    sum += extractBrightHighlight(uv + vec2( r1.x, -r1.y)) * 0.12;
    sum += extractBrightHighlight(uv + vec2(-r1.x, -r1.y)) * 0.12;
    sum += extractBrightHighlight(uv + vec2( r2.x,  0.0 )) * 0.08;
    sum += extractBrightHighlight(uv + vec2(-r2.x,  0.0 )) * 0.08;
    sum += extractBrightHighlight(uv + vec2( 0.0,   r2.y)) * 0.08;
    sum += extractBrightHighlight(uv + vec2( 0.0,  -r2.y)) * 0.08;
    return sum * uBloomIntensity;
  }

  void main() {
    float rawDepth = texture2D(tDepth, vUv).r;
    vec3 centerColor = texture2D(tColor, vUv).rgb;
    float noise = interleavedGradientNoise(gl_FragCoord.xy);
    float centerLinZ = readLinearDepth(vUv);

    vec2 velocity = vec2(0.0);
    if (uMotionBlurEnabled > 0.5 && rawDepth < 0.9999) {
      vec4 clipPos = vec4(vUv * 2.0 - 1.0, rawDepth * 2.0 - 1.0, 1.0);
      vec4 worldPos = uCurrInvViewProj * clipPos;
      worldPos /= max(1e-6, worldPos.w);

      vec4 prevClipPos = uPrevViewProj * worldPos;
      if (prevClipPos.w > 1e-4) {
        vec2 prevUv = (prevClipPos.xy / prevClipPos.w) * 0.5 + 0.5;
        velocity = (vUv - prevUv) * uShutterScale;

        float velMag = length(velocity);
        float maxRadius = 0.026;
        if (velMag > maxRadius) {
          velocity *= maxRadius / velMag;
        }
      }
    }

    float speedPx = length(velocity * uResolution);
    vec3 hdrColor = centerColor;

    if (uMotionBlurEnabled > 0.5 && speedPx > 1.2) {
      vec3 accumColor = centerColor * 1.25;
      float totalWeight = 1.25;

      const int SAMPLES = 10;
      for (int i = 0; i < SAMPLES; i++) {
        float fi = (float(i) + noise) / float(SAMPLES) - 0.5;
        vec2 sampleUv = clamp(vUv + velocity * fi, 0.001, 0.999);
        vec3 sampleCol = texture2D(tColor, sampleUv).rgb;
        float sampleLinZ = readLinearDepth(sampleUv);

        float depthDiff = abs(sampleLinZ - centerLinZ);
        float depthWeight = smoothstep(1.5, 0.10, depthDiff) * 0.75 + 0.25;
        float windowWeight = 1.0 - abs(fi) * 0.65;
        float w = depthWeight * windowWeight;

        accumColor += sampleCol * w;
        totalWeight += w;
      }
      hdrColor = accumColor / totalWeight;
    } else if (uSharpenIntensity > 0.001) {
      vec3 n = texture2D(tColor, vUv + vec2(0.0, uTexelSize.y)).rgb;
      vec3 s = texture2D(tColor, vUv - vec2(0.0, uTexelSize.y)).rgb;
      vec3 e = texture2D(tColor, vUv + vec2(uTexelSize.x, 0.0)).rgb;
      vec3 w = texture2D(tColor, vUv - vec2(uTexelSize.x, 0.0)).rgb;
      vec3 neighborAvg = 0.25 * (n + s + e + w);

      vec3 minCol = min(centerColor, min(min(n, s), min(e, w)));
      vec3 maxCol = max(centerColor, max(max(n, s), max(e, w)));
      float localContrast = length(maxCol - minCol);

      float detailWeight = (1.0 - smoothstep(0.35, 1.1, localContrast)) * uSharpenIntensity;
      float aaBlend = smoothstep(0.55, 1.35, localContrast) * 0.22;
      vec3 sharpened = max(vec3(0.0), centerColor + (centerColor - neighborAvg) * detailWeight);
      hdrColor = mix(sharpened, mix(centerColor, neighborAvg, 0.45), aaBlend);
    }

    float motionFade = 1.0 - clamp((speedPx - 4.0) / 18.0, 0.0, 0.65);
    float ao = mix(1.0, computeContactAO(vUv, centerLinZ, noise), motionFade);
    hdrColor *= ao;

    hdrColor += computeWarmBloom(vUv);

    vec3 ldrColor = acesFilmicToneMapping(hdrColor, uExposure);
    gl_FragColor = vec4(linearToSrgb(ldrColor), 1.0);
  }
`;

export class PostProcessingPipeline {
  private readonly renderer: THREE.WebGLRenderer;
  private renderTarget: THREE.WebGLRenderTarget;
  private readonly postScene: THREE.Scene;
  private readonly postCamera: THREE.OrthographicCamera;
  private readonly postMaterial: THREE.ShaderMaterial;

  private readonly currViewProj = new THREE.Matrix4();
  private readonly currInvViewProj = new THREE.Matrix4();
  private readonly prevViewProj = new THREE.Matrix4();
  private hasPrevMatrix = false;

  private quality: GraphicsQualityPreset = 'ultra';
  private motionBlurEnabled = true;
  private motionBlurStrength = 0.68;
  private ambientOcclusionEnabled = true;
  private bloomEnabled = true;
  private cssWidth = 1;
  private cssHeight = 1;

  public constructor(renderer: THREE.WebGLRenderer, width: number, height: number) {
    this.renderer = renderer;
    this.cssWidth = Math.max(1, width);
    this.cssHeight = Math.max(1, height);

    const dpr = this.computeTargetPixelRatio();
    this.renderer.setPixelRatio(dpr);

    this.renderTarget = this.createHdrDepthTarget(
      Math.round(this.cssWidth * dpr),
      Math.round(this.cssHeight * dpr)
    );

    this.postScene = new THREE.Scene();
    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.postMaterial = new THREE.ShaderMaterial({
      vertexShader: POST_VERTEX_SHADER,
      fragmentShader: POST_FRAGMENT_SHADER,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tColor: { value: this.renderTarget.texture },
        tDepth: { value: this.renderTarget.depthTexture },
        uResolution: { value: new THREE.Vector2(this.renderTarget.width, this.renderTarget.height) },
        uTexelSize: {
          value: new THREE.Vector2(1 / this.renderTarget.width, 1 / this.renderTarget.height),
        },
        uNear: { value: 0.15 },
        uFar: { value: 90.0 },
        uIsOrtho: { value: 0.0 },
        uExposure: { value: 1.15 },
        uCurrInvViewProj: { value: new THREE.Matrix4() },
        uPrevViewProj: { value: new THREE.Matrix4() },
        uMotionBlurEnabled: { value: 1.0 },
        uShutterScale: { value: 0.68 },
        uAoIntensity: { value: 0.88 },
        uBloomIntensity: { value: 0.34 },
        uSharpenIntensity: { value: 0.36 },
      },
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMaterial);
    quad.frustumCulled = false;
    this.postScene.add(quad);
    this.syncShaderUniforms();
  }

  private createHdrDepthTarget(pixelWidth: number, pixelHeight: number): THREE.WebGLRenderTarget {
    const w = Math.max(1, pixelWidth);
    const h = Math.max(1, pixelHeight);

    const depthTexture = new THREE.DepthTexture(w, h);
    depthTexture.type = THREE.UnsignedIntType;
    depthTexture.format = THREE.DepthFormat;
    depthTexture.minFilter = THREE.NearestFilter;
    depthTexture.magFilter = THREE.NearestFilter;

    const maxSamples = this.renderer.capabilities.maxSamples ?? 0;
    const msaaSamples =
      this.quality === 'ultra'
        ? Math.min(4, maxSamples)
        : this.quality === 'balanced'
          ? Math.min(2, maxSamples)
          : 0;

    const target = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      colorSpace: THREE.LinearSRGBColorSpace,
      depthBuffer: true,
      stencilBuffer: false,
      depthTexture,
      samples: msaaSamples,
    });
    return target;
  }

  private computeTargetPixelRatio(): number {
    const nativeDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    if (this.quality === 'ultra') {
      return Math.min(nativeDpr, 2.0);
    }
    if (this.quality === 'balanced') {
      return Math.min(nativeDpr, 1.5);
    }
    return 1.0;
  }

  private syncShaderUniforms(): void {
    const u = this.postMaterial.uniforms;
    u.uMotionBlurEnabled.value =
      this.motionBlurEnabled && this.quality !== 'performance' ? 1.0 : 0.0;
    u.uShutterScale.value = this.motionBlurStrength;
    u.uAoIntensity.value =
      this.ambientOcclusionEnabled && this.quality !== 'performance'
        ? this.quality === 'ultra'
          ? 0.92
          : 0.65
        : 0.0;
    u.uBloomIntensity.value =
      this.bloomEnabled && this.quality !== 'performance'
        ? this.quality === 'ultra'
          ? 0.28
          : 0.18
        : 0.0;
    u.uSharpenIntensity.value =
      this.quality === 'ultra' ? 0.36 : this.quality === 'balanced' ? 0.25 : 0.0;
  }

  public getSettings(): GraphicsSettingsState {
    return {
      quality: this.quality,
      motionBlurEnabled: this.motionBlurEnabled,
      motionBlurStrength: this.motionBlurStrength,
      ambientOcclusionEnabled: this.ambientOcclusionEnabled,
      bloomEnabled: this.bloomEnabled,
      pixelRatio: this.computeTargetPixelRatio(),
    };
  }

  public cycleQualityPreset(): GraphicsQualityPreset {
    const order: readonly GraphicsQualityPreset[] = ['ultra', 'balanced', 'performance'];
    const next = order[(order.indexOf(this.quality) + 1) % order.length] ?? 'ultra';
    this.quality = next;
    this.resize(this.cssWidth, this.cssHeight);
    this.syncShaderUniforms();
    return next;
  }

  public resize(cssWidth: number, cssHeight: number): void {
    this.cssWidth = Math.max(1, cssWidth);
    this.cssHeight = Math.max(1, cssHeight);
    const dpr = this.computeTargetPixelRatio();
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.cssWidth, this.cssHeight, false);

    const pw = Math.max(1, Math.round(this.cssWidth * dpr));
    const ph = Math.max(1, Math.round(this.cssHeight * dpr));

    this.renderTarget.dispose();
    this.renderTarget.depthTexture?.dispose();
    this.renderTarget = this.createHdrDepthTarget(pw, ph);

    const u = this.postMaterial.uniforms;
    u.tColor.value = this.renderTarget.texture;
    u.tDepth.value = this.renderTarget.depthTexture;
    u.uResolution.value.set(pw, ph);
    u.uTexelSize.value.set(1 / pw, 1 / ph);
  }

  public render(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
    dtSeconds: number
  ): void {
    camera.updateMatrixWorld();
    this.currViewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.currInvViewProj.copy(this.currViewProj).invert();

    if (!this.hasPrevMatrix) {
      this.prevViewProj.copy(this.currViewProj);
      this.hasPrevMatrix = true;
    }

    const u = this.postMaterial.uniforms;
    const isOrtho = camera instanceof THREE.OrthographicCamera;
    u.uIsOrtho.value = isOrtho ? 1.0 : 0.0;
    u.uNear.value = Math.max(0.05, camera.near);
    u.uFar.value = camera.far;
    u.uExposure.value = this.renderer.toneMappingExposure;
    u.uCurrInvViewProj.value.copy(this.currInvViewProj);
    u.uPrevViewProj.value.copy(this.prevViewProj);

    const fpsScale = Math.min(2.0, Math.max(0.4, 1 / Math.max(0.004, dtSeconds) / 60.0));
    u.uShutterScale.value = this.motionBlurStrength * fpsScale;

    const prevToneMapping = this.renderer.toneMapping;
    const prevColorSpace = this.renderer.outputColorSpace;

    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(scene, camera);

    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCamera);

    this.renderer.toneMapping = prevToneMapping;
    this.renderer.outputColorSpace = prevColorSpace;

    this.prevViewProj.copy(this.currViewProj);
  }
}
