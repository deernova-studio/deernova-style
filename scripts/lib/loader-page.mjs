// The Deernova Loaders section of the Style guide: the three loaders, install, which to use, sizes, and the
// thinking loader settling into its icon. The live <dn-loader> elements are defined by the page script.
const LOADERS = [
  { name: 'thinking', title: '思考', use: 'AI 正在思考：对话末尾的运行状态行。', curve: '三瓣玫瑰线 r = cos 3θ，花瓣加宽（|cos 3θ|^0.6），一个花瓣朝上', lap: '5.2 秒', rest: '落成 <code>thinking</code> 图标，就是「已思考 12 秒」前面那个图标', status: '正在思考' },
  { name: 'working', title: '运行工具', use: 'AI 正在运行工具：对话末尾的运行状态行。', curve: '1:2 利萨如曲线（∞）', lap: '3 秒', rest: '停下后换成这一步的结果', status: '正在运行 命令' },
  { name: 'spinner', title: '普通加载', use: '其他所有加载：按钮里、正在进行的步骤和任务、侧边栏会话、远程搜索、重新连接。', curve: '圆', lap: '0.9 秒（减弱动态效果时 2.4 秒）', rest: '消失', status: '正在保存' }
];

const sizes = name => `<div class="loaders-sizes">${[14, 16, 20, 32, 64].map(size =>
  `<figure><dn-loader name="${name}" style="--loader-size:${size}px"></dn-loader><figcaption>${size}</figcaption></figure>`).join('')}</div>`;

export function renderLoadersDoc(thinkingIcon, mark) {
  return `<section class="doc doc-package" id="package-loaders" aria-labelledby="package-loaders-title">
<header class="doc-head">${mark}<h2 id="package-loaders-title">Deernova Loaders</h2><code class="doc-path">@deernova/icons/loaders</code></header>
<div class="doc-body">
<p class="lede">一笔单色的线沿着数学曲线走，尾巴逐渐变细，后面是很淡的完整曲线。网格和描边与 Deernova Icons 相同（24×24、1.75），颜色跟随文字，不依赖任何库。它是 Deernova Icons 的一部分。什么时候用哪个见<a href="#components-skeleton">加载状态</a>。</p>
<div class="specimen" data-density="desktop"><div class="loaders-hero">${LOADERS.map(item => `<figure><dn-loader name="${item.name}" style="--loader-size:48px"></dn-loader><figcaption><code>${item.name}</code>${item.title}</figcaption></figure>`).join('')}</div></div>
<h3 id="package-loaders-install">安装和使用</h3>
<p>加载动效在图标包里，装了 <code>@deernova/icons</code> 就有：</p>
<pre><code>npm install @deernova/icons</code></pre>
<p>定义一次自定义元素，之后直接写标签；加上 <code>done</code> 属性时停下。需要自己控制时用 <code>createLoader(容器, 'thinking')</code>，它返回 <code>stop()</code> 和 <code>destroy()</code>；尺寸默认 <code>icon-size-md</code>，用 <code>--loader-size</code> 改。</p>
<pre><code>import { defineLoaderElement } from '@deernova/icons/loaders';
defineLoaderElement();

&lt;dn-loader name=&quot;thinking&quot;&gt;&lt;/dn-loader&gt;</code></pre>
<h3 id="package-loaders-choose">选哪个</h3>
<div class="table-wrap"><table><thead><tr><th>名字</th><th>用在</th><th>曲线</th><th>一圈</th><th>停下后</th></tr></thead><tbody>
${LOADERS.map(item => `<tr><td><code>${item.name}</code></td><td>${item.use}</td><td>${item.curve}</td><td>${item.lap}</td><td>${item.rest}</td></tr>`).join('\n')}
</tbody></table></div>
${LOADERS.map(item => `<h3 id="package-loaders-${item.name}">${item.title}</h3>
<div class="specimen" data-density="desktop">${sizes(item.name)}<div class="loaders-status" role="status"><dn-loader name="${item.name}"></dn-loader>${item.status}</div></div>`).join('\n')}
<h3 id="package-loaders-rest">停下与图标</h3>
<p>思考结束时调用 <code>stop()</code>：线在 240ms 内补满整条曲线、粗细变均匀，停下来就是 <code>thinking</code> 图标，后面的文字换成「已思考 12 秒」。开启「减弱动态效果」时从头到尾只显示这个图标。</p>
<div class="specimen" data-density="desktop">
<div class="loaders-status" role="status"><span class="loaders-slot" id="thinking-slot"></span><span id="thinking-text">正在思考</span><span class="loaders-status-time" id="thinking-time">0 秒</span></div>
<div class="loaders-controls"><button class="dn-button" type="button" id="thinking-finish">思考完成</button><button class="dn-button is-plain" type="button" id="thinking-restart">重新开始</button></div>
<div class="loaders-pair">
<figure><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true">${thinkingIcon}</svg><figcaption>thinking 图标</figcaption></figure>
<figure><span class="loaders-slot" id="rest-slot"></span><figcaption>thinking 动效停下后</figcaption></figure>
</div>
</div>
<p class="doc-credit">「让线沿数学曲线走」的思路受 <a href="https://github.com/Paidax01/math-curve-loaders" target="_blank" rel="noopener noreferrer">Paidax01/math-curve-loaders</a> 启发；曲线参数、单笔变细的画法和代码都是 Deernova 独立实现的。MIT 许可。</p>
</div>
</section>`;
}
