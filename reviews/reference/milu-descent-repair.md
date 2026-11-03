# 下降与落地补帧

2026-11-03。使用内置 imagegen，透明背景；生成结果原始字节直接复制到项目，未做程序化图像修补。

- 修改 [flight 图集](../../art/milu/source/milu-cycle-flight.png) 的原第 11、12 帧：后腿屈膝回收，前腿朝前下方伸展。输出 exec-b2b4c9aa-9161-4e87-8e09-536babc2fa96.png。其余格存在轻微重绘，透明轮廓变化约 0.6–2.5%；按躯干中心重新校准了整帧平移。
- 新增 [descent 图集](../../art/milu/source/milu-cycle-descent.png)，6 张中间姿态分别插入原 10→11、11→12、12→13 之间，共 30 个源姿态。初稿 exec-9c72549e-4a99-47d3-8ebe-6669a92421bb.png；修正首格后腿和第二格前腿后采用 exec-4d8c81b9-a635-4157-a766-61d55dd0be94.png。
- 两张采用素材均为 1536×1024 RGBA，alpha 0–254。对每个 512px 格测量 alpha>128 的轮廓、蹄子高度和躯干位置；新增格整帧注册到相邻姿态之间，禁止单独拉伸或扭曲四肢。
- 跳跃在腾空高度归零时到达第一个前腿支撑姿态，然后继续四个支撑姿态完成承重，再接回奔跑。原来落地前前腿反向收起的姿态已修正。
- 用项目自身 Canvas 渲染模块在 Node 原生 Canvas 中输出连续帧和网点画面；这是渲染检查，不是浏览器帧率测量。生成插画在鹿角和毛发细节上仍有差异，帧间可有轻微重影。

## 修正原腾空图集的完整提示词

```text
Use case: precise-object-edit.
Asset: transparent game animation atlas, exactly 1536 x 1024 pixels, 3 columns by 2 rows of 512 x 512 cells.
Image 1 is the EDIT TARGET: six consecutive right-facing deer flight poses. Image 2 is REFERENCE ONLY: the following foreleg landing/support poses.
Change ONLY the legs of the bottom-middle and bottom-right deer (cells 5 and 6) in image 1 to create a coherent extended gallop recovery and pre-landing. Preserve the first four cells. Preserve ALL deer heads, antlers, ears, necks, torsos, markings, short tails, body scale, body positions and silhouette style in all six cells. Same warm brown detailed natural history illustration. Entire image genuinely transparent, no background, no gradients, no floor, no labels.
Bottom-middle: intermediate between the bottom-left fully stretched flight and the next tucked-hind-leg landing. Hind thighs swing slightly forward beneath the pelvis while the hocks flex and the hooves curl UP and forward toward the belly: do not let the rear legs dangle straight downward. Forelegs continue gradually reaching forward and down, one slightly leading, preserving anatomy.
Bottom-right: hindlegs are recovered into the same folded-under-pelvis pose as the top-left of image 2, carried above the ground. BOTH forelegs extend forward and downward ready to land, with elbows opening; remove the abruptly backward-curled near foreleg. Match the direction of the two reaching forelegs of image 2 top-left, but keep the hooves just above its contact line (in cell-local coordinates around y=430). This is a pre-contact pose, no backward foreleg recovery before landing.
Maintain exactly four anatomical legs per deer, two paired rear hocks, no extra/merged limbs, short deer tail. Preserve strict side view and cell positions. Output only the edited six-cell atlas.
```

## 生成六张中间姿态的完整提示词

```text
Use case: illustration-story. Asset: six NEW in-between frames for a right-facing deer animation, in a transparent 1536x1024 sprite atlas with 3 columns and 2 rows of 512x512 cells.
References: Image1 is the six flight poses. Image2 is the following six foreleg-support poses. Same individual tan-brown stag, detailed natural-history rendering, same antler shape, short tail and side view. This request creates intermediate drawings; do not repeat reference poses.
Read left-to-right top-to-bottom. Let A=Image1 bottom-left fully stretched pose, B=Image1 bottom-middle hocks folding under pelvis, C=Image1 bottom-right two forelegs reaching down, D=Image2 top-left forelegs about to support weight.
Output cell1: one third from A to B. Hind thighs still trail back, hocks just starting to bend; hoof path curls forward and slightly up toward belly. Forelegs slightly lower than A.
Cell2: two thirds from A to B. Rear hocks bend more, hind hooves halfway to under the pelvis, anatomically correct intermediate. Forelegs continue reaching forward/down.
Cell3: one third from B to C. Hindlegs increasingly folded under pelvis; forelegs gradually rotate down.
Cell4: two thirds from B to C. Hind hooves tucked under pelvis; forelegs near final forward/downward reach.
Cell5: one third from C to D. BOTH front legs continue reaching toward ground, one slightly leading. Rear legs remain folded up.
Cell6: two thirds from C to D. Forelegs nearly in first-contact direction, not yet planted; hindlegs folded under pelvis, not hanging straight down.
CRITICAL: feet must travel along arcs, these are six distinct consecutive anatomical poses, NOT six fades/double exposures. Exactly four legs and four hooves per stag, no extra limbs. Do not reverse or tuck the forelegs before landing. No stiff vertical dangling hindlegs.
Consistent torso, hip and shoulder placement/scale across all six cells: in each 512x512 cell, main torso centered near x245,y285, approximately 235px long and 95px high; antler top near y65; nose near x455,y230; with an imagined floor at y455. Keep torso near horizontal and match the reference animal, all legs and antlers fit each cell with margin. Deer stays locked in place, only limbs move through the sequence; no camera shift, no rotations. Transparent background, no backdrop, no gradients, no shadows, no grid, no labels, no text.
```

## 修正补帧的完整提示词

```text
Use case: precise-object-edit. Edit target: the attached transparent 1536x1024 six-cell deer atlas. Preserve exact layout, size, all bodies, antlers, head, coats, tails, and other four cells.
Repair ONLY (A) the rear legs of the TOP-LEFT deer and (B) the front legs of the TOP-MIDDLE deer. These two are adjacent flight inbetweens.
(A) Top-left: hind legs must begin curling upward during recovery from a backward-extended gallop. Keep the thighs trailing behind, bend the hocks slightly, move the near rear hoof from its current very low position (x65,y430) to approximately x80,y393 and the far rear hoof to x62,y380, within its 512x512 cell. It should be a small partial flexion after full extension, neither dangling vertically nor deeply tucked. Keep ALL front legs exactly as they are.
(B) Top-middle: remove the near front leg that is curled backward underneath the chest. BOTH forelegs must be outstretched forward and down to the right in prelanding reach, anatomically correct with slightly bent elbows, the near fore hoof at approximately x445,y415 and the far fore hoof at x455,y398 relative to that cell. Keep both hindlegs exactly as drawn.
No extra legs or hooves, no ghosting. Four legs total per deer. Keep every other pixel/pose/animal identity as closely as possible. Genuinely transparent background, no backdrop, no labels, no grid.
```

