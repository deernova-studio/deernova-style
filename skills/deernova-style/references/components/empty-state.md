# 空状态与错误页

列表、搜索结果或整个页面没有内容时显示：说明现在是什么状态，再给出下一步。页面打不开（找不到、没有权限、离线、服务出错）时的**错误页**用同一种版式，见下面的[错误页](#错误页)。

**需要提供**：图标、标题（描述状态）、一句正文（告诉用户怎么开始），以及最多一个主操作和一个次操作。

## 尺寸

<!-- tokens:empty-state -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `empty-title-size` | 24 | 20 | 32 | 空状态标题（衬线）字号。 |
| `empty-icon-size` | 32 | 36 | 40 | 空状态图标的边长。 |
<!-- /tokens -->

- 在可用区域里视觉居中：水平居中，垂直方向略高于正中（上下留白约 2 : 3），见 [布局与对齐](../foundations/layout.md)。图标 `empty-icon-size`、细线、`ink-tertiary`；标题用衬线 `empty-title-size`、半粗；正文 `type-body`、`ink-secondary`，最大宽度 320。
- 按钮用[大号](button.md)。
- 搜索没有结果时不放按钮，标题写成「没有找到“关键词”」，正文给出修改建议。

## 错误页

整个页面或一整块内容打不开时，在内容区里显示，版式和空状态相同。

- **只换内容区**：侧边栏、顶栏照常显示，用户可以直接去别的地方；不跳到一个独立的错误网站。
- **图标**仍是 `ink-tertiary` 细线，不用红色，不放插画；标题、正文、按钮的规格同空状态。
- **错误编号**放在按钮下面一行，`caption`、`ink-tertiary`、等宽，例如「错误编号 7f3a-92c1」，可以选中复制；没有编号就不写。不在标题里写「404」「500」。
- **按钮**最多两个，主按钮是最可能解决问题的动作。

| 情况 | 标题 | 正文 | 按钮 |
| --- | --- | --- | --- |
| 找不到（404） | 找不到这个页面 | 链接可能已经失效，或者内容已被删除。 | 返回首页 |
| 没有权限（403） | 你没有访问权限 | 这个文档属于「设计组」，可以向所有者申请。 | 申请访问 · 切换账号 |
| 离线 | 网络已断开 | 恢复连接后会自动重新加载。 | 重试 |
| 服务出错（5xx） | 页面没有加载出来 | 这不是你的问题，我们已经收到报告。 | 重试 · 复制错误详情 |
| 页面崩溃 | 这个页面出了问题 | 你的内容已经保存。重新加载通常能解决。 | 重新加载 |

- **局部出错**：只有一块（一个面板、一张卡片）出错时，不用整页错误，在那一块里显示一行原因加「重试」，见[加载状态](skeleton.md)。
- **离线时自动恢复**：网络恢复后自动重新加载，不需要用户点「重试」。
- 写法见[反馈与通知](../foundations/feedback.md)的「错误怎么写」。

## Web

```css
.dn-empty { display: flex; flex-direction: column; align-items: center; gap: var(--space-1); padding: var(--space-6) var(--space-5); text-align: center; }
.dn-empty > .dn-icon { width: var(--empty-icon-size); height: var(--empty-icon-size); color: var(--ink-tertiary); stroke-width: 1.4; }
.dn-empty-title { margin: var(--space-2) 0 0; color: var(--ink); font: var(--weight-semibold) var(--empty-title-size)/1.25 var(--font-serif); letter-spacing: var(--type-display-tracking); }
.dn-empty-body { max-width: 320px; margin: 0 0 var(--space-3); color: var(--ink-secondary); font: var(--type-body); }
.dn-empty-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--gap-stack); }
.dn-empty-code { margin: var(--space-3) 0 0; color: var(--ink-tertiary); font: var(--weight-regular) var(--type-caption-size)/var(--type-caption-line) var(--font-mono); user-select: all; }
```

```html
<div class="dn-empty">
  <svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg>
  <h3 class="dn-empty-title">还没有笔记</h3>
  <p class="dn-empty-body">写下第一条想法，它会同步到你所有的设备。</p>
  <div class="dn-empty-actions">
    <button class="dn-button is-primary is-lg" type="button">新建笔记</button>
    <button class="dn-button is-lg" type="button">从文件导入</button>
  </div>
</div>
```

错误页（服务出错）：

```html
<div class="dn-empty" role="alert">
  <svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v10H4z"/><path d="M8 20h8M12 16v4M9.5 9.5l5 3M14.5 9.5l-5 3"/></svg>
  <h3 class="dn-empty-title">页面没有加载出来</h3>
  <p class="dn-empty-body">这不是你的问题，我们已经收到报告。</p>
  <div class="dn-empty-actions">
    <button class="dn-button is-primary is-lg" type="button">重试</button>
    <button class="dn-button is-lg" type="button">复制错误详情</button>
  </div>
  <p class="dn-empty-code">错误编号 7f3a-92c1</p>
</div>
```

## SwiftUI

```swift
ContentUnavailableView {
    Label("还没有笔记", systemImage: "doc.text")
        .font(.system(size: Deernova.emptyTitleSize, weight: .semibold, design: .serif))
} description: {
    Text("写下第一条想法，它会同步到你所有的设备。")
} actions: {
    Button("新建笔记") { create() }.buttonStyle(.borderedProminent).controlSize(.large)
    Button("从文件导入") { importFile() }.controlSize(.large)
}

// 搜索没有结果
ContentUnavailableView.search(text: query)

// 错误页
ContentUnavailableView {
    Label("页面没有加载出来", systemImage: "exclamationmark.icloud")
} description: {
    Text("这不是你的问题，我们已经收到报告。")
} actions: {
    Button("重试") { reload() }.buttonStyle(.borderedProminent).controlSize(.large)
}
```

## 不要

- 用插画或吉祥物填满空白。
- 标题写「空空如也」这种玩笑话。
- 出现三个以上的按钮。
- 错误页用红色大图标、标题写「404」「出错了」，或者把堆栈和内部错误名给用户看。
- 出错时把侧边栏和顶栏一起拿掉，让用户只能点浏览器的返回。
