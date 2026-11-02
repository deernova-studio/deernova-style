# Web 落地

用 HTML、CSS 或前端框架实现 Deernova 的做法。规则本身见 [基础](foundations.md)，各类界面的规格见 [界面模式](patterns.md)。不需要安装任何 npm 包。

## 接入变量

`assets/tokens.css` 是现成的 CSS 变量：浅色是默认值，系统切到深色时自动换成深色；在 `<html>` 上设置 `data-theme="light"` 或 `data-theme="dark"` 可以强制指定，去掉这个属性就跟随系统。

- 项目里还没有设计变量时，把 `tokens.css` 复制到项目的样式目录，在全局样式里引入一次。
- 项目已经有自己的主题系统（Tailwind、CSS-in-JS、组件库主题）时，把 Deernova 的值映射进去，保持语义名，不要在组件里直接写十六进制颜色。

```js
// tailwind.config.js：颜色指向 CSS 变量，深色主题自动生效
export default {
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)', surface: 'var(--surface)',
        'surface-raised': 'var(--surface-raised)', 'surface-sunken': 'var(--surface-sunken)',
        ink: 'var(--ink)', 'ink-secondary': 'var(--ink-secondary)', 'ink-tertiary': 'var(--ink-tertiary)',
        line: 'var(--line)', 'line-control': 'var(--line-control)',
        accent: 'var(--accent)', 'on-accent': 'var(--on-accent)',
        success: 'var(--success)', warning: 'var(--warning)', danger: 'var(--danger)', info: 'var(--info)'
      },
      fontFamily: { serif: 'var(--font-serif)', sans: 'var(--font-sans)', mono: 'var(--font-mono)' }
    }
  }
};
```

## 密度

- **桌面上的应用界面**（后台、工具、编辑器）沿用 Mac 的密度：正文 13–14px，控件 24–28px，列表行 26–32px，侧边栏 220px。
- **触屏**沿用 iOS 的规则：正文不小于 16px，可点区域至少 44×44px，按钮看起来可以是 36px。用 `@media (pointer: coarse)` 区分，而不是只看屏幕宽度。
- **官网、文档这类阅读页面**可以更舒展：标题更大、留白更多，但仍然只用黑白灰、细线分组、衬线标题。
- 长文栏宽不超过 680px。窄屏下布局要重新排列，不能出现横向滚动。

## 字体

直接用 `--font-serif`、`--font-sans`、`--font-mono` 三个字体栈，都是系统字体，不需要加载网络字体。标题和长文用 serif，界面文字用 sans。中文会落到苹方；在 Windows 上会落到系统的无衬线字体，这是预期的。

## 玻璃

网页没有系统玻璃，只能近似。只用在页眉、浮动工具条、弹出菜单这类操作层上，不要用在正文、卡片或输入框上。

```css
.glass {
  background: var(--glass-fill);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  backdrop-filter: blur(14px) saturate(1.4);
  border: var(--stroke-hairline) solid var(--glass-stroke);
  box-shadow: var(--shadow-glass);
}
@media (prefers-reduced-transparency: reduce) {
  .glass { background: var(--surface-raised); -webkit-backdrop-filter: none; backdrop-filter: none; }
}
```

## 控件

- 用原生元素：`<button>`、`<a>`、`<input>`、`<select>`、`<dialog>`、`<details>`。只有图标的按钮加 `aria-label`。
- 焦点环：`outline: var(--stroke-focus) solid var(--focus-ring); outline-offset: 2px;`，只在 `:focus-visible` 时显示。
- 主按钮：`background: var(--accent); color: var(--on-accent);`。次按钮：`surface-raised` 底、`line` 描边、`shadow-control`。
- 细线：`border: var(--stroke-hairline) solid var(--line);`。0.5px 在高分屏上是 1 个物理像素，在普通屏上浏览器会按 1px 画。
- 分段控件、开关这类有状态的控件，用 `aria-pressed`、`aria-checked` 或 `role="tab"` 标出当前状态。
- 弹窗用 `<dialog>` 的 `showModal()`，自带焦点管理和 Esc 关闭。

## 动效

- 即时反馈 0.12s，展开和切换 0.2s，缓动用 `cubic-bezier(0.2, 0.8, 0.2, 1)`。
- `@media (prefers-reduced-motion: reduce)` 下关掉位移和缩放，只保留淡入淡出。
- 连续的装饰动画用 `requestAnimationFrame` 按时间推进，页面隐藏（`visibilitychange`）时暂停。

## 验证

- 375px 和桌面两种宽度，浅色和深色两套主题。
- 只用键盘走一遍：Tab 顺序合理，焦点环清楚，Esc 能关闭弹层。
- 浏览器缩放到 200%，长中文、长英文和空数据都不溢出、不重叠。
- 打开「减弱动态效果」和「降低透明度」各看一次。
