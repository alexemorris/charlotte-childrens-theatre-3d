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

export interface CncElementAnalysis {
  readonly element: ProductionElementSpec;
  readonly productionTitle: string;
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

/**
 * Analyzes a Three.js scenic element group, separates CNC-routed components from
 * traditional non-CNC shop components (and excludes cast blocking figures), and
 * generates a complete workshop fabrication plan.
 */
export function analyzeElementForCncShop(
  element: ProductionElementSpec,
  production: ProductionSpec,
  objectGroup: THREE.Object3D
): CncElementAnalysis {
  const profile = inferElementFabricationProfile(element);
  const requiresCncRouting =
    profile.method === 'cnc-primary' || profile.method === 'hybrid-cnc-carpentry';

  objectGroup.updateWorldMatrix(true, true);
  const overallBox = new THREE.Box3().setFromObject(objectGroup);
  if (overallBox.isEmpty()) {
    overallBox.set(new THREE.Vector3(-1, 0, -0.5), new THREE.Vector3(1, 2, 0.5));
  }
  const sizeM = new THREE.Vector3();
  overallBox.getSize(sizeM);

  const unitInvMatrix = objectGroup.matrixWorld.clone().invert();
  const structuralMeshes: THREE.Mesh[] = [];
  let excludedBlockingFiguresCount = 0;

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
      structuralMeshes.push(child);
    }
  });

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

  const rawCncItems = requiresCncRouting
    ? candidateItems.filter((item) => item.classification.isCncRouted).slice(0, 22)
    : [];
  const rawNonCncItems = candidateItems
    .filter((item) => !requiresCncRouting || !item.classification.isCncRouted)
    .slice(0, 12);

  // Shelf-pack ONLY true CNC-routed parts onto 4'x8' (2438.4 x 1219.2 mm) sheets
  let currentSheet = rawCncItems.length > 0 ? 1 : 0;
  let cursorX = SHEET_MARGIN_MM;
  let cursorY = SHEET_MARGIN_MM;
  let shelfRowHeight = 0;
  let totalPerimeterMm = 0;

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
      label: `${partCode} · ${cleanLabel || element.name.slice(0, 18)}`,
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
      label: `${partCode} · ${cleanLabel || element.name.slice(0, 18)}`,
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
    currentSheet > 0 ? Math.max(3.2, Math.round((totalPerimeterMm / 1000) * 10) / 10) : 0;
  const estimatedRouterMinutes =
    currentSheet > 0 ? Math.max(8, Math.round(estimatedCutLengthM * 1.45 + currentSheet * 6)) : 0;

  return {
    element,
    productionTitle: production.title,
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
    primaryConstructionNote: profile.primaryConstructionNote,
    departmentBreakdown: profile.departments,
    cncParts,
    nonCncParts,
    allParts,
  };
}

/**
 * Renders the interactive 2D Scenic Shop Blueprint & 4'x8' CNC Sheet Nesting preview canvas.
 * If the unit is manufactured without CNC (e.g. Soft Goods Scrim/Curtain, Box Truss, or Props),
 * the right panel renders a dedicated Department Fabrication Schematic instead of fake CNC sheets.
 */
export function renderCncShopPreviewCanvas(
  canvas: HTMLCanvasElement,
  analysis: CncElementAnalysis,
  activeSheetFilter = 1
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#0e1522';
  ctx.fillRect(0, 0, w, h);

  // Subtle CAD millimeter grid
  ctx.strokeStyle = 'rgba(72, 138, 220, 0.11)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx < w; gx += 24) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, h);
    ctx.stroke();
  }
  for (let gy = 0; gy < h; gy += 24) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }

  // Left Half: Front Orthographic Shop Elevation with Color-Coded CNC vs Traditional Parts
  const leftBox = { x: 18, y: 34, w: w * 0.44 - 24, h: h - 52 };
  ctx.strokeStyle = 'rgba(110, 175, 255, 0.38)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(leftBox.x, leftBox.y, leftBox.w, leftBox.h);

  ctx.fillStyle = '#7ec0ff';
  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.fillText(
    'FRONT ORTHOGRAPHIC ELEVATION (GREEN=CNC, BLUE=TRADITIONAL SHOP)',
    leftBox.x + 8,
    leftBox.y - 8
  );

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
    const spanX = Math.max(0.5, maxX - minX);
    const spanY = Math.max(0.5, maxY - minY);
    const pad = 26;
    const scale = Math.min((leftBox.w - pad * 2) / spanX, (leftBox.h - pad * 2) / spanY);
    const ox = leftBox.x + leftBox.w / 2 - (minX + maxX) * 0.5 * scale;
    const oy = leftBox.y + leftBox.h - pad + minY * scale;

    for (const p of analysis.allParts) {
      const rx = ox + p.unitMinM.x * scale;
      const ry = oy - p.unitMaxM.y * scale;
      const rw = Math.max(3, (p.unitMaxM.x - p.unitMinM.x) * scale);
      const rh = Math.max(3, (p.unitMaxM.y - p.unitMinM.y) * scale);
      const isCnc = p.sheetIndex > 0;

      ctx.fillStyle = isCnc ? 'rgba(46, 216, 136, 0.16)' : 'rgba(88, 180, 255, 0.14)';
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = isCnc ? '#38ef8c' : '#58b4ff';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(rx, ry, rw, rh);

      if (rw > 26 && rh > 14) {
        ctx.fillStyle = isCnc ? '#b8ffda' : '#d8ecff';
        ctx.font = '600 9px "JetBrains Mono", monospace';
        ctx.fillText(p.partCode, rx + 4, ry + 11);
      }
    }

    ctx.fillStyle = '#ffd248';
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.fillText(
      `W: ${formatMetersToImperialShop(analysis.overallWidthM)} (${Math.round(analysis.overallWidthM * 1000)}mm)`,
      leftBox.x + 12,
      leftBox.y + leftBox.h - 8
    );
    ctx.fillText(
      `H: ${formatMetersToImperialShop(analysis.overallHeightM)} (${Math.round(analysis.overallHeightM * 1000)}mm)`,
      leftBox.x + 12,
      leftBox.y + 18
    );
  }

  // Right Half: Either 4'x8' CNC Router Sheet Nesting OR Non-CNC Shop Pattern View
  const rightBox = { x: w * 0.45 + 6, y: 34, w: w * 0.55 - 24, h: h - 52 };

  if (analysis.requiresCncRouting && analysis.sheetCount4x8 > 0) {
    ctx.fillStyle = '#38ef8c';
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillText(
      `4'×8' (1220×2440mm) CNC ROUTER SHEET #${activeSheetFilter} OF ${analysis.sheetCount4x8}`,
      rightBox.x + 4,
      rightBox.y - 8
    );

    const sheetScale = Math.min(
      (rightBox.w - 20) / SHEET_WIDTH_MM,
      (rightBox.h - 20) / SHEET_HEIGHT_MM
    );
    const sheetPxW = SHEET_WIDTH_MM * sheetScale;
    const sheetPxH = SHEET_HEIGHT_MM * sheetScale;
    const sx0 = rightBox.x + (rightBox.w - sheetPxW) / 2;
    const sy0 = rightBox.y + (rightBox.h - sheetPxH) / 2;

    ctx.fillStyle = '#192334';
    ctx.fillRect(sx0, sy0, sheetPxW, sheetPxH);
    ctx.strokeStyle = '#ff9838';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx0, sy0, sheetPxW, sheetPxH);

    const sheetParts = analysis.cncParts.filter((p) => p.sheetIndex === activeSheetFilter);
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
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(part.partCode, 0, -2);
      ctx.fillStyle = '#9ed8ff';
      ctx.font = '500 8px "JetBrains Mono", monospace';
      ctx.fillText(`${part.widthInches}"×${part.heightInches}"`, 0, 9);
      ctx.restore();
    }
  } else {
    // Non-CNC Element (Soft Goods / Paint Shop, Box Truss Rigging, or Props/Blocking)
    ctx.fillStyle = '#ffd248';
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillText(
      `NON-CNC SHOP SPECIFICATION · ${analysis.fabricationBadgeLabel}`,
      rightBox.x + 4,
      rightBox.y - 8
    );

    ctx.fillStyle = '#141e2e';
    ctx.fillRect(rightBox.x, rightBox.y, rightBox.w, rightBox.h);
    ctx.strokeStyle = 'rgba(255, 210, 72, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rightBox.x, rightBox.y, rightBox.w, rightBox.h);

    ctx.fillStyle = '#ffd248';
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      'NO 4\'×8\' CNC ROUTING REQUIRED FOR THIS SCENIC UNIT',
      rightBox.x + 18,
      rightBox.y + 30
    );

    ctx.fillStyle = '#c8daf0';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    const noteWords = analysis.primaryConstructionNote.split(' ');
    let line = '';
    let ly = rightBox.y + 54;
    for (const word of noteWords) {
      if ((line + word).length > 56) {
        ctx.fillText(line.trim(), rightBox.x + 18, ly);
        line = word + ' ';
        ly += 16;
      } else {
        line += word + ' ';
      }
    }
    if (line.trim()) {
      ctx.fillText(line.trim(), rightBox.x + 18, ly);
      ly += 24;
    }

    for (const dept of analysis.departmentBreakdown) {
      ctx.fillStyle = 'rgba(88, 180, 255, 0.14)';
      ctx.fillRect(rightBox.x + 18, ly - 4, rightBox.w - 36, 44);
      ctx.strokeStyle = 'rgba(88, 180, 255, 0.4)';
      ctx.strokeRect(rightBox.x + 18, ly - 4, rightBox.w - 36, 44);

      ctx.fillStyle = '#7ec0ff';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillText(`${dept.department} [${dept.roleBadge}]`, rightBox.x + 26, ly + 12);

      ctx.fillStyle = '#d8e6f8';
      ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(dept.scopeSummary.slice(0, 74), rightBox.x + 26, ly + 28);
      ly += 52;
    }
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
      `${analysis.element.id.toUpperCase()} - 4x8 CNC SHEET #${s} (2438x1219mm)`
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
    `<text x="80" y="68" fill="#58b4ff" font-family="monospace" font-size="38" font-weight="bold">CHILDREN'S THEATRE OF CHARLOTTE · SCENIC WORKSHOP (${analysis.element.name.replace(/&/g, 'AND')})</text>`,
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
 * Generates a Binary `.STL` 3D mesh buffer of the selected scenic unit (in millimeters),
 * excluding any non-fabricated character blocking figures, for 3-axis/5-axis CNC EPS
 * foam carving or 1:24 scale model 3D printing.
 */
export function generateCncBinaryStlBuffer(objectGroup: THREE.Object3D): ArrayBuffer {
  objectGroup.updateWorldMatrix(true, true);
  const invRoot = objectGroup.matrixWorld.clone().invert();

  const triangles: { a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3 }[] = [];
  const va = new THREE.Vector3();
  const vb = new THREE.Vector3();
  const vc = new THREE.Vector3();

  objectGroup.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !child.geometry) return;
    if (isInsideCharacterBlockingSubtree(child, objectGroup)) return;
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
        `"${analysis.element.name.replace(/"/g, '""')}"`,
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
