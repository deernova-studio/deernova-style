# 动效

动效用来说明因果：东西从哪里来、到哪里去。数值见 [设计变量](../tokens.md) 的「动效」。

| Token | 值 | 用途 |
| --- | --- | --- |
| `duration-instant` | 120ms | 悬停、按压、选中这类即时反馈 |
| `duration-base` | 200ms | 展开、收起、切换、开关 |
| `duration-slow` | 320ms | 面板滑入、页面级转场 |
| `ease-standard` | cubic-bezier(0.2, 0.8, 0.2, 1) | 默认缓动：快进、缓停 |

- SwiftUI 默认用 `.spring(response: 0.35, dampingFraction: 0.85)`，手感干脆、不回弹过头；即时反馈用 `.easeOut(duration: Deernova.durationInstant)`。弹窗、导航的转场交给系统。
- Web 上 `transition: background-color var(--duration-instant) var(--ease-standard)`。只过渡颜色、不透明度和 transform，不过渡 width、height。

## 规则

- 业务界面里不做无目的的循环动画。品牌展示页可以有叙事动效，但要能暂停，也不能妨碍阅读。
- 用户开启「减弱动态效果」后，位移和缩放换成淡入淡出，完整信息不能依赖动画才看得到。
- **布局保持稳定**：给会变化的标题、状态和按钮文字预留空间，切换时阅读位置和按钮位置不跳动。禁用的按钮保持原位，不隐藏。加载时按钮宽度不变，把文字换成转圈。
- **状态不丢失**：重绘、切换主题、窗口缩放时，焦点、选中项和用户输入都要保留。
- **中断可恢复**：装饰性动画在暂停、离开视野或页面隐藏时冻结，回来后从原处继续，不追赶错过的时间；和真实时间绑定的功能（倒计时等）仍以真实时间为准。
- 连续的装饰动画在 Web 上用 `requestAnimationFrame` 按时间推进，`visibilitychange` 时暂停。
