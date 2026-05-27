# 项目说明

## 项目概览

这是一个纯静态的“内蒙古高考志愿查询”项目，用本地 JSON 数据展示 2025 年普通高考录取最高分、最低分信息。页面支持按批次、科类、省份、最低分区间、院校名称、专业关键词筛选，并可以展开查看专业组下的专业明细。

项目没有 `package.json`，前端不依赖构建工具或第三方库。核心运行方式是通过本地静态服务器打开 `index.html`，让浏览器可以正常 `fetch` `data/` 目录下的 JSON 文件。

## 目录结构

- `index.html`：应用入口页面，定义标题、筛选工具栏、结果摘要和录取结果表格。
- `assets/styles.css`：页面样式，包含整体布局、筛选栏、表格、展开明细、响应式适配等。
- `assets/app.js`：前端业务逻辑，负责加载数据、构建索引、筛选、排序、渲染表格和处理交互。
- `data/lq2.json`：本科批专业组汇总数据，共 3973 条。
- `data/lq.json`：本科批专业明细数据，共 13314 条。
- `data/gzzk-lq2.json`：高职（专科）批专业组汇总数据，共 1488 条。
- `data/gzzk-lq.json`：高职（专科）批专业明细数据，共 5680 条。
- `data/school-provinces.json`：院校名称到省份的映射，共 1490 所院校。
- `data/school-provinces-unmatched.json`：无法自动匹配省份的院校列表；当前为空。
- `scripts/serve-static.js`：使用 Node 内置 `http` 模块启动本地静态服务器。
- `scripts/generate-school-provinces.js`：根据院校名称和省市关键词规则重新生成院校省份映射。

## 本地运行

推荐使用项目自带的静态服务器：

```powershell
node scripts\serve-static.js
```

默认监听：

```text
http://127.0.0.1:8000/
```

如需改端口，可以先设置环境变量：

```powershell
$env:PORT=8001
node scripts\serve-static.js
```

也可以使用其他静态服务器，但不要直接用浏览器打开 `index.html` 文件路径，因为浏览器通常会限制本地文件对 JSON 的 `fetch` 请求。

## 数据模型

录取数据字段沿用招生考试数据中的缩写字段，常见字段如下：

- `YXDH`：院校代号，数据中可能带空格，前端会 `trim()`。
- `YXMC`：院校名称。
- `PCDM` / `PCMC`：批次代码 / 批次名称。
- `KLDM` / `KLMC`：科类代码 / 科类名称，例如 `历史类`、`历史类(专项类)`、`物理类`、`物理类(专项类)`。
- `JHLBMC`：计划类别。
- `ZYZDH`：专业组代号。
- `ZYZLQRS`：专业组录取人数。
- `ZYZZGF`：专业组最高分。
- `ZYZZDF`：专业组最低分。
- `ZYDH`：专业代码，仅专业明细数据有。
- `ZYMC`：专业名称，仅专业明细数据有。
- `LQRS`：专业录取人数，仅专业明细数据有。
- `ZGF` / `ZDF`：专业最高分 / 最低分，仅专业明细数据有。

前端使用 `PCDM | KLDM | YXDH | ZYZDH` 作为专业组和专业明细的关联键。修改数据时要保持这些字段一致，否则展开专业明细时可能找不到对应专业。

## 前端行为

- `assets/app.js` 启动后并行加载本科汇总、本科明细、专科汇总、专科明细和院校省份映射。
- 批次分为 `undergraduate`（本科）和 `vocational`（高职/专科）。
- 科类按钮只显示 `历史类` 和 `物理类` 两个入口，但判断逻辑是 `KLMC.includes("历史")`，所以 `历史类(专项类)` 会归入历史类，其他会归入物理类。
- 默认排序字段是 `ZYZZDF`，方向为降序，也就是按专业组最低分从高到低展示。
- 可排序字段包括院校、省份、计划类别、科类、专业组、录取人数、最高分、最低分。
- 专业关键词筛选会检查专业组下的专业明细 `ZYMC`，不是只看汇总行。
- 所有用户输入和数据渲染都会经过 `escapeHtml`，高亮搜索词时也会先转义再插入 `<mark>`。

## 省份映射生成

如果录取数据更新或新增院校，可以运行：

```powershell
node scripts\generate-school-provinces.js
```

脚本会读取：

- `data/lq2.json`
- `data/gzzk-lq2.json`

然后按省份名称、城市名称、院校关键词规则生成：

- `data/school-provinces.json`
- `data/school-provinces-unmatched.json`

如果 `school-provinces-unmatched.json` 中出现未匹配院校，应优先在 `scripts/generate-school-provinces.js` 的 `cityRules` 或 `supplementalRules` 中补充规则，再重新生成映射。

## 维护注意事项

- 文件是 UTF-8 编码；在 Windows PowerShell 中直接 `Get-Content` 有时可能显示乱码，优先用支持 UTF-8 的编辑器查看。
- 当前仓库已有未提交改动，修改前先确认 `git status --short`，不要回退他人的改动。
- 修改数据文件时要注意体积和字段完整性，尤其是汇总数据与明细数据之间的关联字段。
- 这个项目没有测试脚本；变更后建议至少启动本地服务器，在浏览器检查筛选、排序、批次切换和专业明细展开。
- 如果新增前端功能，尽量继续使用原生 HTML/CSS/JavaScript，保持项目无构建依赖的简单形态。
