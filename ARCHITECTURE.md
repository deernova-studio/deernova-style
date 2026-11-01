# 仓库架构

Deernova Style 维护一套设计规范、一个可安装的 AI skill，以及用于浏览和体验设计语言的网站。HTML 示例是参考资料，不是独立组件库。唯一 npm 包是 `@deernova/style`。

## 源文件职责

```text
 design/                       设计规则和结构化数据
   README.md                   设计基础
   motion.md                   动效与状态稳定性
   tokens.json                 颜色、字体、尺寸等 token 源数据
   components/<Name>/README.md 组件说明与 SwiftUI 参考
   images/                     参考图片
 examples/html/                独立 HTML 视觉示例
   <Name>/preview.html         可单独打开的预览
   shared.css                  示例共用样式
 skill/                        AI 的入口与使用方法
   SKILL.md                    按任务选择规范的工作流
   references/                 Web、原生平台、设计审查指导
 apps/website/                 展示网站
   pages/                      首页和完整规范页的 HTML 模板
   styles/                     首页、动效、规范页样式
   scripts/                    网站交互和鹿动画
 packages/style/               npm 分发与安装工具
   bin/cli.mjs                 install / update / doctor
 scripts/                      构建与发布工具
 tests/                        安装、构建边界、资源引用及动效验证
 archive/Paperlight/            原始资料，保留用于追溯
```

`design/design-system.json` 是迁移时保留的编辑器元数据，不参与页面渲染或规范决策。原始截图不会因修改 HTML 自动重新拍摄；修改对应示例后，需要检查截图是否仍准确。

## 两种 HTML

- `examples/html/` 描述 UI 的外观、结构和状态。网站通过 iframe 展示这些文件，skill 也包含这些文件，AI 可以选择参考。
- `apps/website/pages/` 是网站本身的页面模板，包括鹿动画首页和规范目录。它们不进入 skill，也不会写进使用者的业务仓库。

示例依赖生成的 `design/tokens.css`。在源码里修改 `tokens.json`，构建后通过 `http://localhost:4173/examples/html/Button/preview.html` 查看示例，不直接双击源码 HTML。两类 HTML 的资源引用均通过测试检查。

## 构建与分发

```text
design/ + examples/html/ ───┬── + apps/website/ ─→ dist/
                           └── + skill/ ────────→ packages/style/skill/
                                                          ↓
                                         @deernova/style 安装 CLI
                                                          ↓
                                    目标仓库 .agents/skills/deernova-style/
```

- `npm run build:site` 只生成 `dist/`，不会重建或覆盖 skill。
- `npm run build:skill` 只生成 `packages/style/skill/`，不会修改网站输出。
- `npm run build` 顺序执行两者；构建不会写回源文件。
- `npm run dev` 构建网站后启动本地服务器。当前没有自动监听，修改后运行 `npm run build:site` 并刷新。
- `npm run pack` 构建 skill 并产生本地 npm 压缩包，不发布。

`dist/` 和 `packages/style/skill/` 都是忽略提交的构建产物，不直接编辑。`tokens.css` 分别生成到两个产物中。网站和 skill 共用 `scripts/lib/design.mjs` 中的 token 生成与参考资料读取逻辑；`build-site.mjs` 和 `build-skill.mjs` 各自负责输出。

完整 skill 的结构为：

```text
SKILL.md
references/          使用指导与从 design/ 生成的规范文本
assets/design/       规范、结构化 token、生成的 CSS 和图片
assets/examples/html/ HTML 示例及其共用样式
manifest.json        版本和 skill 内容哈希
```

两个产物有各自的 `sourceHash`，按实际输出文件计算，不包含自身 manifest、绝对路径和时间戳。网站的文案、动画或样式变化不会改变 skill 哈希；规范、参考 HTML 和 skill 指导的变化会改变它。版本号单独记录，不代替内容检查。

## 改动应该落在哪里

| 需要修改的内容 | 修改位置 | 后续动作 |
| --- | --- | --- |
| 颜色、字体、间距 | `design/tokens.json` | 构建两者并检查主题/对比度 |
| 组件使用规范或 SwiftUI 示例 | `design/components/` | 构建两者 |
| UI 外观参考 HTML/CSS | `examples/html/` | 构建两者，检查预览和已有截图 |
| AI 选择、应用、审查规范的方法 | `skill/` | 构建 skill |
| 首页文案、布局、鹿动画 | `apps/website/` | 构建网站 |
| 从网站实践中总结出的通用规则 | `design/`，必要时在 skill 入口增加路由 | 构建两者 |
| 安装目标、更新和备份行为 | `packages/style/bin/` | 安装集成测试 |

网站是规范的实例，不是规范的唯一来源。网站的新实现不会自动变成通用要求；需要人工判断其适用范围，再写回 `design/`。例如动效稳定性可复用，而鹿、星空和 ASCII 表现形式属于网站主题。

## 验证与发布边界

`npm test` 验证独立构建、源文件不被改写、资源链接、CLI 安装/更新/备份、对比度和动效边界。视觉和浏览器交互仍需在页面中检查。

GitHub 提交和 npm 发布是两件事。只有发布新版 `@deernova/style` 后，使用者执行 `npx @deernova/style@latest update` 才能取得新 skill；网站改版不需要发包。发布步骤见 README。此前的 `@deernova/ui` 和 `@deernova/tokens` 仅为历史版本，当前无依赖关系。
