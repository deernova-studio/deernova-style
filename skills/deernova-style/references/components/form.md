# 表单

把[文本框](text-field.md)、[选择控件](choice.md)、[下拉选择](menu.md)组织成一张可以填写和提交的表单：怎么分组、标签放哪、怎么校验、怎么提交。

**需要提供**：字段和分组、每个字段的标签和说明、哪些是必填、校验规则和错误文案、提交和取消的动作、提交后的结果。

## 尺寸

<!-- tokens:form -->
| Token | 桌面<br>Web 应用 · macOS 内容区 | 触控<br>iOS · iPadOS · Web 触屏 | 舒展<br>官网与文档 | 用途 |
| --- | --- | --- | --- | --- |

| Token | 值 | 用途 |
| --- | --- | --- |
| `form-label-width` | `160px` | 标签在左的表单里标签栏的宽度。 |
<!-- /tokens -->

## 布局

- 单栏，宽度不超过 `form-max`，在内容区里居中或靠左（设置页靠左对齐分组标题）。不要把两个不相关的字段并排；只有天然成对的才并排（省和市、开始和结束日期），并排的两项同高。
- **标签在上**：默认标签在输入框上方，`callout`、`weight-medium`、`ink-secondary`；说明在下方，`caption`、`ink-tertiary`；三者之间 `space-1`。
- **标签在左**：只用在宽屏的设置页，标签栏宽 `form-label-width`，右对齐到控件左边 `space-4` 处，标签和控件的第一行按中线对齐；窄于 `breakpoint-sm` 时改回标签在上。
- 字段之间 `gap-stack` 的 2 倍（表单字段通常带说明，需要更多呼吸）；分组之间 `gap-group`，每组有一个 `headline` 的组标题，可以带一句说明。
- 按钮区在表单最后，和字段之间 `gap-group`：主按钮在右，取消在它左边（弹窗里同样）；长表单的设置页可以把按钮区吸底，上方一条 1px `line`。

## 必填和可选

- 大部分字段必填时，只标出可选的：标签后加 `ink-tertiary` 的「（可选）」；大部分可选时，反过来标「（必填）」。不要只用红色星号。
- 读屏：必填字段加 `required` 和 `aria-required="true"`。

## 校验

- **什么时候校验**：用户离开一个字段（失焦）后再校验这个字段，不在输入第一个字时就报错；已经报错的字段，改对的那一刻立即清除错误。提交时校验全部字段。
- **错误怎么显示**：字段换成 `danger-soft` 底，下方说明换成 `danger` 色的错误信息，写清楚怎么改（「密码至少 8 位，还差 3 位」），不写「格式错误」。
- **提交失败**：表单顶部出一条[横幅](banner.md)「有 2 处需要修改」，列出字段名，点击跳到对应字段；焦点移到第一个出错的字段。
- 服务端返回的错误（用户名已被占用），显示在对应字段下，规则相同。

## 提交

- 主按钮写具体动作：「创建项目」「保存修改」，不写「提交」「确定」。
- 提交中：主按钮保持宽度，文字换成转圈加「正在保存」，表单字段不禁用（用户还能看），但不能再次提交。
- 成功：留在原页时用[轻提示](banner.md)「已保存」；进入新页面时直接跳转，不再弹提示。
- 没有改动时，「保存修改」可以禁用；离开有未保存修改的表单时，先问「放弃修改？」。

## Web

```css
.dn-form { display: grid; gap: calc(var(--gap-stack) * 2); width: min(100%, var(--form-max)); }
.dn-form-section { display: grid; gap: calc(var(--gap-stack) * 2); margin: 0; padding: 0; border: 0; min-width: 0; }
.dn-form-section + .dn-form-section { margin-top: calc(var(--gap-group) - var(--gap-stack) * 2); }
.dn-form-section > legend, .dn-form-title { margin: 0 0 var(--space-1); padding: 0; color: var(--ink); font: var(--type-headline); }
.dn-form-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); }
.dn-optional { color: var(--ink-tertiary); font-weight: var(--weight-regular); }
.dn-form-actions { display: flex; justify-content: flex-end; gap: var(--gap-stack); margin-top: calc(var(--gap-group) - var(--gap-stack) * 2); }
.dn-form.is-aside .dn-field { grid-template-columns: var(--form-label-width) minmax(0, 1fr); column-gap: var(--space-4); align-items: center; }
.dn-form.is-aside .dn-field-label { text-align: end; }
.dn-form.is-aside .dn-field-help { grid-column: 2; }
@media (max-width: 760px) {
  .dn-form-pair { grid-template-columns: minmax(0, 1fr); }
  .dn-form.is-aside .dn-field { grid-template-columns: minmax(0, 1fr); }
  .dn-form.is-aside .dn-field-label { text-align: start; }
  .dn-form.is-aside .dn-field-help { grid-column: auto; }
}
```

```html
<form class="dn-form" novalidate>
  <div class="dn-banner" role="alert"><svg class="dn-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg><div class="dn-banner-text"><p class="dn-banner-title">有 1 处需要修改</p><p class="dn-banner-body">项目名称</p></div></div>
  <fieldset class="dn-form-section">
    <legend>新项目</legend>
    <div class="dn-field">
      <label class="dn-field-label" for="pname">项目名称</label>
      <input class="dn-input" id="pname" value="d" aria-invalid="true" aria-describedby="pname-help" required>
      <p class="dn-field-help is-error" id="pname-help">名称至少需要 2 个字，还差 1 个。</p>
    </div>
    <div class="dn-field">
      <label class="dn-field-label" for="pdesc">描述 <span class="dn-optional">（可选）</span></label>
      <input class="dn-input" id="pdesc" placeholder="一句话说明这个项目做什么">
    </div>
    <div class="dn-form-pair">
      <div class="dn-field"><label class="dn-field-label" for="pstart">开始日期</label><input class="dn-input" id="pstart" value="2026-11-10"></div>
      <div class="dn-field"><label class="dn-field-label" for="pend">结束日期</label><input class="dn-input" id="pend" value="2026-12-20"></div>
    </div>
  </fieldset>
  <div class="dn-form-actions">
    <button class="dn-button is-plain" type="button">取消</button>
    <button class="dn-button is-primary" type="submit">创建项目</button>
  </div>
</form>
```

## SwiftUI

用 `Form` 加 `Section`，系统负责分组样式和间距；Mac 上 `Form` 用 `.formStyle(.grouped)` 得到标签在左的设置页。错误信息放在字段下方的 `Text`，用 `.foregroundStyle(.danger)`；提交按钮放在 `.toolbar` 的 `confirmationAction` 位置，取消放 `cancellationAction`。

## 不要

- 两栏表单让视线来回跳；把不相关的字段并排。
- 用户刚输入第一个字就报错；错误只写「格式错误」；只把边框或星号变红。
- 提交时禁用整张表单，或者让按钮宽度跳动；成功后什么反馈都没有。
- 按钮写「提交」「确定」；主按钮放在左边。
