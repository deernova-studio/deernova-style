# 动效

动效用来说明因果：东西从哪里来、到哪里去。打开有过程，关闭也有过程；起步要快，停下要柔。数值见 [设计变量](../tokens.md) 的「动效」。

| Token | 值 | 用途 |
| --- | --- | --- |
| `duration-instant` | 120ms | 悬停、按压、选中；tooltip 的进出；菜单、popover 的退出 |
| `duration-base` | 200ms | 菜单、popover、轻提示的进入；展开收起；弹窗和抽屉的退出 |
| `duration-slow` | 320ms | 弹窗、底部弹窗、侧边抽屉的进入，页面级转场 |
| `ease-standard` | cubic-bezier(0.2, 0.8, 0.2, 1) | 状态变化和展开收起：颜色、高度、箭头旋转 |
| `ease-enter` | cubic-bezier(0.16, 1, 0.3, 1) | 出现：起步快、停得很柔 |
| `ease-exit` | cubic-bezier(0.4, 0, 0.2, 1) | 消失：配比进入低一档的时长 |
| `ease-drawer` | cubic-bezier(0.32, 0.72, 0, 1) | 从屏幕边缘滑入滑出的面板，进出都用它 |

## 进入和退出

| 元素 | 进入 | 退出 | 动什么 |
| --- | --- | --- | --- |
| Tooltip | `duration-instant` · `ease-enter` | `duration-instant` · `ease-exit` | 透明度 |
| 菜单、下拉选择、popover、悬停卡片 | `duration-base` · `ease-enter` | `duration-instant` · `ease-exit` | 透明度，加上从触发器那一侧 0.96 → 1 的缩放 |
| 轻提示 | `duration-base` · `ease-enter` | `duration-instant` · `ease-exit` | 透明度，加上向上 8px 的位移 |
| 居中弹窗 | `duration-slow` · `ease-enter` | `duration-base` · `ease-exit` | 面板的透明度和 0.96 → 1 的缩放；遮罩的透明度 |
| 底部弹窗 | `duration-slow` · `ease-drawer` | `duration-base` · `ease-drawer` | 从底边整块滑入；遮罩的透明度 |
| 侧边抽屉 | `duration-slow` · `ease-drawer` | `duration-base` · `ease-drawer` | 从左边或右边整块滑入；遮罩的透明度 |
| 展开收起（侧边栏分组、执行步骤、目录） | `duration-base` · `ease-standard` | 同进入 | 内容高度，箭头同步旋转 |
| 悬停、按下、选中 | `duration-instant` · `ease-standard` | 同进入 | 颜色，见 [交互状态](states.md) |
| 按钮和可点卡片按下 | `duration-press` · `ease-standard` | `duration-release` · `ease-release` | 只有底色层缩到 `press-scale`，文字不动；松开时带回弹 |

## 原则

- **一开一关都要有过程。** 只有出现动画、消失时一下子不见，是最常见的生硬感来源。
- **退出比进入快一档。** 用户要关掉的东西不该拖住他：进入 `duration-slow` 的，退出用 `duration-base`；进入 `duration-base` 的，退出用 `duration-instant`。
- **进入用 `ease-enter`。** 前一半时间就完成大部分位移，看起来立即响应，结尾又很柔。抽屉和底部弹窗用 `ease-drawer`，整块面板像被推出来一样顺。
- **距离要短。** 浮层从触发器旁边长出来：缩放不小于 0.96，位移不超过 8px；只有抽屉和底部弹窗走完整的屏幕边距离。不要从远处飞入，不要回弹、晃动。
- **一起动的东西同步。** 遮罩和面板用同样的时长和曲线；面板里的内容跟着面板一起出现，应用里不做逐个错开的入场。
- **可以中途反向。** 刚打开就关闭、刚关闭又打开时，从当前位置平滑退回，不跳到起点。
- **保持 60fps。** 浮层只动 `transform` 和 `opacity`；展开收起是唯一允许动高度的情况。不在动画里改宽度、位置、阴影、模糊。内容超过一屏的区域不做高度动画，直接展开。

## Web 写法

- 开合用 CSS transition，不用 `@keyframes`：transition 中途反向时会从当前值退回，keyframes 会跳。
- 打开的样子写在元素默认样式里，关闭的样子写在关闭状态的选择器上（`[hidden]`、`dialog:not([open])`、`[popover]:not(:popover-open)`），并在那里换成退出的时长和曲线。浏览器按「变成哪个状态」选用 transition，所以进出可以各用各的。
- 出现前的样子写在 `@starting-style` 里，元素从 `display: none` 出来时从这里开始过渡。
- 关闭时元素要变回 `display: none`、离开顶层：给 `display` 加 `allow-discrete`（`<dialog>` 和 popover 还要给 `overlay` 加），退出动画才能播完。不支持的浏览器退化为直接消失，功能不受影响。
- 展开收起：`<details>` 用 `::details-content` 加 `interpolate-size: allow-keywords` 过渡高度；其他容器用 `grid-template-rows` 从 `0fr` 到 `1fr`。
- 不用 `setTimeout` 按时长删除元素；要等退出结束时监听 `transitionend`。`will-change` 只在动画进行时加。
- 检查：在浏览器性能面板里录一次开合，没有掉帧；在动画中途反向操作，能平滑退回。

各组件的完整写法见 [菜单](../components/menu.md)、[弹窗、抽屉与 popover](../components/sheet.md)、[Tooltip](../components/tooltip.md)、[横幅与轻提示](../components/banner.md)。下面是展开收起的通用写法：

```css
.dn-collapse { interpolate-size: allow-keywords; }
.dn-collapse::details-content { block-size: 0; overflow: clip; transition: block-size var(--duration-base) var(--ease-standard), content-visibility var(--duration-base) allow-discrete; }
.dn-collapse[open]::details-content { block-size: auto; }
.dn-collapse > summary { list-style: none; }
.dn-collapse > summary::-webkit-details-marker { display: none; }
.dn-collapse-grid { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--duration-base) var(--ease-standard); }
.dn-collapse-grid.is-open { grid-template-rows: 1fr; }
.dn-collapse-grid > * { min-height: 0; overflow: hidden; }
@media (prefers-reduced-motion: reduce) { .dn-collapse::details-content, .dn-collapse-grid { transition: none; } }
```

```html
<details class="dn-collapse">
  <summary class="dn-state dn-state-row">本周的会话（点开试试）</summary>
  <div class="dn-state dn-state-row">整理周会记录</div>
  <div class="dn-state dn-state-row">修复登录页的焦点顺序</div>
  <div class="dn-state dn-state-row">起草发布说明</div>
</details>
```

## 减弱动态效果

- 用户开启「减弱动态效果」后，去掉位移和缩放（包括按钮按下的缩放），只保留透明度的淡入淡出，时长不超过 `duration-base`；抽屉和底部弹窗也改成淡入淡出。
- 展开收起直接切换；`spinner` 放慢，`thinking`、`working` 这类曲线动效停在静止帧（见[加载状态](../components/skeleton.md)）。
- 完整信息不能依赖动画才看得到。

## 其他规则

- 业务界面里不做无目的的循环动画。品牌展示页可以有叙事动效，但要能暂停，也不能妨碍阅读。
- **布局保持稳定**：给会变化的标题、状态和按钮文字预留空间，切换时阅读位置和按钮位置不跳动。禁用的按钮保持原位，不隐藏。加载时按钮宽度不变，把文字换成转圈。
- **状态不丢失**：重绘、切换主题、窗口缩放时，焦点、选中项和用户输入都要保留。
- **中断可恢复**：装饰性动画在暂停、离开视野或页面隐藏时冻结，回来后从原处继续，不追赶错过的时间；和真实时间绑定的功能（倒计时等）仍以真实时间为准。
- 连续的装饰动画在 Web 上用 `requestAnimationFrame` 按时间推进，`visibilitychange` 时暂停。

## SwiftUI

系统的 `.sheet`、`.popover`、`Menu`、`NavigationStack`、`DisclosureGroup` 自带进出动画，不要另加。自己画的浮层和面板：出现和消失都给 `transition`，动画挂在状态上。默认用 `.smooth`，小浮层用 `.snappy`。

```swift
@Environment(\.accessibilityReduceMotion) private var reduceMotion

// 小浮层：从触发器一侧长出来
ZStack(alignment: .topLeading) {
    if isOpen {
        FilterPanel()
            .transition(reduceMotion ? .opacity : .opacity.combined(with: .scale(scale: 0.96, anchor: .topLeading)))
    }
}
.animation(.snappy(duration: Deernova.durationBase), value: isOpen)

// 侧边抽屉：遮罩和面板一起动
ZStack(alignment: .leading) {
    if showDrawer {
        Color.scrim.ignoresSafeArea()
            .onTapGesture { showDrawer = false }
            .transition(.opacity)
        DrawerView()
            .frame(width: Deernova.sidebarWidth)
            .transition(reduceMotion ? .opacity : .move(edge: .leading))
    }
}
.animation(.smooth(duration: Deernova.durationSlow), value: showDrawer)

// 展开收起
withAnimation(.smooth(duration: Deernova.durationBase)) { isExpanded.toggle() }
```

## 不要

- 只做出现动画，关闭时一下子消失；退出比进入还慢。
- 用 `@keyframes` 做开合，中途反向时跳回起点。
- 在动画里改宽度、位置、阴影或模糊；对超过一屏的内容做高度动画。
- 从远处飞入、缩放小于 0.96、回弹或晃动；应用里让列表项逐个错开入场。
- 用 `setTimeout` 按时长删除元素；遮罩和面板各用一套时长。
