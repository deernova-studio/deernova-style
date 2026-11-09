# 表格

成行成列的数据：文件列表、用量明细、运行记录、成员管理。简单的几行数据用[分组列表](list.md)；需要横向比较多个字段、排序、筛选、批量操作时才用表格。

**需要提供**：列（标题、数据类型、对齐、是否可以排序）、行数据、每行的主键；可选的选中、批量操作、行操作、分页、空状态和加载状态。

## 尺寸

<!-- tokens:table -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |
| `table-row-height` | 36 | 44 | 40 | 表格每一行（包括表头）的高度。 |
| `table-cell-padding-x` | 12 | 16 | 12 | 单元格左右内边距。 |
<!-- /tokens -->

- 表格直接放在内容区上，不加外框和底色；表头和每一行之间是 1px `line` 分隔线，最后一行下面也有一条。宽度不超过 `wide-max`。
- 行高 `table-row-height`，单元格左右内边距 `table-cell-padding-x`；文字 `callout`、`ink`，单行截断，悬停显示完整内容。
- 表头：`caption` 字号、`weight-medium`、`ink-secondary`，吸顶（滚动时固定在顶部），底部的分隔线换成 `line-control`。
- 斑马纹不用；靠分隔线和对齐让人扫读。

## 对齐

- 文字列左对齐；数字、金额、时长、日期右对齐，用等宽数字（`tabular-nums`）；状态和图标列居中或跟随左对齐的文字。表头和本列内容对齐方式一致。
- 每一列只放一种数据；单位写在表头里（「费用（元）」），不在每个单元格里重复。
- 第一列是主列（名称），用 `ink`，可以带图标；次要列用 `ink-secondary`。
- 单行单元格垂直居中；有单元格需要两行时，整行改成顶部对齐，并统一用更高的行高。

## 交互

- **悬停**：整行 `fill-hover`。可以点开详情的行，整行都是点击区域，光标是手形。
- **选中**：最左边一列复选框（见[选择控件](choice.md)）；表头的复选框控制全选，部分选中时显示横线。选中的行 `fill-selected` 底。选中至少一行后，表格上方的工具行换成批量操作栏：「已选 3 项」、批量操作按钮、「取消选择」。
- **排序**：可以排序的表头是文字按钮，悬停出现 `fill-hover`；当前排序的列名变 `ink`，后面一个 `icon-size-sm` 的上下箭头。一次只按一列排序，默认是最常用的顺序（通常是时间倒序）。
- **行操作**：放在最右一列，一个「更多」图标按钮，点开是[菜单](menu.md)；常用的一两个操作可以直接显示成图标按钮，指针端悬停时才出现，触屏上一直显示。
- **筛选和搜索**：在表格上方的工具行：左边搜索框和筛选标签，右边主操作（「新建」）和视图设置。筛选后结果为 0 时显示空状态「没有符合条件的记录」，并给一个「清除筛选」。
- **分页或加载更多**：数据多时在表格下方：左边「共 1,280 条」，右边上一页、页码、下一页；也可以滚到底自动加载更多，但要显示「正在加载」。
- 列很多、内容很宽时，表格在自己的容器里横向滚动，主列固定在左边，页面本身不横向滚动。

## 空、加载和错误

- 空表：表头保留，表体换成[空状态](empty-state.md)，说明为什么空、怎么开始。
- 加载：第一次加载时显示 5 行[骨架](skeleton.md)，表头正常显示；之后翻页时保留旧数据，在表格上方显示细的进度条，不闪白。
- 加载失败：表体换成一行说明和「重试」。

## 触屏

- 窄于 `breakpoint-sm` 时，表格改成列表：每条记录一行，主列做标题，其余两三个最重要的字段放在下方的说明里，其余收进详情页。不要让手机上出现横向滚动的宽表。

## Web

用真正的 `<table>`、`<thead>`、`<th scope="col">`；可以排序的表头里放 `<button>`，当前排序列加 `aria-sort="ascending"` 或 `descending`。选中行的复选框要有名称（「选择 周报草稿.md」）。

```css
.dn-table-demo { display: grid; gap: var(--space-1); max-width: var(--wide-max); }
.dn-table-wrap { max-width: var(--wide-max); overflow-x: auto; overscroll-behavior-x: contain; }
.dn-table { width: 100%; border-collapse: collapse; color: var(--ink); font: var(--weight-regular) var(--type-callout-size)/1.3 var(--font-sans); }
.dn-table th, .dn-table td { height: var(--table-row-height); padding: 0 var(--table-cell-padding-x); border-bottom: var(--stroke-line) solid var(--line); text-align: start; vertical-align: middle; white-space: nowrap; }
.dn-table thead th { position: sticky; top: 0; z-index: 1; border-bottom-color: var(--line-control); background: var(--canvas); color: var(--ink-secondary); font: var(--weight-medium) var(--type-caption-size)/1 var(--font-sans); }
.dn-table td { color: var(--ink-secondary); }
.dn-table td.is-primary { color: var(--ink); }
.dn-table :is(th, td).is-number { text-align: end; font-variant-numeric: tabular-nums; }
.dn-table :is(th, td).is-check { width: var(--check-size); padding-inline-end: 0; }
.dn-table :is(th, td).is-actions { width: 1%; text-align: end; }
.dn-table tbody tr { transition: background-color var(--duration-instant) var(--ease-standard); }
@media (hover: hover) { .dn-table tbody tr:hover { background: var(--fill-hover); } }
.dn-table tbody tr[aria-selected="true"] { background: var(--fill-selected); }
.dn-table-cell { display: flex; align-items: center; gap: var(--space-2); min-width: 0; max-width: 320px; }
.dn-table-cell > span { overflow: hidden; text-overflow: ellipsis; }
.dn-table-cell > .dn-icon { flex: none; width: var(--icon-size-md); height: var(--icon-size-md); color: var(--ink-secondary); }
.dn-sort { display: inline-flex; align-items: center; gap: 2px; height: var(--button-height-sm); margin-inline: calc(var(--space-1) * -1); padding: 0 var(--space-1); border: 0; border-radius: var(--radius-xs); background: transparent; color: inherit; font: inherit; cursor: pointer; }
@media (hover: hover) { .dn-sort:hover { background: var(--fill-hover); color: var(--ink); } }
.dn-sort .dn-icon { width: var(--icon-size-sm); height: var(--icon-size-sm); }
th[aria-sort] .dn-sort { color: var(--ink); }
.dn-table-bar { display: flex; flex-wrap: wrap; align-items: center; gap: var(--gap-stack); min-height: var(--toolbar-height); }
.dn-table-bar-end { display: flex; align-items: center; gap: var(--gap-stack); margin-left: auto; }
.dn-table-count { color: var(--ink-secondary); font: var(--type-callout); font-variant-numeric: tabular-nums; }
.dn-table-foot { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); min-height: var(--toolbar-height); color: var(--ink-tertiary); font: var(--type-callout); font-variant-numeric: tabular-nums; }
```

```html
<div class="dn-table-demo">
  <div class="dn-table-bar">
    <span class="dn-table-count">已选 1 项</span>
    <button class="dn-button is-sm" type="button">下载</button>
    <button class="dn-button is-sm is-danger" type="button">删除</button>
    <div class="dn-table-bar-end"><button class="dn-button is-plain is-sm" type="button">取消选择</button></div>
  </div>
  <div class="dn-table-wrap">
    <table class="dn-table">
      <thead><tr>
        <th class="is-check" scope="col"><span class="dn-choice-box"><input type="checkbox" aria-label="全选"><svg class="dn-icon is-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg><svg class="dn-icon is-mixed" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg></span></th>
        <th scope="col">名称</th>
        <th scope="col" aria-sort="descending"><button class="dn-sort" type="button">更新时间<svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg></button></th>
        <th class="is-number" scope="col">大小（KB）</th>
        <th class="is-actions" scope="col"><span class="sr-only">操作</span></th>
      </tr></thead>
      <tbody>
        <tr aria-selected="true">
          <td class="is-check"><span class="dn-choice-box"><input type="checkbox" checked aria-label="选择 周报草稿.md"><svg class="dn-icon is-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg><svg class="dn-icon is-mixed" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg></span></td>
          <td class="is-primary"><span class="dn-table-cell"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg><span>周报草稿.md</span></span></td>
          <td>今天 14:20</td><td class="is-number">12</td>
          <td class="is-actions"><button class="dn-icon-button" type="button" aria-label="更多操作"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/></svg></button></td>
        </tr>
        <tr>
          <td class="is-check"><span class="dn-choice-box"><input type="checkbox" aria-label="选择 第三季度经营分析.pdf"><svg class="dn-icon is-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg><svg class="dn-icon is-mixed" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg></span></td>
          <td class="is-primary"><span class="dn-table-cell"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg><span>第三季度经营分析.pdf</span></span></td>
          <td>昨天 09:05</td><td class="is-number">2,410</td>
          <td class="is-actions"><button class="dn-icon-button" type="button" aria-label="更多操作"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/></svg></button></td>
        </tr>
        <tr>
          <td class="is-check"><span class="dn-choice-box"><input type="checkbox" aria-label="选择 会议录音.m4a"><svg class="dn-icon is-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg><svg class="dn-icon is-mixed" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg></span></td>
          <td class="is-primary"><span class="dn-table-cell"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg><span>会议录音.m4a</span></span></td>
          <td>11 月 3 日</td><td class="is-number">18,920</td>
          <td class="is-actions"><button class="dn-icon-button" type="button" aria-label="更多操作"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/></svg></button></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="dn-table-foot"><span>共 3 条</span><span>第 1 / 1 页</span></div>
</div>
```

## SwiftUI

Mac 和 iPad 用 `Table(rows, selection: $selection, sortOrder: $sortOrder)`，列用 `TableColumn("名称", value: \.name)`；数字列的内容加 `.monospacedDigit()` 并右对齐。iPhone 上 `Table` 会自动退化成单列，只显示第一列，所以手机上直接用 `List`，把次要字段放进说明行。

## 不要

- 给表格加外框、底色、斑马纹或粗的表头底色。
- 数字左对齐；单位重复写在每个单元格里；一列里混放多种数据。
- 让整个页面横向滚动；手机上塞一张宽表。
- 翻页时整张表闪白；空表只留一片空白。
