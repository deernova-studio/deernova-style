# Tooltip 与悬停浮层

指针停在一个控件上时浮出的一小段文字，用来说出只有图标的按钮叫什么、快捷键是什么，或者显示被截断的完整文字。悬停卡片是它的大号版本，用来预览链接、人名这类对象。

**需要提供**：一段很短的文字（通常就是按钮的名称），可选的快捷键；悬停卡片需要标题、一两行摘要。

## 什么时候用

| 情况 | 用 |
| --- | --- |
| 只有图标的按钮，说出它的名称和快捷键 | tooltip |
| 文字被截断，显示完整内容 | tooltip |
| 解释一个概念、给出操作说明 | 写在界面上的说明文字，或者 [popover](sheet.md) |
| 里面要放链接、按钮、输入框 | [popover](sheet.md) |
| 预览一个链接、文件或人 | 悬停卡片 |
| 必须让用户看到的信息（错误、限制、价格） | 直接写在界面上，不要藏进 tooltip |

## 尺寸

<!-- tokens:tooltip -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `tooltip-height` | 24 | 28 | 28 | 单行 tooltip 的高度；折成两行时随内容长高。 |
| `tooltip-padding-x` | 8 | 10 | 10 | tooltip 左右内边距。 |
| `tooltip-font-size` | 12 | 13 | 13 | tooltip 字号。 |
| `tooltip-radius` | 6 | 8 | 8 | tooltip 圆角。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `tooltip-offset` | `8px` | tooltip 和触发它的控件之间的距离。 |
| `tooltip-max-width` | `240px` | tooltip 最大宽度，超过时折行，最多两行。 |
| `tooltip-delay` | `500ms` | 指针停留多久后显示 tooltip 和悬停卡片。SwiftUI 的 .help() 用系统的时间。（仅网页） |
| `tooltip-skip-window` | `300ms` | 一个 tooltip 刚关闭的这段时间里，移到相邻控件立即显示，不再等待。（仅网页） |
<!-- /tokens -->

- 外观：反色的小块，`accent` 底、`on-accent` 字（浅色主题黑底白字，深色主题白底黑字），圆角 `tooltip-radius`，阴影 `shadow-float`，叠放层级 `z-tooltip`。不加箭头，不加描边。
- 单行高 `tooltip-height`，左右内边距 `tooltip-padding-x`，字号 `tooltip-font-size`、常规字重。超过 `tooltip-max-width` 时折行，最多两行；两行还放不下，说明内容太多，改用 popover。
- 快捷键跟在名称后面，间距 `space-2`，颜色是 `on-accent` 的 70%，用等宽数字。
- 文案：名词或动词短语，和按钮的无障碍名称一致，不加句号，不写「点击这里……」。
- 悬停卡片：外观和 [popover](sheet.md) 相同（`surface-raised` 底、`line` 描边、`menu-radius`、`shadow-float`、`popover-padding`），宽度不超过 `sheet-width-sm`。

## 位置

- 默认在控件正下方，水平居中，间距 `tooltip-offset`；下方放不下时翻到上方。窗口底部的控件（例如 Composer 里的按钮）默认放在上方。
- 靠近窗口边缘时往里推，离边缘至少 `space-2`，不要被裁掉。
- 盖住旁边的控件没有关系，但不能盖住触发它的控件本身。

## 显示与关闭

- **指针**：停留 `tooltip-delay` 后显示。一个 tooltip 正在显示，或者刚关闭不到 `tooltip-skip-window` 时，移到相邻的控件立即显示，不再等待，这样扫过一排工具栏按钮时不会一个个卡顿。
- **键盘**：控件获得键盘焦点（`:focus-visible`）时立即显示，失去焦点时关闭。
- **关闭**：指针离开控件和 tooltip、按 Esc、按下或点击控件、页面滚动时关闭。指针可以从控件移到 tooltip 上而不关闭（离开后留 100ms 的余地），方便放大镜用户阅读。
- 同一时间最多显示一个 tooltip。
- 动效：淡入淡出，都用 `duration-instant`（进入 `ease-enter`，退出 `ease-exit`），不位移、不缩放。
- 悬停卡片：同样停留 `tooltip-delay` 后显示；指针移到卡片上不关闭，离开控件和卡片 300ms 后关闭。卡片里的内容只是预览，点击链接本身就能看到全部，所以键盘和触屏用户不会因为看不到卡片而缺少信息。

## 触控端

- 触屏没有悬停，不显示 tooltip 和悬停卡片，也不要把长按改成显示 tooltip。只有图标的按钮靠清晰的图标和无障碍名称；含义不明显的操作直接带文字标签。
- iPad 接触控板或鼠标时有指针，SwiftUI 的 `.help()` 会显示系统 tooltip。

## 悬停才出现的操作

列表行、消息上悬停才出现的操作按钮（复制、更多）也属于悬停浮层，规则一样：

- 放在 `@media (hover: hover) and (pointer: fine)` 里才隐藏；触屏上一直显示，或者收进「更多」菜单。
- 键盘焦点进入这一行时也要显示（`:focus-within`），隐藏时用 `opacity`，按钮仍然能被 Tab 到。
- 显示和隐藏不改变布局，不让旁边的内容跳动。

## Web

- 只有图标的按钮用 `aria-label` 命名，快捷键用 `aria-keyshortcuts`；这时 tooltip 只是把名称显示出来，加 `aria-hidden="true"`，避免读屏读两遍。tooltip 补充了名称以外的信息（被截断的全文、禁用的原因）时，用 `role="tooltip"`，并在控件上用 `aria-describedby` 指向它。
- 禁用的按钮收不到指针事件。要用 tooltip 解释禁用原因时，用 `aria-disabled="true"` 代替 `disabled`，保留焦点和悬停。
- 不要用 `title` 属性：显示时间不能控制，键盘聚焦时不显示，样式也和界面不一致。
- tooltip 用脚本显示和定位。要盖在弹窗之上时，给它加 `popover="manual"`（浏览器支持时用 `popover="hint"`）放到顶层。只在工具栏这类简单场景里，可以用下面的 `.dn-tooltip-anchor` 直接定位。

```css
.dn-tooltip {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: max-content;
  max-width: min(var(--tooltip-max-width), 100vw - 2 * var(--space-2));
  min-height: var(--tooltip-height);
  margin: 0;
  padding: var(--space-1) var(--tooltip-padding-x);
  border: 0;
  border-radius: var(--tooltip-radius);
  background: var(--accent);
  color: var(--on-accent);
  box-shadow: var(--shadow-float);
  font: var(--weight-regular) var(--tooltip-font-size)/var(--type-caption-line) var(--font-sans);
  overflow-wrap: anywhere;
  transition: opacity var(--duration-instant) var(--ease-enter), overlay var(--duration-instant) allow-discrete, display var(--duration-instant) allow-discrete;
}
.dn-tooltip[popover] { position: fixed; inset: auto; }
.dn-tooltip[popover]:not(:popover-open) { display: none; opacity: 0; transition-timing-function: var(--ease-exit); }
@starting-style { .dn-tooltip:popover-open { opacity: 0; } }
.dn-tooltip-shortcut { margin-inline-start: var(--space-2); color: color-mix(in srgb, var(--on-accent) 70%, transparent); font-variant-numeric: tabular-nums; }
.dn-tooltip-anchor { position: relative; display: inline-flex; }
.dn-tooltip-anchor > .dn-tooltip { position: absolute; top: calc(100% + var(--tooltip-offset)); left: 50%; z-index: var(--z-tooltip); translate: -50% 0; }
```

```html
<div class="dn-row">
  <button class="dn-icon-button" type="button" aria-label="新建笔记" aria-keyshortcuts="Meta+N"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
  <span class="dn-tooltip-anchor">
    <button class="dn-icon-button" type="button" aria-label="搜索" aria-keyshortcuts="Meta+K"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg></button>
    <span class="dn-tooltip" aria-hidden="true">搜索<span class="dn-tooltip-shortcut">⌘K</span></span>
  </span>
  <button class="dn-icon-button" type="button" aria-label="设置"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg></button>
</div>
```

示例里的 tooltip 画成显示状态。真实页面里由脚本按上面的时间显示和关闭。

## SwiftUI

在 macOS 和接了指针的 iPadOS 上，`.help()` 显示系统 tooltip，时间和位置由系统决定。iPhone 上不显示。

```swift
Button {
    search()
} label: {
    Image(systemName: "magnifyingglass")
}
.keyboardShortcut("k")
.accessibilityLabel("搜索")
.help("搜索")

// 被截断的文字：给出完整内容
Text(note.title)
    .lineLimit(1)
    .help(note.title)
```

工具栏按钮用 `Label("搜索", systemImage: "magnifyingglass")` 写，标题会成为无障碍名称，再加 `.help()` 显示 tooltip。SwiftUI 没有悬停卡片的系统组件，不要自己做；需要预览时，用 `.contextMenu(menuItems:preview:)`（右键或长按显示）。

## 不要

- 用 tooltip 放必须看到的信息、长段说明，或者链接和按钮。
- 给已经有文字标签的按钮再加一个重复的 tooltip（只补快捷键时除外）。
- 用 `title` 属性代替 tooltip；只在悬停时显示，键盘聚焦时不显示。
- 在触屏上用长按显示 tooltip。
- 给 tooltip 加箭头、彩色底色或描边；一次显示多个 tooltip。
- 指针一碰到就立即显示（扫过工具栏时满屏闪烁）；指针移到 tooltip 上它就消失。
