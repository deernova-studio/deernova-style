# @deernova/icons

Deernova 的线性图标：AI 应用常用的 60 个，24×24 网格、1.75 描边、圆头圆角、无填充，颜色跟随文字。39 个来自 [Lucide](https://lucide.dev)，7 个按 Deernova 的比例重画，14 个 AI 图标是自己画的。

```js
import { svg } from '@deernova/icons';
button.innerHTML = svg('send', { label: '发送' }); // 只有图标的按钮给 label；旁边有文字时不给
```

也可以用 `@deernova/icons/sprite.svg`（`<use href="sprite.svg#dn-send">`）或单个文件 `@deernova/icons/svg/send.svg`。尺寸和描边用 Deernova 规范里的 `.dn-icon` 类控制；名字和用途见 `icons.json`。

## 加图标

1. 在 `src/` 放一个 SVG，用和其他文件一样的 `<svg>` 开头，里面只用 `path`、`circle`、`rect`、`line`、`polyline`、`ellipse`，不写颜色和描边。
2. 在 `icons.json` 对应分组里加一行：名字（kebab-case）、中文用途、来源（`lucide` / `redrawn` / `deernova`）、关键词。
3. `npm test`。从 Lucide 原样拿的图标可以用 `npm run icons -- import` 导入。

许可：MIT（见 `LICENSE`）。来自 Lucide 的图标按 ISC 许可使用，许可全文见 `LICENSE-LUCIDE`。
