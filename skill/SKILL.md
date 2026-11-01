---
name: deernova-style
description: Apply Deernova's monochrome design language to Deernova apps, websites and components; implement or review semantic tokens, typography, paper and glass hierarchy, platform density and accessibility. Use when a project requests Deernova styling or adopts this design system.
---

# Deernova Style

Use this skill as the design reference for the repository in which it is installed. Read its guidelines when creating, modifying or reviewing that repository’s interface. Apply the principles through the project’s existing technology and components; do not install a component library or replace the architecture merely to follow this skill.

Build coherent Deernova interfaces using the versioned resources bundled with this skill. Preserve the user's product, platform, framework and requested scope. The HTML previews demonstrate appearance; they are not production SwiftUI components or proof of functional behavior.

## Start with the relevant source

- Read [foundations](references/foundations.md) for principles, writing, layout, platform behavior, motion and accessibility.
- Read [tokens](references/tokens.md) when choosing semantic values. Exact structured values and typography live in `assets/design/tokens.json`; the CSS in `assets/design/tokens.css` is a reference implementation, not a mandatory dependency.
- Search [components](references/components.md) for the component being implemented, then inspect `assets/design/components/<Name>/preview.html` for its anatomy and variants. Native implementation examples live in that component's README.
- For web implementation and validation, read [web](references/web.md). For native implementation, read [native](references/native.md).
- For design review, read [review](references/review.md). Report concrete mismatches and locations; do not redesign unrelated screens.

## Core decisions

Content lives on opaque paper surfaces; transient actions may use glass. Use neutral grayscale and contrast for emphasis. Color communicates status with supporting text or symbols. Use semantic tokens rather than copying literals. `accent` maps to ink; primary labels use `on-accent`, never hardcoded white.

Serif communicates titles and sustained reading; system sans supports controls; monospace supports code and aligned data. Preserve platform differences: compact macOS controls, Dynamic Type and 44 pt hit regions on iOS, responsive web layouts. Do not impose desktop dimensions on touch screens.

Cards use thin borders without floating shadows. System-native controls and glass take precedence on supported Apple platforms. The supplied CSS glass values are web approximations only. Honor the project's deployment target rather than silently raising it to the source guide's iOS/macOS 26 baseline.

## Workflow

1. Identify target platform, screen purpose, existing components and styling integration.
2. Select tokens and component patterns from the bundled source. Retain existing product behavior and content.
3. Implement normal, selected, disabled, loading, empty and error states where the product needs them. Give demonstrations explicit demo behavior; do not invent backend operations.
4. Verify both themes, keyboard navigation, focus, overflow, status clarity and relevant touch/text scaling. Use the review reference for concrete criteria.
5. Report implementation and verification limits. Do not claim native parity or accessibility compliance based only on the visual preview.

## Version and updates

`manifest.json` identifies the package version and source hash. The documentation website and skill references are generated together from the repository's `design/` source. Update through `npx @deernova/style@latest update` in the same project; for global installations append `--global` and the same agent choice. This is an explicit update, not a background network service. Preserve local changes; the CLI refuses to overwrite them unless `--force` is requested, in which case it keeps a backup. Never edit generated references as the upstream source.
