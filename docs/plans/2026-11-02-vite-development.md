# Vite 开发服务

`npm run dev` 直接运行 Vite，根目录为 `apps/website`，继续使用本机 4173 端口。CSS 使用 Vite 原生热更新，HTML 和未声明 HMR 接收的脚本自动刷新。端口占用时明确报错，避免用户打开旧服务。

开发模式与静态构建共用 Markdown 模板渲染函数。规范文档在请求时渲染，变更时通知规范页刷新；共享 token 和截图直接从 skill 源目录加载。开发时从 tokens.json 在内存生成 CSS 和规范表格，不写回源码或 dist。生产构建保留 token 同步检查。

验证实际 HTTP 页面、共享素材和 WebSocket 更新消息：CSS 更新、脚本刷新、Markdown 修改与设计变量修改。测试使用隔离目录，不往当前工作区写测试标记。原来的静态预览保留为 `npm run preview`。
