import { readdir } from 'node:fs/promises';
import { join, posix } from 'node:path';
import { read } from './files.mjs';

// The skill folder is the single source of truth; the website and the npm package read from it.
export const SKILL_DIR = 'skills/deernova-style';

export const readTokens = async root => JSON.parse(await read(join(root, SKILL_DIR, 'assets/tokens.json')));

// Groups in the order they are documented. Palette and color are handled separately.
export const GROUPS = [
  ['space', '间距'],
  ['radius', '圆角'],
  ['stroke', '线宽'],
  ['line', '线形'],
  ['shadow', '阴影'],
  ['layer', '层级'],
  ['motion', '动效'],
  ['opacity', '不透明度'],
  ['glass', '玻璃'],
  ['layout', '布局']
];

const GENERATED = 'Generated from tokens.json by `npm run tokens`. Do not edit by hand.';
export const isDensity = token => Boolean(token.values);
export const isThemed = token => token.value !== null && typeof token.value === 'object';
const webOnly = token => token.platforms?.length === 1 && token.platforms[0] === 'web';
const cell = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const camel = name => name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

export const densityIds = tokens => tokens.densities.map(density => density.id);

// Every token that is not a color, in documentation order, tagged with its group.
export function groupTokens(tokens) {
  const groups = GROUPS.map(([key, title]) => ({ key, title, note: tokens[key].note, tokens: tokens[key].tokens }));
  for (const component of tokens.components) {
    groups.push({ key: component.id, title: component.title, component, tokens: component.tokens });
  }
  return groups;
}

// Palette references like {gray-96} resolve to literal colors; references to other semantic tokens stay aliases.
export function resolveColor(tokens, value) {
  const ref = String(value).match(/^\{([^}]+)\}$/)?.[1];
  if (!ref) return value;
  const swatch = tokens.palette.tokens.find(token => token.name === ref);
  return swatch ? swatch.value : value;
}

export const aliasOf = value => String(value).match(/^\{([^}]+)\}$/)?.[1] ?? null;

// The literal color a semantic token has in one theme, following aliases (accent → ink).
export function colorIn(tokens, name, theme) {
  const token = tokens.color.tokens.find(item => item.name === name);
  if (!token) throw Error(`Unknown color ${name}`);
  const raw = isThemed(token) ? token.value[theme] : token.value;
  const resolved = resolveColor(tokens, raw);
  const alias = aliasOf(resolved);
  return alias ? colorIn(tokens, alias, theme) : resolved;
}

// WCAG contrast ratio between two #rrggbb colors.
export function contrast(a, b) {
  const channel = value => { const c = parseInt(value, 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const luminance = hex => hex.slice(1, 7).match(/../g).map(channel).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

const cssValue = (tokens, value) => {
  const resolved = resolveColor(tokens, value);
  return String(resolved).replace(/\{([^}]+)\}/g, 'var(--$1)');
};

const densityValue = (token, density) => {
  const value = token.values[density];
  return `${value}${token.unit ?? 'px'}`;
};

function themedDeclarations(tokens, theme) {
  const lines = [];
  for (const token of tokens.color.tokens) {
    lines.push(`--${token.name}: ${cssValue(tokens, isThemed(token) ? token.value[theme] : token.value)};`);
  }
  for (const token of tokens.shadow.tokens) lines.push(`--${token.name}: ${token.value[theme]};`);
  return lines;
}

function staticDeclarations(tokens) {
  const lines = Object.entries(tokens.type.families).map(([name, stack]) => `--font-${name}: ${stack};`);
  for (const weight of tokens.type.weights) lines.push(`--${weight.name}: ${weight.value};`);
  for (const role of tokens.type.roles) if (role.tracking) lines.push(`--type-${role.name}-tracking: ${role.tracking};`);
  for (const group of groupTokens(tokens)) {
    if (group.key === 'shadow') continue;
    for (const token of group.tokens) {
      if (isDensity(token) || token.css === false) continue;
      lines.push(`--${token.name}: ${token.value};`);
    }
  }
  return lines;
}

function densityDeclarations(tokens, density) {
  const lines = [];
  for (const role of tokens.type.roles) {
    const [size, line] = role.values[density];
    lines.push(`--type-${role.name}-size: ${size}px;`, `--type-${role.name}-line: ${line}px;`,
      `--type-${role.name}: ${role.weight} ${size}px/${line}px var(--font-${role.family});`);
  }
  for (const group of groupTokens(tokens)) {
    for (const token of group.tokens) if (isDensity(token)) lines.push(`--${token.name}: ${densityValue(token, density)};`);
  }
  return lines;
}

const block = (selector, lines, indent = '') =>
  `${indent}${selector} {\n${lines.map(line => `${indent}  ${line}`).join('\n')}\n${indent}}`;

export function renderTokensCss(tokens) {
  const [fallback] = densityIds(tokens);
  return [
    `/* ${GENERATED}\n *\n * 主题：浅色是默认值；系统切到深色时自动换成深色。在 <html> 或任何元素上设置\n *   data-theme="light" / "dark" 可以强制指定，去掉属性就跟随系统。\n * 密度：默认 desktop（Web 应用）；触屏设备（pointer: coarse）自动换成 touch。在 <html> 或任何元素上设置\n *   data-density="desktop" / "touch" / "comfortable" 可以强制指定。\n */`,
    block(':root,\n[data-theme="light"]', ['color-scheme: light;', ...themedDeclarations(tokens, 'light')]),
    `@media (prefers-color-scheme: dark) {\n${block(':root:not([data-theme="light"])', ['color-scheme: dark;', ...themedDeclarations(tokens, 'dark')], '  ')}\n}`,
    block('[data-theme="dark"]', ['color-scheme: dark;', ...themedDeclarations(tokens, 'dark')]),
    block(':root', staticDeclarations(tokens)),
    block(`:root,\n[data-density="${fallback}"]`, densityDeclarations(tokens, fallback)),
    `@media (pointer: coarse) {\n${block(':root:not([data-density])', densityDeclarations(tokens, 'touch'), '  ')}\n}`,
    ...densityIds(tokens).filter(id => id !== fallback).map(id => block(`[data-density="${id}"]`, densityDeclarations(tokens, id))),
    ''
  ].join('\n\n');
}

// Tailwind CSS v4: utilities point at the CSS variables, so themes and densities keep working.
export function renderTailwindCss(tokens) {
  const lines = [];
  for (const token of tokens.color.tokens) lines.push(`--color-${token.name}: var(--${token.name});`);
  lines.push('');
  for (const role of tokens.type.roles) {
    lines.push(`--text-${role.name}: var(--type-${role.name}-size);`,
      `--text-${role.name}--line-height: var(--type-${role.name}-line);`,
      `--text-${role.name}--font-weight: ${role.weight};`);
  }
  lines.push('');
  const spacing = {
    'control-sm': 'button-height-sm', 'control-md': 'button-height-md', 'control-lg': 'button-height-lg',
    'button-x-sm': 'button-padding-x-sm', 'button-x-md': 'button-padding-x-md', 'button-x-lg': 'button-padding-x-lg',
    field: 'field-height', row: 'row-height', hit: 'hit-min', sidebar: 'sidebar-width',
    'gap-inline': 'gap-inline', 'gap-stack': 'gap-stack', 'gap-group': 'gap-group', page: 'page-margin',
    'card-x': 'card-padding-x', 'card-y': 'card-padding-y', 'icon-sm': 'icon-size-sm', 'icon-md': 'icon-size-md', 'icon-lg': 'icon-size-lg'
  };
  for (const [name, token] of Object.entries(spacing)) lines.push(`--spacing-${name}: var(--${token});`);
  lines.push('--container-content: var(--content-max);', '');
  const radius = { button: 'button-radius', 'button-sm': 'button-radius-sm', field: 'field-radius', card: 'card-radius', tag: 'tag-radius', menu: 'menu-radius', sheet: 'sheet-radius', composer: 'composer-radius', row: 'row-radius' };
  for (const [name, token] of Object.entries(radius)) lines.push(`--radius-${name}: var(--${token});`);
  lines.push('');
  for (const token of tokens.shadow.tokens) lines.push(`--shadow-${token.name.replace(/^shadow-/, '')}: var(--${token.name});`);
  lines.push('--ease-standard: var(--ease-standard);',
    '--default-transition-duration: var(--duration-instant);',
    '--default-transition-timing-function: var(--ease-standard);');
  return [
    `/* ${GENERATED}\n *\n * Tailwind CSS v4。在全局样式里依次引入：\n *   @import "tailwindcss";\n *   @import "./tokens.css";\n *   @import "./tailwind.css";\n * tokens.css 不要放进 @layer：它要覆盖 Tailwind 默认主题里同名的 --font-*、--radius-*。\n * 用法：bg-surface text-ink border-line、text-body、h-control-md px-button-x-md rounded-button、shadow-float。\n */`,
    block('@theme inline', lines).replace(/\n {2}\n/g, '\n\n'),
    ''
  ].join('\n\n');
}

const swiftColor = hex => {
  const value = hex.slice(1);
  const rgb = value.slice(0, 6).toUpperCase();
  const alpha = value.length === 8 ? +(parseInt(value.slice(6), 16) / 255).toFixed(3) : 1;
  return [`0x${rgb}`, alpha];
};

const swiftNumber = value => {
  if (typeof value === 'number') return value;
  const match = String(value).match(/^(-?[\d.]+)(px|ms)?$/);
  if (!match) return null;
  return match[2] === 'ms' ? +(parseFloat(match[1]) / 1000).toFixed(3) : parseFloat(match[1]);
};

// SwiftUI: colors adapt to the appearance; sizes are desktop on macOS and touch on iOS / iPadOS.
export function renderSwift(tokens) {
  const colors = tokens.color.tokens.filter(token => !webOnly(token));
  const swiftName = name => name === 'accent' ? 'brandAccent' : camel(name);
  const colorLines = colors.map(token => {
    const alias = !isThemed(token) && aliasOf(token.value);
    if (alias) return `    public static let ${swiftName(token.name)} = ${swiftName(alias)}`;
    const [light, lightAlpha] = swiftColor(resolveColor(tokens, token.value.light));
    const [dark, darkAlpha] = swiftColor(resolveColor(tokens, token.value.dark));
    return `    /// ${token.usage}\n    public static let ${swiftName(token.name)} = Color(deernovaLight: ${light}, ${lightAlpha}, dark: ${dark}, ${darkAlpha})`;
  });
  const styleLines = colors.map(token => `    static var ${swiftName(token.name)}: Color { DeernovaColor.${swiftName(token.name)} }`);

  const staticLines = [];
  const densityLines = { desktop: [], touch: [] };
  for (const group of groupTokens(tokens)) {
    for (const token of group.tokens) {
      if (webOnly(token) || token.swift === false || token.css === false) continue;
      if (isDensity(token)) {
        const type = token.unit === '' ? 'Int' : 'CGFloat';
        for (const density of ['desktop', 'touch']) densityLines[density].push(`    public static let ${camel(token.name)}: ${type} = ${token.values[density]}`);
        continue;
      }
      const number = swiftNumber(token.value);
      if (number === null) continue;
      const type = /ms$/.test(token.value) || group.key === 'opacity' ? 'Double' : 'CGFloat';
      staticLines.push(`    /// ${token.usage}\n    public static let ${camel(token.name)}: ${type} = ${number}`);
    }
  }
  const fontLines = tokens.type.roles.map(role => `    /// ${role.usage}\n    static var deernova${role.name[0].toUpperCase()}${role.name.slice(1)}: Font {\n        #if os(macOS)\n        ${role.swiftui.macos}\n        #else\n        ${role.swiftui.ios}\n        #endif\n    }`);

  return `// ${GENERATED}
//
// Deernova 的 SwiftUI 设计变量。把这个文件加进 App target 即可使用，不需要 Asset Catalog。
// 颜色跟随浅色 / 深色外观；尺寸在 macOS 上是 desktop 密度，在 iOS 和 iPadOS 上是 touch 密度。
// macOS 的侧边栏、工具栏、菜单用系统控件和系统尺寸；这里的尺寸用于自己画的内容区。

import SwiftUI
#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

extension Color {
    fileprivate init(deernovaLight light: UInt32, _ lightAlpha: Double, dark: UInt32, _ darkAlpha: Double) {
        func components(_ hex: UInt32) -> (Double, Double, Double) {
            (Double((hex >> 16) & 0xFF) / 255, Double((hex >> 8) & 0xFF) / 255, Double(hex & 0xFF) / 255)
        }
        #if canImport(UIKit)
        self.init(uiColor: UIColor { traits in
            let (hex, alpha) = traits.userInterfaceStyle == .dark ? (dark, darkAlpha) : (light, lightAlpha)
            let (r, g, b) = components(hex)
            return UIColor(red: r, green: g, blue: b, alpha: alpha)
        })
        #elseif canImport(AppKit)
        self.init(nsColor: NSColor(name: nil) { appearance in
            let isDark = appearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua
            let (hex, alpha) = isDark ? (dark, darkAlpha) : (light, lightAlpha)
            let (r, g, b) = components(hex)
            return NSColor(srgbRed: r, green: g, blue: b, alpha: alpha)
        })
        #endif
    }
}

/// 语义颜色。accent 命名为 brandAccent，避开系统的 accentColor。
public enum DeernovaColor {
${colorLines.join('\n')}
}

/// 让 .foregroundStyle(.inkSecondary)、.background(.surface, in: …) 直接可用。
public extension ShapeStyle where Self == Color {
${styleLines.join('\n')}
}

/// 尺寸、间距、圆角、时长。
public enum Deernova {
${staticLines.join('\n')}

    // 按密度取值的尺寸：macOS 是 desktop（只用于自己画的内容区），iOS 和 iPadOS 是 touch。
    #if os(macOS)
${densityLines.desktop.join('\n')}
    #else
${densityLines.touch.join('\n')}
    #endif
}

/// 字体角色。iOS 上是文本样式，支持动态字体。
public extension Font {
${fontLines.join('\n')}
}
`;
}

// ---------- Markdown ----------

const densityHeader = tokens => tokens.densities.map(density => `${density.name}<br>${density.scenes}`);
export const showDensity = (token, value) => {
  if (token.name.includes('radius') && value === 999) return '胶囊';
  return String(value);
};

function densityTable(tokens, list, { usage = true } = {}) {
  const out = [`| Token | ${densityHeader(tokens).join(' | ')} |${usage ? ' 用途 |' : ''}`, `| --- |${' --- |'.repeat(tokens.densities.length)}${usage ? ' --- |' : ''}`];
  for (const token of list) {
    const values = densityIds(tokens).map(id => showDensity(token, token.values[id]));
    out.push(`| \`${token.name}\` | ${values.join(' | ')} |${usage ? ` ${cell(token.usage)} |` : ''}`);
  }
  return out;
}

function staticTable(list) {
  const out = ['| Token | 值 | 用途 |', '| --- | --- | --- |'];
  for (const token of list) out.push(`| \`${token.name}\` | \`${cell(token.value)}\` | ${cell(token.usage)}${webOnly(token) ? '（仅网页）' : ''} |`);
  return out;
}

const link = (from, target, text) => `[${text}](${posix.relative(posix.dirname(from), target)})`;

export function renderScenesTable(tokens, from) {
  const density = id => tokens.densities.find(item => item.id === id).name;
  const out = ['| 场景 | 密度 | 输入 | 怎么启用 | 读这里 |', '| --- | --- | --- | --- | --- |'];
  for (const scene of tokens.scenes) {
    const target = join(SKILL_DIR, scene.reference).split('\\').join('/');
    out.push(`| ${scene.name} | ${density(scene.density)}（\`${scene.density}\`） | ${scene.input} | ${scene.apply} | ${link(from, target, scene.reference.replace(/^references\//, ''))} |`);
  }
  return out.join('\n');
}

// The handful of numbers every screen needs, per density: [label, { desktop, touch, comfortable }].
export function summaryRows(tokens) {
  const find = name => groupTokens(tokens).flatMap(group => group.tokens).find(token => token.name === name);
  const role = name => tokens.type.roles.find(item => item.name === name);
  const radius = id => {
    const value = find('button-radius').values[id];
    return value === 999 ? '胶囊' : `圆角 ${value}`;
  };
  const rows = [
    ['正文', id => role('body').values[id].join(' / ')],
    ['长文、AI 回答（衬线）', id => role('prose').values[id].join(' / ')],
    ['默认按钮（可见高度）', id => `${find('button-height-md').values[id]}，${radius(id)}`],
    ['小 / 大按钮', id => `${find('button-height-sm').values[id]} / ${find('button-height-lg').values[id]}`],
    ['最小点击区域', id => String(find('hit-min').values[id])],
    ['输入框', id => String(find('field-height').values[id])],
    ['列表行', id => String(find('row-height').values[id])],
    ['卡片：圆角 / 内边距', id => `${find('card-radius').values[id]} / ${find('card-padding-y').values[id]} × ${find('card-padding-x').values[id]}`],
    ['页面边距', id => String(find('page-margin').values[id])],
    ['侧边栏宽度', id => String(find('sidebar-width').values[id])]
  ];
  return rows.map(([label, value]) => [label, Object.fromEntries(densityIds(tokens).map(id => [id, value(id)]))]);
}

// The quick reference in SKILL.md.
export function renderSummaryTable(tokens) {
  const ids = densityIds(tokens);
  const out = [`| | ${densityHeader(tokens).join(' | ')} |`, `| --- |${' --- |'.repeat(ids.length)}`];
  for (const [label, values] of summaryRows(tokens)) out.push(`| ${label} | ${ids.map(id => values[id]).join(' | ')} |`);
  return out.join('\n');
}

export function renderComponentTable(tokens, id) {
  const component = tokens.components.find(item => item.id === id);
  if (!component) throw Error(`Unknown component ${id}`);
  const density = component.tokens.filter(isDensity);
  const fixed = component.tokens.filter(token => !isDensity(token));
  const out = densityTable(tokens, density);
  if (fixed.length) out.push('', ...staticTable(fixed));
  return out.join('\n');
}

const BLOCK = /<!-- tokens:([\w-]+) -->\n[\s\S]*?<!-- \/tokens -->/g;

// Hand-written Markdown can embed generated tables between <!-- tokens:name --> and <!-- /tokens -->.
export function applyGeneratedBlocks(markdown, tokens, from) {
  return markdown.replace(BLOCK, (_, name) => {
    const body = name === 'scenes' ? renderScenesTable(tokens, from)
      : name === 'summary' ? renderSummaryTable(tokens)
        : renderComponentTable(tokens, name);
    return `<!-- tokens:${name} -->\n${body}\n<!-- /tokens -->`;
  });
}

export async function skillMarkdownFiles(root) {
  const files = [];
  async function walk(relativeDir) {
    for (const entry of await readdir(join(root, SKILL_DIR, relativeDir), { withFileTypes: true })) {
      const path = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith('.md')) files.push(path);
    }
  }
  await walk('');
  return files.sort();
}

export function renderTokensMarkdown(tokens) {
  const from = `${SKILL_DIR}/references/tokens.md`;
  const out = [
    '# 设计变量',
    '',
    '由 `assets/tokens.json` 生成（在 deernova-style 仓库里运行 `npm run tokens`），不要手改。同一份数据还生成了 `assets/tokens.css`（CSS 变量）、`assets/tailwind.css`（Tailwind v4 主题）和 `assets/DeernovaTokens.swift`（SwiftUI）。CSS 变量名和这里的 token 名一致，例如 `var(--ink)`、`var(--button-height-md)`。',
    '',
    '每个 token 的值只取决于两件事：**主题**（浅色 / 深色）和**密度**（紧凑 / 常规 / 触控 / 舒展）。token 名字里不出现平台，平台差异全部放在值里。',
    '',
    '## 场景与密度',
    '',
    renderScenesTable(tokens, from),
    '',
    '| 密度 | 说明 |',
    '| --- | --- |',
    ...tokens.densities.map(density => `| ${density.name}（\`${density.id}\`） | ${density.note} |`),
    '',
    '## 原始色板',
    '',
    tokens.palette.note,
    '',
    '| Token | 值 |',
    '| --- | --- |',
    ...tokens.palette.tokens.map(token => `| \`${token.name}\` | \`${token.value}\` |`),
    '',
    '## 颜色',
    '',
    tokens.color.note,
    '“= `ink`” 表示这个变量直接引用另一个语义颜色。',
    '',
    '| Token | 浅色 | 深色 | 用途 |',
    '| --- | --- | --- | --- |'
  ];
  const showColor = value => {
    const alias = aliasOf(value);
    if (!alias) return `\`${value}\``;
    const swatch = tokens.palette.tokens.find(token => token.name === alias);
    return swatch ? `\`${alias}\` \`${swatch.value}\`` : `= \`${alias}\``;
  };
  for (const token of tokens.color.tokens) {
    const [light, dark] = ['light', 'dark'].map(theme => showColor(isThemed(token) ? token.value[theme] : token.value));
    out.push(`| \`${token.name}\` | ${light} | ${dark} | ${cell(token.usage)} |`);
  }

  out.push('', '## 字体', '', tokens.type.note, '', '| 字族 | CSS 变量 | 字体栈 |', '| --- | --- | --- |');
  for (const [name, stack] of Object.entries(tokens.type.families)) out.push(`| ${name} | \`--font-${name}\` | \`${cell(stack)}\` |`);
  out.push('', '### 字重', '', ...staticTable(tokens.type.weights.map(weight => ({ ...weight, value: weight.value }))));
  out.push('', '### 字号角色', '',
    '每个角色生成 `--type-<角色>`（`font` 简写，可以直接写 `font: var(--type-body)`）、`--type-<角色>-size` 和 `--type-<角色>-line`。表里是“字号 / 行高”。', '',
    `| 角色 | 字族 | 字重 | ${densityHeader(tokens).join(' | ')} | SwiftUI（macOS · iOS） | 用途 |`,
    `| --- | --- | --- |${' --- |'.repeat(tokens.densities.length)} --- | --- |`);
  for (const role of tokens.type.roles) {
    const values = densityIds(tokens).map(id => role.values[id].join(' / '));
    out.push(`| \`${role.name}\` | ${role.family} | ${role.weight} | ${values.join(' | ')} | \`${cell(role.swiftui.macos)}\` · \`${cell(role.swiftui.ios)}\` | ${cell(role.usage)} |`);
  }

  for (const [key, title] of GROUPS) {
    const group = tokens[key];
    out.push('', `## ${title}`, '');
    if (group.note) out.push(group.note, '');
    if (key === 'shadow') {
      out.push('| Token | 浅色 | 深色 | 用途 |', '| --- | --- | --- | --- |');
      for (const token of group.tokens) out.push(`| \`${token.name}\` | \`${cell(token.value.light)}\` | \`${cell(token.value.dark)}\` | ${cell(token.usage)} |`);
      continue;
    }
    const fixed = group.tokens.filter(token => !isDensity(token));
    const density = group.tokens.filter(isDensity);
    if (fixed.length) out.push(...staticTable(fixed));
    if (fixed.length && density.length) out.push('');
    if (density.length) out.push(...densityTable(tokens, density));
  }

  out.push('', '## 组件尺寸', '', '按密度取值。每个组件的完整规格和写法见对应的组件说明。');
  for (const component of tokens.components) {
    out.push('', `### ${component.title}`, '', `见 ${link(from, `${SKILL_DIR}/${component.reference}`, component.reference.replace(/^references\//, ''))}。`, '', renderComponentTable(tokens, component.id));
  }
  return out.join('\n') + '\n';
}

// Paths of generated files relative to the repository root, so callers can write or compare them.
export async function renderTokenOutputs(root, tokens) {
  const outputs = {
    [`${SKILL_DIR}/assets/tokens.css`]: renderTokensCss(tokens),
    [`${SKILL_DIR}/assets/tailwind.css`]: renderTailwindCss(tokens),
    [`${SKILL_DIR}/assets/DeernovaTokens.swift`]: renderSwift(tokens),
    [`${SKILL_DIR}/references/tokens.md`]: renderTokensMarkdown(tokens)
  };
  for (const file of await skillMarkdownFiles(root)) {
    if (file === 'references/tokens.md') continue;
    const path = `${SKILL_DIR}/${file}`;
    const source = await read(join(root, path));
    if (!source.includes('<!-- tokens:')) continue;
    outputs[path] = applyGeneratedBlocks(source, tokens, path);
  }
  return outputs;
}
