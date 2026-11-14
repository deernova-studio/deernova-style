# 整页示例

[总则](../SKILL.md)前六条落到整页上是什么样子。每个例子先给 AI 常做出来的样子，标出它违反了哪几条，再给 Deernova 的样子。「改成」只用规范里的组件；外层的 `ex-` 类只是把例子框成一页，项目里换成自己的页面骨架。

## 例一：笔记应用的首页

不要：

```html
<div class="ex-page" style="display:grid;grid-template-columns:200px 1fr;background:#f8fafc;color:#0f172a;font:13px/1.5 Inter,system-ui,sans-serif">
  <aside style="display:grid;align-content:start;gap:6px;padding:16px;background:linear-gradient(180deg,#eef2ff,#faf5ff);border-right:1px solid #e2e8f0">
    <div style="display:flex;align-items:center;gap:8px;font-weight:700"><span style="display:grid;place-items:center;width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff">✦</span>NoteAI<span style="padding:1px 6px;border-radius:99px;background:#ede9fe;color:#7c3aed;font-size:10px">BETA</span></div>
    <button type="button" style="margin:10px 0;padding:8px;border:0;border-radius:10px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;font-weight:600;box-shadow:0 4px 14px #a855f755">✨ 新建 AI 笔记</button>
    <span style="font-size:10px;font-weight:600;letter-spacing:.08em;color:#94a3b8">导航</span>
    <span>🏠 首页</span><span>📝 我的笔记</span><span>⭐ 收藏</span><span>🤖 AI 助手 <b style="padding:1px 6px;border-radius:99px;background:#dcfce7;color:#16a34a;font-size:10px">NEW</b></span>
  </aside>
  <main style="padding:20px 24px;overflow:hidden">
    <span style="font-size:10px;font-weight:600;letter-spacing:.1em;color:#6366f1">DASHBOARD</span>
    <h2 style="margin:2px 0;font-size:22px;font-weight:800">欢迎回来，林一 👋</h2>
    <p style="margin:0 0 14px;color:#64748b">今天也是充满创造力的一天！AI 已经为你整理好了所有笔记。</p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
      <div style="padding:10px 12px;border-radius:12px;background:#fff;box-shadow:0 2px 8px #0f172a14"><span style="color:#64748b;font-size:11px">笔记总数</span><br><b style="font-size:18px">128</b> <span style="color:#16a34a;font-size:11px">↑ 12%</span></div>
      <div style="padding:10px 12px;border-radius:12px;background:#fff;box-shadow:0 2px 8px #0f172a14"><span style="color:#64748b;font-size:11px">本周新增</span><br><b style="font-size:18px">14</b> <span style="color:#16a34a;font-size:11px">↑ 8%</span></div>
      <div style="padding:10px 12px;border-radius:12px;background:#fff;box-shadow:0 2px 8px #0f172a14"><span style="color:#64748b;font-size:11px">AI 摘要</span><br><b style="font-size:18px">36</b></div>
      <div style="padding:10px 12px;border-radius:12px;background:#fff;box-shadow:0 2px 8px #0f172a14"><span style="color:#64748b;font-size:11px">节省时间</span><br><b style="font-size:18px">5.2h</b></div>
    </div>
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px"><b style="margin-right:auto">📚 最近笔记</b><span style="padding:4px 8px;border:1px solid #e2e8f0;border-radius:8px">🔍 搜索</span><span style="padding:4px 8px;border:1px solid #e2e8f0;border-radius:8px">筛选 ▾</span><span style="padding:4px 8px;border:1px solid #e2e8f0;border-radius:8px">排序 ▾</span><span style="padding:4px 8px;border-radius:8px;background:#6366f1;color:#fff">+ 新建</span></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
      <div style="padding:12px;border-radius:12px;background:#fff;box-shadow:0 2px 8px #0f172a14"><span style="display:inline-grid;place-items:center;width:26px;height:26px;border-radius:8px;background:#e0e7ff">📄</span> <b>设计周会纪要</b><p style="margin:6px 0;color:#64748b;font-size:12px">本次会议主要讨论了首页改版的方向，确定了下一步的分工……</p><span style="padding:1px 6px;border-radius:99px;background:#f3e8ff;color:#9333ea;font-size:10px">AI 生成</span> <span style="color:#6366f1;font-size:12px">查看详情 →</span></div>
      <div style="padding:12px;border-radius:12px;background:#fff;box-shadow:0 2px 8px #0f172a14"><span style="display:inline-grid;place-items:center;width:26px;height:26px;border-radius:8px;background:#dcfce7">📗</span> <b>读书笔记</b><p style="margin:6px 0;color:#64748b;font-size:12px">这本书讲述了设计的本质，作者认为设计不是……</p><span style="padding:1px 6px;border-radius:99px;background:#dcfce7;color:#16a34a;font-size:10px">已完成</span> <span style="color:#6366f1;font-size:12px">查看详情 →</span></div>
      <div style="padding:12px;border-radius:12px;background:#fff;box-shadow:0 2px 8px #0f172a14"><span style="display:inline-grid;place-items:center;width:26px;height:26px;border-radius:8px;background:#fef3c7">💡</span> <b>灵感收集</b><p style="margin:6px 0;color:#64748b;font-size:12px">一些关于产品的随想和灵感，随时记录下来……</p><span style="padding:1px 6px;border-radius:99px;background:#fef3c7;color:#d97706;font-size:10px">草稿</span> <span style="color:#6366f1;font-size:12px">查看详情 →</span></div>
    </div>
  </main>
</div>
```

问题：

- **少写字**：「DASHBOARD」眉标、欢迎语、一句口号、侧边栏的「导航」小字、每张卡片两行摘要和「查看详情 →」。
- **只有纸、墨和线**：渐变侧边栏和按钮、彩色图标底块、emoji 当图标、BETA 和 NEW 徽标、卡片阴影，一屏五种颜色。
- **应用是工具**：首屏一半是欢迎语和统计卡片，笔记只露出三条；「节省时间 5.2h」是凑出来的数字。
- **每个控件都要干活**：「新建」出现两次；三条笔记配了搜索、筛选和排序；「AI 助手」和「首页」说不清和笔记是什么关系。

改成：

```html
<div class="dn-app ex-page">
  <nav class="dn-sidebar" aria-label="侧边栏">
    <div class="dn-sidebar-section">
      <a class="dn-sidebar-item" href="#"><svg class="dn-icon" aria-hidden="true"><use href="#dn-search"/></svg><span class="dn-sidebar-label">搜索</span><span class="dn-sidebar-count">⌘K</span></a>
      <a class="dn-sidebar-item" href="#" aria-current="page"><svg class="dn-icon" aria-hidden="true"><use href="#dn-document"/></svg><span class="dn-sidebar-label">全部笔记</span><span class="dn-sidebar-count">128</span></a>
      <a class="dn-sidebar-item" href="#"><svg class="dn-icon" aria-hidden="true"><use href="#dn-star"/></svg><span class="dn-sidebar-label">收藏</span><span class="dn-sidebar-count">24</span></a>
    </div>
    <details class="dn-sidebar-group" open>
      <summary class="dn-sidebar-heading">文件夹<svg class="dn-icon" aria-hidden="true"><use href="#dn-chevron-down"/></svg></summary>
      <a class="dn-sidebar-item" href="#"><span class="dn-sidebar-label">工作</span><span class="dn-sidebar-count">64</span></a>
      <a class="dn-sidebar-item" href="#"><span class="dn-sidebar-label">读书</span><span class="dn-sidebar-count">23</span></a>
      <a class="dn-sidebar-item" href="#"><span class="dn-sidebar-label">生活</span><span class="dn-sidebar-count">41</span></a>
    </details>
  </nav>
  <div class="dn-app-main">
    <header class="dn-toolbar">
      <h2 class="dn-toolbar-title"><span>全部笔记</span></h2>
      <div class="dn-toolbar-actions">
        <button class="dn-icon-button" type="button" aria-label="新建笔记"><svg class="dn-icon" aria-hidden="true"><use href="#dn-plus"/></svg></button>
      </div>
    </header>
    <div class="dn-app-content">
      <ul class="dn-list">
        <li class="dn-list-row">首页改版：第二轮反馈<span class="dn-list-value">14:03</span></li>
        <li class="dn-list-row">设计周会纪要<span class="dn-list-value">周三</span></li>
        <li class="dn-list-row">读书笔记：《设计中的设计》<span class="dn-list-value">11月8日</span></li>
        <li class="dn-list-row">给 Deernova 官网的三条修改意见<span class="dn-list-value">11月6日</span></li>
        <li class="dn-list-row">灵感<span class="dn-list-value">11月2日</span></li>
        <li class="dn-list-row">杭州周末去哪儿<span class="dn-list-value">10月30日</span></li>
      </ul>
    </div>
  </div>
</div>
```

打开就是笔记本身。数量放在侧边栏的计数里，不单独做统计卡片；新建只有顶栏一个，加 ⌘N；128 条笔记的搜索放在侧边栏，用 ⌘K 打开。

## 例二：AI 对话

不要：

```html
<div class="ex-page" style="display:grid;grid-template-rows:auto 1fr auto;background:#fff;color:#0f172a;font:13px/1.6 Inter,system-ui,sans-serif">
  <header style="display:flex;align-items:center;gap:8px;padding:10px 16px;border-bottom:1px solid #e2e8f0"><span style="display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#06b6d4,#8b5cf6);color:#fff">✨</span><b>AI 智能助手</b><span style="padding:1px 6px;border-radius:99px;background:#ecfeff;color:#0891b2;font-size:10px">GPT 驱动</span><span style="margin-left:auto;color:#22c55e;font-size:11px">● 在线</span></header>
  <main style="display:grid;align-content:start;gap:10px;padding:14px 20px;overflow:hidden">
    <div style="justify-self:end;padding:8px 12px;border-radius:14px 14px 2px 14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff">帮我总结一下这周的周报草稿</div>
    <div style="padding:10px 12px;border:1px solid #c7d2fe;border-radius:12px;background:#eef2ff"><b style="color:#4f46e5">🔧 正在调用工具：read_file</b><div style="height:6px;margin:6px 0;border-radius:3px;background:linear-gradient(90deg,#6366f1 80%,#e0e7ff 0)"></div><span style="color:#64748b;font-size:11px">AI 正在努力为你分析文件内容，请稍候……</span></div>
    <div style="padding:12px;border-radius:12px;background:#f8fafc;box-shadow:0 1px 4px #0f172a14">🎉 <b>好的！我已经为你完成了周报的总结！</b><br>📌 <b>要点一：</b>首页改版进入第二轮<br>📌 <b>要点二：</b>修复了 3 个线上问题<br>📌 <b>要点三：</b>下周开始做设置页<br><span style="color:#64748b">希望这对你有帮助！如果还有其他问题，随时问我哦～ 😊</span></div>
    <div style="display:flex;gap:6px;color:#64748b;font-size:11px"><span style="padding:3px 8px;border:1px solid #e2e8f0;border-radius:99px">📋 复制</span><span style="padding:3px 8px;border:1px solid #e2e8f0;border-radius:99px">👍 有用</span><span style="padding:3px 8px;border:1px solid #e2e8f0;border-radius:99px">👎 没用</span><span style="padding:3px 8px;border:1px solid #e2e8f0;border-radius:99px">🔄 重新生成</span><span style="padding:3px 8px;border:1px solid #e2e8f0;border-radius:99px">📤 分享</span></div>
  </main>
  <footer style="padding:10px 16px;border-top:1px solid #e2e8f0"><div style="display:flex;gap:8px;padding:8px 10px;border:2px solid #a5b4fc;border-radius:14px"><span style="color:#94a3b8;flex:1">✍️ 在这里输入你的问题，按 Enter 发送，Shift+Enter 换行……</span><span style="padding:2px 10px;border-radius:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff">发送 🚀</span></div><p style="margin:6px 0 0;color:#94a3b8;font-size:10px;text-align:center">⚠️ AI 生成的内容可能不准确，请仔细甄别。本服务由先进的大语言模型驱动，持续为你提供智能支持。</p></footer>
</div>
```

问题：

- **少写字**：「在线」、「GPT 驱动」、「AI 正在努力为你分析」、回答开头的「好的！」和结尾的客套、输入框里的使用说明、两句免责声明。
- **只有纸、墨和线**：渐变头像、渐变气泡、彩色的工具调用卡片、emoji 当小标题、进度条。
- **每个控件都要干活**：五个胶囊按钮常驻在每条回答下面；「发送 🚀」占了文字的位置。
- **安静**：🎉 和「已经为你完成了」在庆祝一件普通的事。

改成：

```html
<div class="dn-app ex-page">
  <div class="dn-app-main">
    <header class="dn-toolbar">
      <button class="dn-toolbar-title" type="button"><span>本周周报</span><svg class="dn-icon" aria-hidden="true"><use href="#dn-chevron-down"/></svg></button>
      <div class="dn-toolbar-actions">
        <button class="dn-icon-button" type="button" aria-label="分享"><svg class="dn-icon" aria-hidden="true"><use href="#dn-share"/></svg></button>
      </div>
    </header>
    <div class="dn-app-content">
      <div class="dn-column dn-thread">
        <div class="dn-message-user">帮我把这周的周报草稿总结成三条</div>
        <details class="dn-activity">
          <summary><svg class="dn-icon" aria-hidden="true"><use href="#dn-tool"/></svg>已读取 1 个文件<svg class="dn-icon" aria-hidden="true"><use href="#dn-chevron-right"/></svg></summary>
        </details>
        <div class="dn-message-assistant">
          <ol>
            <li>首页改版进入第二轮，反馈集中在导航层级。</li>
            <li>修复了 3 个线上问题，其中支付超时已经上线验证。</li>
            <li>下周开始做设置页，先出交互稿。</li>
          </ol>
        </div>
      </div>
    </div>
    <div class="dn-column ex-dock">
      <div class="dn-composer">
        <button class="dn-icon-button" type="button" aria-label="添加" aria-haspopup="menu"><svg class="dn-icon" aria-hidden="true"><use href="#dn-plus"/></svg></button>
        <textarea rows="1" aria-label="消息"></textarea>
        <button class="dn-send" type="button" aria-label="发送" disabled><svg class="dn-icon" aria-hidden="true"><use href="#dn-send"/></svg></button>
      </div>
    </div>
  </div>
</div>
```

回答就是三条要点，不寒暄。读文件的过程收成一行灰字，点开再看。复制、重新生成这些操作在悬停回答时才出现；免责提示只在输入框下方的信息行出现一次，见 [Composer](components/composer.md)。

## 例三：设置页

不要：

```html
<div class="ex-page" style="padding:20px 28px;background:#f8fafc;color:#0f172a;font:13px/1.5 Inter,system-ui,sans-serif;overflow:hidden">
  <div style="text-align:center;margin-bottom:16px"><span style="font-size:10px;font-weight:600;letter-spacing:.1em;color:#6366f1">SETTINGS</span><h2 style="margin:2px 0;font-size:22px;font-weight:800">⚙️ 个性化你的体验</h2><p style="margin:0;color:#64748b">在这里管理你的账户、通知和偏好设置，打造专属于你的工作空间。</p></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div style="padding:14px;border-radius:14px;background:#fff;box-shadow:0 2px 10px #0f172a14"><span style="display:inline-grid;place-items:center;width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff">👤</span><b style="display:block;margin:8px 0 2px">账户信息</b><p style="margin:0 0 10px;color:#64748b;font-size:12px">管理你的个人资料、头像和账户安全设置。</p><div style="padding:8px;border-radius:8px;background:#f1f5f9;text-align:center;color:#6366f1">前往设置 →</div></div>
    <div style="padding:14px;border-radius:14px;background:#fff;box-shadow:0 2px 10px #0f172a14"><span style="display:inline-grid;place-items:center;width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff">🔔</span><b style="display:block;margin:8px 0 2px">通知偏好</b><p style="margin:0 0 10px;color:#64748b;font-size:12px">选择你希望接收的通知类型和频率。</p><div style="padding:8px;border-radius:8px;background:#f1f5f9;text-align:center;color:#6366f1">前往设置 →</div></div>
    <div style="padding:14px;border-radius:14px;background:#fff;box-shadow:0 2px 10px #0f172a14"><b>☁️ iCloud 同步</b> <span style="float:right;width:34px;height:20px;border-radius:99px;background:#6366f1"></span><p style="margin:4px 0 0;color:#64748b;font-size:12px">开启此选项可以在你的所有设备之间无缝同步笔记，让你随时随地访问。</p></div>
    <div style="padding:14px;border-radius:14px;background:#fff;box-shadow:0 2px 10px #0f172a14"><b>🌐 语言</b> <span style="float:right;color:#94a3b8">即将推出</span><p style="margin:4px 0 0;color:#64748b;font-size:12px">更多语言支持正在开发中，敬请期待！</p></div>
  </div>
  <div style="margin-top:14px;text-align:center"><span style="padding:8px 28px;border-radius:99px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;font-weight:600">💾 保存所有设置</span></div>
</div>
```

问题：

- **少写字**：眉标、标题里的 emoji、一句口号、每张卡片一句介绍、开关下面的功能介绍。
- **只有纸、墨和线**：渐变图标底块、卡片阴影、卡片里再套一个灰框。
- **应用是工具**：居中的大标题和 44 高的胶囊按钮是官网的尺寸。
- **每个控件都要干活**：「语言」还没做却先放了出来；开关已经生效，还要再点一次「保存所有设置」。

改成：

```html
<div class="dn-app ex-page">
  <div class="dn-app-main">
    <header class="dn-toolbar"><h2 class="dn-toolbar-title"><span>设置</span></h2></header>
    <div class="dn-app-content ex-narrow">
      <section class="dn-list-section">
        <ul class="dn-list">
          <li class="dn-list-row">账户<span class="dn-list-value">林一</span><svg class="dn-icon dn-chevron" aria-hidden="true"><use href="#dn-chevron-right"/></svg></li>
          <li class="dn-list-row">通知<svg class="dn-icon dn-chevron" aria-hidden="true"><use href="#dn-chevron-right"/></svg></li>
          <li class="dn-list-row">外观<span class="dn-list-value">跟随系统</span><svg class="dn-icon dn-chevron" aria-hidden="true"><use href="#dn-chevron-right"/></svg></li>
        </ul>
      </section>
      <section class="dn-list-section">
        <ul class="dn-list">
          <li class="dn-list-row"><label for="ex-sync">iCloud 同步</label><input class="dn-switch" id="ex-sync" type="checkbox" role="switch" checked></li>
        </ul>
        <p class="dn-list-footer">关闭后，新笔记只保存在这台设备上。</p>
      </section>
    </div>
  </div>
</div>
```

分组列表，行与行之间一条细线。只有 iCloud 同步会带来后果，所以只有它有一句说明。开关切换即生效，没有保存按钮。

## 例四：官网首页

官网可以舒展，但同样不堆东西。

不要：

```html
<div class="ex-page" style="display:grid;align-content:start;justify-items:center;gap:12px;padding:28px;background:radial-gradient(circle at 50% 0,#ede9fe,#fff 60%);color:#0f172a;font:14px/1.6 Inter,system-ui,sans-serif;text-align:center;overflow:hidden">
  <span style="padding:3px 12px;border:1px solid #c4b5fd;border-radius:99px;background:#f5f3ff;color:#7c3aed;font-size:11px">✨ 全新 AI 驱动 · 立即体验 →</span>
  <h2 style="margin:0;font-size:34px;line-height:1.15;font-weight:800;background:linear-gradient(90deg,#6366f1,#ec4899);-webkit-background-clip:text;background-clip:text;color:transparent">重新定义你的<br>笔记体验</h2>
  <p style="max-width:460px;margin:0;color:#64748b">一站式智能笔记平台，借助先进的 AI 技术，无缝连接你的灵感、知识与团队，让创造力自由流动。</p>
  <div style="display:flex;gap:8px"><span style="padding:9px 18px;border-radius:99px;background:#0f172a;color:#fff">免费开始使用</span><span style="padding:9px 18px;border:1px solid #e2e8f0;border-radius:99px">了解更多</span><span style="padding:9px 18px;color:#6366f1">观看演示 ▶</span></div>
  <div style="display:flex;gap:28px;margin-top:6px"><span><b style="font-size:20px">10K+</b><br><small style="color:#64748b">活跃用户</small></span><span><b style="font-size:20px">99.9%</b><br><small style="color:#64748b">可用性</small></span><span><b style="font-size:20px">4.9★</b><br><small style="color:#64748b">用户评分</small></span></div>
  <span style="font-size:10px;letter-spacing:.12em;color:#94a3b8">深受全球团队信赖</span>
  <div style="display:flex;gap:24px;color:#cbd5e1;font-weight:700">ACME · Globex · Initech · Umbrella</div>
</div>
```

问题：

- **少写字**：标题上方的胶囊，「重新定义」「一站式」「无缝」，编造的用户数、可用率、评分和客户标志。
- **只有纸、墨和线**：渐变背景、渐变文字、紫色强调。
- **每个控件都要干活**：三个按钮，「免费开始使用」「了解更多」都说不清点了去哪。

改成：

```html
<div class="ex-page ex-site" data-density="comfortable">
  <h2 class="ex-site-title">把想法写下来，<br>它会自己长成文档。</h2>
  <p class="ex-site-lede">Deernova 笔记在你写的时候整理结构，在你需要的时候找到它。</p>
  <div class="dn-row">
    <button class="dn-button is-primary is-lg" type="button">下载 Mac 版</button>
    <button class="dn-button is-lg" type="button">在浏览器中使用</button>
  </div>
</div>
```

一个衬线标题说清它做什么，一句话补充，两个具体的按钮。下面接真实的产品截图，不放凑出来的数字，见 [官网与文档](scenes/web-marketing.md)。

## 每种情况都有样子

上面每个「改成」都只画了有内容的样子。真实页面还要画这些情况，以例一的笔记列表为例：

| 情况 | 样子 |
| --- | --- |
| 没有笔记 | [空状态](components/empty-state.md)：「还没有笔记」、一句话、「新建笔记」 |
| 加载中 | 和列表同样行高的[骨架](components/skeleton.md)，加载完位置不跳 |
| 加载失败 | 列表位置一行「笔记没有加载出来」加「重试」，侧边栏和顶栏照常 |
| 没有权限 | 「这个文件夹属于设计组」，给「申请访问」 |
| 离线 | 显示已缓存的笔记，顶部一条全局状态 |
| 超长标题 | 一行截断，悬停显示全文 |
| 上千条 | 滚动不卡，按时间分组 |

示例内容也要像真的：长短不一的标题、分散的日期、真实感的名字，不用「张三」和「测试笔记 1、2、3」。
