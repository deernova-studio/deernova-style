# 交互状态

悬停、按下、选中、焦点、禁用分别怎么表现。颜色只有两个半透明的底色：悬停 `fill-hover`，按下和选中 `fill-selected`，数值见 [设计变量](../tokens.md) 的「颜色」。

## 各元素的状态

| 元素 | 悬停 | 按下 | 选中（当前项） |
| --- | --- | --- | --- |
| 文字按钮、图标按钮、工具栏按钮 | `fill-hover` 底，文字和图标从 `ink-secondary` 变 `ink` | `fill-selected` 底 | `fill-selected` 底、`ink`（`aria-pressed`） |
| 次按钮（灰底） | 在 `fill-selected` 上再叠一层 `fill-hover` | 再叠一层 `fill-selected` | — |
| 主按钮、实色危险按钮 | 不透明度 `opacity-solid-hover` | 同悬停 | — |
| 浅底危险按钮 | 在 `danger-soft` 上叠一层 `fill-hover` | 叠一层 `fill-selected` | — |
| 列表行、侧边栏项、菜单项、步骤行 | `fill-hover` 底 | `fill-selected` 底 | `fill-selected` 底，字重不变；选中项悬停时保持 `fill-selected`，不再叠加 |
| 可点的卡片 | 描边从 `line` 变 `line-control`，底色不变 | 同悬停 | 描边 `ink`，宽 `stroke-control` |
| 分段控件、标签页、折叠标题 | 文字从 `ink-secondary` 变 `ink`，不加底色 | — | 分段控件的选中块；标签页 `fill-selected` 底 |
| 本身是 `ink` 的文字链接（字标、页眉的产品名） | 变 `ink-secondary` | — | — |
| 正文里的链接 | 下划线从 `line-control` 变成文字颜色 | — | — |
| 输入框 | 不变 | — | 聚焦：边框 `focus-ring`，外圈 3px `accent-soft` |
| 玻璃按钮 | 比命中区小一圈的 `fill-hover` | `fill-selected` | `fill-selected`，图标 `ink` |

## 规则

- **悬停底色只用 `fill-hover`。** 它是半透明的黑（深色主题是白），叠在 `canvas`、`surface`、`surface-raised` 和玻璃上都成立。不要另选一个实色灰（比如 `#f2f2f2`），换一张纸面或换到深色主题就不对了。
- **三档，不叠加。** 悬停最轻，按下和选中一样深。选中项被悬停时保持选中的底色；按下时用 `fill-selected` 换掉 `fill-hover`，不是两层叠在一起。次按钮本身就是灰底，悬停和按下在它上面叠一层，这是唯一的叠加。
- **反馈只改颜色。** 悬停和按下只改底色、文字颜色或描边颜色（三者可以一起变，比如图标按钮底色和图标颜色一起变），不加阴影，不上浮，不缩放，不改字重和尺寸。
- **底色的形状和元素一样。** 悬停底色和元素同样大、同样的圆角（`row-radius`、`button-radius`、`menu-radius` 减内边距）。列表行在容器里左右缩进，不铺满整栏；命中区比可见尺寸大时，底色只画在可见范围里。
- **只在能悬停的设备上。** `:hover` 一律写在 `@media (hover: hover)` 里，触屏上不会停在悬停状态。触屏没有悬停，按下时（`:active`）立即给 `fill-selected` 反馈。
- **过渡要快。** 底色、文字颜色、描边在 `duration-instant` 内变化，进入和离开一样快，不加延迟。
- **焦点不靠悬停底色。** 键盘焦点用焦点环（`stroke-focus` 宽的 `focus-ring`，只在 `:focus-visible` 时出现）。列表和菜单里用方向键移动的高亮，用 `fill-hover` 加内描边焦点环，见 [菜单](../components/menu.md)。
- **禁用没有反馈。** 禁用的元素整体降到 `opacity-disabled`，没有悬停和按下的变化，光标恢复默认；不要隐藏，保持在原位。
- **光标。** 可以点的元素（按钮、行、标签、卡片、链接）用 `cursor: pointer`；文字输入用 `text`；可以拖动的用 `grab`，拖动中用 `grabbing`。
- **拖放。** 拖起来的元素用 `shadow-float` 浮起；可以放下的位置用 `fill-selected` 底，或者 `line-style-dropzone` 的虚线框。

## Web

下面的 `.dn-state` 是通用写法，适合行、文字按钮这类「透明底、悬停出底色」的元素。按钮、卡片、分段控件的写法见各自的组件说明。示例里的 `.is-hover`、`.is-active` 只用来在文档里把状态画出来。

```css
.dn-state { cursor: pointer; transition: background-color var(--duration-instant) var(--ease-standard), color var(--duration-instant) var(--ease-standard); }
@media (hover: hover) { .dn-state:hover { background-color: var(--fill-hover); color: var(--ink); } }
.dn-state:active, .dn-state.is-active { background-color: var(--fill-selected); }
.dn-state.is-hover { background-color: var(--fill-hover); color: var(--ink); }
.dn-state:is([aria-selected="true"], [aria-current="page"], [aria-current="true"], [aria-pressed="true"]) { background-color: var(--fill-selected); color: var(--ink); }
.dn-state:is(:disabled, [aria-disabled="true"]) { background-color: transparent; opacity: var(--opacity-disabled); cursor: default; }
.dn-state-row { display: flex; align-items: center; height: var(--row-height); padding: 0 var(--row-padding-x); border-radius: var(--row-radius); color: var(--ink-secondary); font: var(--weight-regular) var(--type-callout-size)/1 var(--font-sans); }
```

同一组状态放在 `canvas` 和卡片的 `surface` 上，半透明的底色在两种纸面上都成立：

```html
<div class="dn-row is-top">
  <div class="dn-state-list">
    <div class="dn-state dn-state-row">默认</div>
    <div class="dn-state dn-state-row is-hover">悬停 · fill-hover</div>
    <div class="dn-state dn-state-row is-active">按下 · fill-selected</div>
    <div class="dn-state dn-state-row" aria-current="true">选中 · fill-selected</div>
    <div class="dn-state dn-state-row" aria-disabled="true">禁用 · opacity-disabled</div>
  </div>
  <div class="dn-card dn-state-list">
    <div class="dn-state dn-state-row">默认</div>
    <div class="dn-state dn-state-row is-hover">悬停 · fill-hover</div>
    <div class="dn-state dn-state-row is-active">按下 · fill-selected</div>
    <div class="dn-state dn-state-row" aria-current="true">选中 · fill-selected</div>
    <div class="dn-state dn-state-row" aria-disabled="true">禁用 · opacity-disabled</div>
  </div>
</div>
```

## SwiftUI

系统控件（`Button`、`List`、`Menu`、工具栏）自带悬停、按下和选中的效果，不要覆盖。自己画的可点区域：

```swift
struct RowButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(maxWidth: .infinity, minHeight: Deernova.rowHeight, alignment: .leading)
            .padding(.horizontal, Deernova.rowPaddingX)
            .background(configuration.isPressed ? Color.fillSelected : .clear,
                        in: .rect(cornerRadius: Deernova.rowRadius))
            .contentShape(.rect)
    }
}

Button(action: open) { Label("周会记录", systemImage: "doc") }
    .buttonStyle(RowButtonStyle())
    .hoverEffect(.highlight)   // iPadOS 接触控板时和系统一致
```

macOS 上自己画的行需要悬停底色时，用 `.onHover` 记下状态，再铺 `fillHover`；iPhone 没有悬停。

## 不要

- 用实色灰做悬停底色；悬停和选中用同一个底色，分不出当前在哪。
- 悬停时加阴影、上浮、放大、加粗，或者改变尺寸让布局跳动。
- 把 `:hover` 写在 `@media (hover: hover)` 外面，让触屏停在悬停状态。
- 选中项悬停时再叠一层变得更深；一个元素同时出现两种底色。
- 用悬停底色代替键盘焦点环；禁用的元素还有悬停效果。
