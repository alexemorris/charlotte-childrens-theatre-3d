import * as THREE from 'three';

let shaderLightCullingInstalled = false;

/**
 * Patches Three.js's built-in PBR light chunks (`lights_pars_begin` and `lights_fragment_begin`)
 * so that off or out-of-range theatrical spotlights and house downlights skip per-pixel
 * Cook-Torrance GGX microfacet BRDF evaluations without triggering shader recompiles.
 */
export function installShaderLightCulling(): void {
  if (shaderLightCullingInstalled) return;
  shaderLightCullingInstalled = true;

  const origPars = THREE.ShaderChunk.lights_pars_begin;
  if (typeof origPars === 'string' && origPars.includes('void getPointLightInfo')) {
    THREE.ShaderChunk.lights_pars_begin = origPars.replace(
      /void getPointLightInfo\s*\(\s*const in PointLight pointLight,\s*const in vec3 geometryPosition,\s*out IncidentLight light\s*\)\s*\{[\s\S]*?light\.visible\s*=\s*\(\s*light\.color\s*!=\s*vec3\(\s*0\.0\s*\)\s*\);\s*\}/,
      `void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		float distSq = dot( lVector, lVector );
		float cutoff = pointLight.distance;
		if ( ( cutoff > 0.0 && distSq >= cutoff * cutoff ) || pointLight.color == vec3( 0.0 ) ) {
			light.color = vec3( 0.0 );
			light.direction = vec3( 0.0, 1.0, 0.0 );
			light.visible = false;
			return;
		}
		float lightDistance = sqrt( distSq );
		light.direction = lVector / max( lightDistance, 1e-4 );
		light.color = pointLight.color * getDistanceAttenuation( lightDistance, cutoff, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}`
    );
  }

  const origFrag = THREE.ShaderChunk.lights_fragment_begin;
  if (typeof origFrag === 'string' && origFrag.includes('RE_Direct(')) {
    THREE.ShaderChunk.lights_fragment_begin = origFrag.replace(
      /RE_Direct\(\s*directLight,\s*geometryPosition,\s*geometryNormal,\s*geometryViewDir,\s*geometryClearcoatNormal,\s*material,\s*reflectedLight\s*\);/g,
      `if ( directLight.visible ) {
			RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
		}`
    );
  }
}
