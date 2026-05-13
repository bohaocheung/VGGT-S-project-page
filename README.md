# Colalab 项目主页说明书

这是一个面向论文、模型、数据集、实验结果和项目展示的静态项目主页模板。它使用原生 `HTML + CSS + JavaScript` 实现，不需要 React、Vue 或 npm 构建流程；你可以直接编辑 `index.html`、`static/css/index.css` 和 `static/js/index.js` 来替换内容、调整样式和扩展交互。

它适合用于：

- 学术论文主页
- 开源模型或系统项目主页
- 数据集与 benchmark 展示页
- 机器人、视觉、语言模型、多模态等实验型项目展示
- 需要视频 demo、图表、表格、引用和代码入口的研究项目

## 为什么这个模板好用

### 1. 纯静态，部署简单

整个页面不依赖构建工具，GitHub Pages、学校服务器、实验室主页、Cloudflare Pages 等静态托管都可以直接部署。修改内容时也不需要安装复杂环境。

### 2. 模块完整，适合研究项目

页面已经包含一个完整项目主页常见的核心模块：

- Hero 首屏动画
- Logo 与项目标题
- 作者和机构信息
- Paper / Code / Model / Dataset 等资源入口
- 顶部 demo carousel
- 项目介绍段落
- 交互式方法图
- 可替换模型结构图
- 项目视频
- 数据可视化
- 3D scatter / t-SNE 占位图
- 圆环数据组成图
- 横向实验指标图
- 纵向柱状图 carousel
- 下方 demo gallery
- 交互式实验表格
- 段落引用和侧边 reference
- BibTeX 引用
- 夜间模式
- Footer copyright

这些模块覆盖了论文主页从“吸引读者”到“展示可信实验”的主要需求。

### 3. 交互丰富，但结构仍然清楚

页面提供 carousel、图表、表格 hover、高亮、视频预览、引用跳转、夜间模式等交互，但仍然保留了可读的 HTML 结构。后续替换文字、图片、视频、表格和引用时，不需要理解复杂框架。

### 4. 视觉风格统一

页面里的 demo、video、data chart、results table 都采用一致的卡片式模块设计，适合科研项目的展示气质：信息密度高，但不显得杂乱。

### 5. 方便后续扩展

页面通过 `window.ProjectPageConfig` 集中暴露了一部分配置，例如主题、图表数据、demo 播放间隔、引用信息和 footer 信息。未来想替换图表数据、自动滚动时间、引用列表等，可以优先从配置对象入手。

## 快速预览

在仓库根目录运行：

```powershell
python -m http.server 8000
```

然后打开：

```text
http://localhost:8000
```

建议使用本地服务器预览，不要直接双击打开 `index.html`。有些浏览器在 `file://` 模式下会限制视频、脚本或资源加载行为。

## 文件结构说明

### `index.html`

主页主体文件。页面中的标题、作者、段落、按钮、图表容器、表格、引用、视频和模块结构大多在这里。

常改内容：

- 项目标题
- 作者和机构
- 资源按钮链接
- 段落文案
- demo 视频
- 表格数据
- YouTube 视频
- BibTeX
- References

### `static/css/index.css`

页面样式文件。控制布局、颜色、夜间模式、hero 动画、carousel、卡片、表格、引用、图表容器和响应式设计。

常改内容：

- 全局字体
- 页面宽度
- 颜色主题
- 卡片圆角和阴影
- 表格样式
- demo gallery 样式
- hero 可乐动画
- 夜间模式适配

### `static/js/index.js`

页面交互文件。控制主题切换、carousel、图表渲染、表格增强、引用跳转、视频预览和 footer 文案。

常改内容：

- 图表渲染逻辑
- carousel 自动播放逻辑
- 表格自动高亮规则
- 引用侧栏行为
- demo 预览弹窗

### `static/images/`

图片资源目录。可以放 teaser、方法图、数据图、项目截图等。

### `static/videos/`

视频资源目录。顶部 carousel、下方 demo gallery 和可播放示例视频都可以从这里读取。

### `static/pdfs/`

PDF 资源目录。适合放论文、补充材料、技术报告等。

### `cologo/cologo.png`

Hero 和导航中使用的 logo。替换同名文件即可快速更换 logo。

## 页面模块说明

## 1. 首屏 Hero

Hero 是进入页面后的第一视觉焦点，包含项目 logo、标题和动态背景效果。

它的作用：

- 让项目名称一眼可见
- 给页面建立品牌感
- 通过动画让静态论文主页更有记忆点

相关位置：

- HTML：`index.html` 中的 `project-hero`
- CSS：`static/css/index.css` 中的 hero、cola、bubble 相关样式
- JS：`setupHeroCollapse()`

如果要修改项目名称，搜索：

```text
Project Title:
```

## 2. 作者、机构与资源入口

Hero 下方有作者、机构和资源按钮区域。资源按钮适合链接到：

- Paper
- Supplementary
- Code
- Weights
- Datasets

优点：

- 用户能快速进入最重要资源
- 图标化按钮比纯文本链接更容易扫读
- 适合论文主页常见访问路径

修改方式：

在 `index.html` 搜索：

```html
class="resource-card"
```

替换每个 `<a>` 的 `href`。

图标来自 Iconify，例如：

```html
<iconify-icon class="resource-icon resource-icon-paper" icon="academicons:arxiv"></iconify-icon>
```

想换图标，可以去 Iconify 搜索图标名，然后替换 `icon="..."`。

## 3. 顶部 Demo Carousel

顶部 demo carousel 用于快速展示项目效果，可以放机器人执行视频、模型输出、图像结果、GIF 或短视频。

功能特点：

- 自动滚动
- 左右切换
- 下方进度点
- 点击 demo 可放大预览
- 预览时背景虚化
- 支持视频播放控制

优点：

- 读者不用滚动太久就能看到项目“真的能做什么”
- 多个 demo 可以在有限空间内展示
- 点击放大能兼顾首页紧凑布局和细节查看

修改位置：

```html
<div class="media-carousel-track" data-carousel-track>
```

每个 demo 类似：

```html
<article class="media-tile" data-carousel-slide>
  <video autoplay muted loop playsinline preload="metadata">
    <source src="static/videos/carousel1.mp4" type="video/mp4">
  </video>
  <span class="media-speed-badge">1x</span>
</article>
```

替换视频路径即可：

```html
<source src="static/videos/your_demo.mp4" type="video/mp4">
```

## 4. 正文介绍与段落引用

正文段落用于解释项目动机、方法、数据和结果。段落中可以加入引用，例如：

```html
<a class="inline-ref" href="#ref-main" data-ref="ref-main">[1]</a>
```

页面会在对应段落旁边显示 reference 卡片。

优点：

- 不用把引用全部堆在页面底部
- 读者能在阅读时直接看到相关论文信息
- 引用卡片可以跳转，方便追踪来源

引用数据在 `window.ProjectPageConfig.references` 中配置。

每条引用包含：

```js
{
  id: "ref-main",
  label: "[1]",
  title: "Paper Title",
  authors: "Author et al.",
  venue: "Conference",
  year: "2026",
  url: "https://example.com"
}
```

## 5. 交互式方法图

方法图区域包含一张可交互的流程图和一组步骤说明卡片。

当前结构包含：

```text
data -> model -> deployment -> feedback
```

特点：

- 鼠标滚动或点击步骤可以切换高亮
- 图中节点、连线和文字说明同步变化
- 适合解释 pipeline、模型流程、训练流程或系统部署流程

优点：

- 比静态图片更容易解释复杂方法
- 可以把读者注意力引导到当前步骤
- 后续可以替换为自己的 SVG 或 HTML 模块

相关位置：

```html
<div class="method-diagram-scroll" data-method-diagram>
```

如果要新增步骤，需要同时保持三类名字一致：

```html
data-method-node="encoder"
data-method-link="encoder"
data-method-step="encoder"
```

并在 `static/js/index.js` 的 `stepThemes` 中添加对应颜色。

## 6. 可替换模型结构图

模型结构图使用 HTML 模块 + SVG 线条构成，不是普通图片。

特点：

- 模块位置可用 CSS 调整
- 箭头可以用 SVG path 调整
- 支持 MathJax LaTeX 公式
- 支持夜间模式适配
- 可以替换成自己的架构图

优点：

- 比截图更容易后期修改
- 适合论文主页里展示模型结构
- 可以保留动态图线，视觉上更清楚

相关位置：

```html
<div class="model-architecture" data-model-architecture>
```

如果想快速替换成图片，可以把内部内容换成：

```html
<img src="static/images/model-architecture.svg" alt="Model architecture diagram" class="section-figure section-figure-wide">
```

如果想继续使用可编辑结构，则修改：

- HTML 模块：`.system-panel-*`、`.system-chip-*`
- SVG 连线：`.system-architecture-lines`、`.system-model-lines`
- CSS 位置：`static/css/index.css` 中的 `.system-panel-*` 和 `.system-chip-*`

## 7. Project Video 模块

视频模块用于嵌入项目介绍视频、论文讲解、demo montage 或补充展示。

相关位置：

```html
<div class="video-card">
```

当前使用 YouTube iframe：

```html
src="https://www.youtube.com/embed/JkaxUblCGz0"
```

替换成自己的视频 ID 即可。

优点：

- 适合放 2 到 5 分钟项目介绍
- 用户可以在页面内直接观看
- 和其他卡片模块视觉统一

## 8. The Data 数据展示

Data 区域包含两种可视化：

### 3D t-SNE / Scatter Visualization

这是一个 Plotly 3D scatter 占位图，用于展示数据分布、任务簇、模型 rollout 或 embedding。

相关函数：

```js
setupTsnePlot()
```

优点：

- 适合展示数据多样性
- 可以让数据集不只是文字描述
- 支持旋转、缩放和 hover

### Interactive Composition Chart

这是一个交互式圆环图，用于展示数据组成比例。

特点：

- 鼠标 hover 可高亮扇区
- 中心显示当前类别和比例
- 图例在外侧，不挤占圆环
- 夜间模式颜色适配

相关配置：

```js
window.ProjectPageConfig.dataPie
```

优点：

- 比普通饼图更清爽
- 适合展示 dataset mix、任务比例、场景比例、来源比例等

## 9. The Results 实验结果

Results 区域是页面的信息密度核心，包含多个实验展示方式。

### 横向指标图

横向图用于展示成功率、泛化能力、效率等指标。

特点：

- tab 切换不同指标组
- hover 可查看数值
- 保留横向柱状图，适合快速比较

相关配置：

```js
window.ProjectPageConfig.horizontalMetrics
```

### 纵向柱状图 Carousel

纵向柱状图用于展示 task-by-task 对比。

特点：

- 单独模块，不替代横向图
- 左右按钮切换
- 下方进度条
- 自动播放
- 鼠标 hover 显示具体数值
- 支持夜间模式
- 动画为柔和滑入滑出

相关配置：

```js
window.ProjectPageConfig.verticalCharts
```

优点：

- 横向图适合摘要比较，纵向图适合细分任务比较
- carousel 可以放多个实验视角，不会把页面拉得太长

### Demo Gallery

下方 demo gallery 用于展示 qualitative rollouts。

特点：

- 卡片式 3D 层叠效果
- 左右按钮
- 进度条
- 自动播放
- 支持一个可播放、可暂停、可拖动进度条的视频示例

优点：

- 定量结果之外，也能展示实际效果
- 适合放成功案例、失败案例、长时序 demo、跨场景 demo

### 实验表格模块

表格现在被包在一个完整的 `tables-panel` 中，风格和 demo gallery 一致。

特点：

- 有标题、说明和 caption
- 表格外层卡片化
- hover 行列高亮
- 点击行可固定高亮
- 最佳值自动或手动高亮
- 窄屏时变成一列
- 宽表在卡片内部横向滚动

优点：

- 学术结果通常需要表格，但普通表格容易显得生硬
- 卡片包装后和页面其他模块统一
- hover / pin 能帮助读者横向比较数据

表格位置：

```html
<div class="tables-panel" data-enhanced-tables>
```

最佳值可以手动添加：

```html
<td class="is-best">0.85</td>
```

## 10. Citation 与 BibTeX

页面底部包含 BibTeX 引用区和复制按钮。

相关位置：

```html
<pre id="bibtex-code"><code>...</code></pre>
```

优点：

- 方便别人引用你的项目或论文
- Copy 按钮会自动复制 BibTeX 内容

## 11. 夜间模式

页面支持夜间模式：

- 默认跟随系统主题
- 用户切换后写入 `localStorage`
- 刷新后记住用户选择
- 图表、表格、引用、demo、视频卡片都做了深色适配

相关配置：

```js
theme: {
  defaultMode: "system",
  storageKey: "colalab-project-theme"
}
```

优点：

- 学术主页经常被长时间阅读，夜间模式更舒适
- 视觉上也更适合展示视频和图表

## 12. Footer

Footer 默认文案为：

```text
© 2026 Colalab. All rights reserved.
```

相关配置：

```js
footer: {
  organization: "Colalab",
  year: 2026
}
```

## 常用修改指南

## 修改字体

当前全局字体是 Arial：

```css
body {
  font-family: Arial, sans-serif;
}
```

如果要换字体，修改 `static/css/index.css` 中的 `body` 即可。

如果要使用 Google Fonts，需要在 `index.html` 重新加入字体 `<link>`，再修改 CSS。

## 修改页面宽度

主内容宽度变量：

```css
--content-measure: 1080px;
```

位置在 `static/css/index.css` 的 `:root` 中。

## 修改自动播放时间

在 `window.ProjectPageConfig` 中修改：

```js
demoAutoplayInterval: 6000,
verticalChartAutoplayInterval: 7000
```

单位是毫秒。

## 替换图片

图片一般放在：

```text
static/images/
```

可以直接替换同名文件，也可以在 `index.html` 中修改 `src` 路径。

建议：

- 截图用 `.jpg` 或 `.webp`
- 透明图用 `.png`
- SVG 图尽量保留矢量格式
- 文件名使用小写英文和短横线

## 替换视频

视频一般放在：

```text
static/videos/
```

推荐格式：

- `.mp4`
- H.264 编码
- 控制文件大小
- autoplay 视频保留 `muted` 和 `playsinline`

示例：

```html
<video autoplay muted loop playsinline preload="metadata">
  <source src="static/videos/your-demo.mp4" type="video/mp4">
</video>
```

## 修改图表数据

主要图表数据在 `index.html` 里的：

```js
window.ProjectPageConfig
```

常改字段：

```js
horizontalMetrics
verticalCharts
dataPie
references
footer
```

这样做的好处是不用深入改渲染逻辑，就能替换大部分展示数据。

## 修改表格数据

搜索：

```html
<div class="tables-panel" data-enhanced-tables>
```

直接编辑 `<table>` 里的 `<th>`、`<td>`。

如果某个单元格是最佳值，可以加：

```html
class="is-best"
```

## 修改引用

正文引用写法：

```html
<a class="inline-ref" href="#ref-main" data-ref="ref-main">[1]</a>
```

引用卡片数据写在：

```js
references: [
  {
    id: "ref-main",
    label: "[1]",
    title: "Paper Title",
    authors: "Author et al.",
    venue: "Conference",
    year: "2026",
    url: "https://example.com"
  }
]
```

注意：`data-ref` 和 `id` 必须一致。

## 发布到 GitHub Pages

1. 把仓库推送到 GitHub。
2. 打开仓库页面。
3. 进入 `Settings`。
4. 打开 `Pages`。
5. Source 选择对应分支，例如 `master` 或 `main`。
6. Folder 选择 `/`。
7. 保存后等待部署。

## 推荐替换顺序

如果你要把这个模板改成真实项目主页，推荐按这个顺序：

1. 替换项目标题、作者、机构。
2. 替换资源按钮链接。
3. 替换 logo。
4. 替换顶部 demo 视频。
5. 替换 overview、model、data、results 文案。
6. 替换模型结构图。
7. 替换数据图和图表配置。
8. 替换实验表格。
9. 替换下方 demo gallery。
10. 替换引用和 BibTeX。
11. 检查夜间模式。
12. 本地预览并发布。

## 维护建议

- 保持视频文件尽量小，避免主页加载过慢。
- 不使用的图片、视频和 PDF 应及时删除。
- 重要图片添加清晰的 `alt` 文本。
- 修改 CSS 前优先搜索已有类名，尽量沿用现有设计系统。
- 修改 JS 前优先查看是否已有配置项可以满足需求。
- 发布前同时检查浅色模式、夜间模式、移动端和桌面端。

## 总结

这个模板的目标不是做一个普通静态页面，而是提供一个“研究项目说明书式主页”：它既能展示项目的视觉吸引力，也能承载论文主页需要的严肃信息，包括方法、数据、实验、引用和资源入口。

它的优点是：

- 内容模块完整
- 视觉风格统一
- 交互足够丰富
- 结构仍然容易修改
- 部署成本低
- 后续扩展方便

因此，它适合作为 Colalab 项目、论文主页和开源研究系统的基础页面。
