# 后腿倒摆修正的 imagegen 记录

2026-11-02，内置 imagegen，transparent_background=true。

- [收腿图集](../../art/milu/source/milu-cycle-gather.png)：第 1 帧改为后腿继续下伸，接在回收图集第 24 帧之后。输出 exec-0d00a0a0-ce30-4507-9f95-b9faf1b92b79.png。
- [蹬伸图集](../../art/milu/source/milu-cycle-flight.png)：第 7 帧后腿继续向后，去掉再次向前落地的姿态。输出 exec-4d6d9298-3c4c-469c-bc14-c877131768e9.png。生成结果按实际蹄子高度注册为早期腾空，而非提示词中要求的支撑帧。

检查：均为1536×1024 RGBA，alpha 0–254。其它格也有轻微重绘，逐格比较透明轮廓，变化占每格面积约0.5–0.7%；边缘极值变化0–4px。两处目标格的后腿方向已视觉核对。修订前项目图集可从8c3a6aa取回；本轮开始时的代码在 /tmp/deernova-gait-before/。

## 收腿图集

输入为原收腿图集、回收图集。

```text
Use case: precise-object-edit. Image 1 is the target 1536x1024 transparent 3x2 deer sprite atlas. Image 2 is the immediately preceding recovery atlas; its bottom-right pose precedes image 1 top-left. Repair ONLY the HIND LEGS of the TOP-LEFT deer of image 1. Preserve every other cell, all head/antlers/torso/front legs/tail/fur/scale/position exactly. The hind legs must be OPENING DOWNWARD from the preceding pose, not tucking up again. Draw the near hind thigh forward under belly, hock opening down and slightly forward, hoof around cell x210,y440; far hind hoof around x165,y428. Both hind hooves still airborne, reaching towards the next top-middle pose where the rear feet land. The front legs stay folded under chest as they currently are. Smooth small transition from image 2 bottom-right -> this repaired image 1 top-left -> image 1 top-middle. Four anatomical legs only. Maintain genuine transparent alpha, dimensions1536x1024, 3x2 cells512. No background, glow, shadows, text or grid. Do not change or regenerate any of the other five poses.
```

## 蹬伸图集

输入为原蹬伸图集、原收腿图集。

```text
Use case: precise-object-edit. Image 1 is the target transparent 1536x1024 3x2 running deer atlas. Image 2 is the immediately preceding atlas; its bottom-right deer precedes this target's top-left. Fix ONLY the HIND LEGS in the TOP-LEFT cell of image 1. Currently a rear foot erroneously swings FORWARD and lands again after the previous frame already drove backward. Both hind legs must instead trail BACKWARD TO THE LEFT in late push-off: near hind leg extended back, last rear hoof toe still touching the imaginary ground at approximately x65,y470 in this512x512cell; far hindleg already lifting with hoof around x85,y435. Rear hoof must NOT be forward under the abdomen or at x230. Keep the top-left torso, hip attachment, face, antlers, front legs, coat texture, tail and scale/position exactly unchanged. The near hind leg has a natural softly bent knee and extended hock, joints in correct direction. This follows image 2 bottom-right and leads into image 1 top-middle (both hind feet lifted backwards). Keep all OTHER FIVE CELLS exactly as drawn. Four legs only, no duplicated hooves. Genuine transparent alpha; no text, shadow, glow, background or grid. Same1536x1024image, six512x512cells.
```
