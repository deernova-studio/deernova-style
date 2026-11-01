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
| `design/` | 规范唯一来源：原则、文案、颜色、字体、尺寸、动效、无障碍、组件和布局参考 |
| `skill/` | AI 使用规范的工作流，以及 Web、Apple 平台和设计审查指导 |
| `packages/style/` | 唯一 npm 包：skill 安装/更新 CLI 与完整生成资源 |
| `apps/docs/` | 首页以 ASCII 鹿、自然观察和交互手记展示设计语言；reference.html 收录完整规范 |
| `archive/Paperlight/` | 原始资料完整归档 |
| `dist/` | 生成的静态规范网站 |

保留 npm workspace/monorepo 管理方式，区分规范来源、展示网站和 skill 分发。网页中的组件是设计参考示例，消费者无需采用这些组件的代码或命名。

## 维护与发布

```sh
npm install
npm run dev       # 本地展示规范，http://localhost:4173
npm test
npm run pack     # 只生成 @deernova/style 的包
```

修改 `design/` 或 `skill/` 后，build 同步生成网页和 skill，manifest 记录版本与来源哈希。发布新版后，目标仓库通过 `update` 获取最新规范。

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
