# One CLI + SSH 部署

流程：**One → npm 构建 → SCP 上传 → SSH 执行部署脚本 → HTTPS 验收**。使用本机 `~/.ssh/config`、密钥和 agent，不需要 OSS、阿里云 AccessKey 或 One/Infisical 登录。

2026-11-11 已完成本机与生产 SSH 配置，并通过真实的一键发布验收。当前这台 Mac 已安装 `~/.local/bin/one`、配置 `deernova` SSH 别名并核对服务器主机密钥，在仓库根目录直接运行 `one run website:deploy` 即可。完整发布记录见 [部署记录](deployment.md)。

当前部署私钥为 `~/.ssh/deernova_deploy_ed25519`，只保存在本机；服务器上的公钥使用 `restrict` 禁用端口转发、agent 转发及 PTY。安全组仅允许配置时的本机直连出口 IPv4 `/32` 访问 TCP 22。更换网络或出口 IP 变化后，需要先更新安全组来源；HTTP 代理的出口 IP 不一定是 SSH 使用的出口 IP。

## 其他维护者能否直接部署

Git 共享的是部署任务、脚本和文档，不包含本机私钥、SSH 配置或服务器访问权限；当前 One 仅作为统一任务入口，未接入共享凭据库。

其他维护者拉取包含这些改动的分支后，需要完成一次本机工具初始化，生成自己的 SSH 密钥，由服务器管理员授权其公钥并放行其出口 IP，再配置 `deernova` 别名、核对服务器主机密钥。`one run website:doctor` 通过后，即可运行 `one run website:deploy`。管理员可以通过已有的 SSH 连接追加公钥，无需每次打开控制台，也无需复制其他维护者的私钥。

当前脚本针对 `deernova.me`、`www.deernova.me` 及现有 `/var/www/`、Nginx 环境。部署到另一台服务器时，还需准备相应服务、域名和证书；只改 SSH 地址并不能自动初始化整台服务器。通过 npm 安装 `@deernova/style` 的普通使用者只获得 skill 安装器和规范，不会获得官网部署权限。

## 初始化本机工具

本机需要 Node.js 22.12+、npm、OpenSSH（`ssh`/`scp`）、`tar`、`curl` 和 `shasum`。运行完整测试另需 Python 3.11.8+。服务器继续使用现有 Ubuntu 24.04、Python 3.12、Nginx、curl 和 systemd。

在仓库根目录运行：

```sh
npm run setup:one
export PATH="$PWD/.cache/one/bin:$PATH"
one mise trust
one run website:install
```

安装脚本固定 One **0.1.25** 并核对仓库内登记的 SHA256，支持 macOS/Linux 的 arm64 和 x86_64；仅写入仓库 `.cache/one/`。PATH 只影响当前终端，重新打开终端后需在仓库根目录再执行，或直接用 `.cache/one/bin/one`。One 首次运行可能下载其 mise、Node 和 Process Compose 运行工具。

`one.manifest.toml` 将官网登记为 `toolchain = "none"`，`mise.toml` 手工维护任务并固定 Node 24.13.0。One 0.1.25 的 Node 工具链只支持 pnpm，显式任务则可以保留本仓库的 npm 锁文件和构建方式。不要用 `one init` 迁移包管理器；修改任务时同步维护 `mise.toml` 与根目录 `package.json`。

## 一次性配置 SSH

现有服务器为杭州 ECS，公网 IP `47.114.38.135`。如需新密钥，在本机运行下面的命令；已有适用密钥可直接使用。

```sh
ssh-keygen -t ed25519 -f ~/.ssh/deernova_deploy_ed25519 -C deernova-site-deploy
ssh-add ~/.ssh/deernova_deploy_ed25519
```

通过目前可用的阿里云控制台终端，将 **`.pub` 公钥**追加到服务器登录账号的 `~/.ssh/authorized_keys`；目录权限为 `700`，文件权限为 `600`。私钥保留在本机。安全组开放实际 SSH 端口（默认 22）给本机出口 IP，同时确认服务器 SSH 服务和系统防火墙允许连接。

把下面一段添加到本机 `~/.ssh/config`，按实际账号、端口和密钥路径调整：

```sshconfig
Host deernova
    HostName 47.114.38.135
    User root
    Port 22
    IdentityFile ~/.ssh/deernova_deploy_ed25519
    IdentitiesOnly yes
    ForwardAgent no
    ServerAliveInterval 15
```

部署账号需要更新 `/var/www/`，执行 `nginx -t` 和 `systemctl reload nginx`。当前流程支持 root；使用普通运维账号时，它必须已有 `sudo -n python3` 的执行权限（这是管理员级权限）。脚本不会创建账号、更改 sudoers 或打开端口。

先通过控制台核对服务器主机指纹（例如 `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`），再在本机完成首次交互连接，将核对过的主机记录加入 `known_hosts`：

```sh
ssh deernova true
one run website:doctor
```

`doctor` 检查密钥连接、执行权限、Python 版本、Nginx 配置与运行状态，以及当前/上一版本目录；不发布网站。自动化命令固定启用 `BatchMode=yes` 和 `StrictHostKeyChecking=yes`，不会询问登录密码或自动接受未知主机。加密私钥先用 `ssh-add` 加载到 agent。

也可使用自己的 SSH 别名；端口、用户、跳板机等配置仍放在 `~/.ssh/config`：

```sh
DEERNOVA_SSH_HOST=my-ecs one run website:doctor
DEERNOVA_SSH_HOST=my-ecs one run website:deploy
```

## 日常命令

| 命令 | 行为 |
| --- | --- |
| `one run website:dev` | 启动本机 Vite 开发服务 |
| `one run website:check` | 构建并运行全部测试，包含隔离部署测试 |
| `one run website:pack` | 只构建发布包和 SHA256，不连接服务器 |
| `one run website:deploy -- --dry-run` | 输出目标与步骤，不构建、不连接生产服务器 |
| `one run website:doctor` | 检查 SSH 和服务器条件 |
| `one run website:deploy` | 检查服务器，构建、上传、部署并验收 |
| `one run website:status` | 查询当前目录与记录的上一版本 |
| `one run website:rollback` | 恢复记录的上一版本，原当前版本成为新的上一版本 |

`deploy` 发布当前本机源码的构建，包括未提交改动；发布前运行 `website:check` 并确认准备上线的改动。它不执行 git push 或 npm 包发布。

One 的 `--dry-run`（放在 `--` 之前）仅展示任务计划；表格里的 `-- --dry-run` 会实际进入部署脚本的预览模式。首次运行 One 自身可能准备本机工具，但部署预览不会连接生产服务器。

不使用 One 时，可直接执行 `npm run doctor`、`npm run status`、`npm run deploy`、`npm run rollback`。参数通过 `--` 传给 npm script，例如 `npm run deploy -- --dry-run`。

## 部署、检查与失败恢复

发布包只含公开网站文件，上传到服务器独立的 `/tmp/deernova-upload.*` 目录。服务器脚本通过 SSH 标准输入执行，无需预先安装在服务器上。

脚本校验 SHA256、归档路径、文件类型、必要页面与模板占位符，使用 `flock` 防止并发部署/回滚，解压到 `/var/www/releases/deernova-TIMESTAMP` 后原子切换 `/var/www/deernova`。上传临时目录在结束后清理；成功版本保留，不自动删除。Nginx 配置与证书沿用服务器现有配置。

服务器上的 Nginx 重载或站内 HTTPS 内容检查失败，会尝试恢复原版本并返回失败。站内检查绕过 DNS 连接本机 Nginx，同时校验两个域名的证书和首页、规范页、CSS、脚本、token 的文件内容。成功后，本机还会检查两个公网域名的相同内容、HTTP → HTTPS 跳转，以及不存在路径和 `.git/config` 的 404。

如果**服务器已切换成功，但本机公网验收失败**，命令会明确报告当前版本和失败原因；它不会因本机 DNS/网络问题自动撤回已发布版本。先查询 `website:status`，需要恢复时运行 `website:rollback`。如果 SSH 在远端执行期间断开，结果可能未知，也应先查状态，不盲目重试发布。

上一版本记录在 `/var/www/.deernova-previous`。首次使用新脚本前，该记录可能不存在；可以从 [历史发布记录](deployment.md) 选取仍然存在的目录，明确指定回滚目标：

```sh
one run website:rollback -- --release /var/www/releases/deernova-TIMESTAMP
```

回滚仅接受 `/var/www/releases/deernova-*` 或历史备份 `/var/www/deernova-before-*` 中的真实目录，并检查必要网站文件；不接受任意路径或目录软链接。历史 Hello World 备份若缺少完整网站文件，不适用这个回滚命令。

## 常见连接问题

- `Host key verification failed`：先交互连接、核对指纹并登记主机；不要关闭主机验证。
- `Permission denied (publickey)`：检查登录账号、`authorized_keys`、密钥文件与 `ssh-add -l`。
- 连接超时：检查安全组来源 IP、端口、系统防火墙和 SSH 服务。
- `sudo` 要求密码：配置已有权限的运维账号，或使用当前管理员账号；自动化不接受交互密码。
- `Another deploy or rollback is running`：等待当前操作完成后查状态；锁随进程结束自动释放。

GitHub Actions 目前只做构建、测试和 One dry-run，不连接生产。以后如需云端发布，可复用同一个 SSH 部署脚本，再配置 CI 的 SSH 密钥、主机指纹与网络访问。
