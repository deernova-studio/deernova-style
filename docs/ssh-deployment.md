# One CLI + Infisical + SSH 部署

流程：**One → Infisical 读取部署凭据 → 构建 → SCP 上传 → SSH 切换版本 → HTTPS 验收**。官网继续部署到现有 ECS；HTTPS 证书和 Nginx 配置由服务器管理，不需要 OSS 或阿里云 AccessKey。

## 凭据与配置放在哪里

| 内容 | 存放位置 |
| --- | --- |
| SSH 私钥、服务器地址、账号、端口、已核验的主机公钥 | Infisical `shared-credentials` 项目，`prod` 环境，`/deernova-website` 目录 |
| One 登录会话 | 每位维护者本机的 One 配置目录，由 One 管理 |
| HTTPS 证书和私钥、Nginx 配置 | 服务器 `/etc/letsencrypt/`、`/etc/nginx/` |
| 公开的任务、部署脚本、域名、目录约定 | Git 仓库 |

接法与 HandyPick 的共享签名凭据一致：`one exec --global --env prod --path ... --keys ...`。`one.manifest.toml` 只登记工作区，不绑定项目级环境变量；仅部署、检查服务器、查状态和回滚任务读取部署目录，开发与构建不需要 Infisical 登录。

`deploy-credentials.mjs` 在系统临时目录创建权限为 `0700` 的目录，密钥、主机公钥和 SSH 配置均为 `0600`。它验证密钥和主机记录后，启动部署子进程，并从子进程环境中移除私钥等凭据值。SSH/SCP 使用临时配置和严格主机校验，不依赖本机 `~/.ssh/config` 或 agent。命令成功、失败或收到正常终止信号后都会清理临时目录；系统断电或强制 `SIGKILL` 无法执行清理。

## 其他维护者开始部署

本机需要 Node.js 22.12+、npm、OpenSSH（`ssh`/`scp`/`ssh-keygen`）、`tar`、`curl` 和 `shasum`。完整测试另需 Python 3.11.8+。服务器使用现有 Ubuntu 24.04、Python 3.12、Nginx、curl 和 systemd。

在包含本次接入的分支根目录运行：

```sh
npm run setup:one
export PATH="$PWD/.cache/one/bin:$PATH"
one mise trust
one run website:install
one login
one env --global
one env list --global --env prod --path /deernova-website
one run website:doctor
one run website:deploy
```

登录时选择维护团队所在的 Infisical 组织，并由管理员授予上述项目、环境和目录的读取权限。`one env --global` 用于确认当前绑定，`env list` 只显示变量名。首次登录后仍需将维护者的实际出口 IP 加入 ECS 的 SSH 安全组白名单；当前服务器为 `47.114.38.135:22`，规则使用 IPv4 `/32`。HTTP 代理的出口 IP 不一定是 SSH 的出口 IP。

获得授权后，无需在每台电脑复制部署私钥或编辑 SSH 配置。没有 Infisical 权限的开源用户不能部署到本服务器，读取该目录私钥的维护者则拥有对应服务器账号的权限。当前账号为 root；共享目录应只对管理员开放。服务器公钥授权使用 `restrict` 禁止转发和 PTY，但不限制 root 命令执行。

当前脚本针对 `deernova.me`、`www.deernova.me` 和 `/var/www/` 的现有网站环境。部署到自己的服务器时，需要自己的 Infisical 凭据和服务器、域名、证书配置，不能只换 IP 就自动初始化新服务器。npm 包 `@deernova/style` 只提供 skill 安装器和规范，不授予官网部署权限。

安装脚本固定 One **0.1.25** 并核对 SHA256，支持 macOS/Linux 的 arm64 和 x86_64，只写入 `.cache/one/`。上面的 PATH 仅影响当前终端；当前维护用 Mac 另已安装 `~/.local/bin/one`。One 首次运行可能下载 mise、Node 和 Process Compose。

`mise.toml` 固定 Node 24.13.0，显式复用根目录 npm scripts。One 0.1.25 的 Node 工具链使用 pnpm，因此本仓库采用 `toolchain = "none"`，保留 npm 锁文件。不要运行 `one init` 改写这些任务。

## 管理员首次存入部署凭据

目标为当前组织的 `shared-credentials` 项目、`prod` 环境、`/deernova-website` 目录，包含以下五项：

| 变量名 | 内容 |
| --- | --- |
| `DEERNOVA_SSH_HOST` | 实际服务器 IPv4 或 DNS 主机名，不是本机 SSH 别名 |
| `DEERNOVA_SSH_USER` | 服务器账号 |
| `DEERNOVA_SSH_PORT` | SSH 端口 |
| `DEERNOVA_SSH_PRIVATE_KEY` | 完整、无口令的专用 OpenSSH 私钥，仅通过标准输入传入 |
| `DEERNOVA_SSH_KNOWN_HOSTS` | 经控制台或可信渠道核验的 OpenSSH 主机公钥记录，包含匹配的主机和端口 |

先确认 `one whoami`、`one env --global` 指向正确账号和组织，并在 Infisical 的 `prod` 环境创建 `/deernova-website` 文件夹，再写入。以下为管理员操作示例，替换账号、主机和本机文件路径；不要把私钥粘贴到命令参数或提交到 Git。

```sh
one env set --global --env prod --path /deernova-website DEERNOVA_SSH_HOST 47.114.38.135
one env set --global --env prod --path /deernova-website DEERNOVA_SSH_USER root
one env set --global --env prod --path /deernova-website DEERNOVA_SSH_PORT 22
one env set --global --env prod --path /deernova-website --stdin DEERNOVA_SSH_KNOWN_HOSTS < /path/to/verified-known-hosts
one env set --global --env prod --path /deernova-website --stdin DEERNOVA_SSH_PRIVATE_KEY < ~/.ssh/deernova_deploy_ed25519
```

One 0.1.25 的共享凭据写入在文件夹不存在时可能返回 `INFISICAL_FOLDER_NOT_FOUND`；先创建文件夹再重试。服务器需要已授权对应公钥、SSH 服务正常，账号能更新 `/var/www/` 并执行 Nginx 检查和重载；普通账号需已有 `sudo -n python3` 权限。脚本不会创建服务器账号或自动放开安全组。

## 日常命令

| 命令 | 行为 |
| --- | --- |
| `one run website:dev` | 本机开发，不读取部署凭据 |
| `one run website:check` | 构建和完整测试，包含隔离部署及凭据清理测试 |
| `one run website:pack` | 构建发布包，不连接 Infisical 或服务器 |
| `one run website:deploy -- --dry-run` | 预览凭据来源和部署步骤，不读取凭据或连接服务器 |
| `one run website:doctor` | 从 Infisical 获取凭据，验证 SSH、Python、Nginx 和版本目录 |
| `one run website:deploy` | 从 Infisical 获取凭据，构建、上传、部署并验收 |
| `one run website:status` | 查询当前版本与上一版本 |
| `one run website:rollback` | 恢复上一版本并验收 |

`npm run doctor/status/deploy/rollback` 使用相同的 Infisical 入口，也需要 One。发布包含当前本机未提交改动，不执行 git push 或 npm 包发布。One 自身的 `--dry-run`（位于 `--` 之前）只展示任务计划；上表的 `-- --dry-run` 会进入部署脚本预览。

若 Infisical 暂时不可用，且本机已有可信的 SSH 配置，可显式使用备用入口；默认流程不会自动绕过 Infisical 授权：

```sh
DEERNOVA_SSH_HOST=deernova node scripts/deploy-ssh.mjs check
DEERNOVA_SSH_HOST=deernova node scripts/deploy-ssh.mjs deploy
```

## 部署、验收与恢复

公开网站发布包上传到独立 `/tmp/deernova-upload.*` 目录；服务器脚本通过 SSH 标准输入执行。服务器校验 SHA256、归档路径、文件类型、必要文件和模板占位符，使用 `flock` 防止并发发布，解压到 `/var/www/releases/deernova-TIMESTAMP` 后原子切换 `/var/www/deernova`。成功版本保留，上传临时目录在结束后清理。

Nginx 重载或站内 HTTPS 内容校验失败，会尝试恢复原版本。站内检查通过本机 Nginx 校验证书和两个域名的页面、CSS、脚本、token 内容；随后本机检查两个公网域名的相同内容、HTTP → HTTPS 跳转，以及未知页面和 `.git/config` 的 404。

若服务器已切换成功、本机公网验收失败，会报告当前版本；不会因本机 DNS/网络问题自动回滚。SSH 中断时结果也可能未知，应先运行 `website:status`。需要回滚时运行 `website:rollback`，或指定仍然存在的历史版本：

```sh
one run website:rollback -- --release /var/www/releases/deernova-TIMESTAMP
```

上一版本记录在 `/var/www/.deernova-previous`。回滚只接受 `/var/www/releases/deernova-*` 或历史 `/var/www/deernova-before-*` 的真实完整网站目录。详细历史见 [部署记录](deployment.md)。

## 常见问题

- Infisical 未登录或登录过期：运行 `one login`，选择正确组织。
- 文件夹不存在或缺少变量：核对项目、`prod`、`/deernova-website` 及五项变量的读取权限；不会回退到本机私钥。
- 主机验证失败：通过可信渠道核对服务器主机公钥后更新 Infisical 记录，不关闭主机验证。
- `Permission denied (publickey)`：检查云端私钥是否与服务器已授权公钥对应、账号是否正确。
- SSH 超时：检查当前网络出口 IP 是否仍在安全组白名单，及端口、系统防火墙、SSH 服务。
- `sudo` 要求密码：使用具有非交互执行权限的账号。
- `Another deploy or rollback is running`：等待当前操作完成后查询状态。

GitHub Actions 只做构建、测试和不读取凭据的 One dry-run，不连接生产。当前流程使用维护者的 One 用户登录；CI 的机器身份和自动发布另行配置。
