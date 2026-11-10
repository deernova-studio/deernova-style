# 横幅与轻提示

横幅是页面内的提示条，告诉用户一件需要知道的事，必要时附带一个解决动作，状态结束前一直在。轻提示（Toast）是浮在页面底部的一小条，确认刚完成的操作、给一次撤销的机会，或者报告一个没有别的地方可以显示的错误。什么时候用哪种，先看 [反馈与通知](../foundations/feedback.md)。

**需要提供**：横幅的语气（中性 / success / warning / danger）、标题（一句话说明状态）、正文（后果或解决办法）、可选的一个动作按钮、能不能关闭；轻提示的类型（确认 / 带动作 / 错误）、一句话、可选的一个动作。

## 尺寸

<!-- tokens:banner -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `toast-height` | 36 | 40 | 40 | 轻提示胶囊的高度。 |
| `banner-radius` | 10 | 12 | 12 | 横幅和贴在输入区上方的提示条的圆角。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `toast-max-width` | `420px` | 轻提示的最大宽度，文字超出时截断。 |
<!-- /tokens -->

## 横幅

- 中性横幅：`surface-raised` 底、`line` 描边、`ink-secondary` 图标。有语气的横幅：对应的 `-soft` 底、无描边、图标用语气色。文字始终是 `ink` 和 `ink-secondary`。
- 圆角 `banner-radius`，内边距上下 `space-2`、左右 `space-3`，图标 `icon-size-md`；标题 `type-body` 半粗，正文 `callout`。状态图标见 [图标](../foundations/iconography.md)。
- 动作按钮用小号次按钮，放在右侧，一个横幅最多一个。能关闭的横幅最右边是一个小号的关闭图标按钮。
- 放在它影响的内容上方：页面级的在内容区顶部，和输入区有关的（额度将用完、网络断开）贴在 Composer 正上方，宽度和 Composer 一致，见 [Composer](composer.md)。
- 状态结束（网络恢复、额度重置）时自动收起；用户关掉的横幅，同一件事不再出现。

## 轻提示

- **样式**：一条胶囊，高 `toast-height`，`radius-full`，最宽 `toast-max-width`，文字放不下时截断。
  - Web：`surface-raised` 底、1px `line` 描边、`shadow-float`，和弹出菜单一样是不透明的浮层；**不用玻璃**。
  - SwiftUI（iOS、macOS）：系统玻璃胶囊（`glassEffect`）。
  - 图标 `icon-size-md`：确认用 `success` 的对勾圆，错误用 `danger` 的叉号圆，其他用 `ink-secondary`；文字 `body` 中粗、`ink`，一句话，不超过 20 个字。
- **三种**：
  - **确认**：「已复制到剪贴板」，完成态，没有按钮，2 秒后消失。
  - **带动作**：「已删除 3 条笔记」后面跟一个文字按钮「撤销」（`ink`、半粗），6 秒后消失；鼠标悬停或键盘焦点在上面时暂停计时。最多一个动作。
  - **错误**：「移动失败：没有权限」，可以跟一个「重试」，最右边一个关闭按钮，**不自动消失**。只用于屏幕上没有位置显示的后台错误；能在原位显示的错误放在原位。
- **位置**：
  - Web 应用：内容区底部居中（不算侧边栏），离底边 `space-5`；页面有 Composer 时放在 Composer 上方 `space-3`。
  - iOS：标签栏或底部工具栏上方，左右居中。macOS：窗口内容区底部居中。
  - 官网与文档：视口底部居中。
- **一次一个**：新的轻提示出现时，旧的立刻淡出，被替换的撤销机会随之结束；所以批量操作合并成一条（「已删除 3 条笔记」），不要连弹三条。同一句话重复出现时只重新计时。
- **撤销**：操作立即生效，撤销把它恢复原样，并给一个确认「已恢复」。轻提示显示期间按 ⌘Z / Ctrl+Z 等于点「撤销」。
- **动效**：出现时淡入并上移 8px（`duration-base`），消失时淡出（`duration-instant`），见 [动效](../foundations/motion.md)。
- **读屏**：确认和带动作的用 `role="status"`，错误用 `role="alert"`；轻提示不抢焦点，所以它的动作在别处也必须能做到。

## Web

```css
.dn-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: var(--stroke-line) solid var(--line);
  border-radius: var(--banner-radius);
  background: var(--surface-raised);
}
.dn-banner > .dn-icon { width: var(--icon-size-md); height: var(--icon-size-md); margin-top: calc((var(--type-body-line) - var(--icon-size-md)) / 2); color: var(--ink-secondary); }
.dn-banner-text { flex: 1; min-width: 0; }
.dn-banner-title { margin: 0; color: var(--ink); font: var(--weight-semibold) var(--type-body-size)/var(--type-body-line) var(--font-sans); }
.dn-banner-body { margin: 0; color: var(--ink-secondary); font: var(--type-callout); }
.dn-banner .dn-button { align-self: center; }
.dn-banner .dn-icon-button { align-self: center; width: var(--button-height-sm); height: var(--button-height-sm); margin-right: calc(var(--space-1) * -1); }
.dn-banner .dn-spinner { margin: calc((var(--type-body-line) - var(--icon-size-sm)) / 2) 2px 0; }
.dn-banner.is-success { border-color: transparent; background: var(--success-soft); }
.dn-banner.is-success > .dn-icon { color: var(--success); }
.dn-banner.is-warning { border-color: transparent; background: var(--warning-soft); }
.dn-banner.is-warning > .dn-icon { color: var(--warning); }
.dn-banner.is-danger { border-color: transparent; background: var(--danger-soft); }
.dn-banner.is-danger > .dn-icon { color: var(--danger); }

.dn-toast {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  max-width: min(var(--toast-max-width), 100vw - 2 * var(--space-4));
  height: var(--toast-height);
  padding: 0 var(--space-4) 0 var(--space-3);
  border: var(--stroke-line) solid var(--line);
  border-radius: var(--radius-full);
  background: var(--surface-raised);
  box-shadow: var(--shadow-float);
  color: var(--ink);
  font: var(--weight-medium) var(--type-body-size)/1 var(--font-sans);
}
.dn-toast { transition: opacity var(--duration-base) var(--ease-enter), transform var(--duration-base) var(--ease-enter), display var(--duration-base) allow-discrete; }
.dn-toast[hidden] { display: none; opacity: 0; transform: translateY(8px); transition-duration: var(--duration-instant); transition-timing-function: var(--ease-exit); }
@starting-style { .dn-toast:not([hidden]) { opacity: 0; transform: translateY(8px); } }
@media (prefers-reduced-motion: reduce) {
  .dn-toast[hidden] { transform: none; }
  @starting-style { .dn-toast:not([hidden]) { transform: none; } }
}
.dn-toast > .dn-icon { flex: none; width: var(--icon-size-md); height: var(--icon-size-md); color: var(--ink-secondary); }
.dn-toast.is-success > .dn-icon { color: var(--success); }
.dn-toast.is-danger > .dn-icon { color: var(--danger); }
.dn-toast-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dn-toast:has(> .dn-toast-action, > .dn-icon-button) { padding-right: var(--space-1); }
.dn-toast-action { flex: none; height: calc(var(--toast-height) - 8px); padding: 0 var(--space-2); border: 0; border-radius: var(--radius-full); background: transparent; color: var(--ink); font: var(--weight-semibold) var(--type-body-size)/1 var(--font-sans); cursor: pointer; }
@media (hover: hover) { .dn-toast-action:hover { background: var(--fill-hover); } }
.dn-toast-action:active, .dn-toast-action:focus-visible { outline: none; background: var(--fill-selected); }
.dn-toast > .dn-icon-button { width: calc(var(--toast-height) - 8px); height: calc(var(--toast-height) - 8px); border-radius: var(--radius-full); }
.dn-toast > .dn-icon-button .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); }
.dn-toast-action + .dn-icon-button { margin-left: calc(var(--space-2) * -1); }
.dn-toast-region { position: fixed; inset: auto 0 var(--space-5); z-index: var(--z-toast); display: flex; justify-content: center; padding: 0 var(--space-4); pointer-events: none; }
.dn-toast-region > .dn-toast { pointer-events: auto; }
```

```html
<div class="dn-stack">
  <div class="dn-banner">
    <svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
    <div class="dn-banner-text"><p class="dn-banner-title">新版本已就绪</p><p class="dn-banner-body">重新打开应用后生效，未保存的内容会自动保留。</p></div>
    <button class="dn-button is-sm" type="button">重新打开</button>
    <button class="dn-icon-button" type="button" aria-label="关闭"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  </div>
  <div class="dn-banner is-warning">
    <svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg>
    <div class="dn-banner-text"><p class="dn-banner-title">本月 AI 次数还剩 10%</p><p class="dn-banner-body">用完后可以继续写笔记，AI 功能会在 11 月 1 日恢复。</p></div>
  </div>
  <div class="dn-banner is-danger" role="alert">
    <svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>
    <div class="dn-banner-text"><p class="dn-banner-title">同步失败</p><p class="dn-banner-body">网络连接已断开，恢复后会自动重试。</p></div>
    <button class="dn-button is-sm" type="button">立即重试</button>
  </div>
  <div class="dn-toast is-success" role="status"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg><span class="dn-toast-text">已复制到剪贴板</span></div>
  <div class="dn-toast" role="status"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg><span class="dn-toast-text">已删除 3 条笔记</span><button class="dn-toast-action" type="button" aria-keyshortcuts="Meta+Z">撤销</button></div>
  <div class="dn-toast is-danger" role="alert"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg><span class="dn-toast-text">移动失败：没有目标文件夹的权限</span><button class="dn-toast-action" type="button">重试</button><button class="dn-icon-button" type="button" aria-label="关闭"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
</div>
```

全局状态（网络断开、正在重新连接）用中性横幅，图标换成转圈，放在内容区顶部或 Composer 上方：

```html
<div class="dn-banner" role="status">
  <span class="dn-spinner" aria-hidden="true"></span>
  <div class="dn-banner-text"><p class="dn-banner-title">正在重新连接…</p><p class="dn-banner-body">网络已断开，修改会在恢复后同步。</p></div>
</div>
```

真实页面里，轻提示放在一个 `.dn-toast-region` 里（`position: fixed`，底部居中），计时、悬停暂停和替换由脚本处理。

## SwiftUI

```swift
HStack(alignment: .top, spacing: Deernova.space2) {
    Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(.warning)
    VStack(alignment: .leading, spacing: 2) {
        Text("本月 AI 次数还剩 10%").font(.headline)
        Text("用完后可以继续写笔记，AI 功能会在 11 月 1 日恢复。")
            .font(.deernovaCallout).foregroundStyle(.inkSecondary)
    }
}
.padding(.vertical, Deernova.space2).padding(.horizontal, Deernova.space3)
.frame(maxWidth: .infinity, alignment: .leading)
.background(.warningSoft, in: .rect(cornerRadius: Deernova.bannerRadius))

// 轻提示：原生端用玻璃胶囊，放在 .overlay(alignment: .bottom) 里
HStack(spacing: Deernova.space2) {
    Label("已删除 3 条笔记", systemImage: "trash")
    Button("撤销") { undo() }.fontWeight(.semibold)
}
.padding(.horizontal, Deernova.space4).frame(height: Deernova.toastHeight)
.glassEffect(in: .capsule)
.transition(.opacity.combined(with: .offset(y: 8)))
```

撤销同时接入系统的 `UndoManager`，摇一摇和 ⌘Z 都能撤销。

## 不要

- 一个页面同时出现多个横幅；同时弹出好几条轻提示。
- 用横幅打广告；错误信息只写「出错了」。
- 轻提示里放需要用户处理的事情（那应该用横幅或弹窗）；放两个以上的按钮。
- 能在原位显示的错误用轻提示报告；错误轻提示几秒后自己消失。
- 可以撤销的操作先弹「确定要删除吗？」。
- 在 Web 上给轻提示用玻璃或模糊；用黑底白字的胶囊。
