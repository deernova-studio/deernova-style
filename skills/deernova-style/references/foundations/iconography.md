# 图标

图标是灰色的线性符号，粗细跟随旁边的文字。

## 尺寸

<!-- tokens:icon -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `icon-size-sm` | 14 | 17 | 16 | 按钮和标签里的图标。 |
| `icon-size-md` | 16 | 20 | 18 | 侧边栏、列表、横幅、工具栏里的图标。 |
| `icon-size-lg` | 20 | 24 | 24 | 玻璃按钮、标签栏里的图标。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `icon-stroke` | `1.75px` | 线性图标在 24×24 viewBox 里的描边宽度，接近 SF Symbols 的常规粗细。（仅网页） |
<!-- /tokens -->

## 用哪套图标

- **Web：`@deernova/icons`。** 73 个线性图标，24×24 网格、1.75 描边、圆头圆角、无填充，颜色跟随文字。其中 Lucide 51 个（只统一了描边），按 Deernova 比例重画 8 个（箭头、展开收起、侧边栏、新对话），AI 相关的 14 个是自己画的。不混用其他图标库，也不手画路径；缺图标时加进这个包（加法见包里的 README），再用。
- **原生：SF Symbols。** 和系统保持一致，13pt 文字旁的图标用 `.medium`。每个 Web 图标在下表里都有对应的 SF Symbol；标「自定义 Symbol」的四个（思考、委派、上下文、/ 命令）系统里没有，用包里的 SVG 导出成自定义 Symbol，导出前暂时用文字代替。
- **加载动效和图标是一套**：`thinking` 图标就是 `thinking` 加载动效停下的样子，见[加载状态](../components/skeleton.md)。
- 不用 emoji 当图标；不用星星、魔法棒这类符号表示 AI。

## 规则

- 默认颜色 `ink-secondary`，选中态和主操作用 `ink`。图标不用彩色，状态图标除外。
- 状态图标固定为：成功 `success`（`checkmark.circle.fill`），警告 `warning`（`exclamationmark.triangle.fill`），错误 `error`（`xmark.circle.fill`），提示 `info`（`info.circle.fill`）。原生端用实心，Web 用同样形状的线性图标。
- 一个意思只用一个图标：删除永远是 `trash`，关闭永远是 `close`，展开下拉永远是 `chevron-down`；同一个图标也不表示两件事。
- 只有图标的按钮必须有无障碍标签（`aria-label`，或 SwiftUI 的 `Button("搜索", systemImage:)` 加 `.labelStyle(.iconOnly)`）；旁边已经有文字的图标对读屏隐藏。

## 图标名单

<!-- tokens:icons -->
**导航**

| 名字 | 用途 | SF Symbols |
| --- | --- | --- |
| `sidebar` | 侧边栏开关 | `sidebar.left` |
| `new-chat` | 新对话 | `square.and.pencil` |
| `search` | 搜索 | `magnifyingglass` |
| `home` | 首页 | `house` |
| `folder` | 文件夹 | `folder` |
| `history` | 历史 | `clock.arrow.circlepath` |
| `settings` | 设置 | `gearshape` |
| `more` | 更多 | `ellipsis` |
| `back` | 返回 | `chevron.backward` |
| `close` | 关闭 | `xmark` |

**方向与展开**

| 名字 | 用途 | SF Symbols |
| --- | --- | --- |
| `chevron-down` | 向下 | `chevron.down` |
| `chevron-right` | 向右 | `chevron.right` |
| `chevron-up` | 向上 | `chevron.up` |
| `expand` | 展开 | `arrow.up.left.and.arrow.down.right` |
| `collapse` | 收起 | `arrow.down.right.and.arrow.up.left` |
| `external` | 在新窗口打开 | `arrow.up.right.square` |
| `chevron-left` | 向左 | `chevron.left` |
| `arrow-down` | 向下箭头 | `arrow.down` |
| `arrow-right` | 向右箭头 | `arrow.right` |

**通用操作**

| 名字 | 用途 | SF Symbols |
| --- | --- | --- |
| `plus` | 添加 | `plus` |
| `copy` | 复制 | `doc.on.doc` |
| `check` | 完成 | `checkmark` |
| `edit` | 编辑 | `pencil` |
| `trash` | 删除 | `trash` |
| `undo` | 撤销 | `arrow.uturn.backward` |
| `download` | 下载 | `arrow.down.to.line` |
| `upload` | 上传 | `arrow.up.to.line` |
| `share` | 分享 | `square.and.arrow.up` |
| `link` | 链接 | `link` |
| `pin` | 固定 | `pin` |
| `filter` | 筛选 | `line.3.horizontal.decrease` |
| `minus` | 减去 | `minus` |
| `options` | 选项 | `slider.horizontal.3` |
| `star` | 收藏 | `star` |

**内容与文件**

| 名字 | 用途 | SF Symbols |
| --- | --- | --- |
| `file` | 文件 | `doc` |
| `document` | 文档 | `doc.text` |
| `image` | 图片 | `photo` |
| `code` | 代码 | `chevron.left.forwardslash.chevron.right` |
| `table` | 表格 | `tablecells` |
| `attach` | 附件 | `paperclip` |
| `web` | 网页 | `globe` |
| `terminal` | 终端 | `apple.terminal` |
| `list` | 列表 | `list.bullet` |
| `chat` | 对话 | `bubble.left` |
| `mail` | 邮件 | `envelope` |
| `changes` | 改动 | `plus.forwardslash.minus` |

**AI**

| 名字 | 用途 | SF Symbols |
| --- | --- | --- |
| `thinking` | 思考 | 自定义 Symbol（待导出） |
| `tool` | 工具调用 | `wrench.adjustable` |
| `delegate` | 委派 | 自定义 Symbol（待导出） |
| `model` | 模型 | `cube` |
| `context` | 上下文 | 自定义 Symbol（待导出） |
| `permission` | 权限 | `checkmark.shield` |
| `artifact` | 产物 | `macwindow` |
| `mention` | @ 提及 | `at` |
| `command` | / 命令 | 自定义 Symbol（待导出） |
| `voice` | 语音 | `mic` |
| `send` | 发送 | `arrow.up` |
| `stop` | 停止 | `stop` |
| `regenerate` | 重新生成 | `arrow.clockwise` |
| `branch` | 分支 | `arrow.triangle.branch` |
| `question` | 提问 | `questionmark.circle` |

**反馈与状态**

| 名字 | 用途 | SF Symbols |
| --- | --- | --- |
| `success` | 成功 | `checkmark.circle.fill` |
| `warning` | 警告 | `exclamationmark.triangle.fill` |
| `error` | 错误 | `xmark.circle.fill` |
| `info` | 提示 | `info.circle.fill` |
| `waiting` | 等待确认 | `pause.circle` |
| `skipped` | 已跳过 | `nosign` |
| `bell` | 通知 | `bell` |
| `thumbs-up` | 赞 | `hand.thumbsup` |
| `thumbs-down` | 踩 | `hand.thumbsdown` |
| `user` | 用户 | `person` |
| `pause` | 暂停 | `pause` |
| `cloud` | 同步 | `icloud` |
<!-- /tokens -->

## Web 写法

```css
.dn-icon {
  width: var(--icon-size-md);
  height: var(--icon-size-md);
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: var(--icon-stroke);
  stroke-linecap: var(--line-cap);
  stroke-linejoin: var(--line-join);
}
```

在页面里内联一次 `@deernova/icons/sprite.svg`，之后按名字引用；规范里所有示例都是这种写法：

```html
<svg class="dn-icon" aria-hidden="true"><use href="#dn-search"/></svg>
```

也可以用包里的函数直接生成：`import { svg } from '@deernova/icons'`，`svg('search')`；只有图标的按钮写成 `svg('search', { label: '搜索' })`。
