# 麋鹿走路图生成记录

使用内置 image_gen 工具生成，没有调用 CLI/API。参考图为 `art/milu/source/milu-walk.png`，仅作为角色与画风参考。

第一轮未采用：透明预览有杂色，体形和姿态一致性不足。

第二轮 `walk-poses-v2.png` 为当前用于独立动态预览的候选图，尚未替换首页。

## 第三轮补图尝试

目标是补齐第二轮每格与下一格之间的姿态。输出仍主要重复关键姿态，没有严格达到半帧位置，不作为额外的 16 个有效中间帧使用。

```text
Create animation IN-BETWEEN cels from the attached 4×4 deer walk-cycle sheet. This is a precise cel animation task, not a new design.

Output a clean opaque white 4×4 sheet with 16 equal square cells and the same cell framing as the reference. Each output cell is a NEW pose exactly HALFWAY IN TIME from the corresponding reference cell to the NEXT reference cell in reading order. Last cell is halfway from reference cell 16 back to reference cell 1. Never simply copy the reference sequence.

Keep the SAME deer: right-facing strict side view, exactly the same warm tawny illustration, body length, head, antlers, ears, tail, torso volume and markings. Trace the reference upper body faithfully; do not redesign, resize, rotate or reposition it. Keep the antlers, muzzle, shoulders and rump at the same local cell coordinates as in the reference. Four legs only; far legs consistently dark, near legs light.

The key correction is smooth hoof travel. Follow each physical leg through its natural joint bends, interpolating its hoof position on a LOW curved path between its two endpoints. No dissolves, blurry feet, ghost legs or blended anatomy: each cel must have four complete, clearly drawn solid legs with crisp connected joints and hooves.

In particular, output cell 2 must show the light front leg BETWEEN its tightly folded position in reference frame 2 and its forward extension in reference frame 3: elbow starting to open, hoof below and slightly ahead of the chest, not already stretched far forward. Output cell 13 must show the light hind leg halfway between reference frame 13 and frame 14: hock folding and hoof swinging forward under the belly, not jumping instantly between positions. Also draw true in-betweens for the leg-crossing transitions 5→6 and 10→11.

Draw a calm natural WALK, grounded animal, no airborne torso, no bounding, no high stepping. Keep supporting feet on the same baseline; only the recovering hoof lifts slightly. Exactly 16 clean hand-drawn cel poses, no text, no layout lines, no floor, no shadow. Solid pure white background.
```


## 第一轮完整提示词

```text
Use case: stylized-concept.
Asset type: production animation sprite sheet / walk-cycle model sheet, not a poster.
Input image 1 is an IDENTITY AND ART STYLE REFERENCE ONLY. Its repeated poses and leg timing are incorrect. Create NEW correct walking poses, not copies of the supplied poses.

Create ONE large square transparent RGBA sprite sheet, ideally 2048x2048, with EXACTLY 16 evenly spaced cells in a precise 4-column by 4-row grid. Reading order left to right then top to bottom is time order, one complete slow WALK cycle at phases 0, 1/16, 2/16 ... 15/16. Every cell contains the SAME handsome adult antlered milu/deer in strict right-facing side profile, full antlers to hooves visible, the same local framing and scale. Fill the cell adequately with at least 10% clear gutters. Fixed orthographic camera. No text, numbers, grid lines, shadows, floor graphics, scenery, or captions.

Identity: retain the reference deer's elegant long face, long neck flowing naturally into shoulders, compact muscular torso, slender anatomically accurate legs, branching swept antlers and short downward tail. Painterly natural-history illustration, warm pale tawny/ivory coat and fine dark contour, clean readable silhouette. The near-side two legs have the body coat tone; far-side two legs subtly darker in shadow so their identities remain unambiguous throughout the ENTIRE cycle.

Most important: temporal consistency as if rendering ONE unchanging three-dimensional animal rig from one fixed camera. Exactly the same skull, eye, muzzle, ears, antler branching, neck length, ribcage length, withers, rump, fur markings, lighting and volume in all sixteen cells. No breathing inflation or changing body width. The trunk, neck, head and antlers travel TOGETHER in one very subtle smooth weight-transfer rise and fall (less than 1% of total height); head connected to shoulder, no independently frozen head, no head jerks, no antler shape changes, no twisting toward the viewer.

Movement: a calm natural quadruped FOUR-BEAT WALK, not trotting, prancing, running, galloping or jumping. At least two hooves support the body at all times. Small relaxed stride. Each leg swings independently and alternates with its opposite leg. Grounded hooves progress evenly from ahead of their shoulder/hip to behind it as time advances, then the heel releases, the joints bend naturally, and the hoof recovers FORWARD in a low smooth arc before softly landing. Never teleport a foot. Hocks bend with correct deer anatomy, limb lengths stay constant. No giant high-knee marching. No stretched rubber legs. Head gently follows the body's weight shift.

Exact touchdown sequence: near hind at frame 01 (0%); near fore at frame 05 (25%); far hind at frame 09 (50%); far fore at frame 13 (75%). The second eight frames must be the actual opposite-leg continuation, NOT duplicates of the first eight. Each hoof supports weight for about 60% of its own cycle, and swings for about 40%. Grounded hoof soles share the same local ground height across cells. Frame 16 is immediately BEFORE frame 01, smoothly connecting to it; do not duplicate frame 01 at the end. All sixteen frames are equally spaced in TIME. Draw the in-between limb positions distinctly and progressively. Ensure there are exactly four legs, with natural occlusion at crossing; do not merge or add legs.

Prioritize a physically convincing, temporally consistent walking sequence over decorative detail. Transparent background with real alpha, no matte color.
```

## 第二轮完整提示词

```text
Use case: illustration-story.
Asset type: clean production CEL ANIMATION sprite sheet, 16-frame WALK cycle.

Create a NEW high-resolution square sheet on a COMPLETELY SOLID PURE WHITE background. EXACTLY 4 columns and 4 rows of equally sized cells. No labels or grid. One full-body deer per cell, facing RIGHT in exact side view. Same centered framing and ground line in every cell; large clear gutters, no cropping. Ideally 2048 by 2048.

Image 1 is the original approved character/style reference. Image 2 is the previous draft for criticism: do NOT reproduce its colored matte noise, body proportion drift, ambiguous near/far legs, or stiff poses.

CRITICAL art direction: design this like hand-drawn 2D animation cels using THE EXACT SAME UPPER-BODY DRAWING in all sixteen cells. Identical torso silhouette, back line, rump, chest, neck, face, eyes, muzzle, ears, antler branches, paint strokes and fur highlights. Same body length and volume, same head-to-body relationship in every cel. Absolutely no camera rotation, body scaling, head scaling, breath inflation or tail flipping. The trunk/head/antlers form one coherent stable drawing. Only the four legs change joint positions. Smooth whole-animal weight shift will be added to the video later. Do not bend or detach the neck.

Subject: elegant adult milu / antlered deer closely matching Image 1, natural-history illustration with restrained warm tawny-ivory coat, slender accurate legs, fine dark edges, calm expression. Two near-side legs light like the body; two far-side legs CONSISTENTLY darker warm gray, clearly separated at crossings. Exactly four legs. Short tail resting downward.

The 16 cels, in reading order, are 16 consecutive equally spaced times through ONE COMPLETE regular FOUR-BEAT WALK. Small relaxed strides; no trotting, jumping, galloping, high-knee marching, or airborne body. Grounded hoof soles all meet the same ground line. Hooves swing forward just above the ground on smooth arcs. Joints bend anatomically; bones do not change length. Hind hock has a natural backward bend.

Foot timing across the 16 cels:
NEAR FRONT (light): frames 1-4 gently recover FORWARD, from behind/under chest to ahead; frame 5 lands ahead; frames 6-14 steadily support weight and move backward relative to the fixed body; frames 15-16 release, bend, and start the next forward recovery.
FAR FRONT (dark): the same sequence eight frames later: frame 13 lands ahead, frames 14-16 and 1-6 support and move backward, frames 7-12 recover forward.
NEAR HIND (light): frame 1 lands ahead of hip; frames 2-10 support and move backward; frames 11-16 lift, bend naturally and swing forward for the next frame 1.
FAR HIND (dark): frame 9 lands ahead of hip; frames 10-16 and 1-2 support and move backward; frames 3-8 recover forward.
All four legs have DIFFERENT phases. Never advance both front legs together or both hind legs together. At every time at least two feet support the body. The opposite-side legs genuinely alternate across the second half; never duplicate the first eight poses. Frame 16 smoothly precedes frame 1, without a duplicate hold.

Prioritize correct progressive foot positions, stable body shape, clean edges and readability. Pure opaque white background throughout. No transparency, colored artifacts, ground shadows, decorative marks, writing, environment, or layout embellishments.
```
