# 通知

用户不在看的时候发生的事：后台任务完成了、AI 在等用户确认、有人提到了用户、同步失败了。分三层，从轻到重：**标记**（侧边栏和图标上的小圆点、数字）、**通知中心**（顶栏铃铛打开的列表）、**系统通知**（推到操作系统的通知）。用户正在看的事情不发通知，用[横幅与轻提示](banner.md)或原位反馈，见 [反馈与通知](../foundations/feedback.md)。

**需要提供**：每条通知的类型（完成 / 需要你 / 失败 / 提到你）、标题（谁或哪件事）、一句正文（发生了什么、需要做什么）、时间、点击后去哪里；可选的一个快捷动作。

## 尺寸

<!-- tokens:notification -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `badge-size` | 16 | 18 | 16 | 数字角标的高度和最小宽度。 |

| Token | 值 | 用途 |
| --- | --- | --- |
| `badge-dot-size` | `8px` | 未读和状态小圆点的直径。 |
| `notification-panel-width` | `360px` | 通知中心浮层的宽度。 |
| `notification-panel-max-height` | `480px` | 通知中心浮层的最大高度，超出时列表内部滚动。 |
<!-- /tokens -->

## 什么值得通知

| 类型 | 例子 | 标记 | 通知中心 | 系统通知 |
| --- | --- | --- | --- | --- |
| 需要你 | AI 等待你确认、有人请你审批 | `ink` 圆点 | 有 | 用户不在这个窗口时发 |
| 失败 | 后台任务失败、同步失败 | `danger` 圆点 | 有 | 用户不在这个窗口时发 |
| 完成 | 运行超过 1 分钟的任务完成、导出完成 | `ink` 圆点，看过即消失 | 有 | 只有用户打开了「任务完成时通知」才发 |
| 提到你 | 评论里 @ 你、文档分享给你 | 数字 | 有 | 按用户的设置 |

- 用户自己刚做的操作、营销内容、版本更新说明都**不发通知**。
- 同一件事只发一次：任务失败后自动重试又失败，更新原来那条，不再发一条。
- 短时间里的同类通知合并：「3 个任务已完成」，点开再看明细。

## 标记

- **圆点**：直径 `badge-dot-size`，`radius-full`。默认 `ink`（有新的、等待你）；失败用 `danger`。用在侧边栏的会话和项目前面、图标按钮的右上角。
- **数字**：只在「有几条」对用户有意义时用（未读的提及、待审批）。高 `badge-size`，最小宽度同高，左右 4px，`radius-full`，`accent` 底、`on-accent` 字，`caption` 半粗、等宽数字；超过 99 写「99+」。
- 叠在图标上时，外面加一圈和背景同色的 2px 描边，把它和图标分开。
- 看过就消失：打开对应的会话或通知中心后，圆点和数字立即清除。
- 不用颜色区分类型以外的东西；一个位置只放一个标记。

## 通知中心

- **入口**：顶栏右侧一个铃铛图标按钮，有未读时右上角一个圆点（有「提到你」时换成数字）。快捷键可选。
- **浮层**：从铃铛下方弹出，样式同[弹窗、抽屉与 popover](sheet.md) 里的 popover，宽 `notification-panel-width`，最高 `notification-panel-max-height`，列表在内部滚动。
- **头部**：左边标题「通知」（`headline`），右边文字按钮「全部标为已读」。
- **分组**：按时间分「今天」「更早」，组名 `caption`、`ink-tertiary`。
- **每一条**：
  - 左边一个 `icon-size-lg` 的圆形图标位：`fill-selected` 底，里面 `icon-size-sm` 的类型图标（完成是对勾、失败是 `danger` 的叉号、需要你是暂停、提到你是对方头像）。
  - 右边第一行：标题 `callout` 半粗 `ink`，单行截断；时间 `caption`、`ink-tertiary`，靠右（「3 分钟前」「昨天 14:20」）。
  - 第二行起：正文 `callout`、`ink-secondary`，最多两行。
  - 未读：标题行最右边、时间后面一个 `badge-dot-size` 的 `ink` 圆点，和标题垂直居中；标题半粗。已读后圆点消失，标题变成常规字重。
  - 整条可点，悬停 `fill-hover`，点击跳到对应的地方并标为已读。
  - 最多一个快捷动作（小号次按钮，在正文下面），例如「查看变更」；危险操作和需要看清内容才能决定的事（批准写入文件）不给快捷动作，点进去再做。
- **空的时候**：列表位置居中一行「没有新通知」，`callout`、`ink-tertiary`，不放插画。
- 通知保留 30 天；已读的不删除，可以回看。

## 系统通知

- **什么时候发**：只在用户不在看的时候：应用在后台、窗口没有焦点，或者用户在看别的会话。用户正看着这件事时不发。
- **什么时候请求权限**：第一次真正需要时（例如用户第一次让 AI 跑一个长任务，或者打开「完成时通知」），用一句话说明会通知什么；不在启动时就请求。
- **怎么写**：标题是会话或文档的名字（没有就写应用名）；正文一句话写发生了什么、要做什么：「写入 3 个文件，等待你确认」「导出完成，共 128 页」「同步失败：网络已断开」。不写「你有一条新通知」。
- **点击**：打开应用并直接定位到那件事（对应的会话、那张确认卡），不是只打开首页。
- **动作**：最多两个，只放安全的：「查看」「稍后提醒」；不能在系统通知里批准危险操作。
- **设置**：在设置里按类型开关（需要你、失败、完成、提到你），默认打开前两种。
- Web 应用：标签页标题前加未读数「(2) 周报草稿」，favicon 右上角加一个圆点；浏览器通知同样只在页面不可见时发。

## Web

铃铛按钮用 `aria-label="通知，2 条未读"`（数字变化时更新），浮层用 `role="dialog"` 和标题；列表用 `<ul>`，未读的条目在读屏文字里加「未读」。

```css
.dn-dot { display: inline-block; flex: none; width: var(--badge-dot-size); height: var(--badge-dot-size); border-radius: var(--radius-full); background: var(--ink); }
.dn-dot.is-danger { background: var(--danger); }
.dn-badge {
  box-sizing: border-box;
  display: inline-grid;
  place-items: center;
  min-width: var(--badge-size);
  height: var(--badge-size);
  padding: 0 4px;
  border-radius: var(--radius-full);
  background: var(--accent);
  color: var(--on-accent);
  font: var(--weight-semibold) var(--type-caption-size)/1 var(--font-sans);
  font-variant-numeric: tabular-nums;
}
.dn-icon-button > .dn-dot, .dn-icon-button > .dn-badge { position: absolute; box-shadow: 0 0 0 2px var(--badge-ring, var(--canvas)); }
.dn-icon-button > .dn-dot { top: 5px; right: 5px; }
.dn-icon-button > .dn-badge { top: 0; left: 55%; }

.dn-notifications { display: flex; flex-direction: column; width: min(var(--notification-panel-width), 100vw - 2 * var(--space-2)); max-height: var(--notification-panel-max-height); padding: 0; overflow: hidden; }
.dn-notifications-head { display: flex; flex: none; align-items: center; justify-content: space-between; gap: var(--space-2); padding: var(--space-2) var(--space-2) var(--space-1) var(--space-4); }
.dn-notifications-title { margin: 0; font: var(--type-headline); }
.dn-notifications-list { margin: 0; padding: 0 var(--space-1) var(--space-1); overflow: auto; overscroll-behavior: contain; list-style: none; }
.dn-notifications-group { padding: var(--space-2) var(--space-3) var(--space-1); color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/var(--type-caption-line) var(--font-sans); }
.dn-notification {
  position: relative;
  display: grid;
  grid-template-columns: var(--icon-size-lg) minmax(0, 1fr);
  gap: 2px var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--menu-radius);
  cursor: pointer;
  transition: background-color var(--duration-instant) var(--ease-standard);
}
@media (hover: hover) { .dn-notification:hover { background: var(--fill-hover); } }
.dn-notification:active { background: var(--fill-selected); }
.dn-notification-icon { display: grid; grid-row: span 3; place-items: center; width: var(--icon-size-lg); height: var(--icon-size-lg); border-radius: var(--radius-full); background: var(--fill-selected); color: var(--ink-secondary); }
.dn-notification-icon > .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); }
.dn-notification-icon.is-success { color: var(--success); }
.dn-notification-icon.is-danger { color: var(--danger); }
.dn-notification-icon.is-waiting { color: var(--ink); }
.dn-notification-head { display: flex; align-items: baseline; gap: var(--space-2); min-width: 0; }
.dn-notification-title { min-width: 0; margin: 0; overflow: hidden; color: var(--ink); font: var(--weight-regular) var(--type-callout-size)/var(--type-callout-line) var(--font-sans); text-overflow: ellipsis; white-space: nowrap; }
.dn-notification-time { flex: none; margin-left: auto; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/1 var(--font-sans); font-variant-numeric: tabular-nums; }
.dn-notification-body { display: -webkit-box; margin: 0; overflow: hidden; color: var(--ink-secondary); font: var(--type-callout); -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.dn-notification > .dn-button { grid-column: 2; justify-self: start; margin-top: var(--space-1); }
.dn-notification.is-unread .dn-notification-title { font-weight: var(--weight-semibold); }
.dn-notification.is-unread .dn-notification-head::after { content: ""; flex: none; align-self: center; width: var(--badge-dot-size); height: var(--badge-dot-size); border-radius: var(--radius-full); background: var(--ink); }
.dn-notifications-empty { margin: 0; padding: var(--space-6) var(--space-4); color: var(--ink-tertiary); font: var(--type-callout); text-align: center; }
```

```html
<div class="dn-stack">
  <div class="dn-row">
    <button class="dn-icon-button" type="button" aria-label="通知，有未读"><svg class="dn-icon" aria-hidden="true"><use href="#dn-bell"/></svg><span class="dn-dot"></span></button>
    <button class="dn-icon-button" type="button" aria-label="通知，3 条未读"><svg class="dn-icon" aria-hidden="true"><use href="#dn-bell"/></svg><span class="dn-badge">3</span></button>
    <button class="dn-icon-button" type="button" aria-label="通知，120 条未读"><svg class="dn-icon" aria-hidden="true"><use href="#dn-bell"/></svg><span class="dn-badge">99+</span></button>
  </div>
  <div class="dn-popover dn-notifications" role="dialog" aria-labelledby="nt">
    <div class="dn-notifications-head"><h3 class="dn-notifications-title" id="nt">通知</h3><button class="dn-button is-plain is-sm" type="button">全部标为已读</button></div>
    <ul class="dn-notifications-list">
      <li class="dn-notifications-group">今天</li>
      <li class="dn-notification is-unread"><span class="dn-notification-icon is-waiting"><svg class="dn-icon" aria-hidden="true"><use href="#dn-pause"/></svg></span><div class="dn-notification-head"><p class="dn-notification-title">周报草稿</p><span class="dn-notification-time">2 分钟前</span></div><p class="dn-notification-body">写入 3 个文件，等待你确认。</p></li>
      <li class="dn-notification is-unread"><span class="dn-notification-icon is-danger"><svg class="dn-icon" aria-hidden="true"><use href="#dn-close"/></svg></span><div class="dn-notification-head"><p class="dn-notification-title">同步失败</p><span class="dn-notification-time">18 分钟前</span></div><p class="dn-notification-body">网络已断开，3 条笔记还没有上传，恢复后会自动重试。</p><button class="dn-button is-sm" type="button">立即重试</button></li>
      <li class="dn-notifications-group">更早</li>
      <li class="dn-notification"><span class="dn-notification-icon is-success"><svg class="dn-icon" aria-hidden="true"><use href="#dn-check"/></svg></span><div class="dn-notification-head"><p class="dn-notification-title">导出完成</p><span class="dn-notification-time">昨天 14:20</span></div><p class="dn-notification-body">年度总结.pdf，共 128 页。</p></li>
    </ul>
  </div>
</div>
```

`--badge-ring` 默认和 `canvas` 同色；图标放在别的底色上时，在外层设 `--badge-ring` 为那个底色。

## SwiftUI

- 标记：标签栏和列表用系统的 `.badge(count)`；只要圆点时用一个 `Circle().fill(.ink).frame(width: 8, height: 8)` 叠在图标右上角（`.overlay(alignment: .topTrailing)`）。App 图标角标用 `UNUserNotificationCenter.current().setBadgeCount(_:)`，只计「需要你」和「提到你」。
- 通知中心：工具栏里的 `Button` 打开 `.popover`，内容是 `List`，每行 `HStack` 放圆形图标位和 `VStack(alignment: .leading)` 的标题、正文（`.lineLimit(2)`）、时间。
- 系统通知：`UNUserNotificationCenter` 发送，`threadIdentifier` 设为会话 ID 让同一会话的通知归在一起；用 `UNNotificationCategory` 声明最多两个安全的动作。权限用 `requestAuthorization` 在第一次需要时请求。

## 不要

- 通知用户自己刚做的事；用通知推营销内容。
- 同一件事反复通知；短时间里一条一条地弹，不合并。
- 用户正看着这件事时还发系统通知；应用一启动就请求通知权限。
- 系统通知写「你有一条新消息」；点开后只打开首页。
- 在系统通知或通知列表里直接批准危险操作。
- 到处都用数字角标；用彩色区分通知类型。
