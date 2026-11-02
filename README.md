# Deernova Style

Deernova 的设计语言，写成一个给 AI agent 读的 skill。agent 在你的项目里写界面时参考它，用项目现有的技术栈实现 Deernova 的风格。它不是组件库：不会往项目里加任何依赖、样式文件或业务代码。

一句话：只用黑、白、灰；内容放在不透明的纸面上，操作浮在玻璃上；标题和长文用衬线，界面文字用系统无衬线；Mac 紧凑，iOS 给手指留足位置。

## 仓库里有什么

| 路径 | 内容 |
| --- | --- |
| `skills/deernova-style/` | **skill 本体，也是规范的唯一来源。** `SKILL.md` 是入口和核心规则；`references/` 是基础、设计变量、界面模式、SwiftUI、Web 和审查清单；`assets/` 是 `tokens.json`、生成的 `tokens.css` 和效果截图 |
| `apps/website/` | 官网。首页传达风格，`guide.html` 把 skill 原文排成一页给人读 |
| `packages/style/` | npm 包 `@deernova/style`：把 skill 装进其他仓库的命令行工具 |
| `scripts/` | 生成 token 文件、构建网站和 npm 包、发布 |
| `tests/` | skill 结构、token 同步、对比度、构建边界和安装器 |
| `archive/Paperlight/` | 最初的设计稿资料，只做留档，不参与构建 |

## 在项目里使用

在项目根目录运行：

```sh
npx @deernova/style@latest install                  # 写入 .agents/skills/deernova-style/
npx @deernova/style@latest install --agent claude   # Claude Code：写入 .claude/skills/deernova-style/
npx @deernova/style@latest update                   # 更新到最新版本
npx @deernova/style@latest doctor                   # 检查是否安装、是否被改过、是否最新
```

然后直接告诉 agent：「参考 deernova-style，给这个应用做一个设置页。」

- `--agent agents|codex|claude` 选择写入 `.agents/skills`、`.codex/skills` 或 `.claude/skills`；`--repo <path>` 指定其他仓库；`--dir <skills-parent>` 写到自定义目录；`--global` 装到用户目录（默认 `$CODEX_HOME/skills`）。`--repo`、`--dir`、`--global` 只能选一个。
- 更新是手动执行的。安装后的文件被改过时，CLI 拒绝覆盖；加 `--force` 会先备份再替换。
- 不想用 npm 时，也可以直接把 `skills/deernova-style/` 整个文件夹复制到项目的 skill 目录里。

## 修改规范

- **改规则**：直接编辑 `skills/deernova-style/` 里的 Markdown。`SKILL.md` 只放每次都要用到的核心规则，细节放进 `references/`。
- **改颜色、字号、尺寸**：编辑 `skills/deernova-style/assets/tokens.json`，再运行 `npm run tokens`，重新生成 `assets/tokens.css` 和 `references/tokens.md`。这两个文件不要手改，测试会检查它们和 `tokens.json` 是否一致。
- **截图**：`assets/screens/` 里的图不会自动更新。改了会影响外观的规则后，要重新截图替换（文件名保持 `名字-light.png` / `名字-dark.png`）。
- **网站**：页面在 `apps/website/`。网站的改动不会改变 skill 的内容哈希，不需要发新版本。

## 开发

需要 Node.js 22 以上。

```sh
npm install
npm run dev          # 构建网站并在 http://localhost:4173 预览
npm run tokens       # 从 tokens.json 重新生成 tokens.css 和 tokens.md
npm run build        # 构建网站（dist/）和 npm 包里的 skill（packages/style/skill/）
npm test             # 构建并运行全部测试
npm run pack         # 在 releases/ 生成 npm 包，不发布
```

`dist/` 和 `packages/style/skill/` 是构建产物，已加入 `.gitignore`。网站没有自动监听，改完运行 `npm run build:site` 再刷新。架构和改动边界见 [ARCHITECTURE.md](ARCHITECTURE.md)。

## 发布

规范或 skill 内容有变化时，发布新版本，使用者运行 `update` 才能拿到：

```sh
npm run release:version -- 0.3.0
npm install --package-lock-only
npm test
npm run release:publish
```

发布由 npm 账号所有者执行，普通提交不会自动发包。只改网站不需要发布。
