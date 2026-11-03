# 肢体连续性修正

2026-11-03。用户明确指出问题是肢体行为衔接，而不是页面帧率。本轮保持现有 60fps 调度，修改素材中的动作及起跳衔接。

## 采用素材

均使用内置 imagegen；透明 PNG 原始字节复制到项目，未通过程序变形四肢。

- [flight](../../art/milu/source/milu-cycle-flight.png)：输出 exec-5b698b31-5917-4c10-ba97-475f25733e80.png。修正原第 8 帧前腿伸出后又向后收回的问题。
- [support](../../art/milu/source/milu-cycle-support.png)：先生成 exec-e107416a-4c2f-4fca-8299-e5c436596061.png，再用 exec-c49abb3f-bc74-4cad-bbb7-3123b340896c.png 调整底行两格的后蹄位置，最后用背景清理输出 exec-95179a81-7275-4736-85b9-eba2e6160426.png。让前腿支撑期间的后腿逐步前收，减小末格突变。
- [reach](../../art/milu/source/milu-cycle-reach.png)：初稿 exec-611fb14b-1e12-4bc7-a78f-7ca1d0e401a1.png；背景清理后采用 exec-1e3fb1f0-9c86-42ea-83ac-3c3e9e73d609.png。六格形成连续的后腿下伸到接触动作；实际生成结果与提示词的蹄子坐标并不完全一致，按实际轮廓重新选择了衔接点和注册参数。

## 动作顺序

原来从原第 23 帧经过 24→1→2→3→4 再到第 5 帧。这五个旧姿态现被新 reach 六格替换。实际选择 31 个姿态播放，六张图集保留完整源格；不为凑数量播放衔接不上的旧格。新增六格按躯干位置对齐，支撑帧按实际最下蹄点注册；不平移已落地的蹄子来补偿躯干高度。

本轮修正使用了 [Bertram & Gutmann 的步态力学论文](https://pmc.ncbi.nlm.nih.gov/articles/PMC2696142/) 作为检查接地次序和身体运动关系的背景资料；具体画面仍是插画动画，不是基于该论文实验数据重建。

点击后先完成当前步态，到下一次后腿蹬地再启动向前跃起，最多等待一个步态周期（约 0.83s）。删除了任意当前姿态到固定蹬地姿态的淡化切换；等待期间腿部动作与普通奔跑完全一致，上一跳的镜头回收继续进行。落地和接回仍保留完整支撑动作。

## 检查

- 51 项测试通过，包括在 100 个不同步态相位点击，检查等待时的姿态不变、起跳边界连续、重复点击、落地承重与继续前进。
- 使用项目实际选帧和整帧 Canvas 绘制代码生成 [修改前后对比](../limb-continuity.mp4)。左边旧版，右边新版；前两秒正常速度，后四秒为四分之一速度。视频编码 60fps，供观察肢体顺序；它不是浏览器性能录制。
- 逐格核对灰度姿态，检查腿间和鹿角间的透明背景。初稿残留半透明底色，已用 imagegen 背景清理结果替换。最终各图集均 1536×1024 RGBA。
- 实际透明轮廓在 8 种桌面/手机视口各采样 2002 个状态，均在画面范围内，窄屏最小余量 12px。
- 当前无浏览器控制工具；生成插画仍有毛发和鹿角细节差异，帧间仍可能出现轻微重影。这些边界没有通过测试数目掩盖。

## 完整提示词

### 修正前腿方向

```text
Use case: precise-object-edit. Edit target image 1 is a 1536x1024 transparent 3-column 2-row atlas. Repair ONLY the FRONT LEGS in the TOP-MIDDLE cell. The deer faces right. This is chronological frame 8, between the top-left and top-right.
Currently its nearer front leg folds BACKWARDS under the chest, interrupting the forward extension from frame 7 to frame 9. Replace this backward-curled foreleg with an anatomical forward-reaching leg, two forelegs both continuing to unfold to the right. Near front hoof around x432,y403 and far front hoof around x449,y382 in that cell. Elbows moderately bent; extend a little more than top-left, a little less than top-right. Exactly four legs and four hooves. No doubled limb.
Keep the hindlegs, torso, neck, head, antlers, tail and coat EXACTLY where they are. Preserve the other five cells, especially the already corrected bottom row. Same art, same dimensions and 512x512 grid, real transparent background without glow/ground/text.
```

### 后腿下伸序列

```text
Use case: illustration-story. Create a precise deer animation INBETWEEN atlas, 1536x1024 RGBA, three columns by two rows, six 512x512 cells. Transparent background.
Reference1 is the recovery atlas; its BOTTOM-RIGHT deer is the START pose. Reference2 is the gather/support atlas; its TOP-LEFT deer is the MIDPOINT pose and its TOP-MIDDLE deer is the END pose. We need six missing intermediate drawings, not copies. A right-facing tan male deer with exactly this established identity, antlers, head, neck, torso, short tail, and natural-history art. Use one consistent torso/head/antler shape throughout, locked to identical location and scale across all six cells: antler top y65, nose x450,y240, body center x240,y283, pelvis x147,y287, shoulder x325,y295, imagined ground y455. Torso and antlers do NOT translate, rotate or resize between cells.
Draw six gradual consecutive hind-leg lowering poses: start with rear hocks gathered forward under belly like reference1 bottom-right, then knees reach forward while hocks unfold so the hooves trace a smooth downward-and-slightly-forward arc. The feet descend to rear-foot touchdown like reference2 top-middle. Crucially the pair of hindlegs must lower at slightly different times, not synchronized dangling legs. Near hind hoof contact last, far hind hoof first.
Cell-local hind HOOF target centers (x,y):
Cell1 top-left near(204,390), far(160,393).
Cell2 top-middle near(209,399), far(162,405).
Cell3 top-right near(211,409), far(160,419).
Cell4 bottom-left near(210,422), far(155,433).
Cell5 bottom-middle near(206,435), far(149,446).
Cell6 bottom-right near(199,449), far(142,455).
These are hoof targets, not knees. Keep hind knee forward and hock bending anatomically; open smoothly, not a backward kick or vertical peg. Follow the four joint chain from hip to knee to hock to split hoof. Far hoof is contacting at last cell while near is about to contact. Only hindlegs reach ground; frontlegs stay folded under chest throughout, naturally beginning to unfold slightly towards last cell just like reference2 top-middle.
There must be exactly four anatomical legs each cell, two hind and two fore, no ghosted duplicates. Keep frontlegs recognizable and separate from rear feet. Preserve the reference visual style and all deer anatomy. No words, labels, grid, background, halo, shadows, props or terrain. Only six complete deer drawings in transparent cells.
```

### 承重期间后腿前收

```text
Use case: precise-object-edit. Target is attached 1536x1024 transparent atlas, six consecutive right-facing deer foreleg support poses. Repair ONLY the HIND LEGS of the four middle cells (top-middle, top-right, bottom-left, bottom-middle). Preserve the FIRST and LAST cells exactly. Preserve ALL forelegs and all torsos, heads, antlers, ears, fur, tails, scales and positions exactly.
Problem: rear feet stay almost frozen, even reverse, for four drawings and then snap forward in the last drawing. Make the folded hindlegs swing forward gradually during foreleg support. The rear hocks remain flexed, hooves are off the ground; never plant or lower the hindfeet yet. Endpoints are first cell hind hoof centers near(125,398) far(170,398), and last cell near(157,371) far(207,367); the bottom row is 31px higher in its own cell, preserve that authored position.
Middle-cell targets in cell-local coordinates:
top-middle: near hind hoof(132,397), far(177,398).
top-right: near(139,396), far(185,397).
bottom-left: near(145,367), far(193,367).
bottom-middle: near(152,369), far(201,367).
Move the full knee-hock-hoof chain anatomically from its fixed hip with progressive forward thigh swing, retaining flexed hocks. These are small changes, no deformation of body, no excessively dangling legs. Four anatomical legs exactly, preserve front support foot contact positions. Keep distinct near and far legs. Unedited animals and every other feature unchanged as closely as possible. Genuine transparent background, no floor/shadows/glow/labels/grid. Output only the edited six-cell atlas.
```

### 修正底行两格后腿位置

```text
Use case: precise-object-edit. Image is transparent 1536x1024 3x2 deer atlas. Make a visibly targeted edit ONLY to the HIND LEGS of the BOTTOM-LEFT and BOTTOM-MIDDLE cells. Everything else unchanged, especially forelegs, bodies, antlers and all other cells.
These two images must be inbetweens of the top-right and bottom-right hind-leg positions. At present both pairs of rear hooves sit too far LEFT, then snap right in the final cell. Move the two folded hind shanks and hooves together FORWARD to the RIGHT, pivoting naturally from fixed hips with forward thigh swing.
Bottom-left: nearer rear hoof should be centered at cell-local x145,y370 (currently x128); farther at x194,y367 (currently x175). Shift those hoof silhouettes about18 pixels RIGHT; adjust hock and knee naturally without lengthening leg.
Bottom-middle: nearer rear hoof centered x152,y370 (currently x130); farther at x202,y367 (currently x178). Shift those hoof silhouettes about22-24 pixels RIGHT; adjust hock and knee naturally.
These are folded AIRBORNE rear feet. Keep them above floor and keep hooves compact. Do not shift torso or any front leg. Do not add additional legs or keep old hooves underneath! Replace the old rear-leg silhouette; exactly four legs per animal. Do not change other cells. Preserve transparent alpha, 1536x1024, six512cells. No background or text.
```

### 清理两张图集背景（各调用一次）

```text
Use case: background-extraction. Edit target: the attached six-cell deer sprite atlas. Preserve the six deer illustrations EXACTLY: all bodies, legs, hooves, antlers, fur, scale, cell positions and canvas1536x1024. Remove all remaining translucent background/matte/glow/noise, including the gray/brown areas BETWEEN legs, BETWEEN antler branches, below the belly and around outlines. Output clean RGBA with alpha exactly0 outside the actual deer silhouette; deer interiors fully opaque and only a narrow anti-aliased fur edge. No drop shadow, no colored or gray halos, no opaque blobs between legs. This is solely clean background removal. Do not redraw anatomy or change poses.
```

