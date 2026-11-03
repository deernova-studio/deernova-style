# Deernova Style 产品图标

工具：内置 `image_gen`，2026-11-02。参考为用户提供的 GitHub 组织 logo（鹿首、鹿角与四芒星），不包含页面截图中的批注。

- [已确认的 PNG](../../apps/website/assets/deernova-style-icon.png)：1254 × 1254，原样复制用户最终确认的 `exec-c56655fb-1113-4e94-80ac-8d00ebabc75f.png`。
- [浅色显示检查](deernova-style-icon-preview.png) · [深色显示检查](deernova-style-icon-dark-preview.png)：从页面中的 SVG 独立渲染，用于检查图标显示，不是浏览器截图。
- 原图保持白底；页面的 SVG 将亮度反转为遮罩透明度，以正文颜色绘制。裁去外围留白后放在产品名前，浅深主题使用同一份定稿。
- 定稿设计：u 的两侧形成鹿角，i 的竖线对齐四芒星中心，仅底部两个角轻微磨圆。用户明确选定此版代表 Deernova Style。

## 定稿圆角调整提示词

```text
Use case: precise-object-edit.
Make only a subtle corner refinement to the existing black ui antler logo in this image.
The right-hand vertical stem of the i currently has four square corners. Round ONLY its two BOTTOM corners with a small, restrained radius, approximately 14 pixels on this 1254px square image (about one tenth of the stem width). Keep most of the bottom edge flat and horizontal between these two small corner arcs. Keep both TOP corners perfectly square and the top edge perfectly flat. The stem must still read as a strong upright rectangular letter stroke, never as a pill or capsule.
Preserve the stem's exact horizontal alignment under the star, its width, height, bounding box, baseline and black fill. Preserve the star entirely unchanged. Preserve the entire antler-shaped u entirely unchanged. Preserve the pure white background, square canvas, scale, margins and composition. No repositioning, rescaling, redrawing or added elements.
The ONLY difference from the source should be the slight softening of the i stem's lower-left and lower-right corners.
```

## 早期方案提示词（鹿头与界面分区，已弃用）

```text
Use case: logo-brand.
Asset type: a final standalone UI product icon for Deernova Style, used beside its product name at 44–56 CSS pixels.
Input image: the supplied black deer head with antlers and a four-point star is a STYLE AND BRAND FAMILY REFERENCE, not an asset to paste unchanged.
Create ONE new related product mark. Retain the recognisable bilateral deer-antler crown and a single small four-point north star centered between the antlers. Make the antlers bold, compact, clean, with only two broad branches per side and smooth tapering curves. Reinterpret the lower deer face as a simple geometric shield / abstract interface tile, using one clear, generous negative-space division suggesting a UI layout: a short header band above two panels. Integrate this naturally into the deer head silhouette rather than adding a second illustration or an external frame. The whole mark must read as one compact, elegant, balanced emblem from the same family as the supplied logo.
Style: flat monochrome black silhouette, vector-like precision, generous negative spaces, minimal forms that survive small icon sizes. Sophisticated, quiet, recognisable. No fur or hand-drawn edge noise.
Composition: square canvas, centered emblem occupying approximately 80% of width and height with even clear margins. Transparent background with genuine alpha. Solid pure black artwork only; no colored elements or opaque white background.
No words, no letters, no wordmark, no watermark, no presentation board, no multiple alternatives, no drop shadows, no gradients, no 3D, no app-tile background, no extra floating symbols.
```
