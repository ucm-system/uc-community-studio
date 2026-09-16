# UC Poster Studio

UC Community 的活动与海报工作室。首页管理每期活动，点击“新建活动”或“编辑活动”进入海报编辑器，支持复制、自动保存和 4K PNG 导出。

## 在线使用

[打开 UC Poster Studio](https://ucm-system.github.io/uc-community-studio/)

GitHub Pages 托管工具页面，活动内容保存在当前浏览器，不会上传到 GitHub，也不会在不同设备间自动同步。

从原来的本地工具迁移：在本地编辑器点击 **导出草稿**，再到线上首页点击 **导入草稿**。两个网址的浏览器存储相互独立。

## 本地运行

在 macOS 上双击项目内的 **启动 UC Poster Studio.command**。它会启动本地服务并打开浏览器；使用期间保留终端窗口。

固定地址：**http://127.0.0.1:4173/**。使用同一个浏览器和这个地址，可以继续编辑之前的草稿。

首次安装依赖需要联网和 Node.js 22 或更新的 LTS 版本。字体、logo 和装饰图随项目提供，海报渲染与图片生成在浏览器内完成。

开发启动：

```sh
npm ci
npm run dev
```

## 制作新一期海报

1. 首页查看各期活动，点击 **新建活动**，或在已有活动卡片上复制上一期。
2. 修改草稿名称、主题、主讲人、时间及地点。示例数据带有“示例活动”标记，发布真实活动前取消该标记。
3. 按需上传头像、二维码。支持 PNG、JPG、WebP，单张不超过 8 MB；二维码使用你实际的会议或报名二维码。
4. 切换 **竖版 / 横版** 检查效果。它们使用同一份内容，分别排版。
5. 点击 **导出 4K PNG**。导出期间暂时锁定编辑，避免内容变化影响生成结果。
6. 点击 **活动首页** 返回列表。刷新编辑页或使用浏览器前进、后退，也能回到相应活动。

| 输出 | 分辨率 | 比例 |
| --- | --- | --- |
| 竖版海报 | 2880 × 3840 | 3:4 |
| 横版封面 | 3840 × 2160 | 16:9 |

顶部 **社区介绍 / 每期活动** 切换两类模板。社区默认文案已完整预填；在社区介绍模式编辑的栏目名称、主张等内容也会用于该草稿的活动海报。

标题支持手动换行；下方 **标题排版** 可调整为 75%–110%。如果内容过多，页面会指出超出空间的字段并暂停导出，请精简对应内容或调整字号。预览缩放仅影响屏幕显示，不影响 PNG 分辨率。

## 保存与备份

- 修改会自动保存到当前浏览器的 IndexedDB，顶部显示保存状态。等待图片在预览中出现、状态变为“已保存到本地”后再关闭页面。
- 复制草稿会创建独立记录，原草稿的文字和图片不受后续编辑影响。
- 左下角 **导出草稿** 下载 `.ucposter.json`，包含文字和上传图片。
- **导入草稿** 始终创建新记录，不覆盖已有记录。
- 更换浏览器、改用 localhost 或其他端口后，浏览器会使用不同的存储空间。使用固定地址，或通过草稿文件迁移。
- 清除网站数据会删除本地草稿。需要长期保留的活动请定期导出备份。

没有账号或服务端数据库。首次打开时提供一条明确标注的示例；删除全部活动后保持空列表。网址中的活动 ID 仅用于打开当前浏览器中的记录，不是跨设备分享链接。

## GitHub Pages 部署

仓库：`ucm-system/uc-community-studio`。推送到 `main` 后，`.github/workflows/pages.yml` 自动安装依赖、运行单元测试、构建并部署 `dist/client` 到 Pages。

Pages 的 Source 设置为 **GitHub Actions**。工作流使用 `PAGES_BASE_PATH=/uc-community-studio/` 生成正确的仓库子路径；开发时默认 `/`。页面使用 hash 路由，直接刷新编辑页不依赖服务器 URL 重写。

```sh
PAGES_BASE_PATH=/uc-community-studio/ npm run build
PAGES_BASE_PATH=/uc-community-studio/ npm run preview
```

## 文件与实现

- `src/model.ts`：活动、社区文案、输出规格、草稿文件契约。
- `src/ActivityHome.tsx` 与 `src/home.css`：活动首页、新建入口和活动卡片。
- `src/App.tsx`：首页与编辑器导航、编辑表单、导入导出。
- `src/Poster.tsx` 与 `src/poster.css`：两类模板和横竖版布局，文字始终可编辑。
- `src/useDrafts.ts` 与 `src/storage.ts`：草稿状态、按顺序持久化、异步图片读取后的字段合并。
- `src/export.ts`：等待本地字体和图片、检测溢出、按明确像素比导出 PNG。
- `examples/`：社区与活动海报的四份 4K PNG、示例草稿。
- `design/`：视觉方案和原始图形标志。

使用 React、TypeScript、Vite、IndexedDB、html-to-image。图标来自 Phosphor；字体使用本地提供的 Inter 和 Noto Sans SC，许可证随 `public/licenses/` 提供。

2026-09-16 按反馈保留原版字体、界面和蓝绿配色，在海报右侧与左下角增加同系列几何色块装饰。

栏目名称中的 Thursday、Tech、Talk 首字母 T 放大为周围文字的 1.6 倍，分别采用蓝、青绿、紫色，形成 3T 标识；蓝底模板使用相应浅色。完整栏目文字仍可编辑。

社区标题 UC Community 中的 U、C 和 Community 首字母 C 同样以蓝、青绿、紫色突出，保持原字号和其余文字颜色。

`public/assets/ucm-symbol.png` 从 UCM 原始图片左侧按 811 × 766 裁切，已验证 RGBA 像素一致。只使用图形，不包含 UCM 文字。装饰图由 ImageGen 根据选定方向生成，记录见 `design/README.md`。

## 验证

```sh
npm run build
npm test
npm run test:e2e
```

端到端测试使用独立浏览器数据目录，不修改你在工作室中的草稿。首次在新电脑运行测试时，可能需要先执行 `npx playwright install chromium`。

验证已启动的子路径预览或线上站点（使用独立测试浏览器数据）：

```sh
STUDIO_URL=https://ucm-system.github.io/uc-community-studio/ npm run test:e2e
```

测试覆盖首页、新建、编辑、返回和直接刷新、删除后空状态，以及四种版式的真实 PNG 下载及像素尺寸、图片和内容的草稿往返、复制后独立编辑、二维码解码、超长标题提示及窄屏操作。验证输出位于 `artifacts/`。
