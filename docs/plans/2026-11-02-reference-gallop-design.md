# 按确认的参考图重做奔跑动画

用户已确认 [imagegen 侧面奔跑图](../../reviews/reference/milu-running.png)，本轮在 `codex/refine-homepage-deer` 直接实现。此图作为造型依据，替代上一轮自行概括的高颈、长尾轮廓。

## 造型与画面

使用确认图的横向躯干、前伸颈部、脸部、分叉鹿角与贴近后臀的尾巴。内置 imagegen 去除背景后，将透明插画保存到 [运行时素材](../../apps/website/assets/milu-running.png)。原始确认图保存在验收资料中。

`profile.js` 记录躯干与四肢的区域、关节和纹理网格；`stag.js` 把图像转换为灰度，并按连续姿态变形四肢。头颈与躯干分层，以肩部为支点轻微反向转动。这样能保留参考图的轮廓和明暗，不必重新猜测鹿的形象。

延续纸面 `#f5f5f5`、墨色 `#171717`、深色背景 `#101010`、浅色网点 `#e6e6e6`，离屏动物使用白色与灰色分层。字标、导航和转场字符仍分别使用系统衬线、无衬线、等宽字体。首页的视觉中心仍为鹿，导航和三段自然场景沿用当前布局。

## 动作

每条腿依次经历着地、支撑、蹬离、折叠、前摆。着地期间从世界坐标约束蹄子，速度与地面一致；离地期间通过光滑轨迹回收。关节按固定骨长求解，前腿腕关节与后腿飞节方向各自正确。四条腿错开落点，身体小幅起伏和俯仰，头部轻微反向补偿，避免生硬的整体上下弹跳。

每秒 1.5 个周期，30 秒场景循环恰好容纳 45 步。星空山脊在四只蹄子的覆盖范围内保持平坦，再向两侧接回起伏地形。手机采用 3px 网格，桌面采用 3–5px 网格，保留更多脸部和鹿角细节。

## 验证

自动检查每条腿骨长、支撑时蹄子的高度与滑移、完整周期衔接、有限坐标和连续性。浏览器检查八个步态时刻、三种场景、深浅外观及手机布局，保留截图与步态预览。

## 素材处理记录

使用内置 imagegen，编辑对象为用户已确认的原始图；请求透明背景，未使用 CLI 或另一个图像模型。输出尺寸为 1536×1024，保留 alpha 通道。完整处理提示词：

```text
Use case: background-extraction. Edit this approved deer illustration for a website animation asset. Remove ONLY the off-white background and output a genuinely transparent PNG. Preserve the animal exactly: identical side-on running pose, identical proportions, silhouette, antlers, face, four limbs, tail, fur details and colors. Preserve the original 1536 by 1024 composition and full canvas bounds, with the deer in the exact same position and size. Do not crop, reframe, redraw, simplify, add a shadow, change the gait, add text, or add objects. The entire background must have zero alpha, including the open gaps between antler tines and between legs. All of the animal's pixels must remain opaque; preserve its light fur and highlights.
```
