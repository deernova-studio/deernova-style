> **已撤回的实验（2026-11-03）**：用户指出前后腿造型与动作不一致，效果退步。首页已恢复完整姿态图集；以下记录仅供复盘，不代表当前实现或已认可的改进。分件代码已移出网站运行目录，素材仅留在 reviews 中。

# 2026-11-03：固定造型与连续步态

## 原因与实现

此前首页轮播六组分别生成的 31 个完整动物姿态。局部注册只能消除位置偏差，无法消除躯干长度、头部比例、鹿角轮廓和纹理的变化；整帧溶解还会在后腿位置差异较大时出现双影。后腿中段屈曲停留、随后集中下伸的问题仍然存在。

本次使用内置 imagegen（不是 CLI）生成完整 12 阶段周期参考，再生成同一只鹿的躯干、前腿、后腿分件图。周期图用于视觉参考，关节坐标与运动曲线由代码编写，并非从图片自动提取动作捕捉数据。最终首页使用 `reviews/reference/milu-puppet-rejected.png`：固定躯干／头／角，同一份腿部贴图按固定长度的三段关节连续运动。远近两侧错开 0.065 个周期。

`anatomy.js` 以三次曲线定义蹄子收回、前摆、下伸的轨迹；承重阶段蹄子在模型中以与地面一致的速度后移，关节求解保持骨段长度。为绘制蹄底留出 0.06／0.065 单位的贴图余量。绘画的蹄底不是精确碰撞体，不能把模型约束当作真实动物生物力学验证。

`stag.js` 用网格蒙皮绑定单份腿部纹理，固定躯干最后覆盖肩和髋部。加载时生成 100 个奔跑缓存姿态，以及 1.05 秒跳跃对应的 64 个姿态（含首尾），播放时只绘制一张完整缓存图。64 MiB 左右的缓存换取播放阶段无需网格计算；离线 Native Canvas 检查中准备约 2.7 秒，这不是浏览器实测性能。播放调度仍以 60 fps 为目标。

跳跃继续在下一次后腿蹬地启动；腾空额外高度归零时进入前蹄接触阶段，完成缓冲后接回奔跑。五个场景、日夜模式、顶栏和产品下拉不变。

原始生成 PNG 仍包含低透明度的有色雾边；清理调用未彻底消除它。运行时把 alpha 128 以下的覆盖去除，将 128–208 映射成窄抗锯齿边，再增加细轮廓，避免雾边随四肢运动。

## 交付素材

- 完整周期参考：`reviews/reference/milu-full-cycle.png`，来自 `exec-26726bef-f30d-4c89-80b0-0a1b0e648a01.png`。
- 分件原图：`exec-ab41ba39-6200-4c54-a1e4-82fae6060736.png`。
- 最终分件素材：`reviews/reference/milu-puppet-rejected.png`，来自 `exec-cf424bc5-145b-44de-a730-0261faece1f2.png`，原始字节复制。
- 对比视频：`reviews/gait-stability.mp4`。左侧为本轮修改前，右侧为已撤回的分件实验代码；前 2 秒正常速度，后 4 秒四分之一速度，输出 60 fps。离线渲染，不是浏览器录屏。
- 原始生成文件保留在 Codex generated_images 目录。六张完整姿态图集现已恢复为首页素材；分件素材不再加载。

## 验证与边界

- `npm test`：51 项通过，网站与 skill 构建通过。
- 新测试覆盖 2,401 个阶段的骨段长度、支撑蹄与地面速度一致、循环首尾位置／速度衔接、远近腿不同步、跳跃落地／接回、每个跳跃显示时刻使用独立缓存图，以及失败重试与缓存复用。
- 实际绘制出的 164 个缓存没有碰到裁切边缘；8 种视口的奔跑与跳跃扫描均在画面内，320px 视口最小边距约 14.6px。
- 检查了 Native Canvas 输出的桌面／手机落地画面和浏览器中的首页；尚未测量真实浏览器的逐帧耗时、GPU 合成或低端手机性能。
- 这是根据参考图手工约束的二维动画，仍可能在极度折叠的关节处出现贴图压缩；不能把测试通过等同于用户已经认可动作自然。

## 动作资料

[Self et al., 2022 — Center of Mass Offset Enhances the Selection of Transverse Gallop in High-Speed Running by Horses](https://pmc.ncbi.nlm.nih.gov/articles/PMC8919080/) 用于交叉检查腾空与前后肢接触顺序的区别；本文模型不是对麋鹿的运动捕捉，项目也不声称达到解剖学仿真精度。

## 完整提示词

### 完整周期参考

```text
Use case: illustration-story.
Create a single professional animation MODEL SHEET: one COMPLETE, anatomically credible galloping cycle of the same adult male deer in strict right-facing side view, as TWELVE consecutive poses, reading left-to-right then top-to-bottom in a precise 4-column by 3-row grid. Landscape 1536 by 1024 canvas. Every animal isolated on true RGBA transparency, no ground, no shadow, no labels, no cell borders. All antlers and hooves stay inside each cell with margins.
Reference image: character/antler style reference ONLY, NOT a pose sequence to copy. Keep the handsome brown stag, slim legs, short tail, swept branching antlers, calm forward-facing head. Cleaner flat cel-painted shading with a dark brown contour, fewer fur details, consistent light. This will be animated and converted to monochrome halftone.
CRITICAL ANIMATION INVARIANTS: exactly the same deer, body length, limb segment lengths, head size and antler branch topology in ALL 12 cells; identical camera and scale; same horizontal pelvis position; chest and pelvis move only a small amount with the stride, head stays stable. No stretching body, no mirrored animals, no changing fur patterns. Each pose must differ meaningfully in the legs and proceed FORWARD through time. Four legs identifiable, nearer pair lightly colored and farther pair slightly darker, far pair trails near pair by a small phase offset. Do not synchronize the hind legs into a rabbit hop. No stationary bent hind legs repeated for half the cycle.
GAIT PHYSICS: Hind leg is a three-segment articulated chain: hip, forward stifle, backward hock, hoof. After rearward push-off the hock flexes and hoof folds forward underneath the belly, then swings further forward under pelvis before lowering toward ground. A rear hoof follows a curved recovery path, NOT a straight pendulum drop behind the rump. When bearing weight, planted hoof moves steadily backwards relative to body as pelvis passes forward, then pushes off. Front feet contact before the recovered hind feet. Continuous cycle, final pose leads naturally into first.
POSES, in strict reading order:
1. Hind-leg loading: near rear hoof just planted FORWARD UNDER the pelvis; rear stifle flexed to absorb load; other rear leg is about to plant. Forelegs folded and recovering in front of chest.
2. Hind support: pelvis passes over the planted rear feet, rear hip/stifle start extending, forelegs begin forward unfolding.
3. Rear propulsion: rear legs extend diagonally BACK, hocks extend, last rear hoof toes leaving ground; forelegs reach forward; body rises slightly.
4. Extended suspension: four feet airborne, forelegs reaching forward and hind legs trailing rearward, spine level, no oversized leap.
5. Late flight: forelegs reach down-forward for landing; trailing rear hocks begin flexing, rear hooves lift/fold forward.
6. First fore contact: leading front hoof lands ahead of shoulder, other front leg follows; rear thighs swing FORWARD, rear hooves tucked up under belly.
7. Fore support: front legs absorb weight below shoulder; hind stifles flex further FORWARD and rear hooves advance under the body's middle, never frozen behind the rump.
8. Fore push-through: planted front hoof sweeps behind shoulder, far foreleg starts recovery; rear legs gathered compactly and swing forward, hind hooves beneath belly in front of pelvis.
9. Gathered suspension: front feet have left ground and fold back; rear thighs are at their furthest forward, hocks folded, rear hooves close under belly, all feet airborne.
10. Rear reach: hind thigh stays forward while hock opens, near rear hoof travels down AND slightly forward toward its landing point under pelvis; forelegs begin forward recovery.
11. Rear landing approach: rear hoof closer to ground, hock still slightly flexed, its ground reach stays forward under pelvis; far hind follows, forelegs folded ahead of chest.
12. Rear touchdown: near rear hoof contacts under/slightly ahead of pelvis and starts loading, far hind is just above ground, forelegs still folded recovering, connects smoothly to pose 1.
Make it a believable running stag, NOT twelve unrelated heroic jumping poses. Stable upper body, continuous coordinated articulated limbs. No haze or translucent material around the cutouts.
```

### 分件素材

```text
Use case: precise-object-edit. Asset type: production 2D deer animation puppet texture atlas.
Reference image: character/style reference from the twelve-pose running stag sheet. Make a NEW animation cutout asset sheet of exactly the SAME handsome stag, with exactly the same swept branching antlers, face, body proportions, short tail, and flat cel-painted brown/beige shading with thin dark brown contours. Strict right-facing side view. Landscape 1536 x 1024 canvas.
This is an animation puppet parts sheet, NOT a running cycle. Place the following THREE isolated objects on true RGBA TRANSPARENCY:
1) In the TOP HALF (x0..1536 y0..512), centered and large, draw the complete upper deer: torso, rump, belly, chest, neck, head, ears, antlers and short tail, WITH NO LEGS. No dangling limb remnants. The abdomen and chest must have a clean continuous softly curved lower contour. The legs will be placed behind this upper-body cutout. Fit entirely in x400..1150, y30..490; whole head and antlers visible. Keep the body level, head pointing forward calmly, antlers identical to the reference. Opaque body with clean fur edges.
2) In the LOWER LEFT quarter (x0..768,y512..1024), draw ONE separate whole NEAR HIND LEG, isolated, facing right, at large useful scale. Include rounded thick upper thigh at HIP, forward STIFLE, lower thigh sloping back to a distinct backward HOCK, long narrow lower limb and small dark CLOVEN HOOF pointing right. It should hang in a RELAXED SLIGHTLY BENT pose, well separated and unfolded enough for cutting at joints. Anatomically correct 3 segments, strong rounded thigh, not a human leg. Thigh begins at (300,550), stifle around (390,690), hock around (300,815), hoof at (340,965). The entire part fits this quadrant.
3) In the LOWER RIGHT quarter (x768..1536,y512..1024), draw ONE separate whole NEAR FORELEG, isolated, at the SAME anatomical scale as the hindleg. Rounded shoulder attachment, upper arm slightly backward to ELBOW, slender forearm forward/down to CARPUS, then almost straight lower cannon and small cloven hoof. Mostly extended vertically, slightly bent, joints visible enough to cut. Shoulder at (1090,550), elbow around (1060,680), carpus around (1120,820), hoof at (1140,965). Entire part fits this quadrant.
The far pair will be duplicates darkened by the renderer: DO NOT draw extra limbs. Exactly 3 separate painted parts total. No additional small scraps, no borders, no text, no numbers, no shadows or halos, no translucent color haze. OUTSIDE ALL THREE SOLID OPAQUE CUTOUTS THE ALPHA MUST BE EXACTLY ZERO. Do not paint any background color at all, no gradient, no checkerboard. This is a texture atlas to assemble into the same deer, preserving the reference beauty.
```

### 透明边缘清理

```text
Use case: background-extraction. Edit THIS exact three-part deer puppet atlas. Keep every contour, exact anatomy, colors, pixels, scale and position of the three painted animal parts unchanged. Remove ALL of the diffuse brown haze, gradient, glow and cloudy matte around the body and the two legs. This is technical alpha cleanup ONLY, no redesign, no rearrangement, no new poses. Final PNG must have truly transparent alpha=0 outside the silhouettes, including between the antler branches and around each separate leg. The interior of the deer body, antlers, and both legs must be opaque alpha=255; retain only a narrow one-pixel soft antialiased outer boundary. There must be no semitransparent colored cloud or ghost background anywhere. Same 1536x1024 canvas, same three parts in same places.
```
