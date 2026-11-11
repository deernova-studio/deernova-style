# @deernova/loaders

Deernova 的加载动效：一笔单色的线沿着数学曲线走，尾巴逐渐变细，后面是很淡的完整曲线。网格和描边与 `@deernova/icons` 相同（24×24、1.75），颜色用 `currentColor`。不依赖任何库，用 SVG 和 `requestAnimationFrame` 实现。

| 名字 | 用在 | 曲线 | 一圈 | 停下后 |
| --- | --- | --- | --- | --- |
| `thinking` | AI 正在思考 | 三瓣玫瑰线 r = cos 3θ，花瓣加宽（\|cos 3θ\|^0.6） | 5.2 秒 | 落成 `thinking` 图标 |
| `working` | AI 正在运行工具 | 1:2 利萨如曲线（∞） | 3 秒 | 完整的 ∞ |
| `spinner` | 普通加载（页面、按钮里） | 圆 | 0.9 秒 | 消失 |

曲线只给 AI 的状态用，普通加载用 `spinner`。等待用户确认时不用动效，显示 `waiting` 图标。

```js
import { createLoader } from '@deernova/loaders';

const loader = createLoader(slot, 'thinking'); // 尺寸跟随 .dn-icon，默认 icon-size-md
// 思考结束：线在 240ms 内补满整条曲线、粗细变均匀，停在 thinking 图标上
loader.stop();
// 不要过渡、直接停：loader.stop({ settle: false })；移除：loader.destroy()
```

也可以用自定义元素：先调用一次 `defineLoaderElement()`，然后写 `<dn-loader name="thinking"></dn-loader>`，加上 `done` 属性时停下。

- 动效本身对读屏隐藏（`aria-hidden`），状态文字（「正在思考」）写在旁边，放在 `role="status"` 的容器里。
- 开启「减弱动态效果」时，曲线类动效直接显示静止的完整曲线；`spinner` 放慢到 2.4 秒一圈。
- 页面不可见时浏览器会暂停 `requestAnimationFrame`，不耗电。
- `curvePath(name)` 返回完整曲线的 SVG 路径，`strokeAt(name, head)` 返回某一时刻的线段，可以用来做服务端渲染或在别的平台照着实现。SwiftUI 用 `TimelineView(.animation)` 加 `Canvas`，按同样的公式和参数画。

许可：MIT（见 `LICENSE`）。
