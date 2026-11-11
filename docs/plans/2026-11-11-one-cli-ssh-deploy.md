# One CLI SSH Deployment Implementation Plan

**Goal:** 用 `one run website:deploy` 将官网直接发布到现有 ECS，支持连接检查、版本查询和回滚。

**Architecture:** One 的 manifest 和 mise 任务复用根目录 npm scripts。OpenSSH 使用用户本机的 SSH 配置与密钥，SCP 上传公开发布包，SSH 通过标准输入执行部署脚本，完成服务器上的原子切换与健康检查。无需 OSS、阿里云 AccessKey 或 One 凭据库登录。

**Tech Stack:** One CLI 0.1.25、Node.js 24、OpenSSH、服务器 Python 3.12、现有 Nginx。

## 范围

- 用户已选择 SSH 直连，并授权完成本机工具、服务器访问配置和真实部署验收。
- 复用现有站点构建和 Nginx 配置，不增加云资源或 npm 发布。
- 默认 SSH 别名 `deernova`，用 `DEERNOVA_SSH_HOST` 覆盖；密钥和 known_hosts 仅在本机管理。

## 实施步骤

1. 增加固定版本、校验 SHA256 的 `scripts/bootstrap-one.sh`，登记 `one.manifest.toml`，用实际 CLI 验证 `mise.toml`。One 0.1.25 的 Node 工具链仅支持 pnpm，因此采用 `toolchain = "none"` 和显式 npm 任务；不迁移包管理器。
2. 让 `scripts/package-site.mjs` 导出打包结果，避免解析日志或误取旧包；增加 `scripts/deploy-ssh.mjs`，提供 check、status、deploy、rollback 和 `--dry-run`，保持 SSH 主机校验，支持非交互密钥认证。
3. 扩展 `scripts/deploy-site.py`：严格校验发布包、部署锁、原子切换、保存上一版本、异常恢复、限定范围回滚，以及站内 HTTPS 内容校验。保留历史手动发布命令兼容。
4. 增加隔离的部署测试：坏包不切换、健康检查失败恢复、并发发布互斥、回滚范围、SSH 参数与失败传播。复用现有 Node 测试入口，并通过 Python unittest 验证服务器脚本；不访问真实 SSH。
5. 更新 `docs/deployment.md`、README 和 CI 检查，说明一次性 SSH 设置、命令、权限与故障处理。
6. 验证 One 任务发现、dry-run、构建打包、完整测试及工作区 diff。配置 SSH 后验收真实连通性、一键发布和版本状态。

## 本地验收结果

- 已通过固定 One 0.1.25 的实际任务执行：`website:deploy -- --dry-run`、`website:check`、`website:pack`。
- `website:check`：80 项 Node 测试通过，其中服务器测试入口实际运行了 10 项 Python 部署用例。
- 实际发布包通过服务器 `Site.extract`、SHA256、必要文件和路径边界检查，仅包含公开站点入口与资源目录。
- 2026-11-11 已将固定版本 One 安装到本机 `~/.local/bin/one`，配置专用部署密钥、`deernova` SSH 别名和经过云控制台核对的主机密钥。
- 用户当场确认后，安全组放行本机出口 IPv4 `/32` 的 TCP 22，部署公钥写入 root 的 `authorized_keys`，使用 `restrict` 限制转发和 PTY。
- 真实 `website:doctor`、`website:deploy`、`website:status` 均通过；当前版本为 `/var/www/releases/deernova-20261111T151334684012Z`，两个域名公网验收通过，上一版本已保留。
- 生产回滚未演练；回滚和异常恢复已通过本地隔离测试。
