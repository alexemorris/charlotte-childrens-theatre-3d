import * as THREE from 'three';
import type { ProductionElementSpec, ProductionSpec } from '../types/theatre.ts';

/**
 * Classifies how each scenic unit in the production is actually manufactured
 * across the theatre's workshop departments:
 * - `'cnc-primary'`: Main structural profiles, curved Seussian arches, contour ribs,
 *   and sculpted foam relief are routed on the 4'x8' CNC bed & hot-wire foam cutter.
 * - `'hybrid-cnc-carpentry'`: Combines CNC-routed curved templates/turntables with
 *   traditional welded steel framing, soft-goods drapery, or prop shop dressing.
 * - `'soft-goods-paint'`: Sewn & painted in the Drapery / Scenic Paint Shop (backdrops,
 *   scrims, velour legs/borders, mylar curtains) — requires NO CNC routing.
 * - `'steel-rigging-carpentry'`: Built in the Metal / Carpentry Shop from stock box truss,
 *   Schedule-40 pipe, and standard dimensional lumber — requires NO CNC routing.
 * - `'props-or-blocking'`: Sourced/dressed by the Props Department or used as 3D Cast
 *   Blocking scale references — requires NO CNC routing.
 */
export type FabricationMethod =
  | 'cnc-primary'
  | 'hybrid-cnc-carpentry'
  | 'soft-goods-paint'
  | 'steel-rigging-carpentry'
  | 'props-or-blocking';

export interface ShopDepartmentBreakdown {
  readonly department:
    | 'CNC Router & EPS Foam Mill'
    | 'Carpentry & Structural Welding'
    | 'Soft Goods & Scenic Paint Shop'
    | 'Props & Set Dressing'
    | 'Rigging & Electrics'
    | 'Stage Management (Cast Blocking)';
  readonly roleBadge: 'PRIMARY CNC' | 'CNC SUB-ASSEMBLY' | 'TRADITIONAL SHOP' | 'NON-FABRICATED';
  readonly scopeSummary: string;
}

export interface CncSubPartRecord {
  readonly partCode: string;
  readonly label: string;
  readonly fabricationProcess: 'CNC Router (4×8 Sheet)' | 'CNC EPS Foam Carve' | 'Traditional Shop / Non-CNC';
  readonly materialSpec: string;
  readonly widthMm: number;
  readonly heightMm: number;
  readonly thicknessMm: number;
  readonly widthInches: number;
  readonly heightInches: number;
  readonly thicknessInches: number;
  /** 0 if this part is manufactured without the 4'x8' CNC router (e.g. steel pipe, fabric, props) */
  readonly sheetIndex: number;
  readonly sheetXMm: number;
  readonly sheetYMm: number;
  /** 2D contour polygon points in part-local millimeters [-widthMm/2..+widthMm/2, -heightMm/2..+heightMm/2] */
  readonly contourPtsMm: ReadonlyArray<{ readonly x: number; readonly y: number }>;
  /** Bounding box in scenic unit root coordinates (meters) for orthographic shop views */
  readonly unitMinM: THREE.Vector3;
  readonly unitMaxM: THREE.Vector3;
}

export interface ScenicSubUnitSpec {
  readonly id: string;
  readonly label: string;
  readonly shortLabel: string;
  readonly description: string;
  readonly matchesObject: (obj: THREE.Object3D) => boolean;
  readonly isCombinedMacroUnit?: boolean;
}

export interface CncElementAnalysis {
  readonly element: ProductionElementSpec;
  readonly productionTitle: string;
  readonly displayTitle: string;
  readonly exportSlug: string;
  readonly activeSubUnit: ScenicSubUnitSpec | null;
  readonly subUnits: ReadonlyArray<ScenicSubUnitSpec>;
  readonly fabricationMethod: FabricationMethod;
  readonly fabricationBadgeLabel: string;
  readonly requiresCncRouting: boolean;
  readonly overallWidthM: number;
  readonly overallHeightM: number;
  readonly overallDepthM: number;
  readonly overallImperialLabel: string;
  readonly sheetCount4x8: number;
  readonly estimatedCutLengthM: number;
  readonly estimatedRouterMinutes: number;
  readonly excludedBlockingFiguresCount: number;
  readonly primaryConstructionNote: string;
  readonly departmentBreakdown: ReadonlyArray<ShopDepartmentBreakdown>;
  readonly cncParts: ReadonlyArray<CncSubPartRecord>;
  readonly nonCncParts: ReadonlyArray<CncSubPartRecord>;
  readonly allParts: ReadonlyArray<CncSubPartRecord>;
}

const SHEET_WIDTH_MM = 2438.4; // 8 ft (96")
const SHEET_HEIGHT_MM = 1219.2; // 4 ft (48")
const SHEET_MARGIN_MM = 25.4; // 1" edge margin
const PART_KERF_GAP_MM = 16.0; // 5/8" CNC router bit + holding tab clearance

interface ElementFabricationProfile {
  readonly method: FabricationMethod;
  readonly badgeLabel: string;
  readonly primaryConstructionNote: string;
  readonly departments: ReadonlyArray<ShopDepartmentBreakdown>;
}

const EXPLICIT_ELEMENT_PROFILES: Readonly<Record<string, ElementFabricationProfile>> = {
  'grinch-snow-portals': {
    method: 'cnc-primary',
    badgeLabel: 'CNC ROUTER + HOT-WIRE EPS FOAM',
    primaryConstructionNote:
      '3/4" Baltic Birch CNC contour ribs at 24" O.C. skinned with 1/4" bending Luan and laminated with 2" CNC-carved high-density EPS snow-drift & fluted icicle profiles.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'PRIMARY CNC',
        scopeSummary: 'All S-curved ice-wave wing profiles, stacked snow-cliff contour ribs, and sculpted Lathe/Extrude icicle valances.',
      },
      {
        department: 'Carpentry & Structural Welding',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Internal 1.5" square steel tower book-frames, stage-jack braces, and lineset header battens.',
      },
      {
        department: 'Soft Goods & Scenic Paint Shop',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Cheesecloth/Rosco Foamcoat hard-coating and airbrushed Seussian blue-violet cross-hatching.',
      },
    ],
  },
  'grinch-preshow-scrim': {
    method: 'soft-goods-paint',
    badgeLabel: 'SOFT GOODS & PAINT SHOP (NO CNC)',
    primaryConstructionNote:
      'Seamless 38\'×22\' cotton Sharkstooth Scrim sewn with 3" top jute webbing, #2 brass grommets on 12" centers on Lineset #1, and weighted 1.5" bottom pipe pocket. No CNC routing required.',
    departments: [
      {
        department: 'Soft Goods & Scenic Paint Shop',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Full-scale translucent dye & scenic paint elevation of the "How The Grinch Stole Christmas!" emblem on sharkstooth scrim.',
      },
      {
        department: 'Rigging & Electrics',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Tied to Lineset #1 (0\'-10" from Proscenium) with 1.5" Schedule-40 bottom weight pipe.',
      },
    ],
  },
  'grinch-whoville-hills-cyc': {
    method: 'cnc-primary',
    badgeLabel: 'CNC GROUNDROW PROFILES + FOAM PEAK',
    primaryConstructionNote:
      'Staggered 3/4" Baltic Birch & 1/4" Luan CNC-profiled rolling snow hill groundrows (Linesets #39 & #45) paired with a 3D CNC-milled EPS foam crooked Mt. Crumpit horn summit.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'PRIMARY CNC',
        scopeSummary: 'CNC-routed sinusoidal hill groundrow face sheets, crooked Mt. Crumpit S-curve spine ribs, and forced-perspective pine tree silhouettes.',
      },
      {
        department: 'Rigging & Electrics',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Low-profile LED cyc groundrow striplights concealed between hill layers at z = -5.9m and z = -6.4m.',
      },
    ],
  },
  'grinch-whoville-houses': {
    method: 'cnc-primary',
    badgeLabel: 'CNC RADIAL RIBS + SCULPTED FOAM DOMES',
    primaryConstructionNote:
      'Three rolling wagon units framed with CNC-cut 3/4" Baltic Birch radial lathe ribs at 15° intervals, kerf-bent 1/4" Luan skins, and 3-axis CNC-milled EPS foam snow roof caps & icicle eaves.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'PRIMARY CNC',
        scopeSummary: 'Bulbous pear-shaped house rib cages, arched window/door trim frames, scalloped snow roof caps, and fluted icicle drips.',
      },
      {
        department: 'Carpentry & Structural Welding',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Welded 1.5"×1.5" steel wagon bases on 4" triple-swivel casters and internal S-bent steel pipe chimney cores.',
      },
      {
        department: 'Props & Set Dressing',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Evergreen wreaths, velvet bows, brass door knockers, and frosted amber acrylic window glazing.',
      },
    ],
  },
  'grinch-whoville-tree': {
    method: 'hybrid-cnc-carpentry',
    badgeLabel: 'HYBRID: CNC TURNTABLE & STAR + STEEL MAST',
    primaryConstructionNote:
      'CNC-routed 8\'-2" diameter 3/4" Baltic Birch dual-disc revolving turntable base and CNC-cut 3D Seussian star topper; central S-curved 2" steel pipe mast dressed with flame-retardant foliage tiers.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'CNC SUB-ASSEMBLY',
        scopeSummary: 'Circular turntable base discs, scalloped snow plinth rim, branch tier plywood spider rings, and Seussian star topper.',
      },
      {
        department: 'Carpentry & Structural Welding',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Bent 2" Schedule-40 steel central tree mast welded to center slewing-ring bearing.',
      },
      {
        department: 'Props & Set Dressing',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Spiral tinsel garlands, oversized ornaments, candy canes, and 18+ wrapped Seussian gift boxes at the base.',
      },
    ],
  },
  'grinch-christmas-sign': {
    method: 'hybrid-cnc-carpentry',
    badgeLabel: 'HYBRID: CNC SCROLL PROFILE + PAINTED BANNER',
    primaryConstructionNote:
      'CNC-routed 1/2" Ultralight MDF scrolled banner silhouette and 3D holly leaf clusters rigged to Lineset #15 (10\'-6"), finished with hand-lettered Seussian graphic artwork.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'CNC SUB-ASSEMBLY',
        scopeSummary: 'Curved ribbon perimeter profile, 3D scroll end-caps, and layered holly leaf corner medallions.',
      },
      {
        department: 'Soft Goods & Scenic Paint Shop',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Hand-lettered Seussian "MERRY CHRISTMAS WHOVILLE" banner face and gold rope border trim.',
      },
    ],
  },
  'grinch-cave-portal': {
    method: 'cnc-primary',
    badgeLabel: 'CNC CRAGGY ARCH + FOAM STALACTITES',
    primaryConstructionNote:
      'Three staggered planes of CNC-routed 3/4" Baltic Birch & 2" EPS foam jagged cavern wings (Lineset #17 at 11\'-10"), CNC-turned fluted stalactites, and forced-perspective miniature Whoville vista.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'PRIMARY CNC',
        scopeSummary: 'Jagged cavern arch profiles, striated rock ledges, 24 fluted icicle/stalactite drips, and miniature forced-perspective Whoville cottages.',
      },
      {
        department: 'Props & Set Dressing',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Crooked brass/copper Seussian spyglass listening horn and Max\'s upholstered rocky perch cushion.',
      },
      {
        department: 'Stage Management (Cast Blocking)',
        roleBadge: 'NON-FABRICATED',
        scopeSummary: '3D Grinch and Max the Dog figures included for sightline/blocking reference (excluded from CNC sheets).',
      },
    ],
  },
  'grinch-mylar-curtain': {
    method: 'soft-goods-paint',
    badgeLabel: 'SOFT GOODS / DRAPERY SHOP (NO CNC)',
    primaryConstructionNote:
      '24\'×15\' flame-retardant metallic Mylar streamer curtain with black duvetyne backing drape tied to Lineset #19 (13\'-2"). Manufactured entirely in the Drapery Shop — no CNC routing required.',
    departments: [
      {
        department: 'Soft Goods & Scenic Paint Shop',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Die-cut 3" wide reflective gold, silver, champagne, and ice-blue Mylar ribbons sewn to top webbing header.',
      },
      {
        department: 'Rigging & Electrics',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Flown on Lineset #19 immediately upstage of the Cave Portal arch.',
      },
    ],
  },
  'grinch-papa-whos-house': {
    method: 'cnc-primary',
    badgeLabel: 'CNC SEUSSIAN TIMBER RIBS + HEARTH',
    primaryConstructionNote:
      'CNC-routed 3/4" Baltic Birch curved olive-green Seussian gable ribs, radiating roof fan struts, and sculpted stone chimney breast (Lineset #9 at 6\'-6"), paired with DSR Kitchen & DSL Daybed wagons.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'PRIMARY CNC',
        scopeSummary: 'Asymmetrical Seussian gable posts, arched window/door frames, stone fireplace hearth, crooked refrigerator body, and scrolled daybed frame.',
      },
      {
        department: 'Soft Goods & Scenic Paint Shop',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Lavender-rose plaster wall panels, royal-blue velvet daybed upholstery, and Christmas stockings.',
      },
      {
        department: 'Stage Management (Cast Blocking)',
        roleBadge: 'NON-FABRICATED',
        scopeSummary: 'Papa Who, Mama Who, and Cindy-Lou Who blocking figures (automatically excluded from CNC cut sheets).',
      },
    ],
  },
  'grinch-papa-whos-house-scrim': {
    method: 'cnc-primary',
    badgeLabel: 'CNC TIMBER SKELETON + BACKLIT SCRIM WALLS',
    primaryConstructionNote:
      'Identical CNC-routed 3/4" Baltic Birch curved Seussian gable frame on Lineset #9, with solid wall bays replaced by sheer lavender Sharkstooth Scrim for the Scene 1E "Mean One" reveal.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'PRIMARY CNC',
        scopeSummary: 'Curved olive-green structural timber ribs, arched mullions, fireplace hearth, and interior furniture carcasses.',
      },
      {
        department: 'Soft Goods & Scenic Paint Shop',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Translucent Sharkstooth Scrim wall infill panels stapled into rear rabbet grooves of the CNC timber ribs.',
      },
      {
        department: 'Stage Management (Cast Blocking)',
        roleBadge: 'NON-FABRICATED',
        scopeSummary: 'Santa-disguised Grinch, Max, and Cindy-Lou Who blocking figures (excluded from CNC cut sheets).',
      },
    ],
  },
  'grinch-shopping-counters': {
    method: 'cnc-primary',
    badgeLabel: 'CNC COUNTER CARCASSES + SIGN ARCHES',
    primaryConstructionNote:
      'Three rolling department-store counter wagons built from CNC-routed 3/4" Baltic Birch curved ribs and kerf-bent 1/4" Luan skins, topped with scalloped CNC-cut overhead shop signs.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'PRIMARY CNC',
        scopeSummary: 'Curved counter ribs, display niche cutouts, and scalloped lime-green overhead shop sign blanks.',
      },
      {
        department: 'Carpentry & Structural Welding',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Spiral-painted PVC/steel candy-cane support posts and castered wagon bases.',
      },
      {
        department: 'Props & Set Dressing',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Whimsical cash registers, gift box stacks, and hand-lettered Seussian sign graphics.',
      },
    ],
  },
  'grinch-mt-crumpit-sleigh': {
    method: 'cnc-primary',
    badgeLabel: 'CNC SLEIGH RIBS + FOAM PRECIPICE WAGON',
    primaryConstructionNote:
      'Steep Mt. Crumpit cliff wagon framed in 3/4" CNC plywood & 2" carved EPS rock strata, supporting the CNC-routed crooked wooden sleigh carcass on bent steel runners.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'PRIMARY CNC',
        scopeSummary: 'Curved sleigh side panels, dashboard scroll profiles, and stepped Mt. Crumpit rock precipice ribs.',
      },
      {
        department: 'Carpentry & Structural Welding',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Structural canted steel cliff truss, sleigh runner pipes, and safety locking floor brakes.',
      },
      {
        department: 'Props & Set Dressing',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Colossal upholstered crimson gift sack stuffed with lightweight prop trees, toys, and ribbons.',
      },
    ],
  },
  'grinch-finale-banquet': {
    method: 'hybrid-cnc-carpentry',
    badgeLabel: 'HYBRID: CNC CURVED TABLE TOP + DRAPERY/PROPS',
    primaryConstructionNote:
      '16\'-0" curved banquet table wagon with CNC-routed 3/4" Baltic Birch arc top segments on folding steel legs, dressed with sewn damask drapery and Roast Beast prop centerpiece.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'CNC SUB-ASSEMBLY',
        scopeSummary: 'Interlocking curved banquet tabletop arc segments and scalloped apron valance backers.',
      },
      {
        department: 'Soft Goods & Scenic Paint Shop',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Floor-length white scalloped tablecloth and royal-blue/gold festooned swags.',
      },
      {
        department: 'Props & Set Dressing',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Silver Roast Beast dome platter, tiered Who-pudding stands, and golden candelabras.',
      },
    ],
  },
  'grinch-offstage-storage': {
    method: 'props-or-blocking',
    badgeLabel: 'BACKSTAGE STORAGE & SPIKE PLAN (NO CNC)',
    primaryConstructionNote:
      'Stage management spike-tape wing layout, pipe prop racks, and running-light stands in USR/SL wings. No scenic CNC fabrication required.',
    departments: [
      {
        department: 'Stage Management (Cast Blocking)',
        roleBadge: 'NON-FABRICATED',
        scopeSummary: 'Color-coded glow/spike tape marks on the offstage wing floor for wagon parking during scene shifts.',
      },
    ],
  },
  'black-velour-masking': {
    method: 'soft-goods-paint',
    badgeLabel: 'HOUSE DRAPERY INVENTORY (NO CNC)',
    primaryConstructionNote:
      'Standard McColl Family Theatre 25 oz. IFR Black Velour masking legs and borders sewn with 50% fullness pleats. House inventory — no CNC fabrication required.',
    departments: [
      {
        department: 'Soft Goods & Scenic Paint Shop',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Flame-retardant black velour legs and borders with top tie-lines and bottom chain pockets.',
      },
    ],
  },
  'alice-proscenium-frieze': {
    method: 'cnc-primary',
    badgeLabel: 'CNC GEOMETRIC FRIEZE PANELS',
    primaryConstructionNote:
      'Stepped non-coplanar 1/2" Baltic Birch & Ultralight MDF geometric color-block frieze panels, checkered racing flags, and circular clock-face medallions routed on the 4\'×8\' CNC bed.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'PRIMARY CNC',
        scopeSummary: 'All stepped geometric frieze blocks, checkerboard squares, keyhole cutouts, and circular target rings.',
      },
      {
        department: 'Carpentry & Structural Welding',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Unistrut & steel angle standoff brackets mounting frieze layers to the false proscenium truss.',
      },
    ],
  },
  'alice-window-backdrop': {
    method: 'cnc-primary',
    badgeLabel: 'CNC GOTHIC TRACERY + VELVET DRAPERY',
    primaryConstructionNote:
      'Forced-perspective gothic lancet window arch and angled jamb reveals CNC-routed from 3/4" Baltic Birch and 1/4" Luan, dressed with sculpted crimson velour swags.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'PRIMARY CNC',
        scopeSummary: 'Pointed gothic arch tracery, forced-perspective trapezoidal mullions, and sill corbels.',
      },
      {
        department: 'Soft Goods & Scenic Paint Shop',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Pleated crimson velvet drapery swags, gold bullion fringe, and braided tieback tassel.',
      },
    ],
  },
  'alice-tea-table': {
    method: 'hybrid-cnc-carpentry',
    badgeLabel: 'HYBRID: CNC CHAIRS/TABLE + PROP FEAST',
    primaryConstructionNote:
      'Cantilevered 22\' tea-party banquet wagon with CNC-routed cabriole legs and oversized Wonderland high-back armchair frames, finished with drapery and prop tea service.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'CNC SUB-ASSEMBLY',
        scopeSummary: 'Whimsical crooked chair backs, cabriole table legs, and oversized pocket-watch frame.',
      },
      {
        department: 'Props & Set Dressing',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Multi-tiered crooked birthday cakes, tilted teapots, stacked teacups, and paper lanterns.',
      },
    ],
  },
  'alice-characters': {
    method: 'props-or-blocking',
    badgeLabel: '3D CAST BLOCKING FIGURES (NO CNC)',
    primaryConstructionNote:
      'Articulated 1:1 human-scale blocking figures (Alice, Mad Hatter, White Rabbit, Queen of Hearts) for sightline and camera framing checks. Not a manufactured scenic unit.',
    departments: [
      {
        department: 'Stage Management (Cast Blocking)',
        roleBadge: 'NON-FABRICATED',
        scopeSummary: 'Used strictly for 3D sightline verification from all 533 seats in the McColl Family Theatre.',
      },
    ],
  },
  'grinch-snow-floor': {
    method: 'soft-goods-paint',
    badgeLabel: 'SCENIC PAINT SHOP FLOOR CLOTH (NO CNC)',
    primaryConstructionNote:
      'Heavy-duty 38\'×28\' #8 Cotton Duck stage floor cloth primed with Rosco Tough Prime and hand-painted with swirling Seussian snow-drift contours and spatter. No CNC routing required.',
    departments: [
      {
        department: 'Soft Goods & Scenic Paint Shop',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Full-stage canvas floor cloth seamed, grommeted, and painted on the Paint Shop deck.',
      },
    ],
  },
  'alice-ray-floor': {
    method: 'soft-goods-paint',
    badgeLabel: 'SCENIC PAINT SHOP FLOOR CLOTH (NO CNC)',
    primaryConstructionNote:
      'Hand-painted forced-perspective radiating blue/gold sun-ray canvas floor cloth taped and tacked to the McColl stage deck. No CNC routing required.',
    departments: [
      {
        department: 'Soft Goods & Scenic Paint Shop',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Snap-line radial layout and two-tone scenic floor paint application.',
      },
    ],
  },
  'sor-truss-towers': {
    method: 'steel-rigging-carpentry',
    badgeLabel: 'RIGGING BOX TRUSS + CNC MARQUEE LETTERS',
    primaryConstructionNote:
      'Four 21\'-8" vertical 12"×12" aluminum box-truss concert towers bolted to steel deck baseplates, paired with a flown concert truss bridge and CNC-routed "BATTLE OF THE BANDS" marquee letters.',
    departments: [
      {
        department: 'Rigging & Electrics',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: '4 vertical aluminum box-truss towers, horizontal concert bridge, and moving-head beam fixtures.',
      },
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'CNC SUB-ASSEMBLY',
        scopeSummary: 'CNC-routed 1/2" Ultralight MDF & aluminum channel letters for the illuminated "BATTLE OF THE BANDS" marquee.',
      },
    ],
  },
  'sor-classroom-wing-walls': {
    method: 'cnc-primary',
    badgeLabel: 'CNC ARCHITECTURAL MILLWORK & PILASTERS',
    primaryConstructionNote:
      'Angled Horace Green Prep walnut classroom walls (SL/SR) featuring CNC-routed fluted pilasters, raised wainscot paneling, V-carved "H G" heraldic crests, and glass-front trophy cabinets.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'PRIMARY CNC',
        scopeSummary: 'Fluted walnut pilaster shafts, pediment headers, raised wainscot rails/stiles, and V-carved Horace Green crests.',
      },
      {
        department: 'Carpentry & Structural Welding',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: '1"×3" studio flat framing, pivot jack braces, and practical classroom doorways.',
      },
    ],
  },
  'sor-speaker-stack-wall': {
    method: 'hybrid-cnc-carpentry',
    badgeLabel: 'HYBRID: CNC SPEAKER BAFFLES + STEEL RACK',
    primaryConstructionNote:
      '17\'-8" tall stepped pyramid wall of 24 faux Marshall/Ampeg 4×12 rock speaker cabinets: CNC-routed 1/2" Birch speaker circular baffles mounted on a lightweight welded steel scaffolding frame.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'CNC SUB-ASSEMBLY',
        scopeSummary: '24× CNC-bored 4×12" speaker baffle boards and angled cabinet side profiles.',
      },
      {
        department: 'Carpentry & Structural Welding',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Rear structural steel scaffolding tower and French-cleat cabinet hangers.',
      },
    ],
  },
  'sor-center-chalkboard-fly': {
    method: 'hybrid-cnc-carpentry',
    badgeLabel: 'HYBRID: FLYABLE CHALKBOARD + PROP DESKS',
    primaryConstructionNote:
      '16\'-0" wide flyable Horace Green center chalkboard wall on Lineset #3 with CNC-routed walnut pediment molding, paired with 6 commercial tubular-steel student desks and teacher oak desk.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'CNC SUB-ASSEMBLY',
        scopeSummary: 'Scrolled walnut cornice molding, pilaster capitals, and chalkboard frame joinery.',
      },
      {
        department: 'Props & Set Dressing',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: '6 student desks & chairs, teacher pedestal desk, globe, and Dewey\'s Gibson SG on stand.',
      },
    ],
  },
  'sor-band-risers-and-cast': {
    method: 'hybrid-cnc-carpentry',
    badgeLabel: 'HYBRID: RISER WAGONS + BACKLINE / CAST',
    primaryConstructionNote:
      'Rolling steel-framed drum and keyboard risers decked in 3/4" Baltic Birch, paired with ATA road cases, floor wedge monitors, and 1:1 cast blocking figures (excluded from CNC sheets).',
    departments: [
      {
        department: 'Carpentry & Structural Welding',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Castered steel band risers, 3/4" birch decking, and angled stage monitor wedges.',
      },
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'CNC SUB-ASSEMBLY',
        scopeSummary: 'Riser corner gussets, wedge monitor side cheeks, and custom kick-drum logo stencil.',
      },
      {
        department: 'Stage Management (Cast Blocking)',
        roleBadge: 'NON-FABRICATED',
        scopeSummary: 'Dewey Finn and student rock band 3D blocking figures (automatically excluded from CNC cut sheets).',
      },
    ],
  },
  'sor-plaid-crest-floor': {
    method: 'soft-goods-paint',
    badgeLabel: 'SCENIC PAINT SHOP FLOOR CLOTH (NO CNC)',
    primaryConstructionNote:
      'Full-stage painted crimson/navy Horace Green tartan plaid floor cloth with central gold "H G" crest medallion. Painted in the Scenic Paint Shop — no CNC routing required.',
    departments: [
      {
        department: 'Soft Goods & Scenic Paint Shop',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Striped tartan plaid layout and stenciled Horace Green crest floor treatment.',
      },
    ],
  },
};

function inferElementFabricationProfile(element: ProductionElementSpec): ElementFabricationProfile {
  const explicit = EXPLICIT_ELEMENT_PROFILES[element.id];
  if (explicit) return explicit;

  if (element.category === 'blocking') {
    return {
      method: 'props-or-blocking',
      badgeLabel: 'CAST BLOCKING REFERENCE (NO CNC)',
      primaryConstructionNote:
        '1:1 human-scale cast blocking and sightline reference figure. Not a manufactured scenic unit.',
      departments: [
        {
          department: 'Stage Management (Cast Blocking)',
          roleBadge: 'NON-FABRICATED',
          scopeSummary: 'Used for 3D stage blocking and audience sightline verification.',
        },
      ],
    };
  }

  if (element.category === 'masking' || element.category === 'backdrop') {
    return {
      method: 'soft-goods-paint',
      badgeLabel: 'SOFT GOODS & PAINT SHOP (NO CNC)',
      primaryConstructionNote:
        'Flame-retardant theatrical soft goods sewn with top webbing, grommets, and bottom pipe pocket. No CNC routing required.',
      departments: [
        {
          department: 'Soft Goods & Scenic Paint Shop',
          roleBadge: 'TRADITIONAL SHOP',
          scopeSummary: 'Sewn and painted theatrical backdrop/drapery panel.',
        },
      ],
    };
  }

  if (element.category === 'props') {
    return {
      method: 'props-or-blocking',
      badgeLabel: 'PROP SHOP SOURCED / BUILT (NO CNC)',
      primaryConstructionNote:
        'Hand-built or sourced by the Theatre Props Department. Does not require 4\'×8\' CNC sheet routing.',
      departments: [
        {
          department: 'Props & Set Dressing',
          roleBadge: 'TRADITIONAL SHOP',
          scopeSummary: 'Prop shop fabrication, upholstery, and detail finishing.',
        },
      ],
    };
  }

  return {
    method: 'cnc-primary',
    badgeLabel: 'CNC ROUTER + CARPENTRY SHOP',
    primaryConstructionNote:
      '3/4" Baltic Birch CNC structural ribs and interlocked profiles skinned with 1/4" Luan and scenic finish.',
    departments: [
      {
        department: 'CNC Router & EPS Foam Mill',
        roleBadge: 'PRIMARY CNC',
        scopeSummary: 'CNC-routed 3/4" Baltic Birch structural profiles and curved 1/4" Luan face sheets.',
      },
      {
        department: 'Carpentry & Structural Welding',
        roleBadge: 'TRADITIONAL SHOP',
        scopeSummary: 'Structural framing assembly, rigging hardware, and castered wagon bases.',
      },
    ],
  };
}

export function formatMetersToImperialShop(meters: number): string {
  const totalInches = Math.max(0, meters * 39.3700787);
  const feet = Math.floor(totalInches / 12);
  const remInches = totalInches - feet * 12;
  const wholeInches = Math.floor(remInches);
  const fracEighths = Math.round((remInches - wholeInches) * 8);
  if (fracEighths === 8) {
    const nextIn = wholeInches + 1;
    if (nextIn === 12) {
      return `${feet + 1}'-0"`;
    }
    return `${feet}'-${nextIn}"`;
  }
  const fracStr =
    fracEighths === 4
      ? ' 1/2'
      : fracEighths === 2
        ? ' 1/4'
        : fracEighths === 6
          ? ' 3/4'
          : fracEighths > 0
            ? ` ${fracEighths}/8`
            : '';
  return `${feet}'-${wholeInches}${fracStr}"`;
}

function isInsideCharacterBlockingSubtree(node: THREE.Object3D, stopRoot: THREE.Object3D): boolean {
  let curr: THREE.Object3D | null = node;
  while (curr && curr !== stopRoot) {
    if (curr.userData?.isCharacterBlocking === true) {
      return true;
    }
    curr = curr.parent;
  }
  return false;
}

/**
 * Determines whether a specific mesh inside a CNC/Hybrid scenic unit is actually a
 * CNC-routed sheet/foam part vs a traditional non-CNC component (steel pipe batten,
 * rigging wire, fabric drape, or small decorative prop).
 */
function classifyMeshFabricationProcess(
  _mesh: THREE.Mesh,
  elementMethod: FabricationMethod,
  widthMm: number,
  heightMm: number,
  thicknessMm: number
): {
  readonly isCncRouted: boolean;
  readonly process: CncSubPartRecord['fabricationProcess'];
  readonly materialSpec: string;
} {
  if (elementMethod === 'soft-goods-paint') {
    return {
      isCncRouted: false,
      process: 'Traditional Shop / Non-CNC',
      materialSpec:
        heightMm < 120
          ? '1.5" Schedule-40 Steel Batten / Weight Pipe (Rigging Shop)'
          : 'Flame-Retardant Cotton Scrim / Velour Soft Goods (Drapery Shop)',
    };
  }

  if (elementMethod === 'props-or-blocking') {
    return {
      isCncRouted: false,
      process: 'Traditional Shop / Non-CNC',
      materialSpec: 'Prop Shop Sourced / Cast Blocking Reference (No CNC)',
    };
  }

  if (elementMethod === 'steel-rigging-carpentry') {
    const isSignPanel = widthMm > 600 && heightMm > 250 && thicknessMm <= 90;
    if (isSignPanel) {
      return {
        isCncRouted: true,
        process: 'CNC Router (4×8 Sheet)',
        materialSpec: '1/2" (12mm) Ultralight MDF Marquee Backer (CNC Routed)',
      };
    }
    return {
      isCncRouted: false,
      process: 'Traditional Shop / Non-CNC',
      materialSpec: '12"×12" Aluminum Box Truss / 1.5" Sch-40 Pipe (Rigging Shop)',
    };
  }

  // Check if geometry is a thin long pipe/rod/wire (e.g., fly wire, batten pipe, pole)
  const aspect = Math.max(widthMm, heightMm) / Math.max(1, Math.min(widthMm, heightMm));
  if (aspect >= 11 && Math.min(widthMm, heightMm) <= 95) {
    return {
      isCncRouted: false,
      process: 'Traditional Shop / Non-CNC',
      materialSpec: '1.5" Schedule-40 Steel Pipe / 1/8" GAC Aircraft Cable (Metal Shop)',
    };
  }

  // Small spherical ornaments or tiny prop details (< 140mm) -> Props Shop
  if (widthMm < 150 && heightMm < 150) {
    return {
      isCncRouted: false,
      process: 'Traditional Shop / Non-CNC',
      materialSpec: 'Turned / Molded Scenic Prop Hardware (Props Shop)',
    };
  }

  // Thick 3D sculpted volume (> 140mm thickness) -> CNC EPS Foam Carve + Birch Core
  if (thicknessMm >= 140) {
    return {
      isCncRouted: true,
      process: 'CNC EPS Foam Carve',
      materialSpec: '3/4" Birch Internal Rib + 2" (50mm) CNC-Carved EPS Foam Lamination',
    };
  }

  if (thicknessMm <= 12) {
    return {
      isCncRouted: true,
      process: 'CNC Router (4×8 Sheet)',
      materialSpec: '1/4" (6mm) Luan Mahogany Scenic Skin (CNC Profile)',
    };
  }

  return {
    isCncRouted: true,
    process: 'CNC Router (4×8 Sheet)',
    materialSpec: '3/4" (18mm) Baltic Birch CNC Structural Plywood',
  };
}

/**
 * Extracts a simplified 2D outer contour polygon (20-direction radial hull)
 * in the part's primary face plane so curved Seussian arches, domes, and
 * waves appear as true curved CNC toolpaths on the nested 4'x8' sheets.
 */
function extractMesh2DContourMm(
  mesh: THREE.Mesh,
  unitInvMatrix: THREE.Matrix4
): {
  readonly widthMm: number;
  readonly heightMm: number;
  readonly thicknessMm: number;
  readonly contourPtsMm: ReadonlyArray<{ readonly x: number; readonly y: number }>;
  readonly unitMinM: THREE.Vector3;
  readonly unitMaxM: THREE.Vector3;
} {
  const geom = mesh.geometry;
  geom.computeBoundingBox();
  const localBox =
    geom.boundingBox ??
    new THREE.Box3(new THREE.Vector3(-0.2, -0.2, -0.05), new THREE.Vector3(0.2, 0.2, 0.05));

  const relMat = new THREE.Matrix4().multiplyMatrices(unitInvMatrix, mesh.matrixWorld);
  const unitBox = localBox.clone().applyMatrix4(relMat);
  const sizeM = new THREE.Vector3();
  unitBox.getSize(sizeM);

  const dimsM = [
    { axis: 'x' as const, len: Math.max(0.03, sizeM.x) },
    { axis: 'y' as const, len: Math.max(0.03, sizeM.y) },
    { axis: 'z' as const, len: Math.max(0.012, sizeM.z) },
  ].sort((a, b) => b.len - a.len);

  const uAxis = dimsM[0]!.axis;
  const vAxis = dimsM[1]!.axis;

  const widthMm = Math.min(SHEET_WIDTH_MM - 60, Math.round(dimsM[0]!.len * 1000));
  const heightMm = Math.min(SHEET_HEIGHT_MM - 60, Math.round(dimsM[1]!.len * 1000));
  const thicknessMm = Math.max(6, Math.round(dimsM[2]!.len * 1000));

  const posAttr = geom.attributes.position;
  const centerM = new THREE.Vector3();
  unitBox.getCenter(centerM);

  const bins = 20;
  const maxRadii = new Array<number>(bins).fill(0);
  const binAngles = new Array<number>(bins).fill(0);
  for (let b = 0; b < bins; b++) {
    binAngles[b] = (b / bins) * Math.PI * 2;
  }

  if (posAttr && posAttr.count >= 4) {
    const v = new THREE.Vector3();
    const step = Math.max(1, Math.floor(posAttr.count / 180));
    const scaleU = dimsM[0]!.len > 1e-4 ? (widthMm * 0.5) / (dimsM[0]!.len * 0.5) : 1000;
    const scaleV = dimsM[1]!.len > 1e-4 ? (heightMm * 0.5) / (dimsM[1]!.len * 0.5) : 1000;

    for (let i = 0; i < posAttr.count; i += step) {
      v.fromBufferAttribute(posAttr, i).applyMatrix4(relMat).sub(centerM);
      const px = v[uAxis] * scaleU;
      const py = v[vAxis] * scaleV;
      const r = Math.hypot(px, py);
      if (r < 1) continue;
      let ang = Math.atan2(py, px);
      if (ang < 0) ang += Math.PI * 2;
      const binIdx = Math.floor((ang / (Math.PI * 2)) * bins) % bins;
      if (r > (maxRadii[binIdx] ?? 0)) {
        maxRadii[binIdx] = r;
      }
    }
  }

  const contourPtsMm: { x: number; y: number }[] = [];
  const halfW = widthMm / 2;
  const halfH = heightMm / 2;
  const hasValidBins = maxRadii.filter((r) => r > 5).length >= 10;

  if (hasValidBins) {
    for (let b = 0; b < bins; b++) {
      const ang = binAngles[b]!;
      const prevR = maxRadii[(b - 1 + bins) % bins] || Math.hypot(halfW, halfH) * 0.7;
      const currR = maxRadii[b] || prevR * 0.9;
      const nextR = maxRadii[(b + 1) % bins] || currR;
      const smoothR = prevR * 0.25 + currR * 0.5 + nextR * 0.25;
      const x = Math.max(-halfW, Math.min(halfW, Math.cos(ang) * smoothR));
      const y = Math.max(-halfH, Math.min(halfH, Math.sin(ang) * smoothR));
      contourPtsMm.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
    }
  } else {
    contourPtsMm.push(
      { x: -halfW, y: -halfH },
      { x: halfW, y: -halfH },
      { x: halfW, y: halfH },
      { x: -halfW, y: halfH }
    );
  }

  return {
    widthMm,
    heightMm,
    thicknessMm,
    contourPtsMm,
    unitMinM: unitBox.min,
    unitMaxM: unitBox.max,
  };
}

function hasAncestorNamed(
  node: THREE.Object3D,
  stopRoot: THREE.Object3D,
  names: ReadonlyArray<string>
): boolean {
  let curr: THREE.Object3D | null = node;
  while (curr && curr !== stopRoot) {
    if (curr.name && names.includes(curr.name)) {
      return true;
    }
    curr = curr.parent;
  }
  return false;
}

function getObjectWorldCenter(node: THREE.Object3D): THREE.Vector3 {
  const box = new THREE.Box3().setFromObject(node);
  if (box.isEmpty()) {
    const pos = new THREE.Vector3();
    node.getWorldPosition(pos);
    return pos;
  }
  const center = new THREE.Vector3();
  box.getCenter(center);
  return center;
}

/**
 * Decomposes multi-piece scenic elements into individual, physical stage sub-units
 * (e.g. Individual Whoville Houses #1/#2/#3, Papa Who's Gable Frame vs Kitchen Wagon vs Daybed,
 * individual Shopping Booths, Drum Riser vs Amp Backline, Banquet Table vs Wonderland Chairs)
 * so clicking an object on stage or inspecting it in the Workshop Modal is focused and granular.
 */
export function getElementGranularSubUnits(
  element: ProductionElementSpec,
  rootGroup: THREE.Object3D
): ReadonlyArray<ScenicSubUnitSpec> {
  rootGroup.updateWorldMatrix(true, true);

  let rawUnits: ScenicSubUnitSpec[] = [];

  switch (element.id) {
    case 'grinch-whoville-houses':
      rawUnits = [
        {
          id: 'house-dsr',
          label: 'House #1 · DSR Pink Whoville Cottage',
          shortLabel: 'DSR Pink House #1',
          description:
            'Downstage Right bulbous pink stucco Who cottage with S-bent chimney, snow dome, and arched doorway.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['WhovillePinkHouse_DSR']),
        },
        {
          id: 'house-usr',
          label: 'House #2 · USR Coral Whoville Cottage',
          shortLabel: 'USR Coral House #2',
          description:
            'Upstage Right coral-rose onion-domed Who cottage with crooked shutters and scalloped snow eaves.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['WhovillePinkHouse_USR']),
        },
        {
          id: 'house-msl',
          label: 'House #3 · MSL Rose Whoville Cottage',
          shortLabel: 'MSL Rose House #3',
          description:
            'Midstage Left warm rose Who cottage with side bay alcove, garland swags, and rolling snow plinth.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['WhovillePinkHouse_MSL']),
        },
      ];
      break;

    case 'grinch-papa-whos-house':
    case 'grinch-papa-whos-scrim-mode':
    case 'grinch-papa-whos-house-scrim':
      rawUnits = [
        {
          id: 'papa-gable-hearth',
          label: 'Line #9 Seussian Gable Wall & Stone Hearth',
          shortLabel: 'Gable Wall & Hearth',
          description:
            'Flown olive-green Seussian timber skeleton, sculpted stone fireplace hearth, mantel stockings, and arched front door.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['PapaWhosHouseFrame_Line9']),
        },
        {
          id: 'papa-kitchen-dsr',
          label: 'DSR Who Kitchen Wagon & Crooked Fridge',
          shortLabel: 'DSR Kitchen & Fridge',
          description:
            'Rolling Downstage Right kitchen unit with bulbous Seussian refrigerator, spiral coils, and prep counter.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['WhoKitchenWagon_DSR']),
        },
        {
          id: 'papa-tree',
          label: 'Interior Potted Who Christmas Trees',
          shortLabel: 'Interior Who Trees',
          description:
            'S-curved potted Who family Christmas tree in bulbous red/gold planter with ornaments and gift boxes.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, [
              'WhoFamilyChristmasTree_Main',
              'WhoFamilyChristmasTree_RightBay',
            ]),
        },
        {
          id: 'papa-daybed-dsl',
          label: 'DSL Royal-Blue Daybed & Crooked Lamp',
          shortLabel: 'DSL Blue Daybed',
          description:
            'Downstage Left sinuous royal-blue velvet Seussian fainting couch with scrolled bolsters and crooked end-table lamp.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, [
              'WhoRoyalBlueDaybed_DSL',
              'WhoEndTable_DSL',
            ]),
        },
      ];
      break;

    case 'grinch-shopping-counters':
      rawUnits = [
        {
          id: 'booth-1-dsr',
          label: 'Booth #1 · DSR Who Dept. Store Counter',
          shortLabel: 'DSR Booth #1',
          description:
            'Downstage Right curved turquoise counter wagon with candy-cane posts and "WHO DEPT. STORE" sign.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['WhovilleShoppingBooth_1']),
        },
        {
          id: 'booth-2-ctr',
          label: 'Booth #2 · Center Tinsel & Trimmings Counter',
          shortLabel: 'Center Booth #2',
          description:
            'Center stage curved department booth with Seussian cash register and "TINSEL & TRIMMINGS" sign.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['WhovilleShoppingBooth_2']),
        },
        {
          id: 'booth-3-dsl',
          label: 'Booth #3 · DSL Floo-Floobers & Toys Counter',
          shortLabel: 'DSL Booth #3',
          description:
            'Downstage Left curved toy booth wagon with stacked gift hatboxes and "FLOO-FLOOBERS & TOYS" sign.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['WhovilleShoppingBooth_3']),
        },
      ];
      break;

    case 'grinch-snow-portals':
      rawUnits = [
        {
          id: 'portal-sr',
          label: 'Stage Right Snow-Cliff & Ice-Wave Portal',
          shortLabel: 'SR Snow Portal',
          description:
            'Downstage Right sculpted snow-cliff tormentor tower and S-curved blue ice-wave wing flats.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['SnowPortal_DSR']),
        },
        {
          id: 'portal-sl',
          label: 'Stage Left Snow-Cliff & Ice-Wave Portal',
          shortLabel: 'SL Snow Portal',
          description:
            'Downstage Left sculpted snow-cliff tormentor tower and S-curved blue ice-wave wing flats.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['SnowPortal_DSL']),
        },
        {
          id: 'portal-arch',
          label: 'Upper Proscenium Snow Teaser Arch',
          shortLabel: 'Upper Teaser Arch',
          description:
            'Overhead sculpted snow-drift teaser border and translucent hanging icicle valance.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['SnowPortal_UpperTeaserArch']),
        },
      ];
      break;

    case 'grinch-whoville-hills-cyc':
      rawUnits = [
        {
          id: 'hill-line-39',
          label: 'Line #39 Foreground Snow Hill Groundrow',
          shortLabel: 'Foreground Hill #1',
          description:
            'Downstage rolling snow-hill groundrow profile on Lineset #39 with winding snowy path.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['HillGroundrow_1_Line39']),
        },
        {
          id: 'hill-line-42',
          label: 'Midground Snow Ridge & Crooked Pines',
          shortLabel: 'Midground Hill #2',
          description:
            'Midstage scalloped snow ridge with miniature crooked streetlamps and forced-perspective pines.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['HillGroundrow_2_Mid']),
        },
        {
          id: 'crumpit-peak',
          label: 'Mt. Crumpit Horn Summit & Rear Ridge (Line #45)',
          shortLabel: 'Mt. Crumpit Peak',
          description:
            'Towering S-curved EPS foam peak of Mt. Crumpit with glowing cave mouth and overhanging snow cap.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, [
              'HillGroundrow_3_Line45',
              'MtCrumpit_PeakUnit',
            ]),
        },
      ];
      break;

    case 'grinch-mt-crumpit-sleigh':
      rawUnits = [
        {
          id: 'crumpit-cliff',
          label: 'Mt. Crumpit Precipice Cliff Wagon',
          shortLabel: 'Crumpit Cliff Wagon',
          description:
            'Steep rolling rock-strata cliff wagon with stepped snow ledges and internal structural steel truss.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['MtCrumpitCliffWagon']) &&
            getObjectWorldCenter(obj).y < 1.55,
        },
        {
          id: 'crumpit-sleigh',
          label: "Grinch's Crooked Sleigh & Overstuffed Sack",
          shortLabel: 'Sleigh & Toy Sack',
          description:
            'Tilted crimson wooden sleigh on bent steel runners with colossal stuffed gift sack perched on the crest.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['MtCrumpitCliffWagon']) &&
            getObjectWorldCenter(obj).y >= 1.55,
        },
        {
          id: 'crumpit-dsr-house',
          label: 'DSR Snow Cottage Anchor (Scene 1F)',
          shortLabel: 'DSR Snow Cottage',
          description:
            'Downstage Right Whoville snow cottage anchoring the opposite side of the stage during Scene 1F.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['WhovillePinkHouse_DSR_1F']),
        },
      ];
      break;

    case 'grinch-whoville-tree':
      rawUnits = [
        {
          id: 'tree-turntable',
          label: 'Revolving Snow Turntable Base & Gift Pile',
          shortLabel: 'Turntable & Gifts',
          description:
            '8\'-2" diameter dual-disc Baltic Birch revolving turntable, snow rim, and 18+ wrapped Seussian gift boxes.',
          matchesObject: (obj) => getObjectWorldCenter(obj).y < 0.75,
        },
        {
          id: 'tree-foliage',
          label: 'S-Curved Foliage Tiers & 3D Star Topper',
          shortLabel: 'Tree Tiers & Star',
          description:
            '7 stacked tilted foliage tiers on bent steel mast with spiral tinsel garland and CNC-cut gold star.',
          matchesObject: (obj) => getObjectWorldCenter(obj).y >= 0.75,
        },
      ];
      break;

    case 'grinch-cave-portal':
      rawUnits = [
        {
          id: 'cave-sr',
          label: 'Stage Right Cavern Wing & Snow Boulders',
          shortLabel: 'SR Cavern Wing',
          description:
            'Stage Right jagged blue-slate cavern wing flats and sculpted snow boulder outcrops.',
          matchesObject: (obj) => {
            const c = getObjectWorldCenter(obj);
            return c.z > -4.6 && c.x < -1.15;
          },
        },
        {
          id: 'cave-arch',
          label: 'Upper Jagged Cave Mouth & Stalactite Valance',
          shortLabel: 'Upper Cave Arch',
          description:
            'Central overhead cavern arch header and 18+ CNC-turned translucent icicle/stalactite teeth.',
          matchesObject: (obj) => {
            const c = getObjectWorldCenter(obj);
            return c.z > -4.6 && c.x >= -1.15 && c.x <= 1.15;
          },
        },
        {
          id: 'cave-sl',
          label: 'Stage Left Cavern Wing & Listening Horn',
          shortLabel: 'SL Wing & Horn Rig',
          description:
            'Stage Left jagged cavern wing, rocky perch, and crooked brass Seussian listening horn.',
          matchesObject: (obj) => {
            const c = getObjectWorldCenter(obj);
            return c.z > -4.6 && c.x > 1.15;
          },
        },
        {
          id: 'cave-vista',
          label: 'Forced-Perspective Miniature Whoville Vista',
          shortLabel: 'Mini Whoville Vista',
          description:
            'Upstage forced-perspective snow hill with 7 miniature Who cottages and town tree seen through the cave mouth.',
          matchesObject: (obj) => getObjectWorldCenter(obj).z <= -4.6,
        },
      ];
      break;

    case 'grinch-finale-banquet':
      rawUnits = [
        {
          id: 'banquet-table',
          label: '16\'-0" Curved Banquet Table & Festoon Drapery',
          shortLabel: 'Curved Banquet Table',
          description:
            'Multi-segment CNC-routed curved banquet tabletop arc with scalloped white tablecloth and royal-blue swags.',
          matchesObject: (obj) =>
            hasAncestorNamed(obj, rootGroup, ['WhovilleFeastBanquetTableArc']),
        },
        {
          id: 'banquet-feast',
          label: 'Roast Beast Platter, Puddings & Candelabras',
          shortLabel: 'Roast Beast & Props',
          description:
            'Silver domed Roast Beast carving centerpiece, tiered Who-pudding stands, and golden candelabras.',
          matchesObject: (obj) =>
            !hasAncestorNamed(obj, rootGroup, ['WhovilleFeastBanquetTableArc']),
        },
      ];
      break;

    case 'sor-classroom-wing-walls':
      rawUnits = [
        {
          id: 'sor-wing-sr',
          label: 'Stage Right Walnut Classroom Wall & Trophy Case',
          shortLabel: 'SR Classroom Wall',
          description:
            'Raked Stage Right walnut classroom flat with fluted pilasters, wainscot panels, and glass trophy cabinet.',
          matchesObject: (obj) => getObjectWorldCenter(obj).x < -1.4,
        },
        {
          id: 'sor-arch-header',
          label: 'Horace Green Crest & Pendant Arch Header',
          shortLabel: 'Crest & Arch Header',
          description:
            'Overhead walnut arch header with V-carved brass Horace Green crest and milk-glass pendant fixtures.',
          matchesObject: (obj) => {
            const cx = getObjectWorldCenter(obj).x;
            return cx >= -1.4 && cx <= 1.4;
          },
        },
        {
          id: 'sor-wing-sl',
          label: 'Stage Left Walnut Classroom Wall & Bookcase',
          shortLabel: 'SL Classroom Wall',
          description:
            'Raked Stage Left walnut classroom flat with fluted pilasters, double doors, and encyclopedia cabinet.',
          matchesObject: (obj) => getObjectWorldCenter(obj).x > 1.4,
        },
      ];
      break;

    case 'sor-center-chalkboard-fly':
      rawUnits = [
        {
          id: 'sor-chalkboards',
          label: 'Flyable Center & Rolling Chalkboard Walls',
          shortLabel: 'Chalkboard Walls',
          description:
            'Lineset #3 flyable Horace Green chalkboard wall with walnut pediment and flanking rolling chalkboards.',
          matchesObject: (obj) => getObjectWorldCenter(obj).z < -2.6,
        },
        {
          id: 'sor-teacher-desk',
          label: "Teacher's Oak Pedestal Desk & Gibson SG",
          shortLabel: "Teacher's Desk",
          description:
            'Double-pedestal oak teacher desk with globe, textbooks, apple, and Dewey\'s red Gibson SG on stand.',
          matchesObject: (obj) => {
            const c = getObjectWorldCenter(obj);
            return c.z >= -2.6 && c.x > 1.3;
          },
        },
        {
          id: 'sor-student-desks',
          label: '6 Horace Green Student Desks & Chairs',
          shortLabel: '6 Student Desks',
          description:
            'Six tubular-steel student desks with book baskets, open notebooks, and molded wood chairs.',
          matchesObject: (obj) => {
            if (hasAncestorNamed(obj, rootGroup, ['HoraceGreenStudentDesks'])) {
              return true;
            }
            const c = getObjectWorldCenter(obj);
            return c.z >= -2.6 && c.x <= 1.3;
          },
        },
      ];
      break;

    case 'sor-band-risers-and-cast':
      rawUnits = [
        {
          id: 'sor-drum-riser',
          label: 'Center Rolling Drum Riser & Rock Kit',
          shortLabel: 'Drum Riser & Kit',
          description:
            'Castered steel-framed drum riser decked in 3/4" birch with 5-piece rock drum kit and brass cymbals.',
          matchesObject: (obj) => {
            const c = getObjectWorldCenter(obj);
            return c.x >= -1.35 && c.x <= 1.35 && c.z < -1.8;
          },
        },
        {
          id: 'sor-amp-backline',
          label: 'SR Marshall / Ampeg Amp Stacks & Road Cases',
          shortLabel: 'SR Amp Backline',
          description:
            'Angled Marshall 4×12 speaker cabinets, Ampeg bass stack, and stenciled ATA flight cases.',
          matchesObject: (obj) => getObjectWorldCenter(obj).x < -1.35,
        },
        {
          id: 'sor-keys-monitors',
          label: 'SL Keyboard Riser & Downstage Wedge Monitors',
          shortLabel: 'Keys Riser & Monitors',
          description:
            'Stage Left rolling keyboard/Hammond organ riser, boom mic stands, and downstage wedge monitors.',
          matchesObject: (obj) => {
            const c = getObjectWorldCenter(obj);
            return c.x > 1.35 || c.z >= -1.8;
          },
        },
      ];
      break;

    case 'sor-truss-towers':
      rawUnits = [
        {
          id: 'sor-truss-sr',
          label: 'Stage Right Box-Truss Concert Towers',
          shortLabel: 'SR Truss Towers',
          description:
            'Two 21\'-8" vertical 12"×12" aluminum box-truss towers on steel deck baseplates (Stage Right).',
          matchesObject: (obj) => getObjectWorldCenter(obj).x < -1.8,
        },
        {
          id: 'sor-marquee-bridge',
          label: 'Battle of the Bands Marquee & Truss Bridge',
          shortLabel: 'Marquee & Bridge',
          description:
            'Flown concert truss bridge with 8 moving-head beam fixtures and CNC-routed "BATTLE OF THE BANDS" sign.',
          matchesObject: (obj) => {
            const cx = getObjectWorldCenter(obj).x;
            return cx >= -1.8 && cx <= 1.8;
          },
        },
        {
          id: 'sor-truss-sl',
          label: 'Stage Left Box-Truss Concert Towers',
          shortLabel: 'SL Truss Towers',
          description:
            'Two 21\'-8" vertical 12"×12" aluminum box-truss towers on steel deck baseplates (Stage Left).',
          matchesObject: (obj) => getObjectWorldCenter(obj).x > 1.8,
        },
      ];
      break;

    case 'alice-tea-table':
      rawUnits = [
        {
          id: 'alice-table',
          label: '22\'-0" Cantilevered Banquet Table & Damask Cloth',
          shortLabel: 'Banquet Table',
          description:
            'Rolling steel-framed banquet table wagon with CNC cabriole legs and scalloped white damask cloth.',
          matchesObject: (obj) => {
            const c = getObjectWorldCenter(obj);
            return c.y < 1.05 && Math.abs(c.x) < 2.1 && c.z >= -1.1;
          },
        },
        {
          id: 'alice-chairs',
          label: 'Mad Hatter Throne & 4 Crooked Wonderland Chairs',
          shortLabel: 'Wonderland Chairs',
          description:
            'Towering purple velvet Mad Hatter armchair and 4 crooked mismatched CNC-routed Wonderland chairs.',
          matchesObject: (obj) => {
            const c = getObjectWorldCenter(obj);
            return Math.abs(c.x) >= 2.1 || c.z < -1.1;
          },
        },
        {
          id: 'alice-props',
          label: 'Crooked Birthday Cakes, Teapots & Lanterns',
          shortLabel: 'Tea Service & Cakes',
          description:
            'Multi-tiered crooked birthday cakes, tilted teapots, stacked teacups, pocket watch, and paper lanterns.',
          matchesObject: (obj) => {
            const c = getObjectWorldCenter(obj);
            return c.y >= 1.05 && Math.abs(c.x) < 2.1 && c.z >= -1.1;
          },
        },
      ];
      break;

    case 'alice-proscenium-frieze':
      rawUnits = [
        {
          id: 'alice-frieze-sr',
          label: 'Stage Right Geometric Frieze & Target Tower',
          shortLabel: 'SR Frieze Tower',
          description:
            'Stepped non-coplanar Stage Right geometric color-block frieze panels, keyhole cutouts, and target rings.',
          matchesObject: (obj) => getObjectWorldCenter(obj).x < -2.2,
        },
        {
          id: 'alice-frieze-header',
          label: 'Upper Proscenium Geometric Valance & Flags',
          shortLabel: 'Upper Frieze Header',
          description:
            'Overhead stepped color-block header panels, checkered racing flags, and circular clock medallions.',
          matchesObject: (obj) => {
            const cx = getObjectWorldCenter(obj).x;
            return cx >= -2.2 && cx <= 2.2;
          },
        },
        {
          id: 'alice-frieze-sl',
          label: 'Stage Left Geometric Frieze & Clock Tower',
          shortLabel: 'SL Frieze Tower',
          description:
            'Stepped non-coplanar Stage Left geometric color-block frieze panels and oversized pocket-watch face.',
          matchesObject: (obj) => getObjectWorldCenter(obj).x > 2.2,
        },
      ];
      break;

    case 'alice-window-backdrop':
      rawUnits = [
        {
          id: 'alice-gothic-window',
          label: 'Forced-Perspective Gothic Lancet Window',
          shortLabel: 'Gothic Window',
          description:
            'CNC-routed pointed gothic arch tracery, trapezoidal forced-perspective mullions, and stained glass.',
          matchesObject: (obj) => {
            const c = getObjectWorldCenter(obj);
            return c.x < 0.85 && c.y < 4.5;
          },
        },
        {
          id: 'alice-crimson-drape',
          label: 'Sculpted Crimson Velvet Swags & Tassel',
          shortLabel: 'Crimson Drapery',
          description:
            'Multi-swag pleated crimson velvet drapery header, gold bullion fringe, and braided tieback tassel.',
          matchesObject: (obj) => {
            const c = getObjectWorldCenter(obj);
            return c.x >= 0.85 || c.y >= 4.5;
          },
        },
      ];
      break;

    default: {
      // Automatic spatial decomposition for wide multi-part elements across Narnia, Charlotte's Web, Mary Poppins, Matilda, etc.
      const overallBox = new THREE.Box3().setFromObject(rootGroup);
      const size = new THREE.Vector3();
      overallBox.getSize(size);
      let meshCount = 0;
      rootGroup.traverse((ch) => {
        if (
          ch instanceof THREE.Mesh &&
          !isInsideCharacterBlockingSubtree(ch, rootGroup)
        ) {
          meshCount++;
        }
      });

      if (
        element.category !== 'masking' &&
        element.category !== 'backdrop' &&
        element.category !== 'blocking' &&
        !element.id.endsWith('-floor') &&
        size.x >= 4.2 &&
        meshCount >= 12
      ) {
        rawUnits = [
          {
            id: 'sub-sr',
            label: `${element.name} · Stage Right Unit`,
            shortLabel: 'Stage Right Unit',
            description: `Stage Right structural sub-assembly of ${element.name}.`,
            matchesObject: (obj) => getObjectWorldCenter(obj).x < -1.1,
          },
          {
            id: 'sub-center',
            label: `${element.name} · Center Stage Unit`,
            shortLabel: 'Center Stage Unit',
            description: `Center stage structural sub-assembly of ${element.name}.`,
            matchesObject: (obj) => {
              const cx = getObjectWorldCenter(obj).x;
              return cx >= -1.1 && cx <= 1.1;
            },
          },
          {
            id: 'sub-sl',
            label: `${element.name} · Stage Left Unit`,
            shortLabel: 'Stage Left Unit',
            description: `Stage Left structural sub-assembly of ${element.name}.`,
            matchesObject: (obj) => getObjectWorldCenter(obj).x > 1.1,
          },
        ];
      }
      break;
    }
  }

  // Filter out any candidate sub-unit that contains 0 structural meshes
  const validUnits = rawUnits.filter((u) => {
    let count = 0;
    rootGroup.traverse((ch) => {
      if (
        ch instanceof THREE.Mesh &&
        ch.geometry &&
        !isInsideCharacterBlockingSubtree(ch, rootGroup) &&
        u.matchesObject(ch)
      ) {
        count++;
      }
    });
    return count > 0;
  });

  if (validUnits.length <= 1) {
    return [];
  }

  return [
    ...validUnits,
    {
      id: 'all',
      label: `All Units Combined (${element.name})`,
      shortLabel: `All ${validUnits.length} Combined`,
      description: `Combined workshop package for all ${validUnits.length} sub-units in ${element.name}.`,
      matchesObject: () => true,
      isCombinedMacroUnit: true,
    },
  ];
}

/**
 * Given a raycasted 3D `hitObject` inside an element's `rootGroup`, returns the specific
 * granular `ScenicSubUnitSpec` that was hovered or clicked (or `null` if the element is a single unit).
 */
export function resolveSubUnitForHitObject(
  element: ProductionElementSpec,
  rootGroup: THREE.Object3D,
  hitObject: THREE.Object3D | null | undefined
): ScenicSubUnitSpec | null {
  if (!hitObject) return null;
  const subUnits = getElementGranularSubUnits(element, rootGroup);
  for (const unit of subUnits) {
    if (unit.isCombinedMacroUnit) continue;
    if (unit.matchesObject(hitObject)) {
      return unit;
    }
  }
  return subUnits.find((u) => !u.isCombinedMacroUnit) ?? null;
}

/**
 * Analyzes a Three.js scenic element group (or a specific granular sub-unit within it),
 * separates CNC-routed components from traditional non-CNC shop components (and excludes
 * cast blocking figures), and generates a focused workshop fabrication plan.
 */
export function analyzeElementForCncShop(
  element: ProductionElementSpec,
  production: ProductionSpec,
  objectGroup: THREE.Object3D,
  requestedSubUnitId?: string | null
): CncElementAnalysis {
  const profile = inferElementFabricationProfile(element);
  const requiresCncRouting =
    profile.method === 'cnc-primary' || profile.method === 'hybrid-cnc-carpentry';

  objectGroup.updateWorldMatrix(true, true);
  const subUnits = getElementGranularSubUnits(element, objectGroup);

  // Default to the first granular sub-unit when multiple exist so the modal opens focused and uncluttered
  const activeSubUnit: ScenicSubUnitSpec | null =
    subUnits.length > 0
      ? (subUnits.find((u) => u.id === requestedSubUnitId) ??
        subUnits.find((u) => !u.isCombinedMacroUnit) ??
        subUnits[0]!)
      : null;

  const isScopedSubUnit =
    activeSubUnit !== null && !activeSubUnit.isCombinedMacroUnit;

  const structuralMeshes: THREE.Mesh[] = [];
  let excludedBlockingFiguresCount = 0;
  const scopedBox = new THREE.Box3();

  objectGroup.traverse((child) => {
    if (child.userData?.isCharacterBlocking === true) {
      excludedBlockingFiguresCount++;
    }
    if (child instanceof THREE.Mesh && child.geometry) {
      if (
        element.category !== 'blocking' &&
        isInsideCharacterBlockingSubtree(child, objectGroup)
      ) {
        return;
      }
      if (isScopedSubUnit && !activeSubUnit.matchesObject(child)) {
        return;
      }
      structuralMeshes.push(child);
      scopedBox.expandByObject(child);
    }
  });

  if (scopedBox.isEmpty()) {
    scopedBox.setFromObject(objectGroup);
  }
  if (scopedBox.isEmpty()) {
    scopedBox.set(new THREE.Vector3(-1, 0, -0.5), new THREE.Vector3(1, 2, 0.5));
  }
  const sizeM = new THREE.Vector3();
  scopedBox.getSize(sizeM);

  const unitInvMatrix = objectGroup.matrixWorld.clone().invert();

  const candidateItems = structuralMeshes
    .map((mesh, idx) => {
      const info = extractMesh2DContourMm(mesh, unitInvMatrix);
      const area = info.widthMm * info.heightMm;
      const classification = classifyMeshFabricationProcess(
        mesh,
        profile.method,
        info.widthMm,
        info.heightMm,
        info.thicknessMm
      );
      const rawName = mesh.name || mesh.parent?.name || `${element.category}_part`;
      return { mesh, idx, info, area, classification, rawName };
    })
    .filter((item) => item.info.widthMm >= 75 && item.info.heightMm >= 75)
    .sort((a, b) => b.area - a.area);

  // Keep per-unit part counts focused and digestible (8 CNC + 4 Shop for individual sub-units)
  const maxCncParts = isScopedSubUnit ? 8 : 16;
  const maxShopParts = isScopedSubUnit ? 4 : 8;

  const rawCncItems = requiresCncRouting
    ? candidateItems
        .filter((item) => item.classification.isCncRouted)
        .slice(0, maxCncParts)
    : [];
  const rawNonCncItems = candidateItems
    .filter((item) => !requiresCncRouting || !item.classification.isCncRouted)
    .slice(0, maxShopParts);

  // Shelf-pack ONLY true CNC-routed parts onto 4'x8' (2438.4 x 1219.2 mm) sheets
  let currentSheet = rawCncItems.length > 0 ? 1 : 0;
  let cursorX = SHEET_MARGIN_MM;
  let cursorY = SHEET_MARGIN_MM;
  let shelfRowHeight = 0;
  let totalPerimeterMm = 0;

  const fallbackLabelBase = (activeSubUnit?.shortLabel || element.name).slice(0, 18);

  const cncParts: CncSubPartRecord[] = rawCncItems.map((item, i) => {
    const w = Math.min(SHEET_WIDTH_MM - SHEET_MARGIN_MM * 2, item.info.widthMm);
    const h = Math.min(SHEET_HEIGHT_MM - SHEET_MARGIN_MM * 2, item.info.heightMm);

    if (cursorX + w + SHEET_MARGIN_MM > SHEET_WIDTH_MM) {
      cursorX = SHEET_MARGIN_MM;
      cursorY += shelfRowHeight + PART_KERF_GAP_MM;
      shelfRowHeight = 0;
    }
    if (cursorY + h + SHEET_MARGIN_MM > SHEET_HEIGHT_MM) {
      currentSheet++;
      cursorX = SHEET_MARGIN_MM;
      cursorY = SHEET_MARGIN_MM;
      shelfRowHeight = 0;
    }

    const sheetXMm = Math.round(cursorX + w / 2);
    const sheetYMm = Math.round(cursorY + h / 2);
    cursorX += w + PART_KERF_GAP_MM;
    shelfRowHeight = Math.max(shelfRowHeight, h);
    totalPerimeterMm += 2 * (w + h);

    const partCode = `CNC-${String(i + 1).padStart(2, '0')}`;
    const cleanLabel = item.rawName
      .replace(/^Element_/, '')
      .replace(/_/g, ' ')
      .slice(0, 24);

    return {
      partCode,
      label: `${partCode} · ${cleanLabel || fallbackLabelBase}`,
      fabricationProcess: item.classification.process,
      materialSpec: item.classification.materialSpec,
      widthMm: w,
      heightMm: h,
      thicknessMm: item.info.thicknessMm,
      widthInches: Math.round((w / 25.4) * 10) / 10,
      heightInches: Math.round((h / 25.4) * 10) / 10,
      thicknessInches: Math.round((item.info.thicknessMm / 25.4) * 100) / 100,
      sheetIndex: currentSheet,
      sheetXMm,
      sheetYMm,
      contourPtsMm: item.info.contourPtsMm,
      unitMinM: item.info.unitMinM,
      unitMaxM: item.info.unitMaxM,
    };
  });

  const nonCncParts: CncSubPartRecord[] = rawNonCncItems.map((item, i) => {
    const w = item.info.widthMm;
    const h = item.info.heightMm;
    const partCode = `SHP-${String(i + 1).padStart(2, '0')}`;
    const cleanLabel = item.rawName
      .replace(/^Element_/, '')
      .replace(/_/g, ' ')
      .slice(0, 24);

    return {
      partCode,
      label: `${partCode} · ${cleanLabel || fallbackLabelBase}`,
      fabricationProcess: 'Traditional Shop / Non-CNC',
      materialSpec: item.classification.materialSpec,
      widthMm: w,
      heightMm: h,
      thicknessMm: item.info.thicknessMm,
      widthInches: Math.round((w / 25.4) * 10) / 10,
      heightInches: Math.round((h / 25.4) * 10) / 10,
      thicknessInches: Math.round((item.info.thicknessMm / 25.4) * 100) / 100,
      sheetIndex: 0,
      sheetXMm: 0,
      sheetYMm: 0,
      contourPtsMm: item.info.contourPtsMm,
      unitMinM: item.info.unitMinM,
      unitMaxM: item.info.unitMaxM,
    };
  });

  const allParts = [...cncParts, ...nonCncParts];
  const estimatedCutLengthM =
    currentSheet > 0 ? Math.max(2.4, Math.round((totalPerimeterMm / 1000) * 10) / 10) : 0;
  const estimatedRouterMinutes =
    currentSheet > 0 ? Math.max(6, Math.round(estimatedCutLengthM * 1.45 + currentSheet * 5)) : 0;

  const displayTitle = isScopedSubUnit ? activeSubUnit.label : element.name;
  const exportSlug = isScopedSubUnit
    ? `${element.id}_${activeSubUnit.id}`
    : element.id;
  const constructionNote = isScopedSubUnit
    ? `${activeSubUnit.description} — ${profile.primaryConstructionNote}`
    : profile.primaryConstructionNote;

  return {
    element,
    productionTitle: production.title,
    displayTitle,
    exportSlug,
    activeSubUnit,
    subUnits,
    fabricationMethod: profile.method,
    fabricationBadgeLabel: profile.badgeLabel,
    requiresCncRouting,
    overallWidthM: Math.round(sizeM.x * 100) / 100,
    overallHeightM: Math.round(sizeM.y * 100) / 100,
    overallDepthM: Math.round(sizeM.z * 100) / 100,
    overallImperialLabel: `${formatMetersToImperialShop(sizeM.x)} W × ${formatMetersToImperialShop(sizeM.y)} H × ${formatMetersToImperialShop(sizeM.z)} D`,
    sheetCount4x8: currentSheet,
    estimatedCutLengthM,
    estimatedRouterMinutes,
    excludedBlockingFiguresCount,
    primaryConstructionNote: constructionNote,
    departmentBreakdown: profile.departments,
    cncParts,
    nonCncParts,
    allParts,
  };
}

/**
 * Renders the interactive 2D Scenic Shop Blueprint OR 4'x8' CNC Sheet Nesting preview canvas.
 * Renders a single focused diagram at full width (`viewMode === 'sheet'` or `'elevation'`)
 * so part labels, dimensions, and contours have generous breathing room.
 */
export function renderCncShopPreviewCanvas(
  canvas: HTMLCanvasElement,
  analysis: CncElementAnalysis,
  activeSheetFilter = 1,
  viewMode: 'sheet' | 'elevation' = 'sheet'
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#0c121d';
  ctx.fillRect(0, 0, w, h);

  // Subtle CAD millimeter grid
  ctx.strokeStyle = 'rgba(72, 138, 220, 0.09)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx < w; gx += 28) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, h);
    ctx.stroke();
  }
  for (let gy = 0; gy < h; gy += 28) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }

  const box = { x: 24, y: 36, w: w - 48, h: h - 54 };

  // Mode 1: Full-Width Front Orthographic Blueprint Elevation
  if (
    viewMode === 'elevation' ||
    !analysis.requiresCncRouting ||
    analysis.sheetCount4x8 === 0
  ) {
    ctx.strokeStyle = 'rgba(110, 175, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    ctx.fillStyle = '#7ec0ff';
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      `FRONT ORTHOGRAPHIC ELEVATION · ${analysis.displayTitle.toUpperCase()}`,
      box.x + 10,
      box.y - 10
    );

    ctx.fillStyle = '#9db4d0';
    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(
      'GREEN = CNC ROUTED / FOAM   ·   BLUE = TRADITIONAL SHOP',
      box.x + box.w - 10,
      box.y - 10
    );
    ctx.textAlign = 'left';

    if (analysis.allParts.length > 0) {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (const p of analysis.allParts) {
        minX = Math.min(minX, p.unitMinM.x);
        maxX = Math.max(maxX, p.unitMaxM.x);
        minY = Math.min(minY, p.unitMinM.y);
        maxY = Math.max(maxY, p.unitMaxM.y);
      }
      const spanX = Math.max(0.4, maxX - minX);
      const spanY = Math.max(0.4, maxY - minY);
      const pad = 34;
      const scale = Math.min(
        (box.w - pad * 2) / spanX,
        (box.h - pad * 2) / spanY
      );
      const ox = box.x + box.w / 2 - (minX + maxX) * 0.5 * scale;
      const oy = box.y + box.h - pad + minY * scale;

      for (const p of analysis.allParts) {
        const rx = ox + p.unitMinM.x * scale;
        const ry = oy - p.unitMaxM.y * scale;
        const rw = Math.max(4, (p.unitMaxM.x - p.unitMinM.x) * scale);
        const rh = Math.max(4, (p.unitMaxM.y - p.unitMinM.y) * scale);
        const isCnc = p.sheetIndex > 0;

        ctx.fillStyle = isCnc
          ? 'rgba(46, 216, 136, 0.16)'
          : 'rgba(88, 180, 255, 0.14)';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = isCnc ? '#38ef8c' : '#58b4ff';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(rx, ry, rw, rh);

        if (rw > 34 && rh > 16) {
          ctx.fillStyle = isCnc ? '#c4ffe0' : '#d8ecff';
          ctx.font = '700 10px "JetBrains Mono", monospace';
          ctx.fillText(p.partCode, rx + 5, ry + 13);
        }
      }

      ctx.fillStyle = '#ffd248';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillText(
        `WIDTH: ${formatMetersToImperialShop(analysis.overallWidthM)} (${Math.round(analysis.overallWidthM * 1000)}mm)   ·   HEIGHT: ${formatMetersToImperialShop(analysis.overallHeightM)} (${Math.round(analysis.overallHeightM * 1000)}mm)`,
        box.x + 14,
        box.y + box.h - 10
      );
    }
    return;
  }

  // Mode 2: Full-Width 4'x8' (1219x2438mm) CNC Router Sheet Nesting Diagram
  const sheetParts = analysis.cncParts.filter(
    (p) => p.sheetIndex === activeSheetFilter
  );

  ctx.fillStyle = '#38ef8c';
  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(
    `4'×8' (1219×2438mm) CNC ROUTER SHEET #${activeSheetFilter} OF ${analysis.sheetCount4x8} · ${analysis.displayTitle.toUpperCase()}`,
    box.x + 4,
    box.y - 10
  );

  ctx.fillStyle = '#9db4d0';
  ctx.font = '600 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(
    `${sheetParts.length} NESTED PART${sheetParts.length === 1 ? '' : 'S'} ON THIS SHEET · 5/8" KERF CLEARANCE`,
    box.x + box.w - 4,
    box.y - 10
  );
  ctx.textAlign = 'left';

  const sheetScale = Math.min(
    (box.w - 24) / SHEET_WIDTH_MM,
    (box.h - 16) / SHEET_HEIGHT_MM
  );
  const sheetPxW = SHEET_WIDTH_MM * sheetScale;
  const sheetPxH = SHEET_HEIGHT_MM * sheetScale;
  const sx0 = box.x + (box.w - sheetPxW) / 2;
  const sy0 = box.y + (box.h - sheetPxH) / 2;

  ctx.fillStyle = '#151f2e';
  ctx.fillRect(sx0, sy0, sheetPxW, sheetPxH);
  ctx.strokeStyle = '#ff9838';
  ctx.lineWidth = 2;
  ctx.strokeRect(sx0, sy0, sheetPxW, sheetPxH);

  // 1" safety margin guide
  const marginPx = SHEET_MARGIN_MM * sheetScale;
  ctx.strokeStyle = 'rgba(255, 152, 56, 0.25)';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1;
  ctx.strokeRect(
    sx0 + marginPx,
    sy0 + marginPx,
    sheetPxW - marginPx * 2,
    sheetPxH - marginPx * 2
  );
  ctx.setLineDash([]);

  for (const part of sheetParts) {
    const cx = sx0 + part.sheetXMm * sheetScale;
    const cy = sy0 + part.sheetYMm * sheetScale;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    part.contourPtsMm.forEach((pt, idx) => {
      const px = pt.x * sheetScale;
      const py = pt.y * sheetScale;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle =
      part.fabricationProcess === 'CNC EPS Foam Carve'
        ? 'rgba(138, 104, 255, 0.22)'
        : 'rgba(46, 216, 136, 0.18)';
    ctx.fill();
    ctx.strokeStyle =
      part.fabricationProcess === 'CNC EPS Foam Carve' ? '#b694ff' : '#38ef8c';
    ctx.lineWidth = 1.75;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(part.partCode, 0, -3);
    ctx.fillStyle = '#a8deff';
    ctx.font = '600 9.5px "JetBrains Mono", monospace';
    ctx.fillText(`${part.widthInches}" × ${part.heightInches}"`, 0, 10);
    ctx.restore();
  }
}

/**
 * Generates an AutoCAD R12/2000 ASCII `.DXF` file containing all 4'x8' CNC router
 * sheets (`SHEET_BORDER`), nested CNC part cut profiles (`CNC_OUTSIDE_CUT`), part callout
 * labels (`PART_LABELS`), and true-scale Front Orthographic Elevation (`ORTHO_ELEVATION`).
 */
export function generateCncDxfFileContent(analysis: CncElementAnalysis): string {
  const lines: string[] = [];
  const pushPair = (code: number, value: string | number): void => {
    lines.push(String(code), String(value));
  };

  pushPair(0, 'SECTION');
  pushPair(2, 'HEADER');
  pushPair(9, '$INSUNITS');
  pushPair(70, 4); // 4 = Millimeters
  pushPair(0, 'ENDSEC');

  pushPair(0, 'SECTION');
  pushPair(2, 'ENTITIES');

  const addClosedPolyline = (
    layer: string,
    color: number,
    pts: ReadonlyArray<{ readonly x: number; readonly y: number }>
  ): void => {
    if (pts.length < 2) return;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]!;
      const b = pts[(i + 1) % pts.length]!;
      pushPair(0, 'LINE');
      pushPair(8, layer);
      pushPair(62, color);
      pushPair(10, a.x.toFixed(2));
      pushPair(20, a.y.toFixed(2));
      pushPair(30, '0.0');
      pushPair(11, b.x.toFixed(2));
      pushPair(21, b.y.toFixed(2));
      pushPair(31, '0.0');
    }
  };

  const addText = (
    layer: string,
    color: number,
    x: number,
    y: number,
    height: number,
    text: string
  ): void => {
    pushPair(0, 'TEXT');
    pushPair(8, layer);
    pushPair(62, color);
    pushPair(10, x.toFixed(2));
    pushPair(20, y.toFixed(2));
    pushPair(30, '0.0');
    pushPair(40, height.toFixed(2));
    pushPair(1, text.replace(/[^\x20-\x7E]/g, '-'));
  };

  for (let s = 1; s <= analysis.sheetCount4x8; s++) {
    const sheetOffsetX = (s - 1) * (SHEET_WIDTH_MM + 300);
    addClosedPolyline('SHEET_BORDER_4X8', 30, [
      { x: sheetOffsetX, y: 0 },
      { x: sheetOffsetX + SHEET_WIDTH_MM, y: 0 },
      { x: sheetOffsetX + SHEET_WIDTH_MM, y: SHEET_HEIGHT_MM },
      { x: sheetOffsetX, y: SHEET_HEIGHT_MM },
    ]);
    addText(
      'PART_LABELS',
      2,
      sheetOffsetX + 20,
      SHEET_HEIGHT_MM + 35,
      28,
      `${analysis.exportSlug.toUpperCase()} - 4x8 CNC SHEET #${s} (2438x1219mm)`
    );

    const sheetParts = analysis.cncParts.filter((p) => p.sheetIndex === s);
    for (const part of sheetParts) {
      const cx = sheetOffsetX + part.sheetXMm;
      const cy = part.sheetYMm;
      const worldPts = part.contourPtsMm.map((pt) => ({
        x: cx + pt.x,
        y: cy + pt.y,
      }));
      addClosedPolyline('CNC_OUTSIDE_CUT', 3, worldPts);
      addText(
        'PART_LABELS',
        7,
        cx - 45,
        cy + 8,
        22,
        `${part.partCode} (${part.widthMm}x${part.heightMm}x${part.thicknessMm}mm)`
      );
    }
  }

  // Emit True-Scale Front Orthographic Elevation below the sheets (y = -4200mm)
  const orthoOriginY = -4200;
  for (const part of analysis.allParts) {
    const x0 = part.unitMinM.x * 1000;
    const x1 = part.unitMaxM.x * 1000;
    const y0 = orthoOriginY + part.unitMinM.y * 1000;
    const y1 = orthoOriginY + part.unitMaxM.y * 1000;
    addClosedPolyline(
      part.sheetIndex > 0 ? 'ORTHO_CNC_PARTS' : 'ORTHO_TRADITIONAL_SHOP',
      part.sheetIndex > 0 ? 3 : 5,
      [
        { x: x0, y: y0 },
        { x: x1, y: y0 },
        { x: x1, y: y1 },
        { x: x0, y: y1 },
      ]
    );
  }

  pushPair(0, 'ENDSEC');
  pushPair(0, 'EOF');
  return lines.join('\n');
}

/**
 * Generates a true-scale Vector `.SVG` CNC Sheet Nesting & Shop Blueprint document.
 */
export function generateCncSvgFileContent(analysis: CncElementAnalysis): string {
  const sheetsToDraw = Math.max(1, analysis.sheetCount4x8);
  const totalWidthMm = sheetsToDraw * (SHEET_WIDTH_MM + 160) + 160;
  const totalHeightMm = SHEET_HEIGHT_MM + 360;

  const svgParts: string[] = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.round(totalWidthMm)} ${Math.round(totalHeightMm)}" width="${Math.round(totalWidthMm)}mm" height="${Math.round(totalHeightMm)}mm">`,
    `<rect width="100%" height="100%" fill="#0c121d"/>`,
    `<text x="80" y="68" fill="#58b4ff" font-family="monospace" font-size="38" font-weight="bold">CHILDREN'S THEATRE OF CHARLOTTE · SCENIC WORKSHOP (${analysis.displayTitle.replace(/&/g, 'AND')})</text>`,
    `<text x="80" y="112" fill="#ffd248" font-family="monospace" font-size="26">METHOD: ${analysis.fabricationBadgeLabel.replace(/&/g, 'AND')} | OVERALL: ${analysis.overallImperialLabel} | 4'x8' CNC SHEETS: ${analysis.sheetCount4x8}</text>`,
  ];

  if (analysis.sheetCount4x8 > 0) {
    for (let s = 1; s <= analysis.sheetCount4x8; s++) {
      const ox = 80 + (s - 1) * (SHEET_WIDTH_MM + 160);
      const oy = 155;
      svgParts.push(
        `<rect x="${ox}" y="${oy}" width="${SHEET_WIDTH_MM}" height="${SHEET_HEIGHT_MM}" fill="#162030" stroke="#ff9838" stroke-width="6"/>`,
        `<text x="${ox + 16}" y="${oy - 14}" fill="#ff9838" font-family="monospace" font-size="26" font-weight="bold">SHEET #${s} (4'x8' / 1219x2438mm BALTIC BIRCH)</text>`
      );

      const sheetParts = analysis.cncParts.filter((p) => p.sheetIndex === s);
      for (const part of sheetParts) {
        const cx = ox + part.sheetXMm;
        const cy = oy + part.sheetYMm;
        const polyPoints = part.contourPtsMm
          .map((pt) => `${(cx + pt.x).toFixed(1)},${(cy + pt.y).toFixed(1)}`)
          .join(' ');
        svgParts.push(
          `<polygon points="${polyPoints}" fill="rgba(56, 239, 140, 0.16)" stroke="#38ef8c" stroke-width="4"/>`,
          `<text x="${cx}" y="${cy - 6}" fill="#ffffff" font-family="monospace" font-size="24" font-weight="bold" text-anchor="middle">${part.partCode}</text>`,
          `<text x="${cx}" y="${cy + 22}" fill="#9ed8ff" font-family="monospace" font-size="18" text-anchor="middle">${part.widthInches}"x${part.heightInches}" (${part.widthMm}x${part.heightMm}mm)</text>`
        );
      }
    }
  } else {
    svgParts.push(
      `<rect x="80" y="155" width="${SHEET_WIDTH_MM}" height="${SHEET_HEIGHT_MM}" fill="#141e2e" stroke="#ffd248" stroke-width="6"/>`,
      `<text x="140" y="260" fill="#ffd248" font-family="monospace" font-size="34" font-weight="bold">NON-CNC SCENIC ELEMENT (${analysis.fabricationBadgeLabel.replace(/&/g, 'AND')})</text>`,
      `<text x="140" y="330" fill="#d8ecff" font-family="monospace" font-size="24">${analysis.primaryConstructionNote.replace(/&/g, 'AND')}</text>`
    );
  }

  svgParts.push(`</svg>`);
  return svgParts.join('\n');
}

/**
 * Generates a Binary `.STL` 3D mesh buffer of the selected scenic unit or granular sub-unit
 * (in millimeters), excluding any non-fabricated character blocking figures, for 3-axis/5-axis
 * CNC EPS foam carving or 1:24 scale model 3D printing.
 */
export function generateCncBinaryStlBuffer(
  objectGroup: THREE.Object3D,
  activeSubUnit?: ScenicSubUnitSpec | null
): ArrayBuffer {
  objectGroup.updateWorldMatrix(true, true);
  const invRoot = objectGroup.matrixWorld.clone().invert();
  const isScoped =
    activeSubUnit !== null &&
    activeSubUnit !== undefined &&
    !activeSubUnit.isCombinedMacroUnit;

  const triangles: { a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3 }[] = [];
  const va = new THREE.Vector3();
  const vb = new THREE.Vector3();
  const vc = new THREE.Vector3();

  objectGroup.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !child.geometry) return;
    if (isInsideCharacterBlockingSubtree(child, objectGroup)) return;
    if (isScoped && !activeSubUnit.matchesObject(child)) return;
    const geom = child.geometry;
    const pos = geom.attributes.position;
    if (!pos) return;
    const relMat = new THREE.Matrix4().multiplyMatrices(invRoot, child.matrixWorld);
    const index = geom.index;

    if (index) {
      for (let i = 0; i < index.count; i += 3) {
        va.fromBufferAttribute(pos, index.getX(i)).applyMatrix4(relMat).multiplyScalar(1000);
        vb.fromBufferAttribute(pos, index.getX(i + 1)).applyMatrix4(relMat).multiplyScalar(1000);
        vc.fromBufferAttribute(pos, index.getX(i + 2)).applyMatrix4(relMat).multiplyScalar(1000);
        triangles.push({ a: va.clone(), b: vb.clone(), c: vc.clone() });
      }
    } else {
      for (let i = 0; i <= pos.count - 3; i += 3) {
        va.fromBufferAttribute(pos, i).applyMatrix4(relMat).multiplyScalar(1000);
        vb.fromBufferAttribute(pos, i + 1).applyMatrix4(relMat).multiplyScalar(1000);
        vc.fromBufferAttribute(pos, i + 2).applyMatrix4(relMat).multiplyScalar(1000);
        triangles.push({ a: va.clone(), b: vb.clone(), c: vc.clone() });
      }
    }
  });

  const triCount = triangles.length;
  const buffer = new ArrayBuffer(84 + triCount * 50);
  const view = new DataView(buffer);

  const headerStr = 'CTC McColl Theatre Scenic Shop CNC 3D STL Export (Units: mm)';
  for (let i = 0; i < Math.min(80, headerStr.length); i++) {
    view.setUint8(i, headerStr.charCodeAt(i));
  }
  view.setUint32(80, triCount, true);

  const edge1 = new THREE.Vector3();
  const edge2 = new THREE.Vector3();
  const norm = new THREE.Vector3();
  let offset = 84;

  for (const tri of triangles) {
    edge1.subVectors(tri.b, tri.a);
    edge2.subVectors(tri.c, tri.a);
    norm.crossVectors(edge1, edge2).normalize();

    view.setFloat32(offset, norm.x, true);
    view.setFloat32(offset + 4, -norm.z, true);
    view.setFloat32(offset + 8, norm.y, true);

    const pts = [tri.a, tri.b, tri.c];
    for (let p = 0; p < 3; p++) {
      const pt = pts[p]!;
      const vo = offset + 12 + p * 12;
      view.setFloat32(vo, pt.x, true);
      view.setFloat32(vo + 4, -pt.z, true);
      view.setFloat32(vo + 8, pt.y, true);
    }
    view.setUint16(offset + 48, 0, true);
    offset += 50;
  }

  return buffer;
}

/**
 * Generates a Scenic Shop Cut-List & Multi-Department Bill of Materials `.CSV` file.
 */
export function generateCncCutListCsvContent(analysis: CncElementAnalysis): string {
  const rows: string[] = [
    'Part Code,Component Name,Scenic Unit,Fabrication Process,4x8 CNC Sheet #,Width (in),Height (in),Thickness (in),Width (mm),Height (mm),Thickness (mm),Material & Shop Specification',
  ];
  for (const p of analysis.allParts) {
    rows.push(
      [
        p.partCode,
        `"${p.label.replace(/"/g, '""')}"`,
        `"${analysis.displayTitle.replace(/"/g, '""')}"`,
        `"${p.fabricationProcess}"`,
        p.sheetIndex > 0 ? String(p.sheetIndex) : 'N/A (Non-CNC)',
        p.widthInches,
        p.heightInches,
        p.thicknessInches,
        p.widthMm,
        p.heightMm,
        p.thicknessMm,
        `"${p.materialSpec.replace(/"/g, '""')}"`,
      ].join(',')
    );
  }
  return rows.join('\n');
}

export function triggerBrowserDownload(
  filename: string,
  content: string | ArrayBuffer,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}
