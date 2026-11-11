// The Deernova Loaders page, laid out like the Style guide: an overview, one section per loader, and the
// thinking loader settling into its icon. The live <dn-loader> elements are defined by the page script.
const LOADERS = [
  { name: 'thinking', title: '思考', use: 'AI 正在思考：对话末尾的运行状态行。', curve: '三瓣玫瑰线 r = cos 3θ，花瓣加宽（|cos 3θ|^0.6），一个花瓣朝上', lap: '5.2 秒', rest: '落成 <code>thinking</code> 图标，就是「已思考 12 秒」前面那个图标', status: '正在思考' },
  { name: 'working', title: '运行工具', use: 'AI 正在运行工具：对话末尾的运行状态行。', curve: '1:2 利萨如曲线（∞）', lap: '3 秒', rest: '停下后换成这一步的结果', status: '正在运行 命令' },
  { name: 'spinner', title: '普通加载', use: '其他所有加载：按钮里、正在进行的步骤和任务、侧边栏会话、远程搜索、重新连接。', curve: '圆', lap: '0.9 秒（减弱动态效果时 2.4 秒）', rest: '消失', status: '正在保存' }
];

const sizes = name => `<div class="loaders-sizes">${[14, 16, 20, 32, 64].map(size =>
  `<figure><dn-loader name="${name}" style="--loader-size:${size}px"></dn-loader><figcaption>${size}</figcaption></figure>`).join('')}</div>`;

export function renderLoadersPage(thinkingIcon) {
  const nav = ['<a class="toc-top" href="#overview">总览</a>', '<p class="toc-group">动效</p>', '<ol>'];
  const docs = [`<section class="doc doc-overview" id="overview" aria-labelledby="overview-title">
<header class="overview-head"><h1 id="overview-title">Deernova Loaders</h1><p class="lede">一笔单色的线沿着数学曲线走，尾巴逐渐变细，后面是很淡的完整曲线。网格和描边与 Deernova Icons 相同（24×24、1.75），颜色跟随文字。不依赖任何库。</p></header>
<div class="doc-body">
<div class="specimen" data-density="desktop"><div class="loaders-hero">${LOADERS.map(item => `<figure><dn-loader name="${item.name}" style="--loader-size:48px"></dn-loader><figcaption><code>${item.name}</code>${item.title}</figcaption></figure>`).join('')}</div></div>
<h3 id="overview-install">安装</h3>
<pre><code>npm install @deernova/loaders</code></pre>
<h3 id="overview-usage">使用</h3>
<p>定义一次自定义元素，之后直接写标签；加上 <code>done</code> 属性时停下：</p>
<pre><code>import { defineLoaderElement } from '@deernova/loaders';
defineLoaderElement();

&lt;dn-loader name=&quot;thinking&quot;&gt;&lt;/dn-loader&gt;</code></pre>
<p>需要自己控制时用 <code>createLoader(容器, 'thinking')</code>，它返回 <code>stop()</code> 和 <code>destroy()</code>。尺寸默认 <code>icon-size-md</code>，用 <code>--loader-size</code> 改。</p>
<h3 id="overview-choose">选哪个</h3>
<div class="table-wrap"><table><thead><tr><th>名字</th><th>用在</th><th>停下后</th></tr></thead><tbody>
${LOADERS.map(item => `<tr><td><code>${item.name}</code></td><td>${item.use}</td><td>${item.rest}</td></tr>`).join('\n')}
</tbody></table></div>
<p>曲线（<code>thinking</code>、<code>working</code>）只给 AI 的运行状态行，同一屏最多一个；等待用户确认时不放动效。完整规则见 Style 的<a href="guide.html#components-skeleton">加载状态</a>。MIT 许可。</p>
</div>
</section>`];

  for (const item of LOADERS) {
    const id = `loader-${item.name}`;
    nav.push(`<li><a href="#${id}">${item.title}</a></li>`);
    docs.push(`<section class="doc" id="${id}" aria-labelledby="${id}-title">
<header class="doc-head"><h2 id="${id}-title">${item.title}</h2><code class="doc-path">${item.name}</code></header>
<div class="doc-body">
<p>${item.use}</p>
<div class="specimen" data-density="desktop">
${sizes(item.name)}
<div class="loaders-status" role="status"><dn-loader name="${item.name}"></dn-loader>${item.status}</div>
</div>
<ul>
<li><strong>曲线</strong>：${item.curve}。</li>
<li><strong>一圈</strong>：${item.lap}。</li>
<li><strong>停下后</strong>：${item.rest}。</li>
</ul>
</div>
</section>`);
  }

  nav.push('<li><a href="#loader-rest">停下与图标</a></li>', '</ol>');
  docs.push(`<section class="doc" id="loader-rest" aria-labelledby="loader-rest-title">
<header class="doc-head"><h2 id="loader-rest-title">停下与图标</h2><code class="doc-path">stop()</code></header>
<div class="doc-body">
<p>思考结束时调用 <code>stop()</code>：线在 240ms 内补满整条曲线、粗细变均匀，停下来就是 <code>thinking</code> 图标，后面的文字换成「已思考 12 秒」。开启「减弱动态效果」时从头到尾只显示这个图标。</p>
<div class="specimen" data-density="desktop">
<div class="loaders-status" role="status"><span id="thinking-slot"></span><span id="thinking-text">正在思考</span><span class="loaders-status-time" id="thinking-time">0 秒</span></div>
<div class="loaders-controls"><button class="dn-button" type="button" id="finish">思考完成</button><button class="dn-button is-plain" type="button" id="restart">重新开始</button></div>
</div>
<p>图标和动效停下后是同一条线：</p>
<div class="specimen" data-density="desktop"><div class="loaders-pair">
<figure><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true">${thinkingIcon}</svg><figcaption>thinking 图标</figcaption></figure>
<figure><span id="rest-slot"></span><figcaption>thinking 动效停下后</figcaption></figure>
</div></div>
</div>
</section>`);
  return { nav: nav.join('\n'), docs: docs.join('\n') };
}
