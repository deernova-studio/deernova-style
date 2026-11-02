import { join } from 'node:path';
import { read } from './files.mjs';

// The skill folder is the single source of truth; the website and the npm package read from it.
export const SKILL_DIR = 'skills/deernova-style';
export const THEMED = ['color', 'shadow'];
export const STATIC = ['spacing', 'radius', 'stroke', 'size'];

export const readTokens = async root => JSON.parse(await read(join(root, SKILL_DIR, 'assets/tokens.json')));

const themed = (value, theme) => typeof value === 'object' ? value[theme] : value;
const cssValue = value => String(value).replace(/\{([^}]+)\}/g, 'var(--$1)');
const cell = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const literal = value => {
  const alias = String(value).match(/^\{([^}]+)\}$/);
  return alias ? `= \`${alias[1]}\`` : `\`${value}\``;
};

export function renderTokensCss(tokens) {
  const themeBlock = theme => THEMED.flatMap(group => tokens[group].tokens)
    .map(token => `  --${token.name}: ${cssValue(themed(token.value, theme))};`).join('\n');
  const staticBlock = STATIC.flatMap(group => tokens[group].tokens)
    .map(token => `  --${token.name}: ${token.value};`)
    .concat(Object.entries(tokens.type.families).map(([name, stack]) => `  --font-${name}: ${stack};`))
    .join('\n');
  return [
    '/* Generated from tokens.json by `npm run tokens`. Do not edit by hand. */',
    `:root {\n  color-scheme: light;\n${themeBlock('light')}\n${staticBlock}\n}`,
    `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n    color-scheme: dark;\n${themeBlock('dark').replaceAll('\n  ', '\n    ').replace(/^  /, '    ')}\n  }\n}`,
    `:root[data-theme="dark"] {\n  color-scheme: dark;\n${themeBlock('dark')}\n}`,
    ''
  ].join('\n\n');
}

export function renderTokensMarkdown(tokens) {
  const out = [
    '# 设计变量',
    '',
    '由 `assets/tokens.json` 生成（在 deernova-style 仓库里运行 `npm run tokens`），不要手改。CSS 版本是 `assets/tokens.css`，变量名和这里一致，例如 `var(--ink)`；SwiftUI 里按同名建 Color Set，见 [SwiftUI 落地](swiftui.md)。',
    '',
    '“= `ink`” 表示这个变量直接引用另一个变量。'
  ];
  const themedTable = (title, group) => {
    out.push('', `## ${title}`, '');
    if (tokens[group].note) out.push(tokens[group].note, '');
    out.push('| Token | 浅色 | 深色 | 用途 |', '| --- | --- | --- | --- |');
    for (const token of tokens[group].tokens) {
      out.push(`| \`${token.name}\` | ${cell(literal(themed(token.value, 'light')))} | ${cell(literal(themed(token.value, 'dark')))} | ${cell(token.usage)} |`);
    }
  };
  const staticTable = (title, group) => {
    out.push('', `## ${title}`, '');
    if (tokens[group].note) out.push(tokens[group].note, '');
    out.push('| Token | 值 | 用途 |', '| --- | --- | --- |');
    for (const token of tokens[group].tokens) out.push(`| \`${token.name}\` | \`${token.value}\` | ${cell(token.usage)} |`);
  };

  themedTable('颜色', 'color');
  out.push('', '## 字体', '', '只用系统字体，不打包字体文件。', '', '| 字族 | CSS 变量 | 字体栈 |', '| --- | --- | --- |');
  for (const [name, stack] of Object.entries(tokens.type.families)) out.push(`| ${name} | \`--font-${name}\` | \`${cell(stack)}\` |`);
  for (const group of tokens.type.groups) {
    out.push('', `### ${group.name}`, '');
    if (group.note) out.push(group.note, '');
    out.push('| 样式 | 字族 | 字号 / 行高 | 字重 | 用途 |', '| --- | --- | --- | --- | --- |');
    for (const style of group.styles) {
      out.push(`| \`${style.name}\` | ${style.family || group.family} | ${style.fontSize} / ${style.lineHeight} | ${style.fontWeight} | ${cell(style.usage)} |`);
    }
  }
  staticTable('间距', 'spacing');
  staticTable('圆角', 'radius');
  staticTable('线宽', 'stroke');
  staticTable('尺寸', 'size');
  themedTable('阴影', 'shadow');
  return out.join('\n') + '\n';
}
