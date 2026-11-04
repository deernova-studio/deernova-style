# 仓库架构

这个仓库只有一个真正的产品：`skills/deernova-style/` 这个 skill。网站和 npm 包都从它派生，不另外维护一份规范。

## 源文件

```text
skills/deernova-style/          skill 本体，规范的唯一来源（直接提交，不经过生成）
  SKILL.md                      入口：什么时候用、核心规则、平台速查、工作流程
  references/
    foundations.md              原则、颜色、字体、间距、圆角、线条、玻璃、动效、图标、文案、无障碍
    tokens.md                   设计变量表（由 tokens.json 生成）
    patterns.md                 按场景整理的界面做法：页面骨架、操作、输入、导航、内容、反馈、AI 对话
    swiftui.md                  SwiftUI 落地
    web.md                      Web 落地
    review.md                   审查清单
  assets/
    tokens.json                 颜色、字体、尺寸的原始数据（手工编辑）
    tokens.css                  CSS 变量（由 tokens.json 生成）
    screens/                    Mac 窗口、iPhone 页面、iOS 按钮尺寸的效果截图，各有浅色和深色
apps/website/                   官网
  index.html                    首页：满屏麋鹿动画，依次走过草原、森林、雪山、星空、沙漠；点天空有场景特效，点鹿它会停下抬腿张望；顶部保留玻璃导航
  guide.html                    完整规范页：头部是标题、打字行和三个按钮，下面把 skill 的 Markdown 按阅读顺序排成一页
  styles/                       网站自己的样式
  assets/milu-run-*.png          两张灰度透明图集：烘焙好的散步，每完整步 160 帧（由 art/milu 生成）
  scripts/site.js               主题、复制命令、规范目录和打字效果
  scripts/product-menu.js       首页顶栏的产品下拉与键盘操作
  scripts/meadow.js             动画入口：浏览器可见性、尺寸、主题事件，以及点击和空格键
  scripts/meadow/               时间轴、鹿、场景、点击特效、渲染和共用数学函数；stride.js 由烘焙脚本生成
art/milu/                       首页麋鹿的原始彩色插画（source/）、姿态表、登记和离线烘焙脚本，不进网站构建
packages/style/                 npm 包 @deernova/style
  bin/cli.mjs                   install / update / doctor
scripts/                        tokens、build-site、build-skill、发布工具
  vite-website.mjs               开发时渲染规范、提供共享素材并监听规范和 token 修改
vite.config.mjs                 Vite 开发入口，直接服务 apps/website，默认端口 4173
tests/                          skill、构建、开发热更新、安装器和动画测试
reviews/verification.md         当前验证结果与未覆盖范围
reviews/history.md              历史验收记录
archive/Paperlight/             最初的设计稿资料，只做留档
```

skill 里只有 Markdown、token 数据和截图。它描述应该做成什么样，不提供可安装的组件、类名或 HTML 模板；使用者用自己项目的组件实现。

## 生成与构建

```text
assets/tokens.json ── npm run tokens ──→ assets/tokens.css + references/tokens.md   （提交进仓库）

skills/deernova-style/ ─┬─ build-skill ─→ packages/style/skill/ + manifest.json ─→ npm 包 ─→ 目标仓库的 skill 目录
                        └─ build-site ──→ dist/（index.html、guide.html、tokens.css、截图）
apps/website/ ──────────┘

art/milu/source/ + drawings.json ── python art/milu/bake.py ──→ apps/website/assets/milu-run-*.png + scripts/meadow/stride.js   （提交进仓库）
```

- `tokens.css` 和 `tokens.md` 是生成文件，但会提交，因为 skill 要能直接从仓库里使用，不依赖构建。`npm test` 会检查它们和 `tokens.json` 是否一致；不一致时两个构建都会直接报错。
- `build-skill` 原样复制 skill 文件夹，再写入 `manifest.json`（版本号和内容哈希）。安装器用这个哈希判断是否需要更新、文件是否被改过。
- `build-site` 读取同一份 skill：首页引用 `tokens.css` 和截图，规范页把各个 Markdown 渲染出来，并把文件之间的链接改成页内锚点。
- 两个构建互不影响，也都不会写回源文件。网站的改动不会改变 skill 的哈希。
- 麋鹿烘焙是 Python 脚本（OpenCV、NumPy、Pillow，版本固定在 `art/milu/requirements.txt`），只在改动插画、姿态顺序或节奏时手动运行，输出提交进仓库；`npm test` 和网站构建都不依赖它。

## 开发服务

`npm run dev` 启动 Vite，直接服务 `apps/website/`，不依赖 `dist/`。CSS 修改使用热更新，保留动画与菜单状态；首页在 Vite 的样式替换完成后重新读取 Canvas 配色并重建网点图案，暂停画面也会重绘。HTML、脚本和图片修改自动刷新页面。默认端口 4173 被占用时直接报错，避免无意切换端口后仍看着旧页面。`npm run preview` 保留静态产物预览，用于检查构建结果。

`scripts/vite-website.mjs` 与静态构建共用 `build-site.mjs` 的 `renderSiteHtml`，两种模式下的规范内容和链接转换一致。插件监听网站目录外的 skill Markdown、token 和截图：Markdown 修改只刷新规范页，token JSON 修改使样式缓存失效并刷新页面。开发时 CSS 和变量表直接从 `tokens.json` 在内存中生成，不写回生成文件；构建仍会检查已提交的 `tokens.css` 和 `tokens.md` 是否同步。共享素材通过 Vite 的文件服务读取，不维护第二份副本。

## 动画与安装器

首页的玻璃顶栏本身是产品列表入口，字标和空白区域均可点击展开菜单，菜单从顶栏左缘开始、宽度为顶栏的一半（窄屏至少 15rem），没有内嵌输入框。首页和规范页右侧均只保留 GitHub、外观两个图标，共用 `base.css` 中的尺寸与间距：图标 18px，桌面点击区域 32px，按钮之间无额外间隔。悬停与按下底色单独绘制为 28px，触屏通过 `pointer: coarse` 将点击区域扩大到 44px，不因窗口变窄而放大按钮。产品条目在 `index.html` 中维护，`product-menu.js` 处理展开、方向键与 Home/End 导航、Esc 返回触发按钮以及移出焦点或点击外部时收起。菜单与顶栏共用玻璃填充、边线和背景模糊；顶栏玻璃单独绘制在伪元素上。桌面行高 32px，触屏通过 `pointer: coarse` 保留至少 44px 点击区域，间距和圆角复用仓库的设计变量。

首页使用浏览器原生 ES 模块，开发时由 Vite 提供热更新，生产构建保持静态文件输出。`meadow.js` 连接浏览器事件和点击；`timeline.js` 管理五个场景和唯一活动时钟（目标每秒 60 帧，容忍正负时间抖动，长帧只绘制最新状态）；`cycle.js` 读取烘焙生成的 `stride.js`，按活动时钟计算固定步频和相邻帧；`stag.js` 负责图集加载、相邻帧混合与点击边界；`scenery.js` 管理场景；`effects.js` 管理点击场景的特效；`color.js` 管理插画色板与上色扩散；`renderer.js` 负责布局、合成和网点／字符输出。

麋鹿在散步。原图是 imagegen 按散步规律画的 8 个姿态（四条腿依次落地，每只蹄子约八分之五的时间着地）。`art/milu/register.py` 量出每张图的位置、统一比例，并按着地蹄子做小的水平微调；`art/milu/bake.py` 离线处理：
- 匹配灰度，移除旧版独立头部对齐；`body.py` 让同一张完整的头、颈、躯干随步态共同起伏与俯仰，腿根随身体运动，着地蹄子保持接地；
- `landmarks.json` 提供蹄子轨迹与校准后的肩、髋连接点，`limbs.py` 修正后腿关节语义并约束骨长；`skin.py` 将身体和近侧两腿作为连续表面一次采样，肩、髋随步态变形，远侧腿从后方遮挡。一个完整左右步取 160 帧，避免半步循环接缝更换腿部身份；
- 套用灰度曲线和细轮廓，打包成两张灰度图集，并实测着地蹄子的后移速度。`bodyMotion` 记录统一运动，禁止后续的躯干单独位移校正抵消这段运动；`footfalls` 驱动仅在落脚时出现、约 0.3 秒内消散的少量沙粒／雪粒。

网站每秒 0.75 个完整左右步循环（步频写在 `drawings.json`，经 `stride.js` 传给页面）。素材按 120 帧/秒采样，网页仍以 60fps 为目标，`poseAt` 按实际时刻在线性相邻样本间取值，避免整帧取整引入的停顿。地面按实测的着地蹄子后移速度（`stride.js` 的 `groundSpeed`，当前约 0.49 场景单位/秒）滚动，远近各层随之放慢；源图落点不均匀，局部仍可能滑动。所有帧共用一个躯干原点和地面线。42 秒走完五个场景。素材和剩余问题见 [art/milu](art/milu/README.md)。

点击鹿不再暂停或改变步态，而是让颜色从点击处向整幅插画扩散：约 0.95 秒铺满，停留 3 秒，再用 1.2 秒淡回黑白。重复点击延长停留，淡出中点击平滑恢复颜色。`stag.js` 按混合后图像的透明度判断轮廓；腿间、鹿角间的空白依然属于场景，保留风、落叶、雪、流星和沙尘点击效果。画布可用 Tab 聚焦，空格／回车触发上色；固定帧和减弱动态效果时直接切换颜色，不播放扩散或场景粒子。

彩色层与黑白层共享场景几何、活动时钟和已混合好的鹿图像，再将原来的网点／字符叠印到颜料上；颜色不重新采样姿态，也不改变场景滚动速度。彩色层只在效果可见时绘制，顶栏继续使用黑白设计变量。网点按五级色阶分组，每级使用遮罩和圆点图案合成。页面预加载两张图集，每张最多尝试 3 次、每次 15 秒超时；加载完成后才开始计时。部分图集失败时用可用帧保持鹿不透明，全部失败时播放背景并显示重试按钮；重试只加载缺失图集，不重置活动时钟。固定帧与减弱动态效果也会在素材就绪后重绘。

`?t=24.5` 固定时刻，`?halftone=0` 查看灰度画面。时间轴、取帧规则、步态贴地与地面速度、轮廓点击分流、上色／褪色与键盘交互在 Node.js 中测试，视觉与真实设备性能另行验证。之前的奔跑版本和撤回的实验见 [整只鹿的奔跑烘焙](reviews/reference/milu-whole-deer-bake.md)、[按真鹿重画](reviews/reference/milu-real-gallop-redraw.md)。

安装器保留一个自包含入口 `packages/style/bin/cli.mjs`，分别处理参数、目录、完整性检查和替换。替换时先准备完整的新目录，再将旧安装移到备份位置；新目录就位失败时恢复备份。内容哈希算法保持兼容，避免整理代码后把旧安装误判为本地修改。

## 改动应该落在哪里

| 想改的内容 | 改哪里 | 之后 |
| --- | --- | --- |
| 颜色、字体、间距、尺寸 | `skills/deernova-style/assets/tokens.json` | `npm run tokens`，检查对比度测试 |
| 原则、文案、玻璃、动效等规则 | `references/foundations.md` | 必要时同步 `SKILL.md` 的核心规则 |
| 某类界面的做法 | `references/patterns.md` | 涉及平台写法时同步 `swiftui.md` 或 `web.md` |
| agent 什么时候读哪份文件 | `SKILL.md` 的「先读什么」 | |
| 首页、规范页的样子 | `apps/website/` | 不需要发布 npm 版本 |
| 首页麋鹿的姿态、节奏、头部处理 | `art/milu/`（原图、`register.py`、`drawings.json`、`bake.py`） | 重新烘焙，运行 `npm test` 并看首页 |
| 安装、更新、备份行为 | `packages/style/bin/cli.mjs` | 运行安装器测试 |

网站是这套规范的一个应用实例。网站上为了展示而做的东西（首页的网点动画和字符转场、页面的分栏线）不是通用规则；需要变成规则时，写进 skill。

## 测试覆盖什么

`npm test` 先构建，再检查：SKILL.md 的 frontmatter；skill 内所有链接和 `assets/` 路径都能找到；skill 只包含 Markdown、token 和截图；`tokens.css`、`tokens.md` 与 `tokens.json` 同步；两套主题的文字和控件对比度；npm 包里的 skill 与源文件逐字节一致；构建不改源文件、网站改动不改变 skill 哈希；网站页面没有遗漏的模板占位符，链接和模块依赖都能找到；安装器的安装、更新、改动保护、备份和参数错误；动画的五个场景交接、烘焙帧与姿态表一致、相邻帧连续过渡、散步帧贴地且地面速度与着地蹄子一致、点鹿后停在警觉姿势且停下起步不打滑不顿挫、图集尺寸与帧位置、不同刷新率及时间戳抖动下的 60 帧调度、暂停恢复、图集失败重试与降级、CSS 热更新后的 Canvas 配色和动画状态。

开发服务测试会在临时副本中启动 Vite，通过 HTTP 与真实 WebSocket 检查 CSS 热更新、HTML／脚本／图片刷新、规范 Markdown 渲染以及 token JSON 联动，并确认服务不写回源文件或生成 `dist/`。

页面的视觉效果、交互和响应式布局需要在浏览器里看。SwiftUI 示例是写法参考，没有在这个仓库里编译。当前验证结果和边界见 [验收记录](reviews/verification.md)。
