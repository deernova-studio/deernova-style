---
name: deernova-style
description: Deernova 的界面设计语言：只用黑白灰，内容放在不透明纸面上，原生端的操作层用系统 Liquid Glass，Web 应用用不透明平面加 1px 线；界面和 AI 回答用无衬线，衬线只给大标题和长文；按场景（Web 应用、macOS、iOS、iPadOS、官网与文档）切换密度。在 Deernova 的应用或网站里新建、修改或审查界面时使用，包括颜色、字体、间距、圆角、线条、阴影、按钮、输入框、复选框单选滑块、表单、表格、菜单与下拉选择、命令面板、侧边栏、顶栏、列表、卡片、弹窗、tooltip、加载与骨架、空状态与错误页、横幅与轻提示（撤销、报错）、通知（角标、通知中心、系统通知）、AI 对话、AI 输入框（附件、@ 提及、/ 命令、模型、发送）、思考与工具调用、权限确认与变更审批、AI 向用户提问（选项卡片）、建议提示、产物预览和任务清单，以及对应的 CSS、Tailwind 或 SwiftUI 实现。
---

# Deernova 设计语言

纸一样的黑白界面，做简单好用的应用。

Web 应用和 macOS 内容区（桌面档）的骨架和密度参照 Claude 桌面端（Code）：288 宽的侧边栏、44 高的顶栏、居中的对话栏、底部的输入区、可以并排打开的侧面板，正文 15/24。颜色、玻璃和衬线是 Deernova 自己的。

这份 skill 是规范和数据，不是组件库：不需要安装任何包。用项目现有的技术栈和组件实现这些规则，缺的部分按这里的规格和参考写法补上。

## 总则

AI 做出来的界面有一种一眼能认出的味道：每块都有小字分类和一句说明，标题前面配彩色图标底块，满屏卡片、徽标和统计数字，应用首页像宣传页，点什么都弹「成功」。Deernova 反过来：像一张纸，只有内容、墨和细线，打开就能干活，安安静静。下面几条先于颜色、字体和尺寸。

1. **少写字。** 界面靠标题、布局和图标说话，不靠小字。用一个标题说清这一屏是什么，用一个主操作回答能做什么，其余交给位置、分组和图标。只管界面上的字，不管 AI 回答和用户自己的内容。
   - 一块一个标题：标题上方不加小字分类，下方不配副标题；标题说不清，就改标题。
   - 不写说明书：不写「在这里输入你的问题」「点击下方按钮开始」。说明只留给用户会犹豫的地方（后果、费用、不能撤销、谁能看到），一句话，紧挨着对应的控件。
   - 不写套话：不写欢迎段落、口号、「智能」「一站式」「无缝」；徽标和数字只表达真实的状态和数据。
   - 标签能省就省：邮箱、日期、金额这类格式自己会说话，不加「邮箱：」；留下的标签比值淡一档。
   - 小字有限额：列表行和卡片一行标题，最多一行元信息（最多 3 项，用 `·` 分隔）；说明最多一句；空状态只有标题、一句话和最多两个按钮。
   - 例：页头不要「✦ NOTES / 你的笔记 / 在这里管理你的所有笔记」，只写「笔记」，右边一个新建图标按钮。
   - 检查：逐行遮住小字，遮住后意思不变的就删。细则见 [文案](references/foundations/writing.md)。
2. **只有纸、墨和线。** 屏幕上的每样东西，要么是内容，要么是操作内容的控件，要么是分开它们的细线；彩色或渐变的图标底块、光晕、插画、emoji、装饰阴影都是装饰，不要。层次只靠字号、灰度和位置，不靠颜色、外框和徽标。一块内容只用一种分隔（细线、留白、底色三选一），卡片里不放卡片。
   - 例：设置页不要一排带渐变图标底块的卡片、每张卡里再套一个「前往设置」框；改成一个分组列表，行之间一条细线，整行可点。
   - 检查：指着一个元素问「去掉它，用户少知道了什么」，答不上来就删。
3. **应用是工具，不是宣传页。** 打开就是工作本身：列表、编辑器或输入框。应用里不放大标题区、功能介绍卡片、一排统计卡片、插画和口号，不把所有东西居中排成一列；尺寸按场景，不按官网。
   - 例：笔记应用首页不要「欢迎回来 👋」加四张统计卡片加「快速开始」卡片，直接是最近的笔记列表；AI 对话应用的新对话页只有一句问候、输入框和几条建议。
   - 检查：截图给没见过它的人看三秒，他先看到的应该是自己的东西，不是产品在介绍自己。
4. **每个控件都要干活。** 一屏一个主操作；同一个操作在一屏只出现一次；控件跟着数据量和真实需要来（5 条数据不加搜索、筛选和分页，两个选项不做下拉，一页内容不套标签页）；没接上功能的不放出来；能用平台自带的控件就不自己造。
   - 例：「新建」不要同时出现在顶栏、侧边栏、列表上方和右下角浮动按钮，只留顶栏一个，加快捷键。
   - 检查：把每个控件点一遍，每个都做了一件真实的事，而且没有两个在做同一件事。
5. **安静。** 结果自己会说话：用户看得见结果时不再提示；能撤销的不先问，做完给「撤销」；不庆祝，动效只说明东西从哪来、到哪去。用户在输入或阅读时，不弹窗、不抢焦点、不挪布局。见 [反馈与通知](references/foundations/feedback.md)。
   - 例：重命名后不弹「✅ 重命名成功！」；删除不先问「确定要删除吗？」，直接删，给一条「已删除 · 撤销」。
   - 检查：做完一件日常操作，屏幕上除了结果本身，什么都没多出来。
6. **每种情况都有样子。** 不只画顺利的那一种：空、加载、出错、没有权限、离线、超长名字、上千条数据都要设计，每种都给出下一步，没有死胡同。用真实感的内容去试，不用三条一样长的假数据。
   - 例：列表除了正常的样子，还要有空状态、和最终内容一样大的骨架、原位的「没有加载出来 · 重试」、一行截断的超长标题。
   - 检查：把数据清空、灌到一千条、断网、换一个没有权限的账号，各看一次。
7. **对照整页示例。** [整页示例](references/examples.md)里有四个「不要 / 改成」的整页：笔记首页、AI 对话、设置页、官网首页，每个都标出违反了哪几条。动手前先看一遍，做完拿自己的页面对照。

## 核心规则

具体的样式规则。

1. **纸面承载内容，玻璃交给系统。** 文字、列表、卡片、代码、消息、输入区是内容，放在不透明的纸面上：`canvas` → `surface` → `surface-raised`，代码块和展开的详情用 `surface-sunken`。操作层按平台处理：**SwiftUI 端**（macOS、iOS、iPadOS）的侧边栏、工具栏、标签栏、浮动按钮直接用系统 Liquid Glass，这是原生端的优势，不要盖掉；**Web 应用**不模拟玻璃，操作层是不透明平面加 1px 分隔线；只有官网与文档的页眉可以用轻玻璃。玻璃上不放段落，内容不做成玻璃，玻璃不叠玻璃。
2. **黑白灰，强调靠对比。** `accent` 就是墨色 `ink`：主按钮在浅色主题是黑底白字，在深色主题是白底黑字，文字用 `on-accent`，不要写死白色。唯一的彩色是状态色 `success`、`warning`、`danger`、`info`，只用来表达状态，而且必须同时带图标或文字。
3. **细线分区，阴影表达层级。** 区块之间用 `line` 色的 1px 线分隔（`stroke-line`），卡片不加阴影。菜单、弹窗、浮动面板和 Composer 用 `shadow-float`。激活和聚焦不加阴影，唯一的例外是输入框聚焦时的 `shadow-control`（见第 5 条）。
4. **无衬线做界面，衬线点题。** 界面文字、AI 回答、用户消息、标题栏都用系统无衬线（SF Pro）；代码和需要对齐的数字用等宽（SF Mono）。衬线（New York）只用在页面大标题和空状态标题（`display`、`title`）、官网与文档，以及文章类的长文阅读（`prose`）。中文统一落到苹方。
5. **激活不加装饰，键盘焦点要看得见。** 悬停 `fill-hover`，按下和选中 `fill-selected`，选中项悬停不再加深。输入框和下拉框是浅灰底加一条 1px `line` 浅线，聚焦时换成白底并加一层柔和的控件阴影。其他控件用键盘聚焦（`:focus-visible`）时画一圈 2px 的 `focus-ring` 焦点环，鼠标点击时不出现；聚焦不改底色，免得和按下、选中分不清。悬停不位移，只写在 `@media (hover: hover)` 里，见 [交互状态](references/foundations/states.md)。
6. **层次靠字号和灰度，少用粗体。** 600 只给真正的标题（`display`、`title`、`headline`）。分组标题、会话名、说明、时间戳用常规字重，靠 `ink-secondary`、`ink-tertiary` 和小一号的字区分层级。
7. **控件高度由 token 决定，点击区域单独补。** 按钮、输入框、列表行的可见高度直接用 `button-height-*`、`field-height`、`row-height`，上下内边距为 0，不让页面行高把它撑高。可见尺寸小于 `hit-min` 时，用透明的命中区补足，不加大可见的控件。
8. **间距成组。** 间距走 4pt 网格。组内用 `gap-stack`，组与组之间用 `gap-group`（至少 2 倍）；内容区里段落、工具调用、卡片之间 `space-4`。用细线和少量留白分组，不靠大块空白和外框。
9. **原生端用系统控件，Web 端用同一套自绘组件。** SwiftUI 端的导航结构、侧边栏、工具栏、菜单、表单、弹窗直接用系统控件和系统尺寸，只通过颜色和字体让它们融入；自己画的内容区（对话、卡片、输入区、任务清单）用 token。Web 应用没有系统控件可借，按组件说明里的规格画，骨架见 [Web 应用](references/scenes/web.md)。
10. **对齐按内容选。** 单行的控件和行在固定高度里垂直居中；图标和文字按中线，不同字号的文字按基线；三行以上的内容，图标和头像对齐第一行；空状态放在略高于正中的位置。不用内边距或 `top` 微调去凑居中。内容栏限宽并在主内容区里居中，见 [布局与对齐](references/foundations/layout.md)。

## 场景

所有尺寸都按场景取值。先确定你在做哪一种界面，再去读对应的场景说明。

<!-- tokens:scenes -->
| 场景 | 密度 | 输入 | 怎么启用 | 读这里 |
| --- | --- | --- | --- | --- |
| Web 应用 | 桌面（`desktop`） | 指针 | tokens.css 的默认值 | [scenes/web.md](references/scenes/web.md) |
| Web 触屏 | 触控（`touch`） | 触摸 | `@media (pointer: coarse)` 自动切换 | [scenes/web.md](references/scenes/web.md) |
| macOS | 桌面（`desktop`） | 指针 | 系统控件用系统尺寸；内容区用 `DeernovaTokens.swift` 的 `#if os(macOS)` | [scenes/macos.md](references/scenes/macos.md) |
| iOS | 触控（`touch`） | 触摸 | `DeernovaTokens.swift` 的 `#else` | [scenes/ios.md](references/scenes/ios.md) |
| iPadOS | 触控（`touch`） | 触摸和指针 | 同 iOS；分栏布局另见场景说明 | [scenes/ipados.md](references/scenes/ipados.md) |
| 官网与文档 | 舒展（`comfortable`） | 指针 | 根元素加 `data-density="comfortable"` | [scenes/web-marketing.md](references/scenes/web-marketing.md) |
<!-- /tokens -->

后台、工具、编辑器、AI 对话这类应用界面，不论是不是网页，都不要用官网的尺寸。

macOS、iOS、iPadOS 共用的 SwiftUI 写法（系统版本、接入变量、字体、点击区域、玻璃、动效）见 [SwiftUI 共用](references/scenes/swiftui.md)。

## 读什么

| 你在做 | 先读 |
| --- | --- |
| 任何界面 | 上面的总则（和[整页示例](references/examples.md)）、核心规则，加上对应的场景说明 `references/scenes/` |
| 改某个组件 | 下面的[按代码里的名字找](#按代码里的名字找) |
| 改颜色、间距、动效这类样式 | 下面的[按样式问题找](#按样式问题找) |
| 图标、加载动效 | [图标](references/foundations/iconography.md)的名单（Web 用 `@deernova/icons`，原生用 SF Symbols）和[加载状态](references/components/skeleton.md)（`@deernova/icons/loaders`），不手画图标、不自己写转圈 |
| 提示、报错、撤销、通知 | [反馈与通知](references/foundations/feedback.md)：先用里面的表选对方式，再读对应的组件 |
| AI 功能：对话、输入框、工具调用、确认、提问 | [AI 交互](references/foundations/ai.md)：一轮回答的顺序、状态和原则，再读里面列出的组件 |
| 需要具体数值 | [设计变量](references/tokens.md)；数据在 `assets/tokens.json` |
| 接入变量 | CSS：`assets/tokens.css`；Tailwind v4：`assets/tailwind.css`；SwiftUI：`assets/DeernovaTokens.swift` |
| 审查已有界面 | [审查清单](references/review.md) |
| 先看原生端的玻璃效果 | `assets/screens/` 里的截图，各有浅色和深色 |

### 按代码里的名字找

拿项目里的组件名、文件名或类名在这张表里搜。没有列出的名字，按它在页面上的作用找最接近的一行。

| 代码里常见的名字 | 读 |
| --- | --- |
| Toolbar、Header、TopBar、AppBar、TitleBar、Panel、Inspector、SplitView | [顶栏与侧面板](references/components/toolbar.md) |
| Sidebar、SideNav、Nav、Navigation、NavRail | [侧边栏](references/components/sidebar.md) |
| GlassButton、FloatingToolbar、TabBar、FAB、浮动按钮 | [玻璃操作层](references/components/glass-controls.md) |
| Button、IconButton、ButtonGroup、CTA | [按钮](references/components/button.md) |
| Input、TextField、TextArea、SearchField、SearchBar | [文本框](references/components/text-field.md) |
| Checkbox、Radio、RadioGroup、Switch、Toggle、Slider | [选择控件](references/components/choice.md) |
| SegmentedControl、ToggleGroup、ViewSwitcher、Tabs（切换视图） | [分段控件](references/components/segmented.md) |
| Menu、DropdownMenu、ContextMenu、Select、Combobox、Picker | [菜单与下拉](references/components/menu.md) |
| Form、Field、FormItem、Label、Validation、Settings 页的表单 | [表单](references/components/form.md) |
| Card、Tile、GridItem | [卡片](references/components/card.md) |
| List、ListItem、ListRow、Cell、Settings 页的分组 | [分组列表](references/components/list.md) |
| Table、DataTable、DataGrid | [表格](references/components/table.md) |
| Tag、Chip、Pill、StatusLabel、Badge（文字状态） | [标签](references/components/tag.md) |
| CodeBlock、Pre、SyntaxHighlighter | [代码块](references/components/code-block.md) |
| EmptyState、ErrorPage、NotFound、ErrorBoundary、Offline | [空状态与错误页](references/components/empty-state.md) |
| Modal、Dialog、AlertDialog、Confirm、Sheet、Drawer、Popover | [弹窗、抽屉与 popover](references/components/sheet.md) |
| CommandPalette、Command、QuickOpen、Spotlight、⌘K | [命令面板](references/components/command.md) |
| Tooltip、HoverCard、Hint | [Tooltip 与悬停浮层](references/components/tooltip.md) |
| Toast、Snackbar、Sonner、Banner、Alert、Callout、InlineMessage | [横幅与轻提示](references/components/banner.md) |
| Notification、NotificationCenter、Inbox、Bell、Badge（数字角标） | [通知](references/components/notification.md) |
| Skeleton、Spinner、Loader、Loading、Progress、Shimmer | [加载状态](references/components/skeleton.md) |
| Suggestions、StarterPrompts、FollowUps、新对话首页 | [建议与新对话](references/components/suggestion.md) |
| Composer、ChatInput、PromptInput、MessageInput、Attachment | [Composer（AI 输入框）](references/components/composer.md) |
| Mention、SlashCommand、Autocomplete、@、/ 命令 | [提及与命令](references/components/mention.md) |
| Message、ChatMessage、Bubble、Thread、Transcript、Citation | [消息](references/components/message.md) |
| ToolCall、ToolUse、Reasoning、Thinking、Step、Activity | [思考、工具调用与执行步骤](references/components/step-row.md) |
| Approval、PermissionPrompt、DiffReview、PlanReview | [确认与审批](references/components/approval.md) |
| Question、AskUser、OptionCard、Choices | [AI 提问](references/components/question.md) |
| TodoList、TaskList、Plan、Checklist | [任务清单](references/components/task-list.md) |
| Artifact、Preview、Canvas、WebView、ImageOutput | [产物与预览](references/components/artifact.md) |

每个组件文件的顺序都一样：开头一句用途和「需要提供」，有的接着是「先选对控件」，然后是「尺寸」（生成的尺寸表）、各自的行为和状态，最后三节固定是「Web」（参考 CSS 和 HTML）、「SwiftUI」、「不要」。只改一端时只读对应的那一节。AI 组件先读总纲 [AI 交互](references/foundations/ai.md)。

### 按样式问题找

| 问题里的词 | 读 |
| --- | --- |
| color、theme、dark mode、背景色、文字颜色、对比 | [颜色](references/foundations/color.md) |
| hover、active、pressed、selected、focus、disabled | [交互状态](references/foundations/states.md) |
| font、font-size、line-height、font-weight | [字体](references/foundations/typography.md) |
| padding、margin、gap、留白 | [间距](references/foundations/spacing.md) |
| layout、align、center、max-width、scroll、栏宽 | [布局与对齐](references/foundations/layout.md) |
| border-radius、圆角 | [圆角](references/foundations/radius.md) |
| border、divider、分隔线 | [线条](references/foundations/stroke.md) |
| shadow、z-index、层级 | [层级与阴影](references/foundations/elevation.md) |
| blur、backdrop-filter、Liquid Glass、玻璃 | [玻璃](references/foundations/glass.md) |
| animation、transition、easing、duration | [动效](references/foundations/motion.md) |
| 提示方式：toast 还是 banner 还是弹窗 | [反馈与通知](references/foundations/feedback.md) |
| AI 对话的整体流程 | [AI 交互](references/foundations/ai.md) |
| icon、SF Symbol | [图标](references/foundations/iconography.md) |
| 按钮文字、标题、说明、报错怎么写 | [文案](references/foundations/writing.md) |
| aria、键盘、读屏、对比度、减弱动态效果 | [无障碍](references/foundations/accessibility.md) |

## 工作流程

1. **先看项目。** 确认场景（上面的场景表）、最低系统版本、现有组件，以及颜色和样式怎么管理（CSS 变量、Tailwind 主题、Asset Catalog）。
2. **接入变量。** 把对应的生成文件接进项目现有的体系，用语义名引用（`ink`、`surface`、`button-height-md`），不要在代码里散落十六进制颜色和尺寸数字。
3. **按组件实现。** 用上面的[按代码里的名字找](#按代码里的名字找)找到对应的组件说明，用项目的组件实现，并补齐需要的状态：默认、悬停或按下、选中、禁用、加载、空、错误。
4. **检查。** 按总则每条的检查方法过一遍；浅色和深色两套主题；量一下默认按钮、输入框、列表行的实际高度，对照下面的[场景速查](#场景速查)；键盘焦点、点击区域、长文本和最大字号、减弱动态效果和降低透明度。审查时按 [审查清单](references/review.md) 逐项看。
5. **汇报。** 说明做了什么、哪些没有验证。不要因为这份 skill 就提高项目的最低系统版本、引入新的 UI 库或改动无关的页面。

## 场景速查

检查时对照：量出来的实际尺寸应该等于这里的值。写代码时引用变量名，不要抄这里的数字。

<!-- tokens:summary -->
| | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 |
| --- | --- | --- | --- |
| 正文 | 15 / 24 | 17 / 23 | 15 / 24 |
| 长文、AI 回答（衬线） | 16 / 26 | 17 / 26 | 17 / 28 |
| 默认按钮（可见高度） | 28，圆角 6 | 36，胶囊 | 36，胶囊 |
| 小 / 大按钮 | 24 / 32 | 30 / 46 | 32 / 44 |
| 最小点击区域 | 24 | 44 | 24 |
| 输入框 | 28 | 44 | 40 |
| 列表行 | 32 | 44 | 40 |
| 卡片：圆角 / 内边距 | 12 / 12 × 16 | 12 / 14 × 16 | 12 / 24 × 24 |
| 页面边距 | 32 | 16 | 32 |
| 侧边栏宽度 | 288 | 320 | 260 |
<!-- /tokens -->

所有数值都来自 `assets/tokens.json`，按密度生成在 `assets/tokens.css` 里；代码里的写法是 `var(--button-height-md)`、`Deernova.buttonHeightMd`。

## 不要做

- 给标题配眉标和副标题，给每个区块写说明，用装饰性的徽标、彩色图标底块和统计数字填空。
- 把应用首页做成宣传页；放还没接上功能的控件；看得见结果的操作再弹「成功」。
- 加品牌色、渐变、彩色图标，或用 emoji 当图标。
- 在 SwiftUI 端给系统工具栏、侧边栏加实色背景盖掉玻璃；在 Web 应用里用模糊效果模仿玻璃。
- 给卡片加阴影；卡片里套卡片；在玻璃上放正文或列表。
- 给界面文字、AI 回答或按钮用衬线；到处用粗体。
- 浮层只有出现动画、关闭时一下子消失；用 `@keyframes` 做开合。
- 用上下内边距撑出按钮高度；为了凑 44 点击区域把可见的按钮做大；用 `padding-top`、`top: 1px` 或等高的 `line-height` 凑垂直居中。
- 把官网的大按钮、大字号搬进应用界面；把桌面档的尺寸直接搬到触屏上。
- 一屏出现两个主按钮；用「确定」「OK」当按钮文字。
- 只靠颜色表达状态。

## 版本与更新

通过 `npx @deernova/style` 安装时，同一目录下的 `manifest.json` 记录版本和内容哈希；更新运行 `npx @deernova/style@latest update`。不要直接修改安装后的文件，规范的源文件在 deernova-style 仓库的 `skills/deernova-style/`。
