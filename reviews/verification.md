# 0.1.0 verification

- Node.js 24.22.1; npm 11.19.1.
- `npm test`: installation, clean update, modification rejection, backup preservation, scaffold nonempty rejection, local asset resolution, and both-theme text/control contrast passed.
- Official skill-creator quick_validate: passed (isolated temporary Python environment).
- `npm run pack`: all three packages generated successfully.
- Installed actual style tarball through npm exec into an isolated temporary skills directory; doctor reported version 0.1.0, matching source and no local changes.
- Browser: light/dark selection, component search, loaded Button preview (12 button elements), 375px responsive layout without document overflow. No browser console errors during these checks.
- Native SwiftUI examples are migrated guidance, not compiled or device-tested in this repository.
- npm account authenticated as rxshi; deernova organization exists and rxshi is its owner.
- After the owner enabled 2FA and completed browser verification, npm publish returned success for @deernova/tokens@0.1.0, @deernova/ui@0.1.0 and @deernova/style@0.1.0.
- Public registry now serves all three packages at 0.1.0. Installed all three from npm into an isolated temporary directory; verified CSS files, skill install/doctor/update, matching source hash, no local modifications, and website initialization.
- Published package URLs: https://www.npmjs.com/package/@deernova/tokens ; https://www.npmjs.com/package/@deernova/ui ; https://www.npmjs.com/package/@deernova/style .

# 0.2.0 scope correction

The intended product is a design reference skill installed into a specified repository. The initial tokens/UI package split and website scaffolder exceeded that scope.

- Removed tokens/UI workspaces and their build/publish outputs. Only @deernova/style is distributed going forward.
- Added --repo targeting and changed init into an existing-repository skill installation alias.
- Installer writes only the selected skill directory; integration tests preserve existing application files and package.json byte-for-byte and reject conflicting destination flags.
- Skill guidance explicitly adapts design rules to the consuming repository's existing technology and components. Reference CSS/HTML is optional source material, not a required component library.
- Website installation section and READMEs now explain the single-skill workflow.
- Build, integration tests, official skill validation and actual 0.2.0 tarball installation passed.
- 0.2.0 is public and latest points to 0.2.0. Installed the published package into an isolated directory and verified install/doctor/update against an existing repository; only .agents/skills files were added, with existing application and package.json unchanged. Prior 0.1.0 tokens/UI releases remain historical public packages; no unpublish was performed.

# Nature-led documentation homepage

- Rebuilt the homepage around a text-rendered, animated ASCII deer, three sourced natural-history notes, and an embedded interactive field journal.
- Full design reference remains available at reference.html; build generates both pages from the existing sources.
- Browser verified: topic changes, saving a note, restoring it after reload, removing the test note, light/dark themes, 390 px layout without horizontal page overflow, pause/resume and paused-frame stability, navigation to the reference page. No browser console errors observed.
- Reduced-motion handling defaults the deer to a static frame; offscreen/background rendering does not advance the animation. OS-level reduced-motion emulation was not exercised.
- npm test and JavaScript syntax checks pass. No npm release is required for this documentation-only change.
- Natural-history sources are linked beside each fact: Washington Department of Fish & Wildlife and U.S. National Park Service. MiMo supplied the requested character-art/editorial direction; its browser view timed out, so only its retrieved page content was available for reference.

# Continuous deer / starfield sequence

- Replaced the 85 ms text replacement loop with requestAnimationFrame and cached canvas glyphs. Persistent, seeded particles follow continuous paths through a 24-second run / scatter / stars / assemble loop.
- Animation, phase indicator and copy share one active-time clock. Fixed canvas and overlaid copy geometry prevent phase changes from shifting the page; build takes phase labels and copy from the motion model.
- Unit tests cover all phase boundaries, complete-loop continuity, deterministic particles, finite coordinates, bounded copy blending, long-frame clamping, and pause / offscreen / hidden-tab resume without time jumps. All six repository tests pass.
- Browser verified: deer and sparse starfield render; phase copy changes with the drawing; desktop copy bounds remain at top 610.390625 px / height 102 px across run and stars. Paused screenshots compare byte-for-byte equal. At 390 px viewport, document width is 375 px (scrollbar reserved), with no horizontal overflow; copy height remains 96 px.
- Browser console has no errors or warnings. Resize preserves paused scene state. OS reduced-motion and background-tab transitions are covered by implementation/model tests, not OS-level browser emulation. Actual device FPS has not been benchmarked.
- Screenshot: reviews/continuous-deer.png. This is a website update; no npm release was made.

# Architecture separation

- Split UI reference HTML into examples/html; retained guidelines and native examples in design/components. Website HTML, CSS and JS now live under apps/website/pages, styles and scripts. Existing original archive is untouched.
- Added independent build:site and build:skill entrypoints sharing design materialization; token CSS is generated only inside outputs. Website styles are formatted and motion styles consolidated into their own file.
- Added architecture tests proving builds do not mutate sources or each other's output, website changes do not alter skill hashes, and guideline / HTML changes update both consumers. All HTML/CSS/module dependencies resolve in both the website and bundled skill assets. All eight tests pass.
- Motion/state-stability principles now live in design/motion.md and are rendered on the reference site and bundled as a routed skill reference. The deer and starfield remain website-specific examples.
- Official skill-creator validation passes. npm pack inventory: 92 files, 18 HTML examples, motion reference and generated tokens included, no website application files. Extracted an actual npm tarball and ran its install/doctor successfully in an isolated directory.
- Browser verified homepage render, reference navigation, Button iframe with 12 controls, and light/dark theme propagation to the newly separated HTML path. No console errors or warnings observed. Screenshot: reviews/separate-html-references.png.
- README and ARCHITECTURE.md document ownership, generation, hashes, maintenance and release boundaries. This change is committed to GitHub; no new npm version was published.

# Skill-first restructure and new homepage

- The skill now lives as hand-written source in `skills/deernova-style/` (SKILL.md, six references, tokens and six reference screenshots). It is usable straight from the repository; the npm package copies it unchanged and adds `manifest.json`.
- Removed the per-component catalog (`design/components/*`, `examples/html/*`) and the build-time assembly of the skill. Component guidance was merged into `references/patterns.md`, organised by scenario (page skeletons, actions, input, navigation and lists, content, feedback, AI conversation).
- `tokens.json` remains the only hand-edited data. `npm run tokens` generates `assets/tokens.css` and `references/tokens.md`; tests fail if either is stale.
- Homepage (revised after review): modelled on the first screen of mimo.mi.com. A serif title "Deernova UI", a typed line, three pill actions, and a large card with a 26-second loop drawn in letters and halftone dots: the deer runs across a meadow by day (gray letter texture), slows, lifts its head as night falls (letters fade, halftone moon and stars, a shooting star), lowers it at dawn and runs again. One clock drives drawing and palette; the loop pauses off screen and in hidden tabs, has a pause control, and shows a still night frame under reduced motion. `?t=<seconds>&g=<stride>` pins a moment for review. `guide.html` renders the skill itself with a table of contents.
- `npm test`: 9 tests pass (skill frontmatter, links and asset paths, skill contents, token sync, contrast in both themes, package equals source, build isolation and skill hash, site links and placeholders, CLI install/update/backup).
- `npm pack --dry-run`: 19 files, 1.1 MB, no website files.
- Browser (built-in pane, http://localhost:4173): homepage and guide at 1440 px in light and dark, theme toggle, eight pinned moments of the loop and eight stride phases, guide anchors and table-of-contents highlight, 375 px homepage with no horizontal overflow. Smooth scrolling did not advance inside the pane, so the guide now jumps to anchors instantly.
- Not verified: real-time playback speed (the preview pane throttles animation frames to about 2.5 per second), OS-level reduced motion and reduced transparency, Safari and Firefox, a real npm publish. The published 0.2.0 package still contains the previous structure until a new version is released.
- Screenshots: reviews/home-desktop.png, reviews/guide-desktop.png.

# Homepage animation, second pass

- The deer was redrawn as a stag from references: Muybridge's 1887 plates of a galloping Virginia deer (Wikimedia Commons, public domain) for the stride, and photographs of red deer stags for proportions and antlers. It is a rig in body lengths: trunk, neck and head outlines, five-segment legs with a ham that swings with the thigh, and six-tine antlers. Far-side legs, antler and ear print dimmer; the belly is shaded and the eye left out.
- Gaits: an eight-key gallop and a six-key walk, blended by speed. The ground speed is derived from each gait's stance so planted hooves stay planted, and the loop holds a whole number of strides.
- Story, 30 seconds: gallop by day; the sun sets ahead and the stag slows to a walk and stops; it looks up as the camera pulls back and the stars come out from the top; a new star flares where it is looking and the stars draw a leaping deer; dawn rises from the horizon, it lowers its head, walks and gallops again. Stride, travel and camera are integrated once from the clock, so `?t=` shows any second exactly; `?g=` pins the stride and `?halftone=0` shows the field without dots.
- Printing: the field is supersampled 3×3 per cell, so thin legs and antler tines keep their shape instead of flickering; faint light thins out dots instead of shrinking them past a cutoff, so glows have no edge. Letters fill the sky only; the land is printed in dots.
- Checked in headless Chrome: 16 moments of the loop at 1440 px, the gallop and walk cycles, the stop and the restart as filmstrips, the dark theme, and a 375 px card (cell 4 px there; the setting sun moves behind the stag so it does not merge with the head). Frame cost with a 1270 px card at 2× DPR: median 4.3 ms, 90th percentile 7.3 ms.
- `npm test`: 9 tests pass.
- Not verified: Safari and Firefox, real devices, OS-level reduced motion (the still frame is t = 20.2, the drawn star deer).
- Screenshots: reviews/home-desktop.png (day gallop), reviews/home-night.png (the star deer).

# Homepage: full-screen run, anime style

- The homepage is now the animation alone, full screen, with a floating glass masthead and one glass card (name, one line, a link to the guide). The mimo-style title, typed line and three pills moved to the top of `guide.html`; the typed line now reads "写给 agent 的界面设计规范", and the old slogan is gone from both pages. The pause control was removed.
- The stag never stops: one gallop the whole loop. 30 seconds: a meadow under cumulus clouds with a low sun, flowers and wind streaks; a misty forest with layered trunks, foliage and light shafts, and a trunk that passes in front of the lens; a ridge under the Milky Way with fireflies and shooting stars, where the hooves leave stardust; then back into the morning meadow. Each scene comes in from ahead of the stag with a wipe whose edge prints the picture in letters (a value ramp, with the darkest cells spelling DEERNOVA).
- Style: scenes are painted in gray, snapped to five flat tones (like manga screentone or anime cel shading) and printed as halftone. The stag is white with a dark outline. Light theme prints ink on paper; dark theme prints light on black.
- Photos from Wikimedia Commons (Muybridge plates, a prairie panorama, a misty forest, a Milky Way photograph; all public domain or CC0) were downloaded to the scratchpad with approval for reference. None are in the repository; after feedback asking for an anime look rather than photographs, the scenes are drawn in code.
- Checked in headless Chrome: twelve moments across the loop and both scene changes at 1440 px, dark theme, three 375 px frames, and the guide header. Frame cost, full screen at 2× DPR: median 7.8 ms at 1440×900, 8.8 ms at 1920×1080, 4.1 ms on a phone.
- `npm test`: 9 tests pass.
- Not verified: Safari and Firefox, real devices, OS-level reduced motion (the still frame is t = 24.5, the night ridge).
- Screenshots: reviews/home-desktop.png (meadow), reviews/home-night.png (night ridge), reviews/guide-desktop.png.
