# 横幅与轻提示

横幅是页面内的提示条，告诉用户一件需要知道的事，必要时附带一个解决动作。轻提示（Toast）是它的短暂版本。

**需要提供**：语气（中性 / success / warning / danger）、标题（一句话说明状态）、正文（后果或解决办法）、可选的一个动作按钮；能关闭的横幅还要提供关闭动作。

## 尺寸

<!-- tokens:banner -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `toast-height` | 36 | 40 | 40 | 轻提示胶囊的高度。 |
| `banner-radius` | 10 | 12 | 12 | 横幅和贴在输入区上方的提示条的圆角。 |
<!-- /tokens -->

- 中性横幅：`surface-raised` 底、`line` 描边、`ink-secondary` 图标。有语气的横幅：对应的 `-soft` 底、无描边、图标用语气色。文字始终是 `ink` 和 `ink-secondary`。
- 圆角 `banner-radius`，内边距上下 `space-2`、左右 `space-3`，图标 `icon-size-md`；标题 `type-body` 半粗，正文 `callout`。状态图标见 [图标](../foundations/iconography.md)。
- 动作按钮用小号次按钮，放在右侧，一个横幅最多一个。
- 和输入区有关的提示（额度将用完、网络断开）贴在 Composer 正上方，宽度和 Composer 一致，见 [Composer](composer.md)。
- 轻提示：底部居中的玻璃胶囊，高 `toast-height`，2 秒后自动消失，只用来确认刚刚完成的操作（「已复制」「已保存」），文字用完成态，不放按钮。读屏用 `role="status"`。

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
.dn-banner.is-success { border-color: transparent; background: var(--success-soft); }
.dn-banner.is-success > .dn-icon { color: var(--success); }
.dn-banner.is-warning { border-color: transparent; background: var(--warning-soft); }
.dn-banner.is-warning > .dn-icon { color: var(--warning); }
.dn-banner.is-danger { border-color: transparent; background: var(--danger-soft); }
.dn-banner.is-danger > .dn-icon { color: var(--danger); }

.dn-toast { display: inline-flex; align-items: center; gap: var(--space-2); height: var(--toast-height); padding: 0 var(--space-4) 0 var(--space-3); color: var(--ink); font: var(--weight-medium) var(--type-body-size)/1 var(--font-sans); }
.dn-toast .dn-icon { width: var(--icon-size-md); height: var(--icon-size-md); color: var(--success); }
```

```html
<div class="dn-stack">
  <div class="dn-banner">
    <svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
    <div class="dn-banner-text"><p class="dn-banner-title">新版本已就绪</p><p class="dn-banner-body">重新打开应用后生效，未保存的内容会自动保留。</p></div>
    <button class="dn-button is-sm" type="button">重新打开</button>
  </div>
  <div class="dn-banner is-warning">
    <svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg>
    <div class="dn-banner-text"><p class="dn-banner-title">本月 AI 次数还剩 10%</p><p class="dn-banner-body">用完后可以继续写笔记，AI 功能会在 11 月 1 日恢复。</p></div>
  </div>
  <div class="dn-banner is-danger">
    <svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>
    <div class="dn-banner-text"><p class="dn-banner-title">同步失败</p><p class="dn-banner-body">网络连接已断开，恢复后会自动重试。</p></div>
    <button class="dn-button is-sm" type="button">立即重试</button>
  </div>
  <div class="dn-glass dn-toast" role="status"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>已复制到剪贴板</div>
</div>
```

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

// 轻提示
Label("已复制到剪贴板", systemImage: "checkmark.circle.fill")
    .padding(.horizontal, Deernova.space4).frame(height: Deernova.toastHeight)
    .glassEffect(in: .capsule)
```

## 不要

- 一个页面同时出现多个横幅。
- 用横幅打广告；错误信息只写「出错了」。
- 轻提示里放需要用户处理的事情（那应该用横幅或弹窗）。
