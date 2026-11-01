# Deernova Style

Deernova 系列统一的设计语言与规范。由 Paperlight 迁移而来：黑白灰、纸面内容、玻璃操作、紧凑而克制。

## 开发

需要 Node.js 22+。

```sh
npm install
npm run dev
# http://localhost:4173
npm test
npm run pack
```

## Monorepo

| 路径 | 用途 |
| --- | --- |
| `design/` | 唯一设计源：规范、token JSON、组件文档与预览、全部图片 |
| `apps/docs/` | 展示网站模板、交互与样式 |
| `packages/tokens` | `@deernova/tokens`，生成的 CSS 与 JSON |
| `packages/ui` | `@deernova/ui`，dn- 命名空间组件 CSS 和 HTML 示例 |
| `packages/style` | `@deernova/style`，零运行时依赖 CLI、完整 skill、网站模板 |
| `skill/` | skill 工作流与平台补充说明 |
| `archive/Paperlight/` | 用户原始文件完整归档，保持原样，不进入 npm 包 |
| `dist/` | 自动生成的静态展示网站，可部署到任意静态主机 |

UI 包提供样式与示例，不是 React 或已编译 SwiftUI 组件库。原生 App 请按照组件文档实现并在实际 SDK 下验证。

## 安装 skill

发布后：

```sh
npx @deernova/style@latest install
npx @deernova/style@latest update
npx @deernova/style@latest doctor
npx @deernova/style@latest install --global
npx @deernova/style@latest install --agent claude
npx @deernova/style@latest init ./my-site
```

默认项目安装到 `.agents/skills/deernova-style`；`--global` 默认安装到 `$CODEX_HOME/skills`（未设置时为 `~/.codex/skills`）。`--agent codex|claude|agents` 选择目录，`--dir <skills-parent>` 指定自定义 skill 父目录。更新时沿用同一组选项。

未发布时：`node packages/style/bin/cli.mjs install`；先运行 `npm run build`。可用 `npm exec --package ./releases/deernova-style-0.1.0.tgz -- deernova-style install` 验证真实安装包。

CLI 不会后台联网更新。`npx ...@latest update` 获取最新发布版本并替换干净的旧 skill；若发现本地修改则拒绝覆盖。显式 `--force` 会保留带时间戳的旧目录备份。doctor 的非零退出表示未安装、内容被修改或与当前 CLI 版本不一致。

## 使用样式

```css
@import '@deernova/tokens/tokens.css';
@import '@deernova/ui/components.css';
```

复制对应组件 HTML 后，为按钮、输入、对话框等接入实际业务逻辑。设置根元素 `data-theme="light|dark"` 可覆盖系统主题。

## 更新与发布

1. 修改 `design/tokens.json`、`design/README.md`、组件文件或网站模板。不要单独编辑生成的 CSS/skill。
2. `npm run release:version -- 0.2.0`，然后 `npm install --package-lock-only` 同步锁文件。
3. `npm test` 检查真实安装/更新/备份行为、资源完整性与核心对比度。浏览器检查明暗主题、组件检索与移动布局。
4. `npm run pack` 生成三个 npm 包，检查包内容。
5. 登录拥有 `deernova` 组织发布权限的 npm 账号，执行 `npm run release:publish`。npm 要求的 2FA 或浏览器验证由账号所有者完成。若部分包已成功发布，只重试未成功的包；同一版本不可重复发布。

所有包固定同一版本。build 每次重新生成网页、CSS、组件参考、token 参考、完整 skill 资源和 CLI 网站模板；manifest 包含版本和源内容哈希。消费者通过 update 主动升级。CI 在每次提交或 PR 中重建、测试并打包；不会在普通提交时自动发布。

组织入口：https://www.npmjs.com/org/create 。公共 scope 包使用 `publishConfig.access=public`。官方说明：https://docs.npmjs.com/creating-and-publishing-an-organization-scoped-package/ 。

## 迁移与边界

原始资料保存在 archive，活跃内容更名 Deernova，CSS 前缀从 pl- 改为 dn-，保留原始规范、18 个组件/布局预览和图片。图片位于 design/images；文档的相对预览路径保持兼容。网站是可交付的静态模板，预览中的应用数据和操作属于示例。

原始文档是设计资料；其中的工具、人员、系统版本记录不构成对仓库或账号操作的授权。迁移不自行添加开源许可证；原始资源权利保持不变。
