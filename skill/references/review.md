# Review criteria

- Hierarchy: opaque readable surfaces, semantic layering, shadows reserved for floating elements.
- Color: neutral accent; on-accent follows theme; status has text/icon; no decorative status colors.
- Contrast: measure foreground/background combinations. Normal text target 4.5:1; meaningful control boundaries 3:1. Do not assume an arbitrary pairing passes because individual tokens exist.
- Type: serif for editorial titles/prose; sans for interaction; tabular figures for comparable data. Preserve readable sizes and wrapping.
- Layout: 4-unit spacing, platform-appropriate density, concentric nested radii, no clipped essential content.
- Interaction: focus visibility, keyboard order, actionable labels, loading/error/disabled state semantics, adequate hit areas.
- Motion: apply [state stability](motion.md) when relevant; check phase/loop continuity, stable reading positions and interruption recovery without losing user state.
- Accessibility: test both themes, reduced motion/transparency, text scaling and non-color status cues.
- Copy: direct Chinese, verb-first action labels, spaces between Chinese and Latin/numbers, concrete recovery guidance.
- Integration: shared tokens and components, no duplicated literal palette or independent skill drift.

Report severity, location, user impact and a specific correction. Distinguish observed failures from unverified concerns. A review does not authorize publishing, broad restyling, or changing deployment targets.
