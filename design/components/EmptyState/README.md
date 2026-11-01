# EmptyState

列表、搜索结果或整个页面没有内容时显示：说明现在是什么状态，再给出下一步。

**需要提供**：SF Symbol、标题（描述状态）、一句正文（告诉用户怎么开始），以及最多一个主操作和一个次操作。

**规格**

- 在可用区域里居中。图标 28pt、细线、`ink-tertiary` 色；标题用 `mac-display` 或 `ios-title`（衬线）；正文 `ink-secondary`，最大宽度 320pt。
- 按钮用大号：Mac 是 `control-mac-lg`，iOS 是 `control-ios`。
- 搜索没有结果时不放按钮，标题写成「没有找到"关键词"」，正文给出修改建议。

```swift
ContentUnavailableView {
    Label("还没有笔记", systemImage: "doc.text")
        .font(.system(.title2, design: .serif))
} description: {
    Text("写下第一条想法，它会同步到你所有的设备。")
} actions: {
    Button("新建笔记") { create() }.buttonStyle(.borderedProminent)
    Button("从文件导入") { importFile() }
}

// 搜索没有结果
ContentUnavailableView.search(text: query)
```

**不要**：用插画或吉祥物填满空白；标题写「空空如也」这种玩笑话；出现三个以上的按钮。
