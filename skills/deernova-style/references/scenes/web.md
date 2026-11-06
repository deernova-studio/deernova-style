# Web 应用

后台、工具、编辑器、AI 对话这类在浏览器里使用的应用。桌面上是**桌面**密度（`desktop`），同一套代码在触屏设备上自动切到**触控**密度（`touch`）。官网、文档这类阅读页面见 [官网与文档](web-marketing.md)。

骨架和密度参照 Claude 桌面端（Code）：不透明的平面、1px 分隔线、正文 15/24。Web 应用**不用玻璃**，也不用模糊效果去模仿。

不需要安装任何 npm 包。

## 接入变量

`assets/tokens.css` 是现成的 CSS 变量，包含两套主题和四种密度：

- **主题**：浅色是默认值；系统切到深色时自动换成深色。在 `<html>` 上设置 `data-theme="light"` 或 `"dark"` 可以强制指定，去掉属性就跟随系统。属性也可以放在任何元素上，只影响它里面的内容。
- **密度**：默认 `desktop`；`@media (pointer: coarse)` 的设备自动换成 `touch`。在 `<html>` 或任何元素上设置 `data-density="desktop" | "touch" | "comfortable"` 可以强制指定。

接入方式按项目现有的体系选：

- 项目里还没有设计变量时，把 `tokens.css` 复制到样式目录，在全局样式里引入一次，**不要放进 `@layer`**。
- **Tailwind v4**：再复制 `assets/tailwind.css`，依次引入 `tailwindcss`、`tokens.css`、`tailwind.css`。之后可以写 `bg-surface text-ink border-line`、`text-body`、`h-control-md px-button-x-md rounded-button`、`shadow-float`，主题和密度切换都自动生效。
- **Tailwind v3**：在 `tailwind.config.js` 里把颜色和尺寸指向 CSS 变量：

  ```js
  export default {
    theme: {
      extend: {
        colors: { canvas: 'var(--canvas)', surface: 'var(--surface)', ink: 'var(--ink)', line: 'var(--line)', accent: 'var(--accent)', 'on-accent': 'var(--on-accent)' /* …其余语义颜色同理 */ },
        spacing: { 'control-sm': 'var(--button-height-sm)', 'control-md': 'var(--button-height-md)', 'control-lg': 'var(--button-height-lg)', field: 'var(--field-height)', row: 'var(--row-height)' },
        borderRadius: { button: 'var(--button-radius)', field: 'var(--field-radius)', card: 'var(--card-radius)' },
        fontFamily: { serif: 'var(--font-serif)', sans: 'var(--font-sans)', mono: 'var(--font-mono)' }
      }
    }
  };
  ```

- **CSS-in-JS 或组件库主题**：把 Deernova 的值映射进去，值写成 `var(--name)`，保持语义名，不要在组件里直接写十六进制颜色和尺寸数字。

## 控件高度：最常见的问题

Web 上按钮“上下特别宽”几乎都是同一个原因：用内边距和行高撑出高度。规则：

1. **高度用 token**：`height: var(--button-height-md)`（输入框 `--field-height`，列表行 `min-height: var(--row-height)`）。
2. **上下内边距为 0**：`padding: 0 var(--button-padding-x-md)`。
3. **行高为 1，不继承页面**：`font: var(--button-font-weight) var(--button-font-size-md)/1 var(--font-sans)`。页面正文的 1.6–1.8 行高一旦进到按钮里，按钮就会变高。
4. **点击区域单独补**：用 `::before` 伪元素把命中区撑到 `max(100%, var(--hit-min))`。**不要用 padding 补**，CSS 的 padding 在背景里面，会让可见的按钮一起变大。SwiftUI 示例里的 `.padding()` 写在 `.buttonStyle()` 之后，是透明的，不能照搬到 CSS。
5. **不要套用官网的按钮**：官网的 44px 胶囊按钮属于 `comfortable` 密度，不用在应用里。

完整写法见 [按钮](../components/button.md)。做完之后在浏览器里量一下：桌面上默认按钮的实际高度应该等于 28，侧边栏行 32，顶栏 44。

## 参考写法

每个组件说明里的 CSS 是可以直接对照的参考实现，类名以 `dn-` 开头。它们不是要引入的样式库：项目有自己的组件时，按里面的数值和状态改写；类名换成项目自己的。示例 HTML 里的 `dn-row`、`dn-stack` 只是排版辅助。

## 页面骨架

写法见 [顶栏与侧面板](../components/toolbar.md)。

- **侧边栏**：宽 `sidebar-width`（288），`surface` 底，比内容区亮一层，右边一条 1px 线。结构见 [侧边栏](../components/sidebar.md)。
- **顶栏**：高 `toolbar-height`（44），`canvas` 底，不透明，底部一条 1px 线；左边是标题，右边是一排 28 的图标按钮。
- **内容区**：`canvas` 底；对话栏宽度不超过 `content-max`，在内容区居中；段落、工具调用行、卡片、任务清单之间 `space-4`。AI 回答用 `type-body`，不用衬线。
- **底部**：[Composer](../components/composer.md) 悬浮在内容之上，上面可以贴一条提示，下面是模型和权限的信息行；内容区底部留出它的高度。
- **侧面板**：右边可以并排打开终端、预览等面板，标签头和顶栏同高。
- 窄于 `breakpoint-md`（960）时侧面板变成抽屉；窄于 `breakpoint-sm`（760）时侧边栏也收起成抽屉，顶栏左侧放菜单按钮。不能出现横向滚动。
- 页面本身不滚动，侧边栏、内容区、侧面板各自滚动。其他页面类型（列表加详情、设置页、表格）的宽度，以及对齐规则，见 [布局与对齐](../foundations/layout.md)。

## 字体

直接用 `--font-serif`、`--font-sans`、`--font-mono`，都是系统字体，不需要加载网络字体。字号用 `font: var(--type-body)` 这类角色变量，见 [字体](../foundations/typography.md)。

## 控件

- 用原生元素：`<button>`、`<a>`、`<input>`、`<select>`、`<dialog>`、`<details>`。只有图标的按钮加 `aria-label`，并用 [tooltip](../components/tooltip.md) 显示名称，不用 `title` 属性。
- 焦点环：`outline: var(--stroke-focus) solid var(--focus-ring); outline-offset: var(--focus-offset);`，只在 `:focus-visible` 时显示。
- 细线：`border: var(--stroke-line) solid var(--line);`。
- 分段控件、开关这类有状态的控件，用 `aria-pressed`、`role="switch"` 或 `role="tab"` 标出当前状态。
- 弹窗用 `<dialog>` 的 `showModal()`，自带焦点管理和 Esc 关闭；popover 用 `popover` 属性。打开、关闭和焦点规则见 [弹窗与 popover](../components/sheet.md)。
- 菜单和下拉：选值优先用原生 `<select>`，命令菜单和链接列表按 [菜单与下拉](../components/menu.md) 选语义、处理键盘。
- 悬停效果放在 `@media (hover: hover)` 里，触屏上不会卡在悬停状态。各元素的悬停、按下、选中见 [交互状态](../foundations/states.md)。

## 验证

- 375px 和桌面两种宽度，浅色和深色两套主题；用开发者工具切到触屏模拟一次，确认密度换成 `touch`。
- 量一下默认按钮、输入框、列表行的实际高度，应该等于对应 token。
- 只用键盘走一遍：Tab 顺序合理，焦点环清楚，Esc 能关闭弹层。
- 浏览器缩放到 200%，长中文、长英文和空数据都不溢出、不重叠。
- 打开「减弱动态效果」和「降低透明度」各看一次。
