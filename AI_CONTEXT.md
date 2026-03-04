# AI Context: xhs-img-vue

本文件用于帮助 AI（或新接手的开发者）快速理解本项目的目标、结构与关键实现。

## 1) 项目定位

- 类型：`Vue 3 + Vite` 单页应用
- 目标：将 Markdown 内容排版成“小红书风格”图片页，并在网页端导出 PNG
- 主要能力：
  - 左侧富文本编辑（TipTap）
  - 右侧分页预览
  - 导出当前页 PNG
  - 导出全部页 ZIP

## 2) 常用命令

- 安装依赖：`npm install`
- 本地开发：`npm run dev`
- 构建：`npm run build`
- 预览构建产物：`npm run preview`

## 3) 目录与职责

- `src/App.vue`
  - 主页面：编辑器、预览、页码联动、导出逻辑
- `src/components/XhsPage.vue`
  - 单页渲染组件（网格背景、正文块、页脚页码）
- `src/parser/markdown.js`
  - Markdown token -> block 结构
- `src/paginator/index.js`
  - block -> pages 分页逻辑
- `src/editor/colorMark.js`
  - TipTap 自定义颜色 mark
- `src/constants/layout.js`
  - 页面尺寸、行高、容量常量
- `content/post.md`
  - 默认输入内容（前端初始内容）

## 4) 核心数据结构

### Block

统一中间层数据，供预览与导出使用：

```js
{
  type: "title" | "subtitle" | "paragraph" | "pageBreak",
  runs?: Run[]
}
```

### Run

```js
{
  text: string,
  strong: boolean,
  color?: string | null
}
```

- `strong`：来自 Markdown `**bold**`
- `color`：来自内联 `<span data-color="...">text</span>`

## 5) Markdown 解析规则

- `#` -> `title`
- `##` -> `subtitle`
- 普通段落 -> `paragraph`
- `---` -> `pageBreak`
- `**text**` -> `run.strong = true`
- `<span data-color="#xxxxxx">text</span>` -> `run.color = "#xxxxxx"`

> 注意：当前实现依赖内联 HTML span 传递颜色信息。

## 6) 分页逻辑

项目存在两套分页模式（同一函数 `paginateBlocks`）：

1. 手动分页模式（当前前端实际使用）
   - `paginateBlocks(blocks, { pageBreakOnly: true })`
   - 仅按 `pageBreak` 拆页，不做自动行数分页
2. 自动分页模式（保留能力）
   - 基于 `maxLinesPerPage`、`CAPACITY`、估算行数进行拆分
   - 会拆分过长 block（按字符切片）

## 7) 前端主流程（App）

1. 加载 `content/post.md` 作为初始内容
2. TipTap 编辑器内容变化 -> 序列化回 Markdown
3. Markdown -> blocks（`parseMarkdownToBlocks`）
4. blocks -> pages（`paginateBlocks`）
5. 当前页数据传给 `XhsPage` 预览
6. 导出时对隐藏渲染节点执行 `toPng`，并下载 PNG / ZIP

另外，编辑区和预览区有“定位联动”：
- 光标/滚动会更新当前页
- 切换预览页会尝试定位到编辑器对应位置

## 8) 导出机制说明（网页端）

- 依赖：`html-to-image` + `jszip`
- `exportCurrentPng`：导出当前页
- `exportAllPng`：逐页渲染后压缩为 `xhs-pages.zip`

## 9) 样式与视觉

- 页面尺寸：`1080 x 1440`
- 深色背景 + 半透明网格叠层
- 字体：`src/assets/fonts/ChildFunSans.ttf`
- 页脚包含作者与页码

## 10) 对 AI 的改造建议

如果你（AI）要修改此项目，优先遵循：

1. 先改“中间层”再改“渲染层”
   - 先确认 `block/run` 数据兼容，再改组件样式
2. 明确分页策略
   - 当前默认手动分页；切回自动分页前需完整回归
3. 导出相关改动优先关注稳定性
   - 截图背景色、缩放比例、异步渲染时序

## 11) 已知技术债

- 颜色能力通过 HTML span 透传，可读性较低
- 自动分页能力存在但默认未启用，行为可能与期望不完全一致

---

如需进一步自动化，可新增：
- `docs/architecture.md`（更详细的设计文档）
- 单元测试：解析器/分页器
