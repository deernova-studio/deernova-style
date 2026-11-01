# @deernova/style

Versioned Deernova design skill installer and static website template. Requires Node.js 22+. No runtime dependencies.

```sh
npx @deernova/style@latest install
npx @deernova/style@latest update
npx @deernova/style@latest doctor
npx @deernova/style@latest init ./my-site
```

Default installation: `.agents/skills/deernova-style` in the current project. Use `--global` for Codex user skills (`$CODEX_HOME/skills` or `~/.codex/skills`), `--agent claude|codex|agents` to choose the agent directory, or `--dir <skills-parent>` for a custom destination. Repeat the same options when updating.

The skill bundles full foundations, component usage and SwiftUI examples, token reference, web/native integration guidance, review criteria, CSS/HTML assets and images. The CLI and website ship the same version and source hash.

Updates are explicit: use `@latest update` to fetch the latest release. Locally modified skills are protected; `--force` backs up before replacing them. doctor returns nonzero if missing, modified or out of sync. init refuses nonempty directories. Serve the generated website with any static HTTP server.
