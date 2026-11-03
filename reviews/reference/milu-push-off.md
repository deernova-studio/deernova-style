# 后腿蹬伸与跳跃衔接

2026-11-03，分支 `codex/refine-homepage-deer`。沿用完整动物图像；不使用已撤回的分件骨骼方案。

## 本次调整

- 使用内置 imagegen 补绘后腿向后蹬伸，新增 [push 图集](../../art/milu/source/milu-cycle-push.png)。原始输出 `exec-15d1dc52-82f1-467f-80f5-b221d627136a.png`；采用透明背景清理后的 `exec-ba7ee44a-c342-460c-a89e-f06946d1d8a2.png`，原始 PNG 字节直接复制。
- 实际选用新图第 2–6 格（源编号 37–41），接在 reach 最后一格之后，替换原有短促的两格后腿支撑。随后直接接 flight 第 3 格；跳过旧 flight 前两格，避免后蹄离地后又下垂、再收起。全周期选用 32 个完整姿态，仍每秒 1.2 个周期、60 fps 调度。
- 图生没有严格遵守每格位置：底行后两只鹿的后蹄越过名义网格。按实际动物边界裁切（底行横向起点 0、480、992，首格宽 480），裁切保持原像素比例，不把窄图拉宽；支撑帧按实测最下蹄点对齐地面。运行时仅加载使用中的六张图集；gather 保留为参考素材。
- 在整段帧间持续混合，去掉每格开头的短暂停顿，使向后蹬伸连续可见。跳跃用同一套步态相位和高度对齐，通过单调三次曲线推进，首尾速度接回奔跑。
- 额外跳跃高度采用两端速度为零的曲线，避免原抛物线在离地、触地时突然启动／停止上下移动。以 200px 场景单位、60Hz 计算，离地后第一帧的额外上移由 7.45px 降至 0.74px。这只是额外高度，不是测量整只鹿所有像素的位移。

## 验证与边界

- 验证结果见 [当前验收记录](../verification.md)。新增回归覆盖离地／触地额外竖直速度、跳跃阶段速度衔接和非正方形裁切不拉伸。
- [实际绘制代码对比](../push-off-and-jump.mp4)：左为本轮修改前，右为本轮修改后；前 3 秒正常奔跑，后 5 秒半速展示跳跃和落地。60fps 离线输出，不是浏览器性能录制。
- 八种视口的奔跑与跳跃边界扫描，每种 2002 个状态，最窄 320px 视口仍保留 12px 余量。
- 补帧仍是分别绘制的插画，毛发、鹿角和躯干细节有差异；本次解决蹬伸段缺失及代码造成的跳跃突变，不宣称消除了所有重影或达到了运动捕捉精度。

## 最终提示词（内置 imagegen）

### 蹬伸过渡

```text
Use case: illustration-story.
Asset type: missing whole-animal frames for an existing deer animation.
Create a 1536x1024 true RGBA transparent atlas with SIX complete deer, in three columns and two rows, each confined to its own 512x512 cell. Read left-to-right top row, then bottom row. No text or borders.

Reference 1 (gather sheet) defines character identity and the starting action: its BOTTOM-MIDDLE deer is the pose immediately BEFORE these six new drawings. Reference 2 (flight sheet) TOP-LEFT deer is the pose immediately AFTER these six drawings. Draw the missing progressive HIND-LEG BACKWARD PUSH-OFF, not another generic running cycle. Same handsome brown stag in strict right-facing side view, exactly the same head, antlers, fur, torso proportions, short tail and natural-history illustration style. Exactly four attached anatomical legs, never detached cutout parts.

Across all six cells LOCK the torso, head, antlers to the same position, scale and shape. Cell-local torso center about (242,270), hip about (150,275), shoulder (330,285), nose (450,225), antler top y55. Imagined ground y455. The animation registration handles body rise, so do not move or resize the animal's upper body between drawings.

The hind feet must travel steadily BACKWARDS (LEFT) relative to the body as the legs PUSH the body forward, then peel off the ground. Thigh extends backward from the hip, hock opens, hoof follows. This is the missing visible power stroke. Do NOT fold or swing hind feet forward in this atlas. Do NOT merely lower the hindfeet vertically. Near/far hind legs stagger naturally, far foot leaves first. No rabbit hop.
Approximate cell-local hind HOOF targets, one incremental change per cell:
1 near(142,455), far(90,455): still bearing weight, hocks open slightly.
2 near(124,455), far(72,454): feet farther back, hips and hocks extend.
3 near(105,455), far(54,444): near toe still planted, far toe leaves.
4 near(86,452), far(38,426): late propulsion, near toe peeling off.
5 near(68,445), far(26,408): very early flight, hindlegs continue backward.
6 near(51,436), far(18,395): connects directly to reference 2 top-left stretched hindlegs.
Keep all hooves within each cell, do not crop. Keep limb lengths and anatomical knee/hock bending consistent.

Forelegs smoothly unfold FORWARD from reference1 bottom-middle toward reference2 top-left throughout these six cells. Do not suddenly fully stretch them then retract. Head/antlers/neck/torso/fur are invariant. Whole deer drawings only. Opaque animal interiors, true alpha=0 outside the silhouette and in spaces between legs/antlers. No brown haze, no matte, no glow, no checkerboard, no floor or shadow.
```

### 透明背景清理

```text
Use case: background-extraction. Edit this exact 1536x1024, 3x2 atlas of six right-facing stag push-off poses. Remove all brown/gray fog, glow and colored translucent matte outside the six animal silhouettes, including between legs and antler branches. The animal bodies, fur, head, antlers, leg poses, scales, locations and cell layout must remain EXACTLY unchanged. Keep every visible hoof and antler inside its current cell. Transparent alpha=0 everywhere outside the actual silhouettes; fully opaque deer interiors with a narrow anti-aliased boundary. No generated backdrop, no haze, no ground/shadow, no new anatomy, no recoloring or repositioning. Pure alpha cleanup only.
```

