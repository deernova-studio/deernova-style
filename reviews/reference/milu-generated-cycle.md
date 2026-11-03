# Imagegen 完整奔跑图集

2026-11-02，使用内置 imagegen（未使用 CLI）。以 [八姿态参考](milu-gallop-study.png) 为形象参照，生成 24 个完整动物姿态，首页实际从以下图集中取帧。

| 文件 | 帧 | 来源输出 |
| --- | --- | --- |
| [收腿与后腿着地](../../art/milu/source/milu-cycle-gather.png) | 01–06 | exec-55735961-47f3-44af-b88c-b4cd9a8c15d9.png |
| [蹬伸与腾空](../../art/milu/source/milu-cycle-flight.png) | 07–12 | exec-230077c7-cb0c-4a9d-9322-a128f3495bb2.png |
| [前腿承重](../../art/milu/source/milu-cycle-support.png) | 13–18 | exec-807127d6-c470-44fc-b661-afbefddae04f.png |
| [离地回收](../../art/milu/source/milu-cycle-recover.png) | 19–24 | exec-4f161e99-c9f6-4641-a92f-cb17036eb4e5.png |

每张图集为 1536×1024 RGBA，3列×2行。原始输出保留在本机 generated_images 中，项目使用副本；透明通道由 imagegen 生成。C 初稿带白底，追加背景提取；D 初稿的前腿回收顺序错误，追加定向重绘。最终透明性与裁切检查见 [验收记录](../verification.md)。

## 首轮完整提示词

四次生成都用下面的共同部分，再分别追加对应分段。

```text
Use case: stylized-concept.
Asset type: a production animation SPRITE ATLAS of exactly SIX consecutive full-body deer drawings, arranged in exactly 3 columns by 2 rows, left to right, top to bottom. Landscape 1536 × 1024 canvas; six equal 512 × 512 cells. This atlas supplies six successive frames of a 24-frame seamless galloping cycle.

Input image is the approved visual identity and pose-study reference. Match that SAME deer, face, branching antlers, coat markings, short tail, warm brown ink-and-pencil natural-history illustration style. Each frame is a newly coherent whole animal. Animate the shoulder, chest, back, pelvis and muscles together. Same anatomy, antler shape, scale, side-view camera and light throughout. All six deer face right. Four clear legs, correct joints and hooves.

SPRITE REGISTRATION: keep the torso centred around x=245 within every cell, spine around y=275, a common imaginary ground at y=445. Keep nose around x=435; the antlers reach roughly y=95. These anchors must stay consistent. All extremities must fit within their own cell, with at least 24 px of empty margin. No part may cross into another cell. Use the cell area consistently: do not grow, shrink or recenter the animal to fit each pose. Small natural body rise and fall is intentional; the camera and animal size do not change.

Background: genuinely transparent alpha everywhere outside the animals, including between legs and antler tines. NO ground line, cast shadow, backdrop, border, grid, frame number, label, text, arrows or watermark. Do not duplicate poses or paste one animal six times. Smooth modest differences between neighbouring frames are essential; these are consecutive in-betweens, not six unrelated dramatic poses. Never add legs or hooves. Avoid mechanical hinged or rubber limbs, stretched texture, changing antlers, tangled legs and excessive bounce.
```

### A 段

```text
Specific six-frame segment:
A: frames 01–06, the gathered aerial phase resolving into hind-leg landing and early drive.
1. Compact gathered suspension: forelegs folding back under chest, hind legs tucked forward under belly; all hooves off ground.
2. Hind legs begin reaching down beneath the pelvis; forelegs stay recovered.
3. First hind hoof reaches the ground beneath the hip; second hind leg follows slightly later.
4. Both hind legs briefly support, knees supple, pelvis compresses slightly; forelegs start opening forward.
5. Near hind leg bears weight as the other begins pushing backward; body begins to rise and extend.
6. Hindquarter drive is starting: rear hooves remain at the baseline, hind legs extend backward while front legs open forward. This leads into segment B, not another landing.
```

### B 段

```text
Specific six-frame segment:
B: frames 07–12, the hindquarter drive through stretched flight to the first front-hoof approach.
1. Strong rear-leg drive: one hind hoof still planted behind the hip, other already lifting; forelegs opening forwards.
2. Last hind toe pushes off; pelvis and spine extend with the thrust, forelegs continue reaching forwards.
3. Early extended flight: all feet off the ground, hind legs trailing backwards, forelegs reaching ahead.
4. Peak graceful extended suspension like pose 04 of the reference: long horizontal body, both hind legs behind, forelegs ahead, slight near/far timing offset.
5. Leading front leg reaches down and forwards towards the ground, other front leg still slightly folded; hind legs begin recovery.
6. Leading front hoof is just above ground ahead of the shoulder, about to land; other front leg follows. This leads directly into front contact in segment C.
```

### C 段

```text
Specific six-frame segment:
C: frames 13–18, foreleg landing and weight transfer, then the start of forefoot release.
1. First front hoof touches the baseline ahead of the shoulder; other front leg is about to land; hind legs are off the ground.
2. First front leg accepts weight, second front hoof arrives; chest lowers slightly, rear legs fold towards belly.
3. Front-leg support: body passes forwards over the planted front hoof, near front leg almost vertical and softly compressed. Keep BOTH hind feet off the ground.
4. Later front support: one front leg begins folding back under chest; remaining planted front leg supports beneath shoulder, hind legs continue swinging forward.
5. Body has passed the last planted front hoof; that FRONT leg now angles diagonally BACK to the left, its hoof still on the baseline behind the shoulder. Both HIND legs remain raised.
6. Last front toe is about to lift from the baseline behind the shoulder; the other foreleg is folded, hind legs draw forwards under abdomen. Do not put hind feet on the ground in this segment.
```

### D 段

```text
Specific six-frame segment:
D: frames 19–24, last front toe-off into gathered flight and the approach to the initial gathered pose.
1. Last FRONT toe leaves ground behind the shoulder. Forelegs trail briefly backwards. Hind legs have folded forward under the abdomen and are airborne.
2. All four feet airborne: forelegs start recovering back under chest, hind legs come further forward under pelvis.
3. Body gathers gently: rear joints tucked beneath abdomen; front legs folded back, with four clean separated hoof shapes.
4. Compact gathered suspension, natural arched loin and muscles compressed, head steady, the whole animal remains horizontal rather than standing upright.
5. Forelegs finish folding beneath chest, hind legs begin to prepare to extend down on the next stride, no hooves touching ground.
6. Approach the exact gathered aerial pose at the beginning of segment A: forelegs back beneath chest, rear legs tucked forward beneath belly. This must loop smoothly into frame 01, with no extra landing, jump or repeated hind-foot support.
```

## C 段背景提取

输入为 C 初稿 exec-f410606a-968f-42a0-ac07-abeb8059fc7e.png，transparent_background=true。

```text
Use case: background-extraction. Edit target: the attached 3-column by 2-row deer animation sprite sheet. Keep the six animals EXACTLY as drawn: all six poses, positions, dimensions, colors, anatomy, antlers and fur. Remove ONLY the white background and faint shadows. Output the same 1536 x 1024 sprite atlas with genuine fully transparent alpha outside each animal, including the gaps between antler branches and between legs. Do not replace the background with white, black, a gradient, checkerboard, glow, or a semi-opaque rectangle. No captions, borders, or ground lines. Preserve every animal pixel and every hoof.
```

## D 段动作修正

输入依次为 D 初稿 exec-34a5a9d2-8d02-4dbf-9167-bf2025281ba3.png、C 初稿、A 最终稿，transparent_background=true。

```text
Use case: illustration-story. Asset type: production animation sprite atlas, segment D, six consecutive complete poses of the SAME right-facing running deer. Image 1 is the edit target and style/identity reference; image 2 supplies the immediately preceding front-leg toe-off pose in its bottom-right cell; image 3 supplies the FOLLOWING gathered pose in its top-left cell. Redraw ONLY the legs and very slightly change torso height in image 1 to fix the motion progression. Preserve its head, antler shape, torso proportions, short tail, warm tan fur and precise side view. 1536x1024 PNG, 3 equal columns by 2 equal rows of 512x512. All six deer complete and separate. Genuine transparent background, NO text, NO shadows, NO lines, NO glow. Full animal fits every cell with 20px margins. Body center x245, antler top around y85, ground level y450. Timeline left to right, top to bottom:
Frame 19 top-left: continue directly from the bottom-right pose of image 2, last FORELEG trailing BACKWARD under the belly, its toe JUST leaving the ground; the other foreleg already folded backward/up under chest. BOTH HINDLEGS airborne bent forward under belly. Do not extend forelegs in front again.
Frame 20 top-center: the trailing foreleg is now fully airborne, wrist bends and hoof sweeps up toward belly; both forelegs fold backward under chest, hindlegs gather farther forward.
Frame 21 top-right: all four feet airborne, forelegs bent compactly and tucked under chest pointing backward, hindlegs flexed forward under belly. Front and rear hooves approach each other beneath torso.
Frame 22 bottom-left: maximum gathered suspension, all legs folded tightly underneath, back slightly rounder.
Frame 23 bottom-center: remain airborne in gathered suspension; near hindleg begins to open very slightly downward while forelegs stay folded.
Frame 24 bottom-right: closely match the NEXT top-left pose of image 3, all four legs still gathered and airborne; only a tiny opening of hind ankle, not landing. This must flow directly back to the top-left pose of image 3 without snapping.
This is NOT six different gallops or six key poses: these six small progressive inbetweens occupy just the last quarter of a gallop cycle. Keep both hind feet off the ground throughout. The forelegs must NEVER reach forward again in this segment. Complete anatomical limbs, no duplicated legs, no fused hooves.
```


## B 段前腿过渡修正

输入为 B 初稿 exec-1b9963aa-306d-4d92-8ee1-0a5f289195b1.png 与 A 最终稿，transparent_background=true。仅修正第 07 帧的前腿重新收回问题。

```text
Use case: precise-object-edit. Edit target: image 1 is a six-frame, 3 columns by 2 rows deer sprite atlas. Image 2 is the immediately PRECEDING six-frame segment: its bottom-right animal is the preceding pose. Fix ONLY the TWO FRONT LEGS in the TOP-LEFT cell of image 1. In that top-left pose, the front legs were mistakenly folded back again after the previous pose had already reached them forward. Instead extend BOTH front legs forward towards the right, midway between the preceding pose (image 2 bottom-right) and the next pose (image 1 top-middle). Keep elbows softly bent, nearer foreleg reaching a little farther forward than the other; all front hooves remain airborne. Keep the hind legs, body, neck, antlers, fur, tail, scale and position of this top-left animal EXACTLY unchanged. Keep ALL OTHER FIVE CELLS pixel-identical. Preserve the same 1536x1024 size, 3x2 equal grid layout and genuine transparent background. No text, shadows, grid, added ground, glow or labels. This is a targeted continuity repair, not a new set of poses.
```
