# 首页麋鹿与导航调整

这是 `ac22c58` 的历史方案。用户随后确认了 imagegen 的侧面奔跑图，当前造型和动作见 [按确认图重做的方案](2026-11-02-reference-gallop-design.md)。

## 目标

让麋鹿成为首页的视觉中心：改善动物轮廓，移除底部介绍卡片，增加顶部导航左右留白。在 `codex/refine-homepage-deer` 分支完成。

## 造型依据

- [法国国家自然历史博物馆：Père David’s deer](https://www.mnhn.fr/en/pere-david-s-deer)：长脸、后掠鹿角和长尾等特征。
- [Lincoln Park Zoo：Père David’s Deer](https://www.lpzoo.org/animals/pere-davids-deer/)：[头颈和鹿角照片](https://www.lpzoo.org/wp-content/uploads/2022/12/davidtrial.png)。
- [Wikimedia Commons：Elaphurus davidianus 001](https://commons.wikimedia.org/wiki/File:Elaphurus_davidianus_001.jpg)：身体、四肢与长尾的比例参考。

照片仅作观察参考；页面中的动物仍由 Canvas 路径绘制，不引入照片素材。

## 设计决定

- 头部加长，颈部抬高，肩胸和腹线用连续曲线连接。腿部调整长度与粗细，保留现有周期性的奔跑骨架。
- 鹿角向后展开，分叉之间留出负空间。两侧鹿角用不同的投影角度区分，避免重合成一根竖直的轮廓。
- 耳朵改为尖端收拢的叶形，尾巴加长并随步态轻摆。
- 保留全屏网点画面与字符转场，首页只留下顶部导航。页面标题保留为供辅助技术读取的隐藏标题。
- 桌面导航左右留白为 `clamp(32px, 6vw, 96px)`，顶部 24px，内部左右 32px；手机两侧与顶部均为 16px，压缩导航项间距以兼容 320px 宽度。

## 沿用的视觉基础

- 纸面 `#f5f5f5`、墨色 `#171717`；深色背景 `#101010`、浅色网点 `#e6e6e6`；动物离屏绘制使用白色 `#ffffff`。
- 品牌字标沿用系统衬线字体，导航沿用系统无衬线，转场字符沿用等宽字体。
- 30 秒草原／森林／星空顺序、主题切换和减少动态效果处理沿用现有实现。

## 验收

运行现有构建和测试；检查草原、森林、星空及奔跑中的多个姿态，检查深浅主题；在 320、375、768、1440px 宽度检查导航与画面。当前结果与截图见 [验收记录](../../reviews/verification.md)。
