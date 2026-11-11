import { escape } from './files.mjs';
import { lucideBody, readIcons } from '../icons.mjs';

// The icon review page: every icon by group, the three sizes side by side, and each redrawn icon next to
// the Lucide original it replaces.
const SOURCE = { lucide: 'Lucide', redrawn: '重画', deernova: '自有' };
const draw = (body, size) => `<svg class="dn-icon" style="width:${size}px;height:${size}px" viewBox="0 0 24 24" aria-hidden="true">${body.join('')}</svg>`;

export async function renderIconSummary(root) {
  const { manifest, icons } = await readIcons(root);
  const count = source => icons.filter(icon => icon.source === source).length;
  return `<p class="icons-summary">${icons.length} 个图标：Lucide ${count('lucide')} 个（描边统一调成 ${manifest.stroke}），重画 ${count('redrawn')} 个，自有 ${count('deernova')} 个。网格 ${manifest.grid}×${manifest.grid}，圆头圆角，无填充，颜色跟随文字。</p>`;
}

export async function renderIconCatalog(root) {
  const { manifest, icons } = await readIcons(root);
  const out = [];

  for (const group of manifest.groups) {
    out.push(`<section class="icons-group" id="group-${group.id}"><h2>${escape(group.title)}</h2><ul class="icons-grid">`);
    for (const icon of icons.filter(item => item.group === group.id)) {
      out.push(`<li class="icons-tile" data-source="${icon.source}"><span class="icons-glyph">${draw(icon.body, 24)}</span><span class="icons-name">${icon.name}</span><span class="icons-label">${escape(icon.label)}</span>${icon.source === 'lucide' ? '' : `<span class="icons-source">${SOURCE[icon.source]}</span>`}</li>`);
    }
    out.push('</ul></section>');
  }

  out.push('<section class="icons-group" id="sizes"><h2>三个尺寸</h2><p class="icons-note">按桌面密度的 <code>icon-size-sm / md / lg</code>（14、16、20），和旁边的文字放在一起看粗细。</p>');
  for (const size of [14, 16, 20]) {
    out.push(`<div class="icons-strip"><span class="icons-strip-label">${size}px</span><span class="icons-strip-row">${icons.map(icon => `<span title="${icon.name}">${draw(icon.body, size)}</span>`).join('')}</span></div>`);
  }
  out.push('</section>');

  out.push('<section class="icons-group" id="compare"><h2>重画前后</h2><p class="icons-note">左边是 Lucide 原图（同样调成 1.75 描边），右边是 Deernova 版本，分别在 16px 和 32px 下。</p><div class="icons-compare">');
  for (const icon of icons.filter(item => item.source === 'redrawn')) {
    // Lucide is a dev dependency of this repository, so the originals come from here even when building elsewhere.
    const before = await lucideBody(icon.lucide);
    out.push(`<div class="icons-pair"><span class="icons-pair-name">${icon.name}</span><span class="icons-pair-cell">${draw(before, 16)}${draw(before, 32)}<em>Lucide</em></span><span class="icons-pair-cell is-ours">${draw(icon.body, 16)}${draw(icon.body, 32)}<em>Deernova</em></span></div>`);
  }
  out.push('</div></section>');

  const pick = name => icons.find(icon => icon.name === name).body;
  out.push(`<section class="icons-group" id="context"><h2>放进界面里</h2>
<div class="icons-context">
  <nav class="icons-sidebar" aria-label="示例侧边栏">
    <div class="icons-row"><button class="dn-icon-button" type="button" aria-label="收起侧边栏">${draw(pick('sidebar'), 16)}</button><span class="icons-spacer"></span><button class="dn-icon-button" type="button" aria-label="搜索">${draw(pick('search'), 16)}</button><button class="dn-icon-button" type="button" aria-label="新对话">${draw(pick('new-chat'), 16)}</button></div>
    <a class="icons-nav">${draw(pick('home'), 16)}首页</a>
    <a class="icons-nav">${draw(pick('folder'), 16)}项目</a>
    <a class="icons-nav">${draw(pick('history'), 16)}最近</a>
    <a class="icons-nav">${draw(pick('settings'), 16)}设置</a>
  </nav>
  <div class="icons-main">
    <div class="icons-step">${draw(pick('thinking'), 16)}已思考 12 秒${draw(pick('chevron-right'), 14)}</div>
    <div class="icons-step">${draw(pick('tool'), 16)}已运行 2 个命令，已读取 1 个文件${draw(pick('chevron-down'), 14)}</div>
    <div class="icons-actions">${['copy', 'thumbs-up', 'thumbs-down', 'regenerate', 'branch', 'share'].map(name => `<button class="dn-icon-button" type="button" aria-label="${name}">${draw(pick(name), 16)}</button>`).join('')}</div>
    <div class="icons-composer">
      <span class="icons-composer-text">描述你要做的事，输入 @ 引用文件，/ 使用命令</span>
      <div class="icons-row">${['plus', 'attach', 'mention', 'command', 'web'].map(name => `<button class="dn-icon-button" type="button" aria-label="${name}">${draw(pick(name), 16)}</button>`).join('')}<span class="icons-spacer"></span><button class="dn-icon-button" type="button" aria-label="语音">${draw(pick('voice'), 16)}</button><button class="icons-send" type="button" aria-label="发送">${draw(pick('send'), 16)}</button></div>
    </div>
  </div>
</div></section>`);
  return out.join('\n');
}
