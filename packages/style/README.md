# @deernova/style

Install the Deernova design reference skill into an existing repository. Requires Node.js 22+. No runtime dependencies.

```sh
npx @deernova/style@latest install --repo /path/to/project
npx @deernova/style@latest update --repo /path/to/project
npx @deernova/style@latest doctor --repo /path/to/project
```

Run without `--repo` inside your target project to use its current directory. The CLI writes only `.agents/skills/deernova-style/` by default. It does not add application code, CSS imports or package dependencies. The AI uses the installed skill to guide implementation through your project's existing framework and components.

The skill contains the complete Deernova foundations, writing, typography, semantic values, platform density, accessibility, review criteria, component/layout references, SwiftUI examples and visual assets. The skill bundles shared design sources and separate HTML examples under `assets/design/` and `assets/examples/html/`. The showcase website is built independently and is not installed. Website-only changes do not alter the skill content hash.

Use `--agent claude|codex|agents` to choose the skill directory, `--dir <skills-parent>` for a custom destination, or `--global` for a user installation. These three destination modes are mutually exclusive. Repeat the same options on update.

Updates are explicit. Modified skills are protected; `--force` backs up before replacing them. doctor returns nonzero if missing, modified or out of sync.

In 0.2.0, `init [existing-repository]` is an alias for skill installation, replacing the 0.1.0 website scaffold command. No separate tokens or UI package is needed.
