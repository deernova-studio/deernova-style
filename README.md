# Deernova Style

给 AI 使用的 Deernova 设计规范 skill。把 skill 安装进一个现有仓库，AI 在那个仓库里创建、修改或审查界面时，就可以参考 Deernova 的风格、规范和示例。

**唯一发布的包是 `@deernova/style`，用途是安装和更新 skill。** 消费项目无需安装组件库，不会因此添加 CSS imports、运行时依赖或应用代码。原有框架、组件体系和业务逻辑由项目自己决定。

## 给指定仓库安装

```sh
npx @deernova/style@latest install --repo /path/to/your-project
# 或在目标仓库里运行
npx @deernova/style@latest install
```

默认写入目标仓库的 `.agents/skills/deernova-style/`，其中包括 SKILL.md、完整设计规范、参考文档、token 数据、组件/布局视觉示例和图片。可将这个目录提交到目标仓库，团队即可共同使用。

```sh
# Claude Code
npx @deernova/style@latest install --repo /path/to/your-project --agent claude
# 同步最新版本
npx @deernova/style@latest update --repo /path/to/your-project
# 检查安装版本和本地修改
npx @deernova/style@latest doctor --repo /path/to/your-project
```

`--agent agents|codex|claude` 分别选择 `.agents/skills`、`.codex/skills` 或 `.claude/skills`。`--dir <skills-parent>` 支持其他工具的自定义 skill 目录。`--global` 安装到用户级技能目录；默认使用 `$CODEX_HOME/skills`，未设置时为 `~/.codex/skills`。`--repo`、`--dir`、`--global` 互斥。

在 AI 对话中可明确要求：“参考 deernova-style skill，为这个仓库实现设置页，保留现有技术栈。”支持 skill 自动发现的工具也可根据任务匹配；实际加载机制取决于所用工具。

更新是主动执行的，不是后台联网服务。发现本地修改时，CLI 拒绝覆盖；显式 `--force` 会先保留备份。`doctor` 在未安装、被修改或与 CLI 所带规范不同步时返回非零退出码。

## 这个仓库负责什么

| 路径 | 内容 |
| --- | --- |
| `design/` | 设计规范、token 源数据、组件说明和参考图片 |
| `examples/html/` | 与网站分开的 HTML UI 示例，随 skill 分发 |
| `skill/` | AI 应用规范的入口，以及 Web、原生平台和设计审查指导 |
| `apps/website/` | 网站自己的 HTML 页面、CSS 与交互脚本 |
| `packages/style/` | 唯一 npm 包：安装/更新 CLI 与生成的 skill |
| `archive/Paperlight/` | 原始资料归档 |

[架构与维护说明](ARCHITECTURE.md) 介绍两类 HTML、构建依赖、输出目录和修改规则。HTML 示例供 AI 参考；使用者无需安装组件库。

## 维护与发布

```sh
npm install
npm run dev         # 构建网站并启动 http://localhost:4173
npm run build:site  # 只构建网站到 dist/
npm run build:skill # 只构建完整 skill
npm run build       # 同时构建两者
npm test
npm run pack     # 只生成 @deernova/style 的包
```

网站和 skill 独立构建，共享 `design/` 和 `examples/html/`。修改网站不会改变 skill 哈希；修改规范或 HTML 示例会同步进入两个产物。网站实践中的通用规则需要先沉淀回规范。

`dist/`、`packages/style/skill/` 和其中的 `tokens.css` 均由构建生成，不直接编辑。当前预览没有自动监听，修改后运行 `npm run build:site` 并刷新。发布新版后，目标仓库通过 `update` 获取最新 skill。

```sh
npm run release:version -- 0.3.0
npm install --package-lock-only
npm test
npm run release:publish
```

npm 发布验证由账号所有者完成。普通提交不会自动发包。原生 SwiftUI 示例是设计指导，需要在消费项目的 SDK 下验证。原始资料的权利保持不变。

## 0.2.0 定位纠正

0.1.0 错误地额外拆分并发布了 `@deernova/tokens` 与 `@deernova/ui`。从 0.2.0 起，这两个包不再属于项目的分发方案，skill 不依赖它们；旧版本的发布事实保留在验证记录中。

`init [existing-repository]` 现在是给现有仓库安装 skill 的快捷方式，不再生成网站。此前通过 install 安装的 0.1.0 skill 可使用 update 升级。
