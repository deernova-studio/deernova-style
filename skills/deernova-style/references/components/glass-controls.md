# 玻璃操作层

浮在内容之上的玻璃操作层：SwiftUI 端的工具栏按钮组、标签栏、浮动操作按钮，以及官网与文档的页眉。规则见 [玻璃](../foundations/glass.md)。

**Web 应用不用玻璃**：顶栏和工具按钮见 [顶栏与侧面板](toolbar.md)。

**什么时候用**：用户在浏览内容时随时要用到的操作，比如新建、搜索、切换页面、分享。内容本身永远不放在玻璃上。

**需要提供**：每个按钮的图标和无障碍标签、点击动作；如果是标签栏，还要提供当前选中项。

## 尺寸

<!-- tokens:glass-controls -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `glass-button-size` | 34 | 44 | 36 | 玻璃按钮的边长：macOS 26 工具栏按钮约 34（系统绘制，这里只作参考和自绘时对齐），官网页眉的图标按钮也用它；按钮组里的按钮比它小 8。Web 应用的工具栏不用玻璃，用 button-height-md。 |
<!-- /tokens -->

- 单个玻璃按钮：圆形，边长 `glass-button-size`，图标 `icon-size-lg`。macOS 26 的工具栏按钮由系统绘制，约 34，和红绿灯在同一条线上，见 [macOS](../scenes/macos.md)。
- 按钮组：胶囊形，内边距 3，组内按钮比单个按钮小 8，间距 2。相邻的玻璃元素放进同一组，组与组之间 `space-3`。
- 选中项：图标从 `ink-secondary` 变成 `ink`，底色 `fill-selected`。
- 实色玻璃（`accent` 底、`on-accent` 图标）一屏只用一次，留给主操作，比如「新建」。

## Web

只用于官网与文档：网页没有系统玻璃，页眉用半透明填充加背景模糊近似。Web 应用里不要用。

```css
.dn-glass {
  border: var(--stroke-line) solid var(--glass-stroke);
  border-radius: var(--radius-full);
  background: var(--glass-fill);
  box-shadow: var(--shadow-glass);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
}
@media (prefers-reduced-transparency: reduce) {
  .dn-glass { background: var(--surface-raised); -webkit-backdrop-filter: none; backdrop-filter: none; }
}

.dn-glass-button {
  position: relative;
  display: inline-grid;
  place-items: center;
  flex: none;
  width: var(--glass-button-size);
  height: var(--glass-button-size);
  padding: 0;
  border-radius: var(--radius-full);
  color: var(--ink);
  font: inherit;
  cursor: pointer;
}
.dn-glass-button .dn-icon { width: var(--icon-size-lg); height: var(--icon-size-lg); }
.dn-glass-button.is-prominent { border-color: transparent; background: var(--accent); color: var(--on-accent); }
.dn-glass-button:focus-visible { outline: var(--stroke-focus) solid var(--focus-ring); outline-offset: var(--focus-offset); }
.dn-glass-button::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: max(100%, var(--hit-min));
  height: max(100%, var(--hit-min));
  transform: translate(-50%, -50%);
}

.dn-glass-group { display: inline-flex; align-items: center; gap: 2px; padding: 3px; }
.dn-glass-group .dn-glass-button {
  width: calc(var(--glass-button-size) - 8px);
  height: calc(var(--glass-button-size) - 8px);
  border: 0;
  background: transparent;
  box-shadow: none;
  color: var(--ink-secondary);
}
.dn-glass-group .dn-glass-button[aria-current="page"], .dn-glass-group .dn-glass-button[aria-pressed="true"] { background: var(--fill-selected); color: var(--ink); }
.dn-glass-group .dn-glass-button .dn-icon { width: var(--icon-size-md); height: var(--icon-size-md); }
```

```html
<div class="dn-glass-demo">
  <div class="dn-row">
    <nav class="dn-glass dn-glass-group" aria-label="页面">
      <button class="dn-glass-button" type="button" aria-label="笔记" aria-current="page"><svg class="dn-icon" aria-hidden="true"><use href="#dn-file"/></svg></button>
      <button class="dn-glass-button" type="button" aria-label="收藏"><svg class="dn-icon" aria-hidden="true"><use href="#dn-star"/></svg></button>
      <button class="dn-glass-button" type="button" aria-label="设置"><svg class="dn-icon" aria-hidden="true"><use href="#dn-settings"/></svg></button>
    </nav>
    <button class="dn-glass dn-glass-button" type="button" aria-label="搜索"><svg class="dn-icon" aria-hidden="true"><use href="#dn-search"/></svg></button>
    <button class="dn-glass dn-glass-button is-prominent" type="button" aria-label="新建"><svg class="dn-icon" aria-hidden="true"><use href="#dn-plus"/></svg></button>
  </div>
</div>
```

## SwiftUI

```swift
// 标准标签栏与工具栏，系统自动渲染为玻璃
TabView {
    Tab("笔记", systemImage: "doc.text") { NotesView() }
    Tab("收藏", systemImage: "star") { FavoritesView() }
    Tab(role: .search) { SearchView() }      // 搜索单独成为右侧的圆形玻璃按钮
}
.tabBarMinimizeBehavior(.onScrollDown)
.tint(.brandAccent)

// 自定义浮动按钮：放进同一个容器，互相融合
GlassEffectContainer(spacing: 12) {
    HStack(spacing: 12) {
        Button("搜索", systemImage: "magnifyingglass") { search() }
            .buttonStyle(.glass)
        Button("新建", systemImage: "plus") { create() }
            .buttonStyle(.glassProminent)
    }
    .labelStyle(.iconOnly)
}

// 完全自定义形状时
Image(systemName: "mic")
    .frame(width: Deernova.glassButtonSize, height: Deernova.glassButtonSize)
    .glassEffect(.regular.interactive(), in: .circle)
```

## 不要

- 在玻璃上放段落文字或列表；玻璃叠玻璃。
- 给工具栏加实色背景挡住滚动边缘效果。
- 同一屏出现两个实色玻璃。
