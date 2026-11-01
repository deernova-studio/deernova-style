# Web implementation

Read the repository’s existing framework, styles and components first. Translate Deernova’s semantic values and visual principles into that system. No npm style or UI package is required. The bundled HTML/CSS files are visual references; their `dn-` class names are not an interface that consuming projects must adopt.

Use `assets/design/tokens.json` and the relevant previews in `assets/examples/html/` to make implementation decisions. Copy selected reference CSS only if it fits the user’s task and project conventions; do not add an entire stylesheet or scaffold application code just because the skill is installed. Ensure buttons submit only intentionally, fields have labels, dialogs manage focus and Escape, and segmented controls expose their selected state. Preview-only static elements must receive real product behavior before shipping.

`data-theme="light"` or `data-theme="dark"` on the root overrides system theme; removing it follows the system. Persist preferences only if appropriate. Honor prefers-reduced-motion and prefers-reduced-transparency with stable and opaque fallbacks. Do not layer glass over reading content.

Use the source's 4 px spacing grid, thin separators and proportional radii. Documentation or marketing pages may have more generous type and spacing than dense application screens. Do not force the 13 pt Mac baseline onto mobile web. Touch targets should be at least 44 × 44 CSS px; previews may require internal scrolling, but real application layouts must reflow at narrow widths.

Verify 375 px and desktop widths, long Chinese/English text, 200% zoom, keyboard traversal, light/dark focus, primary-button contrast and empty/error states. Copy only needed images; retain provenance. No external font download is required.

For continuous scenes or changing content, read [motion and state stability](motion.md). Reserve responsive space for state changes, synchronize related visuals and copy, and preserve user state across redraws.
