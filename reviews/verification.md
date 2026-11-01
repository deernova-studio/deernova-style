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
