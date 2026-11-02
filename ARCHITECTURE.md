# 仓库架构

这个仓库只有一个真正的产品：`skills/deernova-style/` 这个 skill。网站和 npm 包都从它派生，不另外维护一份规范。

## 源文件

```text
skills/deernova-style/          skill 本体，规范的唯一来源（直接提交，不经过生成）
  SKILL.md                      入口：什么时候用、核心规则、平台速查、工作流程
  references/
    foundations.md              原则、颜色、字体、间距、圆角、线条、玻璃、动效、图标、文案、无障碍
    tokens.md                   设计变量表（由 tokens.json 生成）
    patterns.md                 按场景整理的界面做法：页面骨架、操作、输入、导航、内容、反馈、AI 对话
    swiftui.md                  SwiftUI 落地
    web.md                      Web 落地
    review.md                   审查清单
  assets/
    tokens.json                 颜色、字体、尺寸的原始数据（手工编辑）
    tokens.css                  CSS 变量（由 tokens.json 生成）
    screens/                    Mac 窗口、iPhone 页面、iOS 按钮尺寸的效果截图，各有浅色和深色
apps/website/                   官网
  index.html                    首页：满屏动画，白鹿依次跑过草原、森林、星空（scripts/meadow.js），左下角一张入口卡片
  guide.html                    完整规范页：头部是标题、打字行和三个按钮，下面把 skill 的 Markdown 按阅读顺序排成一页
  styles/  scripts/             网站自己的样式和交互
packages/style/                 npm 包 @deernova/style
  bin/cli.mjs                   install / update / doctor
scripts/                        tokens、build-site、build-skill、发布工具
tests/                          skill、构建、安装器测试
archive/Paperlight/             最初的设计稿资料，只做留档
```

skill 里只有 Markdown、token 数据和截图。它描述应该做成什么样，不提供可安装的组件、类名或 HTML 模板；使用者用自己项目的组件实现。

## 生成与构建

```text
assets/tokens.json ── npm run tokens ──→ assets/tokens.css + references/tokens.md   （提交进仓库）

skills/deernova-style/ ─┬─ build-skill ─→ packages/style/skill/ + manifest.json ─→ npm 包 ─→ 目标仓库的 skill 目录
                        └─ build-site ──→ dist/（index.html、guide.html、tokens.css、截图）
apps/website/ ──────────┘
```

- `tokens.css` 和 `tokens.md` 是生成文件，但会提交，因为 skill 要能直接从仓库里使用，不依赖构建。`npm test` 会检查它们和 `tokens.json` 是否一致；不一致时两个构建都会直接报错。
- `build-skill` 原样复制 skill 文件夹，再写入 `manifest.json`（版本号和内容哈希）。安装器用这个哈希判断是否需要更新、文件是否被改过。
- `build-site` 读取同一份 skill：首页引用 `tokens.css` 和截图，规范页把各个 Markdown 渲染出来，并把文件之间的链接改成页内锚点。
- 两个构建互不影响，也都不会写回源文件。网站的改动不会改变 skill 的哈希。

## 改动应该落在哪里

| 想改的内容 | 改哪里 | 之后 |
| --- | --- | --- |
| 颜色、字体、间距、尺寸 | `skills/deernova-style/assets/tokens.json` | `npm run tokens`，检查对比度测试 |
| 原则、文案、玻璃、动效等规则 | `references/foundations.md` | 必要时同步 `SKILL.md` 的核心规则 |
| 某类界面的做法 | `references/patterns.md` | 涉及平台写法时同步 `swiftui.md` 或 `web.md` |
| agent 什么时候读哪份文件 | `SKILL.md` 的「先读什么」 | |
| 首页、规范页的样子 | `apps/website/` | 不需要发布 npm 版本 |
| 安装、更新、备份行为 | `packages/style/bin/cli.mjs` | 运行安装器测试 |

网站是这套规范的一个应用实例。网站上为了展示而做的东西（首页的网点动画和字符转场、页面的分栏线）不是通用规则；需要变成规则时，写进 skill。

## 测试覆盖什么

`npm test` 先构建，再检查：SKILL.md 的 frontmatter；skill 内所有链接和 `assets/` 路径都能找到；skill 只包含 Markdown、token 和截图；`tokens.css`、`tokens.md` 与 `tokens.json` 同步；两套主题的文字和控件对比度；npm 包里的 skill 与源文件逐字节一致；构建不改源文件、网站改动不改变 skill 哈希；网站页面没有遗漏的模板占位符、链接都能找到；安装器的安装、更新、改动保护和备份。

页面的视觉效果、交互和响应式布局需要在浏览器里看。SwiftUI 示例是写法参考，没有在这个仓库里编译。
