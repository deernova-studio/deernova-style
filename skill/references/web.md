# Web implementation

Install matching versions of `@deernova/tokens` and `@deernova/ui`. Import tokens.css before components.css. The CSS component namespace is `dn-` (migrated from Paperlight's `pl-`). The UI package provides CSS and HTML examples, not React components or JavaScript behavior.

For framework-neutral implementations, copy the required CSS from `assets/design/`, and derive semantic markup from the relevant preview. Ensure buttons submit only intentionally, fields have labels, dialogs manage focus and Escape, and segmented controls expose their selected state. Preview-only static elements must receive real product behavior before shipping.

`data-theme="light"` or `data-theme="dark"` on the root overrides system theme; removing it follows the system. Persist preferences only if appropriate. Honor prefers-reduced-motion and prefers-reduced-transparency with stable and opaque fallbacks. Do not layer glass over reading content.

Use the source's 4 px spacing grid, thin separators and proportional radii. Documentation or marketing pages may have more generous type and spacing than dense application screens. Do not force the 13 pt Mac baseline onto mobile web. Touch targets should be at least 44 × 44 CSS px; previews may require internal scrolling, but real application layouts must reflow at narrow widths.

Verify 375 px and desktop widths, long Chinese/English text, 200% zoom, keyboard traversal, light/dark focus, primary-button contrast and empty/error states. Copy only needed images; retain provenance. No external font download is required.
