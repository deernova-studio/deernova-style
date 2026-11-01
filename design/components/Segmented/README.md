# Segmented

分段控件，在同一份数据的 2–4 种视图或范围之间切换。

**需要提供**：选项列表（每项 2–4 个字，或者一个 SF Symbol）和绑定的选中值。

**规格**：底槽 `fill-selected`；选中块 `surface-raised` 加 `shadow-control`；未选中文字 `ink-secondary`，选中文字 `ink`。Mac 上外层 `radius-sm`、内边距 2，内层 `radius-xs`，两层同心；高度 `control-mac-sm`。iOS 上是胶囊形，高 32pt。

```swift
Picker("视图", selection: $mode) {
    Text("列表").tag(Mode.list)
    Text("卡片").tag(Mode.cards)
    Text("日历").tag(Mode.calendar)
}
.pickerStyle(.segmented)
.labelsHidden()
```

直接用系统控件就能得到上面的效果，不需要自己画。

**不要**：选项超过 4 个（改用 Menu 或 Picker）；拿它当执行动作的按钮组；文字长短差别太大。
