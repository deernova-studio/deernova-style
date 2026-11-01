# ListGroup

iOS 分组列表，用于设置页、详情页和各种表单。

**需要提供**：分组，每个分组可以有页头和页脚说明；每一行提供标题，以及可选的图标、右侧的值、开关或箭头，点击后跳转或执行动作。

**规格**

- 页面底色 `canvas`，分组底色 `surface-raised`，`radius-lg`，左右边距 `space-4`，分组之间 `space-5`。
- 每行最小高度 `control-ios`（44），左右内边距 `space-4`，文字 17pt `ink`；右侧的值用 `ink-secondary`，箭头用 `ink-tertiary`。
- 图标放在 28pt 的方块里，`accent-soft` 浅灰底、`ink` 图标、`radius-sm`。整个列表统一用灰色，不要每行一个颜色。
- 分隔线 `stroke-hairline`、`line` 色，从文字起点开始。
- 页头 13pt `ink-secondary`，页脚 13pt `ink-tertiary`，页脚写清楚这个设置会带来什么后果。
- 开关打开时用 `success` 色。不要用黑白色调的开关：深色主题下白色轨道会把白色圆钮吞掉。

```swift
Form {
    Section("账号") {
        NavigationLink { ProfileView() } label: {
            LabeledContent { Text("林一") } label: { Label("个人资料", systemImage: "person") }
        }
    }
    Section {
        Toggle(isOn: $iCloudSync) { Label("iCloud 同步", systemImage: "icloud") }
            .tint(.success)
    } header: {
        Text("同步")
    } footer: {
        Text("关闭 iCloud 同步后，新笔记只保存在这台设备上。")
    }
}
.scrollContentBackground(.hidden)
.background(.canvas)
.tint(.brandAccent)
```

Mac 上的设置窗口同样用 `Form` 加 `.formStyle(.grouped)`，系统会给出对应的 Mac 样式。

**不要**：每行用不同颜色的图标；页脚写成一大段；在列表行里放主按钮（主按钮放在页面底部）。
