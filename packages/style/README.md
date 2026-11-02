# @deernova/style

Install the Deernova design skill into an existing repository, so AI agents follow Deernova when they build or review interfaces there. Requires Node.js 22+. No runtime dependencies.

```sh
npx @deernova/style@latest install                  # writes .agents/skills/deernova-style/
npx @deernova/style@latest install --agent claude   # writes .claude/skills/deernova-style/
npx @deernova/style@latest update
npx @deernova/style@latest doctor
```

Run these inside the target project, or pass `--repo <path>`. The CLI writes only the skill directory. It does not add application code, CSS imports or package dependencies.

The skill is guidance, not a component library: `SKILL.md` with the core rules and a reading guide, `references/` (foundations, tokens, interface patterns, SwiftUI, web, review checklist) and `assets/` (`tokens.json`, `tokens.css` and reference screenshots). Agents apply it through the project's existing framework and components.

Use `--agent claude|codex|agents` to choose the skill directory, `--dir <skills-parent>` for a custom destination, or `--global` for a user installation; these three destination modes are mutually exclusive. Repeat the same options on update.

Updates are explicit. Modified skills are protected; `--force` backs up before replacing them. `doctor` exits non-zero if the skill is missing, modified or out of date.
