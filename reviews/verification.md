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
