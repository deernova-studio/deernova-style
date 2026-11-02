# 麋鹿奔跑姿态对照

2026-11-02，在 `codex/refine-homepage-deer` 上制作。用户希望先用 imagegen 生成一组奔跑姿态，比较当前动画为什么别扭。

- 造型参考：[已确认的侧面图](milu-running.png)。
- 当前动画的八帧：[步态截图](../gait-cycle.png)，对应实现提交 `c489e19`。
- 本次生成：[八个姿态](milu-gallop-study.png)。使用内置 imagegen 生成对照图，并单独修订第 06、07 帧；未使用 CLI。

## 对照观察

当前动画的前腿收拢时出现尖锐折角，后腿回收时腿根和轮廓存在拉扯感。肩胸与臀部的变化较小，四肢看起来在一个相对固定的躯干下折叠。

生成图中，第 03、04 帧同时展开躯干、肩胸与后腿，伸展更连贯；第 01、08 帧的腿部收拢仍保留圆润的肌肉轮廓；修订后的第 06 帧明确呈现前腿承接身体的姿态。

这是一组姿态研究图，不是已验证的逐帧动画素材。第 07 帧仍过早回到后腿承重，前腿离地的过渡不充分；各图还需要统一身体位置、落脚基准和时间间隔。不能仅按编号拼接便宣称得到了自然循环。

下一轮建议以整只鹿的关键姿态为依据，补足过渡并校准节奏后再转换成首页的字符／网点表现。

## 初始生成提示词

```text
Use case: stylized-concept.
Asset type: ONE eight-frame running-cycle contact sheet for evaluating animation poses.

Input image: the approved character identity and illustration style reference. Preserve this SAME adult male deer: identical face, elegant branching antlers, body proportions, coat pattern, short unobtrusive tail and refined natural-history illustration style. Change its pose across the frames.

Create an animation artist's carefully drawn study of ONE COMPLETE natural, energetic deer gallop, shown as EIGHT DIFFERENT consecutive full-body side-profile drawings. Every animal faces right. Clean white background. Arrange exactly four equal panels across and two rows, read left to right then top to bottom. Small understated frame numbers 01 to 08 under each drawing are the only text. Keep the same scale, side-view camera, ground baseline and anatomical proportions in every cell. All antlers and hooves must fit fully within each cell with generous margins.

Pose progression:
01: gathered airborne phase, hind legs sweeping forward under the abdomen, forelegs folded back beneath the chest.
02: first hind hoof meets the ground underneath the body, second hind leg following; forelegs are beginning to swing forwards.
03: hindquarters drive and extend backwards through toe-off; forelegs reach forward; the back and pelvis subtly extend with the push.
04: broad graceful extended suspension, hind legs stretched behind and forelegs reaching ahead, with natural asymmetry between near and far legs; all four hooves clear of the ground.
05: leading forefoot reaches and touches down, other foreleg follows; hind legs start folding and coming forward.
06: forelegs accept the body's weight and the shoulder lowers slightly; hind legs recover beneath the abdomen. Show supple natural joints and muscle compression.
07: last forefoot pushes off behind the shoulder; hind legs reach forwards beneath the body, preparing for the next hind landing.
08: supple gathered airborne phase just before frame 01, legs recovering compactly and smoothly without tangled knees.

Style and motion: same tasteful lightly colored ink-and-pencil wildlife illustration as the reference, realistic muscle masses, graceful curved contours, warm brown coat. Let the shoulder, chest, pelvis and spine participate in the run rather than keeping a rigid torso above moving sticks. Head and antlers stay relatively steady with a little natural follow-through. Clear negative space separates the four limbs. Each drawing must be a newly coherent whole animal with anatomically plausible shoulders, elbows, wrists, stifles, hocks, pasterns and cloven hooves.

Avoid: eight copies of the same pose, unrelated running poses without progression, trot, walking, stiff rocking-horse body, mechanical hinged knees, angular paper-cut limbs, melted or detached joints, extra legs, missing legs, doubled hooves, inconsistent antlers, size changes, viewpoint changes, exaggerated floating, giant bounces, motion blur, scenery, decorative framing, paragraphs, arrows, watermark. This is a visual pose study, not a website mockup.
```

## 局部修订提示词

```text
Use case: precise-object-edit.
Edit ONLY panels 06 and 07 (the second and third drawings in the bottom row) of this eight-pose deer gallop contact sheet. Preserve the canvas dimensions, white background, frame numbers, layout, scale, character identity, colors and linework. Preserve panels 01, 02, 03, 04, 05 and 08 exactly as they are.

The targeted correction is the continuity of the foreleg support phase:
Panel 06: show the deer accepting its weight on the NEAR front leg, with that forehoof firmly planted on the same ground baseline as the extended hoof in panel 05. The load-bearing front leg extends almost vertically from shoulder to hoof, with mild elastic compression rather than a sharp folded zigzag. The far foreleg is already recovering and folded modestly. Both hind legs are sweeping forward under the abdomen, clearly distinct and off the ground. Lower the shoulder and chest slightly with this weight transfer; keep the head and antlers close to their existing level.
Panel 07: the body has traveled forward over the last planted front hoof. That foreleg now trails diagonally BACK behind the shoulder and is at toe-off, its hoof still at the baseline. The other foreleg folds back under the chest. The hind legs have advanced farther under the belly, preparing the gathered airborne phase in panel 08. Show this as one coherent supple animal, not separately rotated limbs.

Keep all four limbs identifiable without extra feet. Muscle contours must be smoothly drawn through each joint. The only change is correcting these two sequential poses; do not redraw the other six panels or relabel or reorder them.
```

