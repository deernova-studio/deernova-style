# Deernova Style

Deernova 的设计语言，写成一个给 AI agent 读的 skill。agent 在你的项目里写界面时参考它，用项目现有的技术栈实现 Deernova 的风格。它不是组件库：不会往项目里加任何依赖、样式文件或业务代码。

一句话：只用黑、白、灰；内容放在不透明的纸面上，操作浮在玻璃上；标题和长文用衬线，界面文字用系统无衬线；Mac 紧凑，iOS 给手指留足位置。

## 仓库里有什么

| 路径 | 内容 |
| --- | --- |
| `skills/deernova-style/` | **skill 本体，也是规范的唯一来源。** `SKILL.md` 是入口和核心规则；`references/` 是基础、设计变量、界面模式、SwiftUI、Web 和审查清单；`assets/` 是 `tokens.json`、生成的 `tokens.css` 和效果截图 |
| `apps/website/` | 官网。首页传达风格，`guide.html` 把 skill 原文排成一页给人读 |
| `art/milu/` | 首页麋鹿的原始插画和离线烘焙脚本，生成首页用的散步帧，不参与构建 |
| `packages/style/` | npm 包 `@deernova/style`：把 skill 装进其他仓库的命令行工具 |
| `scripts/` | 生成 token 文件、构建网站和 npm 包、发布 |
| `tests/` | skill 结构、token 同步、对比度、构建边界、开发热更新、安装器和动画 |
| `reviews/` | 当前验收结果、截图，以及单独保留的历史记录 |
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

需要 Node.js 22.12.0 以上。

```sh
npm install
npm run dev          # Vite 开发服务，默认 http://localhost:4173
npm run preview      # 构建网站并预览静态产物，不监听修改
npm run tokens       # 从 tokens.json 重新生成 tokens.css 和 tokens.md
npm run build        # 构建网站（dist/）和 npm 包里的 skill（packages/style/skill/）
npm test             # 构建并运行全部测试
npm run pack         # 在 releases/ 生成 npm 包，不发布
```

开发服务直接读取源码：CSS 保存后热更新，不重置首页动画；HTML、脚本和图片修改会自动刷新。规范 Markdown 修改后会刷新规范页；`tokens.json` 修改会即时更新样式和变量表，提交或构建前仍需运行 `npm run tokens` 同步生成文件。

开发端口被占用时会直接提示，避免误看旧服务；也可以用 `npm run dev -- --port 4174` 指定其他端口。从旧静态服务切换后，手动刷新一次页面以加载热更新连接。

`dist/` 和 `packages/style/skill/` 是构建产物，已加入 `.gitignore`。Vite 开发服务不写入这些目录，也不改写规范源文件。架构和改动边界见 [ARCHITECTURE.md](ARCHITECTURE.md)。

当前验证结果与未覆盖范围见 [验收记录](reviews/verification.md)。首页动画可通过 `?t=24.5` 固定时刻检查，通过 `?halftone=0` 查看原始灰度画面。

## 发布

规范、skill 内容或安装器有变化时，发布新版本，使用者通过最新 CLI 安装或运行 `update` 才能拿到：

```sh
npm run release:version -- 0.3.0
npm install --package-lock-only
npm test
npm run release:publish
```

发布由 npm 账号所有者执行，普通提交不会自动发包。只改网站不需要发布。
