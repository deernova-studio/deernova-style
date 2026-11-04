# Deernova Style 优化整理建议

> **状态：已按本文实施（v0.3.0，2026-11-04）。** 待定事项按建议值落地：Web 应用默认按钮 28；iPadOS 沿用触控密度（侧边栏 320，首版规则，待真机验证）；官网与文档作为正式场景（`comfortable`）；skill 内放参考 CSS 片段和生成的 Tailwind / Swift 文件。与本文的出入：没有单独的 `components.json`，组件尺寸直接写在 `tokens.json` 的 `components` 里；Tailwind 只生成 v4 的 `tailwind.css`，v3 的写法放在 `scenes/web.md`；`SKILL.md` 另加了一个由 token 生成的「场景速查」表。

针对三个问题：Web 按钮间距过大、规范展示页信息密度低、skill 的组织形式。结论先行，证据和方案在后。

- 按钮问题不是某一行 CSS 写错，而是规范对 Web 按钮“只给了颜色、没给尺寸”，尺寸 token 又按 Mac / iOS 命名且语义不一致，agent 只能猜，绝大多数猜法都落在 39–47px。另外你本机全局装的是旧版 0.2.0，它的 Web 说明要求所有按钮 44×44。
- 展示页的问题是：它把 skill 的 7 个 Markdown 按“agent 的阅读顺序”拼成一页，而不是按“人查规范”的方式组织。所以有 agent 专用内容、主题重复、没有可视样本。
- 组织形式上，ui-ux-pro-max 值得借的是“数据化 + 按栈分文件 + 薄路由 + 数据契约测试 + 密度旋钮”，不需要借它的检索脚本和多风格生成。你的“多场景”对应它的 stack + dial，可以统一成一个“场景”维度，和现有的浅/深主题维度并列。

---

## 一、Web 按钮为什么会有大量上下间距

### 实测

在规范页里注入同一个「保存」按钮，页面基础字号 14px、行高 1.6（常见的中文应用基线），按几种 agent 可能的读法分别量高度：

| 读法 | 依据 | 实测高度 |
| --- | --- | --- |
| A. 规范原意 | 0.2.0 的 `bundle.css` 里 `.dn-btn`：固定 `height` + 上下 padding 为 0 + `line-height: 1` | **24px** |
| B. 照官网按钮 | `apps/website/styles/base.css` 的 `.pill`，这是规范站上唯一的 Web 按钮 | 44px，最小宽 148px |
| C. 只看 web.md | padding 用 `space-2 space-3`，行高继承页面 | 39px |
| D. 同上，padding 用 `space-3` | tokens 里 `space-3` 的用途写的是“Mac 按钮内边距” | 47px |
| E. 把 44 点击区域用在所有按钮上 | 0.2.0 web.md 原文 “Touch targets should be at least 44 × 44 CSS px” | 44px |
| F. 翻译 SwiftUI 的“透明外边距补足 44” | patterns.md 的 iOS 按钮示例 `.padding(.vertical, 4)` | 45px |
| G. 用 `ios-headline` 字样 | 17/22 + `space-2` | 39px |

只有完整照搬旧版参考 CSS 才是 24px，其余合理读法全部是目标值的 1.6–2 倍。

### 根因（按影响排序）

1. **Web 没有按钮尺寸规格。** 现在 `references/web.md` 的「控件」一节只写了颜色（`accent` 底、`on-accent` 字、描边），没有高度、左右内边距、字号、行高；「密度」一节只给了一个区间“控件 24–28px”。0.2.0 里原本有一份完整的 `.dn-btn` 参考 CSS，在 c6cc01f（separate design references…）删除 `design/components/bundle.css` 时一起没了，之后没有补回等价的文字规格。
2. **尺寸 token 按平台命名，语义还不一致。** `control-mac`（24）是可见高度，`control-ios`（44）却是点击区域，`control-ios-lg`（46）又变回可见高度，`button-ios`（36）是可见高度。Web 没有自己的 token，agent 只能从 mac/ios 里挑，而带 `control-` 前缀、数值最“安全”的就是 44。
3. **SwiftUI 的“透明内边距”到了 CSS 里不透明。** foundations.md 第 132 行和 patterns.md 都写“差的部分用透明的内边距补足”。SwiftUI 里 `.padding()` 写在 `.buttonStyle()` 之后，确实在背景外面；CSS 的 `padding` 在 `background` 里面，照搬就是一个 44px 高的实心按钮。正确的 Web 做法（用 `::before` 扩大命中区、可见尺寸不变）其实官网的 `.masthead-action` 已经在用，但没写进 skill。
4. **你本机用的是旧版 skill。** `~/.agents/skills/deernova-style/manifest.json` 是 0.2.0（旧的 `design/` + 组件预览结构），它的 web.md 要求“Touch targets should be at least 44 × 44 CSS px”，没有 `pointer: coarse` 限定。仓库源码已经加了限定，但 `package.json` 版本号仍是 0.2.0、也没有重新发布，所以 `doctor` 从版本号上看不出它已过期。
5. **行高继承。** 按钮写 `font: inherit` 会把页面的 1.6–1.8 行高带进来。规范里没有说按钮必须固定 `height`、`padding-block: 0`、`line-height: 1`，只要用 padding 撑高度，结果就跟着页面行高走。
6. **官网按钮是营销尺寸，却是唯一的 Web 样例。** `.pill` 是 44px 高、左右 24px、最小宽 148px，web.md 又允许“官网、文档可以更舒展”。参考官网去写应用，就会把营销尺寸带进工具界面。

### 立即修复（不依赖后面的重构）

1. 在 web.md 写死按钮、输入框、分段控件的尺寸表和一段参考 CSS，明确“高度只由 `height` 决定，上下 padding 为 0”：

   ```css
   .btn {
     position: relative;
     display: inline-flex; align-items: center; justify-content: center; gap: var(--space-1);
     height: var(--button-height-md);
     padding: 0 var(--button-padding-x-md);        /* 上下永远是 0 */
     font: 500 var(--button-font-size-md)/1 var(--font-sans);
     white-space: nowrap;
     border-radius: var(--button-radius);
   }
   /* 触屏：可见高度不变，命中区由伪元素撑到 44 */
   @media (pointer: coarse) {
     .btn::before {
       content: ""; position: absolute; top: 50%; left: 50%;
       width: max(100%, var(--hit-min)); height: max(100%, var(--hit-min));
       transform: translate(-50%, -50%);
     }
   }
   ```

2. 把“透明内边距”改成按平台分开写：SwiftUI 用 `.padding()` 加 `.contentShape()`；CSS 用 `::before` 或外层透明容器，不能在有背景的元素上加 padding。
3. 在 review.md 加一条可以量化的检查：“桌面 Web 默认按钮的实际高度等于 `button-height-md`，不随页面行高变化”。
4. 发布 0.3.0，在本机运行 `npx @deernova/style@latest update --global`。以后只要 skill 内容变化就升版本号。

---

## 二、规范展示页为什么密度低

这里说的是 `apps/website/guide.html`：首页产品菜单里点「Deernova Style」进入的二级页面（页面标题「完整规范 · Deernova」），不是首页 `index.html`。首页的麋鹿动画和产品菜单不在本节讨论范围内。

### 实测（1440 × 900）

- 整页高 37,693px，约 **42 屏**。其中「界面模式」一章就有 15,493px。
- 首屏 hero（大标题「Deernova UI」）占 448px，第一个正文标题出现在 615px。hero 里是「写给 agent 的界面设计规范」打字效果、「复制安装命令」按钮，以及“agent 读的就是这些”。
- 页面上 **0 张图、0 个真实渲染的组件**。`assets/screens/` 里已有的 6 张效果截图没有出现在页面上。颜色只有一个 12px 的小方块。
- 23 个代码块里 21 个是 Swift，CSS 和 JS 各 1 个。用 Web 开发时几乎没有可抄的东西。
- 同一主题反复出现：颜色 4 次、字体 4 次、玻璃 3 次、动效 3 次、无障碍和验证各 2 次。原因是 `scripts/build-site.mjs` 的 `DOCS` 把 SKILL.md、foundations、tokens、patterns、swiftui、web、review 按文件顺序拼接，同一主题被拆在“原则 / 数值 / SwiftUI / Web”四处。
- 有不少 agent 专用内容：「先读什么」「工作流程」「版本与更新」「怎么汇报」，以及 hero 里的安装引导。
- 排版是阅读型的：正文 15px、行高 1.8，栏宽 760px，每章上下 64px、h2 上方 48px；1440 宽时右侧空出 214px。

### 改法：页面和 skill 同源，但分开组织

skill 给 agent 读，按“任务 → 文件”路由；展示页给人查，按“主题 → 样本”组织。两者都从同一份数据（tokens + 组件规格）生成，这样内容不会分叉。

**顶部**：去掉 hero，换成一条 48px 的工具栏：字标 · 场景切换（Web / macOS / iOS / iPadOS）· 浅深主题 · 密度 · token 搜索。安装命令和 agent 说明移到「资源」页。

**目录结构**

```
基础    颜色 · 字体 · 间距 · 圆角 · 线条 · 阴影与层级 · 玻璃 · 动效 · 图标 · 文案
组件    按钮 · 文本框 · 分段控件 · 侧边栏 · 列表 · 卡片 · 标签 · 代码块 · 空状态 · 横幅 · 弹窗 · Composer · 消息 · 执行步骤
页面    Mac 窗口 · iPhone 列表与对话 · iPad 分栏 · Web 应用骨架
场景    平台差异总表（一张表看完所有平台的数值差异）
资源    tokens 下载（CSS / Tailwind / Swift / JSON）· 安装 skill · 更新记录
```

**每个基础章节都是“可视样本 + 速查表”**

- 颜色：色卡网格，浅深并排，标出对比度和一句用途；点击 token 名复制 `var(--ink)`。
- 字体：用真实字号渲染的字阶，随场景切换变成 Mac / iOS / Web 的字号。
- 间距、圆角、阴影、线宽：用标尺和样本块展示，不只是表格。

**每个组件章节都是三段**

1. 真实渲染的矩阵：变体 × 尺寸 × 状态（默认、悬停、按下、焦点、禁用、加载），用 tokens.css 实时绘制，跟着场景和主题切换。
2. 规格表：高度、左右内边距、字号字重、圆角、命中区，每个场景一列。
3. 代码分栏（CSS / Tailwind / SwiftUI），默认收起。

**排版**：说明文字 13–14px、行高 1.5；内容用满宽度，或“说明 + 样本”两栏；章节间距 32–40px。目标是 1440 宽下整站 10 屏以内能看完基础 + 组件。

---

## 三、skill 怎么借鉴 ui-ux-pro-max

### 它是怎么组织的

`.claude/skills/ui-ux-pro-max/`：

- `SKILL.md` 只做路由：一张按优先级排的规则分类表、查询约定、工作流程；完整规则放在 `references/quick-reference.md`，交付前检查放在 `references/pro-rules.md`，按需读取。
- `data/*.csv` 每一行是一条规则，列固定：`Category, Issue, Platform, Description, Do, Don't, Code Good, Code Bad, Severity`。
- `data/stacks/<stack>.csv` 按技术栈分文件（swiftui、react、html-tailwind…共 22 个）。
- `scripts/search.py` 按 `--domain`、`--stack` 检索；`--design-system` 生成 `MASTER.md` + `pages/<page>.md` 的“总则 + 覆盖”；`--density` 等旋钮直接改写间距表。
- `validate_data.py` 和一组测试检查数据契约（列齐全、计数一致、无失效条目）。

### 借什么、不借什么

| 它的做法 | 对 Deernova | 建议 |
| --- | --- | --- |
| 薄 SKILL.md 只做路由 | 已经部分做到 | 保留，进一步把细节移出 |
| 规则数据化（每行一条，列固定） | 组件规格、平台差异现在散在段落里，同一主题写了 4 遍 | **借**：组件规格和 token 用结构化数据，Markdown 表格和网站样本都从它生成 |
| 按 stack 分文件 | 对应你的平台和场景 | **借**：`platforms/web.md`、`macos.md`、`ios.md`、`ipados.md`，每份只写该平台特有的内容 |
| MASTER + pages 覆盖 | 对应“基础 token + 场景覆盖” | **借思路**：token 的值按“主题 × 场景”两个维度给出 |
| `--density` 旋钮 | 正好解决“Mac 紧凑 / Web / 触屏 / 营销页”的尺寸差 | **借**：做成 density 维度，而不是写在 token 名字里 |
| 数据契约测试 | 你已经有对比度和 token 同步测试 | **借**：扩展成“每个组件每个场景都有尺寸”“没有带平台名的 token” |
| BM25 检索脚本、1MB 级数据、多风格生成 | 你只有一种风格，全部数据不到 100KB，没有“选风格”的问题 | **不借**：agent 按路由表直接读文件就够；如果要脚本，用现有的 Node CLI 做导出 |

### 核心概念：场景（scene）

你说的 iOS、Mac、Web、Pad 端，加上官网这类营销页，统一叫“场景”。每个场景声明输入方式和密度，所有尺寸 token 按密度取值：

| 场景 | 输入 | 密度 | 正文 | 按钮 sm / md / lg（可见高） | 命中区 | 列表行 |
| --- | --- | --- | --- | --- | --- | --- |
| macOS | 指针 | compact | 13 / 18 | 20 / 24 / 28 | 等于可见 | 26 |
| Web 应用（桌面） | 指针 | regular | 13–14 / 20 | 24 / 28 / 32（建议，待定） | 等于可见 | 28–32 |
| Web 触屏 | 触摸 | touch | 16 / 24 | 30 / 36 / 46 | 44 | 44 |
| iOS | 触摸 | touch | 17 / 23 | 30 / 36 / 46 | 44 | 44 |
| iPadOS | 触摸 + 指针 | touch（待定） | 17 / 23 | 待定 | 44 | 待定 |
| 官网 / 文档 | 指针 | comfortable | 15–16 | 32 / 36 / 44 | 等于可见 | — |

Web 应用的 md 建议取 28 而不是 24：Web 正文用 14px，比 Mac 的 13pt 大一号，Windows 下的字体渲染也更宽；你之前做首页产品菜单时，桌面行高定的也是至少 32px。如果你希望与 Mac 完全一致，就填 20 / 24 / 28。iPadOS 现在规范里完全没有，需要单独定。

### token 改成三层、两个维度

1. **原语层**：灰阶 `gray-50…950`、状态色色阶、4pt 尺寸刻度。只在 token 文件内部被引用，组件不直接用。
2. **语义层**（按主题取值）：`canvas`、`surface`、`ink`、`line`、`accent`……现有颜色基本不用改。
3. **组件 / 场景层**（按密度取值）：`button-height-md`、`button-padding-x-md`、`button-font-size-md`、`button-radius`、`field-height`、`row-height`、`hit-min`、`page-margin`、`card-padding`……

命名规则是 `{对象}-{属性}-{尺寸}`，名字里不出现平台，平台差异放在值里：

```json
"button": {
  "height-sm":    { "compact": 20, "regular": 24, "touch": 30, "comfortable": 32 },
  "height-md":    { "compact": 24, "regular": 28, "touch": 36, "comfortable": 36 },
  "height-lg":    { "compact": 28, "regular": 32, "touch": 46, "comfortable": 44 },
  "padding-x-md": { "compact": 12, "regular": 12, "touch": 16, "comfortable": 24 },
  "font-size-md": { "compact": 13, "regular": 13, "touch": 15, "comfortable": 14 },
  "radius":       { "compact": "{radius-sm}", "regular": "{radius-sm}", "touch": "{radius-full}", "comfortable": "{radius-full}" },
  "hit-min":      { "compact": 0, "regular": 0, "touch": 44, "comfortable": 0 }
}
```

生成的 CSS：`:root` 默认是 Web 应用（regular），`@media (pointer: coarse)` 切到 touch，`[data-density="compact"]` / `[data-density="comfortable"]` 手动指定。生成的 Swift 用 `#if os(macOS)` 选 compact 或 touch。

### 补齐你列的变量

| 类别 | 现状 | 建议补充 |
| --- | --- | --- |
| 颜色 | 语义层齐全 | 加原语层；加 `opacity-disabled`（旧 CSS 里是 0.35，现在只在 0.2.0 里有） |
| 字体 | 有字族；字号按 `mac-*` / `ios-*` 分 | 改成角色 `display / title / headline / body / prose / callout / caption / code`，每个角色按场景取值；Web 现在没有自己的字阶 |
| 粗细 | 只藏在字样里 | 独立 `weight-regular 400 / medium 500 / semibold 600`；图标描边 `icon-stroke 1.5` |
| 线宽 | hairline / control / focus | 加 `focus-offset 2`、`icon-stroke`，区分分隔线和控件边框 |
| 线形 | 没有 | `line-style-divider: solid`、`line-style-dropzone: dashed`、图标 `linecap: round`；虚线的 dash 长度 |
| 间距 | 只有刻度 | 加语义间距：`gap-inline`、`gap-stack`、`gap-group`、`page-margin`、`card-padding`，按场景取值 |
| 圆角 | 刻度 + 用途说明 | 加语义映射：`radius-button`、`radius-field`、`radius-card`、`radius-sheet`，按场景取值（iOS 按钮是胶囊，Mac 是 6） |
| 阴影 | control / float / glass | 改成层级 `elevation-0/1/2/3` 并配 `z-index` |
| 动效 | 只在正文里（0.12s / 0.2s / 缓动） | `duration-fast / base / slow`、`ease-standard` |
| 玻璃 | 模糊值写在正文里，web.md 是 14px，官网实现是 16px，已经出现分歧 | `glass-blur`、`glass-saturate` |
| 布局 | `sidebar-mac`、`content-max` | `breakpoint-*`、`sidebar-width`（按场景）、栅格 gutter |

### 建议的目录

```
skills/deernova-style/
  SKILL.md                      一句话风格、6 条核心规则、场景选择、路由表、工作流程（控制在 150 行内）
  references/
    foundations/                跨平台的“为什么”，每个主题只写一次
      color.md  typography.md  spacing.md  radius.md  stroke.md
      elevation.md  glass.md  motion.md  iconography.md  writing.md  accessibility.md
    components/                 每个组件一份：用途、变体、尺寸表（每个场景一列）、状态、Web 和 SwiftUI 写法、不要
      button.md  text-field.md  segmented.md  sidebar.md  list.md  card.md  tag.md
      code-block.md  empty-state.md  banner.md  sheet.md  composer.md  message.md  step-row.md
    scenes/                     落地：只写该场景特有的东西
      web.md  web-marketing.md  macos.md  ios.md  ipados.md
    review.md                   检查清单，每条都能量化
  assets/
    tokens.json                 唯一来源：三层 + 主题 × 密度
    components.json             组件规格矩阵，生成 components/*.md 里的表格和网站样本
    tokens.css                  生成
    tailwind-preset.js          生成
    DeernovaTokens.swift        生成
    screens/
```

`components/*.md` 里的尺寸表由 `components.json` 生成，正文手写。这样 skill 仍然是“说明 + 数据”，不是组件库，只是每个组件都给出一段可以直接对照的参考写法。`tests/skill.test.mjs` 里“assets 只允许 screens、tokens.css、tokens.json”的断言需要相应放宽。

### SKILL.md 的路由表示例

| 你在做 | 先读 |
| --- | --- |
| 任何界面 | 本文件的核心规则，加上对应的 `scenes/<场景>.md` |
| 某个组件 | `components/<组件>.md` |
| 需要数值 | `assets/tokens.json`，或生成好的 css / tailwind / swift 文件 |
| 某条规则的原因 | `foundations/<主题>.md` |
| 审查 | `review.md` |

---

## 执行顺序

| 阶段 | 内容 | 依赖 |
| --- | --- | --- |
| P0 | 修按钮：web.md 补尺寸表和参考 CSS，改写“透明内边距”，review 加量化检查，发布 0.3.0 并更新本机全局安装 | 无 |
| P1 | token 重构：去掉平台名、加密度维度、补齐缺失类别；生成器输出 CSS / Tailwind / Swift；补测试 | 需要你先定 Web 应用和 iPadOS 的数值 |
| P2 | references 拆成 foundations / components / scenes；生成组件尺寸表；SKILL.md 改成路由 | P1 |
| P3 | 展示页改成样本优先：工具栏、场景和密度切换、组件矩阵、规格表 | P1、P2 的数据 |

## 需要你拍板的事

1. Web 应用的默认按钮是 28（建议）还是与 Mac 一致的 24。
2. iPadOS 的尺寸和密度：完全沿用 iOS，还是侧边栏和列表行用更紧凑的值。
3. 官网 / 文档是否作为正式场景写进 skill（建议写进去，否则 `.pill` 这类营销尺寸会继续被当作应用规格）。
4. 是否接受在 skill 里放参考 CSS 片段和生成的 Tailwind / Swift 文件（会改变“assets 只有 tokens”这条测试约束）。
