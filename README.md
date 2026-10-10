# Children's Theatre of Charlotte — 3D Set Design & Audience Sightline Modeler

Interactive **Three.js + TypeScript + Vite** 3D architectural digital twin, scenic set design sandbox, counterweight fly-loft simulator, and **570-seat 1st-person sightline analyzer** built for the **Hugh McColl Family Theatre at ImaginOn** (**Children's Theatre of Charlotte**, 300 E. 7th St, Charlotte, NC).

---

## Venue Research & Architectural Specifications

- **Facility:** **ImaginOn: The Joe & Joan Martin Center** (`300 E. 7th St, Charlotte, NC 28202`) — a 102,000 sq ft joint venture between **Children's Theatre of Charlotte** and the **Charlotte Mecklenburg Library**, and the first LEED Silver public building in Mecklenburg County.
- **Opened:** **October 8, 2005** (Inaugural mainstage production: *The Lion, the Witch and the Wardrobe*).
- **Architects & Theatre Consultants:** Designed by **Holzman Moss Bottino Architecture** (formerly Hardy Holzman Pfeiffer Associates) in collaboration with **Gantt Huberman Architects** (Charlotte) and **Theatre Projects Consultants**.
- **Auditorium Capacity (570 Seats):**
  - **Main Floor (Orchestra):** **420 seats** across Rows `A`–`P` (`Main Floor Left Wing`, `Main Floor Center-Left`, `Main Floor Center-Right`, `Main Floor Right Wing`).
  - **Balcony Tiers:** **150 seats** across the **Lower Balcony** (`96 seats`, Rows `AA`–`DD` + angled side box wings with 14 FOH balcony rail spotlights) and **Upper Balcony** (`54 seats`, Rows `UA`–`UC` + overhead FOH lighting catwalk bridge).
- **Stage & Rigging Infrastructure:**
  - Postmodern geometric relief proscenium arch (checkerboard, quilted diamond, and sculptural frieze panels).
  - Trapped stage floor (`3` removable stage traps into the lower trap room).
  - **Single-purchase counterweight fly system** (Lines `1`–`4` modeled with live trim-height controls from `0.0m` in-trim to `+6.8m` out-trim).
  - **20-player sunken orchestra pit** with removable forestage apron cover.

---

## Key Features

1. **570 Clickable Seats & 1st-Person Sightline View (`Seat View Mode`)**
   - Click any seat directly in the **3D Auditorium** or on the **Interactive 2D SVG Seating Chart** to fly into a 1st-person seated perspective looking at the stage.
   - **Drag Mouse / Touch** to look freely around the stage, proscenium arch, wings, and upper fly loft from that exact seat.
   - **Child (`0.96m`) vs. Adult (`1.18m`) Eye-Height Toggle (`C`):** Specifically calibrated for Children's Theatre of Charlotte's young audiences to verify sightlines over the row ahead and check stage floor grazing angles from Row A.
   - **Balcony Overhang & Lateral Masking Sightline Heatmap:** Instantly color-codes all 570 seats in 2D and 3D (`Optimal`, `Good`, `Balcony Overhang Trim`, `Extreme Side Angle`) and calculates maximum visible fly height at the upstage backdrop.
   - **3D Sightline Laser Rays (`L`):** Projects 3D sightline vectors from the active seat's eye point to Downstage Apron, Center Stage, Stage Left/Right Wings, and the Upstage Fly Header.

2. **7 Modular Switchable Production Sets (`src/sets/`)**
   - `src/sets/school-of-rock.ts` — ***School of Rock (Battle of the Bands & Horace Green Prep)***: Recreated from the Children's Theatre of Charlotte production photos, featuring the painted navy/teal tartan plaid stage floor with the angled `"H G"` Horace Green shield crest (DSR), 4 vertical aluminum concert box-truss towers with LED PARs and cyan spotlight beams, stepped pyramid wall of 24 rock speaker cabinets, cherry-trimmed Horace Green chalkboard classroom wing walls, flyable Center Classroom chalkboard unit on Batten Line 3, rolling Yamaha keyboard & Roland drum risers, road cases with student performers, and Dewey Finn at Center Stage.
   - `src/sets/alice-in-wonderland.ts` — ***Alice in Wonderland (Mad Hatter's Tea Party)***: Recreated directly from the McColl Family Theatre reference photo, featuring the raked forced-perspective gothic stained-glass window, crimson velvet swag curtain, radiating geometric painted stage floor, and banquet table with cast blocking.
   - `src/sets/narnia-wardrobe.ts` — ***The Lion, the Witch and the Wardrobe***: Commemorates the October 2005 inaugural McColl Family Theatre production with the carved oak Wardrobe wagon (DSR), Lantern Waste lamppost (DSL), frozen ice-crystal arch portals, and Aslan's Stone Table.
   - `src/sets/charlottes-web.ts` — ***Charlotte's Web (Zuckerman's Barn)***: Timber-frame gambrel barn portal with `+2.45m` hayloft deck, illuminated `"SOME PIG"` silver spiderweb in the upper barn frame, and Wilbur's cedar pen.
   - `src/sets/mary-poppins.ts` — ***Mary Poppins (Cherry Tree Lane & High-Fly Rig)***: Tests upper-balcony overhang sightlines against a performer flying at `+4.85m` above the stage, alongside Victorian London chimney rooftops and 17 Cherry Tree Lane.
   - `src/sets/matilda.ts` — ***Matilda The Musical***: Scrambled alphabet-cube proscenium portals, Mrs. Phelps' library bookcase towers, and revolving classroom desk turntable.
   - `src/sets/tech-grid-sandbox.ts` — ***Technical Stage Grid & Designer Sandbox***: Bare 1m × 1m CAD marley grid with Centerline (`CL`) & Plaster Line (`PL`) spike marks, `1m`–`7m` trim calibration poles, and Child (`1.35m`) / Adult (`1.75m`) scale figures.

3. **Modular Custom Set Piece Spawner & Stage Mechanics**
   - Spawn and position custom `4×8ft Stage Risers`, `12ft Scenic Flats`, `Arch Portals`, `3-Step Stairs`, `Periaktoi`, `Prop Tables`, and `Child/Adult Scale Performers`.
   - Operate the **Counterweight Fly Battens (`Lines 1–4`)**, **Grand Velour Curtain**, **Stage Floor Traps**, and **20-Player Orchestra Pit**.

4. **Custom HDR WebGL2 Post-Processing Pipeline (`src/engine/`)**
   - Adapted from the Crox Farmhouse graphics pipeline: Symmetric-Pair Screen-Space Contact Ambient Occlusion (SSAO), Warm Theatrical Halation Bloom, Per-Pixel 3D Camera Shutter Motion Blur, Contrast-Adaptive Sharpening (CAS), and ACES Filmic Tone Mapping.

---

## Project Directory Structure

```text
charlotte-childrens-theatre-3d/
├── index.html                        # App shell, Loading Screen & floating HUD windows
├── public/
│   └── reference/                    # Venue reference photos & official seating chart
└── src/
    ├── main.ts                       # Application bootstrap & loading progress controller
    ├── style.css                     # Matte dark charcoal utility inspector stylesheet
    ├── types/
    │   └── theatre.ts                # Strict TypeScript interfaces (seats, sets, rigging)
    ├── engine/
    │   ├── post-processing-pipeline.ts # HDR SSAO + Bloom + Motion Blur + CAS + ACES
    │   ├── procedural-textures.ts    # Procedural PBR CanvasTextures (wood, velour, floor)
    │   └── shader-light-culling.ts   # PBR fragment shader distance light culling
    ├── sets/
    │   ├── index.ts                  # Production set registry & controller barrel
    │   ├── types.ts                  # Shared set builder interfaces
    │   ├── shared-scenic-helpers.ts  # Scale figure builder, rigging battens & masking legs
    │   ├── school-of-rock.ts         # Set 1: School of Rock (Battle of the Bands & Horace Green)
    │   ├── alice-in-wonderland.ts    # Set 2: Alice in Wonderland (Mad Hatter's Tea Party)
    │   ├── narnia-wardrobe.ts        # Set 3: The Lion, the Witch and the Wardrobe (2005)
    │   ├── charlottes-web.ts         # Set 4: Charlotte's Web (Zuckerman's Barn)
    │   ├── mary-poppins.ts           # Set 5: Mary Poppins (Cherry Tree Lane & Fly Rig)
    │   ├── matilda.ts                # Set 6: Matilda The Musical (Alphabet Portal)
    │   ├── tech-grid-sandbox.ts      # Set 7: Technical Stage Grid & Sandbox
    │   └── custom-set-pieces.ts      # Custom modular set piece builder
    ├── theatre/
    │   ├── seating-layout.ts         # 570-seat generator & 3D sightline math engine
    │   ├── theatre-architecture.ts   # McColl Theatre 3D shell, proscenium, balconies, traps
    │   └── theatre-scene.ts          # Three.js scene, camera modes, lighting & picking
    └── ui/
        ├── hud.ts                    # Floating HUD windows, sliders & keyboard shortcuts
        └── seating-chart-svg.ts      # Interactive 2D SVG seating chart (570 seats)
```

---

## Getting Started

```bash
npm install
npm run dev
```

To typecheck and build for production:

```bash
npm run build
```
