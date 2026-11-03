# 按真鹿步态重画奔跑原图

2026-11-04。交给 Codex（内置 imagegen）执行。**已撤回**：按此计划生成并接入了 A、B、D，用户看后认为更难看，已恢复到重画前的版本；新原图、姿态参考图和登记脚本已从仓库删除。经过见 [按真鹿重画](../../reviews/reference/milu-real-gallop-redraw.md)。背景见 [真鹿奔跑参考与差距](../../reviews/reference/milu-real-gallop.md)：现有 31 张原图画的是成对着地、长时间腾空的蹦跳，后期处理改变不了，需要按真鹿的步态重画。

## 要做什么

画 13 张新的整只麋鹿，组成一个完整步态。每张对应 Muybridge 1887 年白尾鹿连拍里的一个时刻，时间间隔相等。腿的位置、哪只蹄子着地、身体高低照真鹿；头、鹿角、毛色、画风保持现在的麋鹿。

跳跃另画一张图集 D（6 个姿态），见下文。

## 输入

| 用途 | 文件 |
| --- | --- |
| 身份与画风（已确认的侧面图） | [milu-running-transparent.png](../../reviews/reference/milu-running-transparent.png) |
| 比例与格式（现有图集，同一只鹿） | [milu-cycle-support.png](../../art/milu/source/milu-cycle-support.png) |
| 姿态参考 A：姿态 01–06 | real-gallop-guide-a.jpg |
| 姿态参考 B：姿态 07–12 | real-gallop-guide-b.jpg |
| 姿态参考 C：姿态 13，再接 01–05 | real-gallop-guide-c.jpg |
| 全步态一览（给人看） | real-gallop-stride.jpg |

姿态参考里的照片已按现有图集的定位点缩放好：每格 512×512，鹿身中点约在 (240,275)，红线是地面 y=455。照片有栅栏背景，鹿是白尾鹿，只取它的姿态。

## 输出

`art/milu/source/milu-gallop-a.png`、`-b.png`、`-c.png` 和跳跃用的 `milu-jump-d.png`：1536×1024，真透明 RGBA，3 列 × 2 行，每格 512×512，从左到右、从上到下。

C 的第 2–6 格重画 01–05，用来检查 13 接回 01 是否顺；接入时 01–05 在 A 和 C 里二选一，选和 13 更连贯、彼此更一致的那组。

## 13 个姿态

着地的蹄子落在 y=455；不着地的明显高于地面。"后方""前方"指鹿身的前后。

| 姿态 | 后腿 | 前腿 |
| --- | --- | --- |
| 01 | 两只后蹄着地：一只在髋下，一只稍前 | 弯曲，向前摆，离地 |
| 02 | 两只后蹄着地，腿向后斜（身体正从上方经过） | 向前伸，离地 |
| 03 | 靠后的那只后蹄离地并继续向后；另一只仍着地，向后斜 | 两前腿伸向前方，领先的前蹄接近地面 |
| 04 | 后蹄刚离地，两腿伸在身后 | 领先前腿几乎伸直，落在肩前远处；另一前腿向前伸 |
| 05 | 离地，开始折起 | 领先前蹄着地；第二只前蹄快落地 |
| 06 | 离地，跗关节折起 | 两只前蹄着地：一只在肩下，一只在前 |
| 07 | 高高折起，开始向前摆 | 前腿承重 |
| 08 | 折起，向前摆 | 两前腿着地，向后斜（身体越过前蹄） |
| 09 | 向前摆到腹下 | 后面那只前蹄着地、向后斜；另一只离地折起 |
| 10 | 伸到腹下，第一只后蹄接近地面 | 最后一只前蹄在身后，准备蹬离 |
| 11 | 第一只后蹄在腹下落地 | 从身后蹬离地面 |
| 12 | 第一只后蹄着地；第二只在它前方落地 | 离地，折起 |
| 13 | 两只后蹄着地，靠前那只向前斜 | 折在胸下，向前摆 |

然后接回 01。这张表是从照片读出来的。照片更清楚的地方，以照片为准。

整个步态几乎没有四蹄同时离地，身体低而长、基本水平，只随步伐小幅前后俯仰。不要画成跳跃。

## 提示词

三次生成都用共同部分，再加对应分段。

```text
Use case: illustration-story.
Asset type: a production animation SPRITE ATLAS of exactly SIX consecutive full-body deer drawings, 3 columns by 2 rows, left to right, top to bottom. 1536 × 1024 true RGBA transparent canvas; six equal 512 × 512 cells. Together with two sibling atlases these are the 13 key poses of ONE seamless galloping stride, at equal time intervals.

Reference 1 is the approved character: the SAME handsome brown stag, same face, same branching antlers, same coat, short tail and warm brown ink-and-pencil natural-history illustration style. Reference 2 shows the same stag in an existing atlas: match its size, line weight and cell placement exactly. Reference 3 is a POSE GUIDE made from real photographs of a galloping white-tailed deer, one photo per cell, already scaled and placed where our stag must stand. In each cell copy ONLY the real deer's pose: the position and bend of every leg, which hooves touch the ground, the body's angle and height. Ignore the photo's fence, ground, shadow, coat, head and small antlers. Never copy the red line or the numbers.

This is a real ground-covering GALLOP, not a leap or a rabbit hop. The two hind legs move separately, one slightly after the other, and so do the two forelegs: near and far legs are clearly offset, never a mirrored pair. The body stays long, low and nearly level, with only a small pitch as the stride passes. Hooves that touch the ground in the guide rest exactly on the imaginary ground line y = 455 in every cell; lifted hooves are clearly above it. Exactly four attached legs with correct deer joints: the hind leg bends forward at the stifle and backward at the hock, the foreleg bends backward at the knee. Hooves are dark and cloven.

SPRITE REGISTRATION, identical in all six cells: hip about (150, 275), shoulder about (330, 285), spine about y = 275, nose about (450, 225), antler tips about y = 55, ground y = 455. Do not grow, shrink or recentre the animal to fit a pose. Same head and antler shape and size in every cell; the neck may carry the head a little further forward than in Reference 1, as a running deer does, but identically in every cell. Every part stays inside its own cell with at least 20 px of empty margin.

Background: genuinely transparent alpha everywhere outside the animals, including between legs and antler tines. NO ground line, shadow, backdrop, border, grid, number, label, text or watermark. Never duplicate one drawing across cells.
```

### A：姿态 01–06

```text
This atlas is poses 01–06: from hind support, through the hind push and the forelegs reaching forward, to the forelegs landing.
1. Both hind hooves on the ground, one under the hip and one slightly ahead; forelegs bent and swinging forward, off the ground.
2. Both hind hooves still on the ground, legs now slanting backward as the body passes over them; forelegs reaching forward, off the ground.
3. The rear hind hoof has left the ground and keeps moving back; the other hind hoof still planted, slanting back; both forelegs stretched forward, the leading forehoof just above the ground.
4. Hind hooves just off the ground, both legs extended behind; the leading foreleg almost straight, touching down far ahead of the shoulder; the other foreleg reaching forward.
5. Leading forehoof planted; second forehoof about to land; hind legs off the ground and starting to fold.
6. Both forehooves planted, one under the shoulder and one ahead of it; hind legs off the ground, hocks folding.
```

### B：姿态 07–12

先完成 A。B 加上 A 作参考 4：A 的第 6 格是 B 第 1 格的前一刻。

```text
This atlas is poses 07–12: fore support, the hind legs swinging forward under the belly, and the hind legs landing. Reference 4 is atlas A of the same stride; its sixth cell is the moment just before this atlas's first cell. Match its stag exactly.
7. Forelegs bearing the weight; hind legs folded high and starting to swing forward.
8. Both forehooves planted, slanting backward as the body moves over them; hind legs folded, swinging forward.
9. The rear forehoof planted, slanting back; the other foreleg off the ground and folding; hind legs swinging forward under the belly.
10. The last forehoof is behind the shoulder, about to push off; the hind legs reach under the belly, the first hind hoof nearly touching the ground.
11. The forehoof leaves the ground behind; the first hind hoof lands under the belly.
12. The first hind hoof planted; the second hind hoof lands just ahead of it; forelegs off the ground and folding.
```

### C：姿态 13 和 01–05

B 完成后再画。C 加上 A、B 作参考 4、5。

```text
This atlas closes the loop. Cell 1 is pose 13; cells 2–6 redraw poses 01–05 so that the stride continues seamlessly from pose 13. Reference 4 is atlas B (its sixth cell is the moment just before cell 1). Reference 5 is atlas A (poses 01–06); match its stag exactly, and make cells 2–6 equivalent to its cells 1–5.
1. Both hind hooves on the ground, the front one slanting forward; forelegs folded under the chest, swinging forward.
2–6. Poses 01–05 exactly as described for atlas A.
```

### D：跳跃 J1–J6

步态三张完成后再画。参考 3 换成 real-jump-guide-d.jpg（Muybridge Plate 691，小黇鹿跃起，公有领域），再加 A 作参考 4。跳跃从步态姿态 02 起跳，经过 J1–J6，从姿态 04 前蹄落地接回奔跑。空中的高度由代码加，所以六格的鹿身都画在同一个定位点上，只随动作俯仰。

```text
This atlas is a JUMP inserted into the same gallop. The stag takes off from gallop pose 02 (both hind hooves planted) and lands on gallop pose 04 (leading foreleg touching down far ahead); Reference 4 is atlas A with those poses. Reference 3 is a pose guide from real photographs of a leaping fawn, scaled and placed where our stag must be; copy only its pose and body angle, never the second deer in the corner, the fence or the fawn's spots. Height in the air is added by the animation, so keep the torso at the registration point in every cell; only the body's pitch changes. No hoof touches the ground in this atlas except the hind toes in cell 1.
1. Take-off: hind legs fully extended down and back, toes just leaving the ground; forelegs folded tight under the chest; body pitched up, neck stretched forward.
2. Rising: all hooves off the ground; hind legs trailing straight behind and below; forelegs tucked; body still pitched up.
3. Top of the jump, body almost level: hind legs trailing back, forelegs tucked under the chest.
4. Level flight: hind legs begin to fold forward; forelegs still tucked.
5. Level, starting down: all four legs gathered under the body.
6. Descending: forelegs unfolding forward and down to meet the ground; hind legs folded under the belly. This leads directly into gallop pose 04.
```

## 验收

每张图集检查一遍，不合格的格子定向重画（参考之前的 [补帧方式](../../reviews/reference/milu-contact-repair.md)）：

- 真透明：格子外、腿间和鹿角之间都没有底色或残影；没有地面线、阴影、文字、编号。
- 每格一只完整的鹿，四条腿都连在身上，关节方向正确。
- 着地蹄子与参考照片一致，落在同一条地面线上；两条后腿、两条前腿明显错开，不是成对的镜像。
- 13 格的头、鹿角、体型、画风一致；躯干位置基本不动。
- 按 01→13→01 顺序快速翻看，像在跑，不像在跳。

## 接入烘焙

1. 图集放进 `art/milu/source/`，原始输出文件名记在 `reviews/reference/` 下的新记录里（做法同 [milu-generated-cycle.md](../../reviews/reference/milu-generated-cycle.md)）。
2. 改 `art/milu/drawings.json`：
   - `drawings` 换成 13 条，源编号用 101–113，`duration` 都是 1；
   - 每条量出 `rect`、`origin`（躯干原点 x、地面 y）和 `unit`（每场景单位多少像素）；
   - `headReference` 选一张头部最端正的；
   - `rate`（每秒几步）先取 1.875，即每步 32 帧，看效果在 1.5–2 之间调。`60 / rate` 必须是整数。
3. 运行 `python art/milu/bake.py --preview <sheet.png>`。脚本会打印着地蹄子的实测后移速度，把 `cycle.js` 的 `RUN_SPEED` 改成这个值，否则蹄子会在地上打滑。
4. 跳跃用 D 的 6 张（源编号 201–206），从姿态 02 起跳、从姿态 04 落地；烘焙另出一段跳跃帧，`cycle.js` 在跳跃中改用这段帧。
5. `npm test`，再录一段和 [真鹿对比](../../reviews/real-deer-gallop.mp4) 同样的并排视频检查。
