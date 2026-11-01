# Apple platform implementation

The migrated guide targets iOS 26 / macOS 26 and includes SwiftUI examples. Check the project's actual SDK and deployment target before adopting newer APIs; the guide's target does not authorize changing the application's supported OS range. For older targets, discuss or implement a suitable native fallback within the task scope.

Map semantic colors to Asset Catalog Any/Dark sets and ShapeStyle color extensions. Use `brandAccent` to avoid confusing the system accentColor. Prefer NavigationStack, NavigationSplitView, TabView and native toolbar materials. Custom floating actions may use system glass where available; never recreate native glass from CSS values.

Use semantic text styles for Dynamic Type on iOS, 44 pt minimum hit areas, displayScale-aware hairlines, monospacedDigit for aligned values, SF Symbols for icons, and environment accessibility settings. Mac dense controls may use the documented 24 pt baseline. SwiftUI examples are implementation guidance, not a compiled native SDK; compile against the target SDK and test interactions and large text.
