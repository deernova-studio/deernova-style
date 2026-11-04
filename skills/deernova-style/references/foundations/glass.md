# 玻璃

内容放在不透明的纸面上，操作层按平台处理：原生端交给系统的 Liquid Glass，Web 应用用不透明平面加 1px 线。

## 为什么按平台分

- **SwiftUI 端（macOS、iOS、iPadOS）**：iOS 26、iPadOS 26、macOS 26 的系统导航结构自带 Liquid Glass，不写代码就有，还自带滚动边缘效果和「降低透明度」处理。这是原生端的优势，直接用；盖掉它反而要额外写背景，也不像新系统上的应用。
- **Web 应用**：浏览器没有系统玻璃，用模糊效果模仿既费性能又显得廉价。操作层用不透明平面（顶栏 `canvas`、侧边栏 `surface`）加 `stroke-line` 分隔线，骨架和 Claude 桌面端一致。
- **官网与文档**：吸顶页眉可以用轻玻璃（`glass-fill`、`glass-blur`），内容从它下面滚过去。这是展示页面的点缀，不用在应用里。

## SwiftUI 端：用玻璃的地方

大部分由系统自动提供：

- 导航栏、工具栏、标签栏、侧边栏：使用系统的标准导航结构，系统会自动渲染成玻璃。
- 浮动操作按钮、浮动工具条。相邻的几个玻璃元素放在一组，让它们互相融合。
- 底部弹窗、弹出菜单、popover：系统自动处理。
- 玻璃层上的主操作用实色玻璃（`accent` 底、`on-accent` 图标），次要操作用普通玻璃。

## 不用玻璃的地方

卡片、列表行、消息、输入区、Composer、代码块、任务清单，以及所有需要长时间阅读的内容。Web 应用的任何部分。

## 规则

- 玻璃上不叠玻璃。
- 玻璃上只放图标和很短的标签，不放段落和列表。
- 只有主操作的玻璃才用实色，一屏最多一个。
- 让内容从工具栏下面滚过去，保留系统的滚动边缘效果。不要给系统工具栏、侧边栏加实色背景。
- 用户开启「降低透明度」后，玻璃要换成不透明的 `surface-raised`。系统玻璃会自动处理，自己写的半透明效果也要做同样的处理。

## 写法

- **SwiftUI**：`.buttonStyle(.glass)`、`.glassProminent`、`GlassEffectContainer`、`.glassEffect()`，见 [SwiftUI 共用](../scenes/swiftui.md) 和 [玻璃操作层](../components/glass-controls.md)。
- **Web 应用**：不用玻璃，顶栏和侧边栏见 [顶栏与侧面板](../components/toolbar.md)、[侧边栏](../components/sidebar.md)。
- **官网页眉**：见 [官网与文档](../scenes/web-marketing.md)。
