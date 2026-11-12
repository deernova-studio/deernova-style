import { escape } from './files.mjs';
import { readIcons } from '../icons.mjs';

// The Deernova Icons section of the Style guide: what the set is, an app put together from it, install, and every icon by group.
const use = (name, size) => `<svg class="dn-icon"${size ? ` style="width:${size}px;height:${size}px"` : ''} aria-hidden="true"><use href="#dn-${name}"/></svg>`;
const button = (name, label) => `<button class="dn-icon-button" type="button" aria-label="${label}">${use(name)}</button>`;

export async function renderIconsDoc(root, mark) {
  const { manifest, icons } = await readIcons(root);
  return `<section class="doc doc-package" id="package-icons" aria-labelledby="package-icons-title">
<header class="doc-head">${mark}<h2 id="package-icons-title">Deernova Icons</h2><code class="doc-path">@deernova/icons</code></header>
<div class="doc-body">
<p class="lede">AI 应用常用的 ${icons.length} 个线性图标，基于 Lucide，按 Deernova 的线条统一：${manifest.grid}×${manifest.grid} 网格、${manifest.stroke} 描边、圆头圆角、无填充，颜色跟随文字。每个图标对应的 SF Symbol 和使用规则见<a href="#foundations-iconography">图标</a>。</p>
<div class="specimen" data-density="desktop"><div class="icons-context">
  <nav class="icons-sidebar" aria-label="示例侧边栏">
    <div class="icons-row">${button('sidebar', '收起侧边栏')}<span class="icons-spacer"></span>${button('search', '搜索')}${button('new-chat', '新对话')}</div>
    <a class="icons-nav is-current">${use('home')}首页</a><a class="icons-nav">${use('folder')}项目</a><a class="icons-nav">${use('history')}最近</a><a class="icons-nav">${use('settings')}设置</a>
  </nav>
  <div class="icons-main">
    <div class="icons-step">${use('thinking')}已思考 12 秒${use('chevron-right', 14)}</div>
    <div class="icons-step">${use('tool')}已运行 2 个命令，已读取 1 个文件${use('chevron-down', 14)}</div>
    <div class="icons-actions">${[['copy', '复制'], ['thumbs-up', '赞'], ['thumbs-down', '踩'], ['regenerate', '重新生成'], ['branch', '分支'], ['share', '分享']].map(([name, label]) => button(name, label)).join('')}</div>
    <div class="icons-composer"><span class="icons-composer-text">描述你要做的事，输入 @ 引用文件，/ 使用命令</span>
      <div class="icons-row">${[['plus', '添加'], ['attach', '附件'], ['mention', '提及'], ['command', '命令'], ['web', '联网搜索']].map(([name, label]) => button(name, label)).join('')}<span class="icons-spacer"></span>${button('voice', '语音')}<button class="icons-send" type="button" aria-label="发送">${use('send')}</button></div>
    </div>
  </div>
</div></div>
<h3 id="package-icons-install">安装和使用</h3>
<pre><code>npm install @deernova/icons</code></pre>
<p>用 <code>svg()</code> 生成一个内联图标；只有图标的按钮给一个 <code>label</code>，旁边有文字时不给：</p>
<pre><code>import { svg } from '@deernova/icons';
button.innerHTML = svg('send', { label: '发送' });</code></pre>
<p>页面里图标多时，内联一次 <code>@deernova/icons/sprite.svg</code>，再按名字引用：</p>
<pre><code>&lt;svg class=&quot;dn-icon&quot; aria-hidden=&quot;true&quot;&gt;&lt;use href=&quot;#dn-send&quot;/&gt;&lt;/svg&gt;</code></pre>
${manifest.groups.map(group => `<h3 id="package-icons-${group.id}">${escape(group.title)}</h3>
<ul class="icon-grid">${group.icons.map(icon =>
    `<li>${use(icon.name)}<code>${icon.name}</code><span>${escape(icon.label)}</span></li>`).join('')}</ul>`).join('\n')}
</div>
</section>`;
}
