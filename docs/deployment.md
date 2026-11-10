# deernova.me 开发与发布

官网是静态网站：本机编辑和构建，ECS 的 Nginx 提供 `dist/` 中的文件。网站发布不需要发布 npm 包。

## 当前发布（2026-11-11 02:14，北京时间）

- 来源：`a9945e6`，版本 `0.3.12`；产品入口改为图标、名称、说明、箭头同一行，行高使用 `menu-item-height`，上下内边距为零；长说明省略，不换行。
- 发布包：`deernova-site-0.3.12-20261110T180859Z.tgz`。
- SHA256：`35a9ede6dfb9384916360008fd1ec225a72024a859f9018c607eb896c0fdd5fc`。
- 当前目录：`/var/www/releases/deernova-20261110T181445121771Z`；上一版为下方 01:56 发布。
- 已验收：构建打包、桌面浅色/深色、方向键和 Esc、线上单行菜单；Nginx 检查通过，主域名和 www 的 HTTPS 首页、菜单 CSS、规范页、HandyPick 图标均与本机构建一致。
- 未验收：移动端真机、回滚演练。

## 历史发布（2026-11-11 01:56，北京时间）

- 来源：`e72435c`，版本 `0.3.12`；HandyPick 为首页产品下拉第一项，使用应用原图标，点击在新标签页进入公开 GitHub 仓库。两个项目入口均有用途说明。
- 发布包：`deernova-site-0.3.12-20261110T175130Z.tgz`。
- SHA256：`8dcee8ec2a5f22274770da1548f79643ba4cc08272177f4f4c66aa3ffb3603ec`。
- 当前目录：`/var/www/releases/deernova-20261110T175633509340Z`。
- 上一版：`/var/www/releases/deernova-20261110T173111290172Z`。
- 已验收：构建和归档、桌面浅色/深色菜单、方向键与 Esc、新标签页打开 HandyPick 公开仓库、线上菜单图标与说明；两个域名的 HTTPS 首页、规范页、CSS、菜单脚本、图标、token 与发布构建逐字节一致，HTTP 跳转 HTTPS，未知页面及 `.git/config` 返回 404。Nginx 配置检查通过。
- 未验收：移动端真机、回滚演练；本次没有修改 HandyPick 应用源码，也未重新验收其应用功能。

## 历史发布（2026-11-10 17:55，北京时间）

- 首页更新为右下角悬浮备案标识；规范页备案链接保留。
- 发布包：`deernova-site-0.3.10-20261110T095157Z.tgz`。
- SHA256：`2a46842015ff8e8ff70f53d6260ff7ed88c974803add1d72060bb90a9cb2178e`。
- 当前目录：`/var/www/releases/deernova-20261110T095525554951Z`。
- 上一版：`/var/www/releases/deernova-20261110T083319728152Z`。
- 本机验证：构建、打包、浅色/深色外观、Tab 可聚焦备案链接均通过。
- 线上验证：Nginx 配置检查通过；主域名和 www HTTPS 首页、规范页、首页 CSS 与本次构建一致；HTTP 跳转 HTTPS；`.git/config` 返回 404。
- 未验收：移动端真机、回滚演练；右下角位置与规定要求的底部中央不同，详见下方说明。

## 首次发布记录（2026-11-10）

- 来源：`main` 的 `37edb3f`，版本 `0.3.10`，加上本次首页及规范页备案链接修改。
- 发布包：`deernova-site-0.3.10-20261110T082636Z.tgz`。
- SHA256：`be9f3ecf0d7925d6e2639f27c185e64b4a11612f234c5a39e8e74fa043e186c8`。
- 首次版本目录：`/var/www/releases/deernova-20261110T083319728152Z`。
- 原 Hello World 备份：`/var/www/deernova-before-20261110T083319728152Z`。
- 已验证：Nginx 配置检查、两个域名 HTTPS 200 / HTTP 301、首页及规范页与本机构建逐字节一致、抽查样式/脚本/动画图片/token 下载一致、未知路径和 `.git/config` 返回 404。本机浏览器验证了浅色/深色、导航到规范页，无脚本错误。
- 本次未验收：移动端真机、回滚演练；SSH 和 GitHub 自动发布未配置。

## 首页备案标识

首页使用右下角的不透明黑白悬浮标识，显示完整备案号并链接到工信部查询；支持浅色、深色和键盘焦点，触屏点击区域由 `hit-min` 补足。规范页继续使用正文底部备案链接。

该位置是网站所有者指定的视觉布局。《非经营性互联网信息服务备案管理办法》第十三条要求主页底部中央标明备案号，右下角布局与该位置要求不同，不应视为已完成合规验收。

## 本机开发

```sh
cd /Users/srx/projects/deernova-style
npm ci
npm run dev
```

打开 http://localhost:4173。编辑 `apps/website/`，浏览器会热更新。规范内容来自 `skills/deernova-style/`；修改 token 后运行 `npm run tokens`。完成后把源码提交到 GitHub，避免服务器成为唯一副本。

## 构建发布包

```sh
npm run pack:site
```

命令会重新构建，并在 `releases/` 生成带时间戳的 `.tgz` 和 `.sha256`。压缩包仅包含公开的网页、样式、脚本、图片和页面提供下载的 token 文件，不包含 `.git`、环境变量、仓库源码或 GitHub 凭据。

## 当前 ECS 发布方式

- 区域：杭州；实例 `i-bp16xd8dppgclvu7y6q7`；公网 IP `47.114.38.135`。
- 控制台：实例 → 全部操作 → 上传/下载文件，将发布包和 `scripts/deploy-site.py` 上传到 `/root/`，权限 `0644` 即可。
- 实例 → 全部操作 → 发送命令，选择 Shell、root，运行下面的命令。替换文件名和 SHA256 为打包命令的实际输出。

```sh
python3 /root/deploy-site.py /root/deernova-site-VERSION-TIMESTAMP.tgz SHA256
```

也可以通过云助手粘贴执行同一个 Python 脚本。脚本需要 Ubuntu 24.04 自带的 Python 3.12，先校验 SHA256 和归档路径，再解压到 `/var/www/releases/deernova-TIMESTAMP`。`/var/www/deernova` 指向当前版本。首次发布会备份原网页目录；后续发布通过切换软链接更新。脚本输出 `DEPLOYED` 和 `PREVIOUS` 路径。Nginx 检查或站内 HTTPS 检查失败会报告错误；切换后的检查失败时恢复上一版本。

Nginx 入口是 `/etc/nginx/sites-enabled/deernova`。证书在 `/etc/letsencrypt/live/deernova.me/`，由 `certbot.timer` 自动续期，续期后自动检查并重载 Nginx。不要在发布包中覆盖 Nginx 配置和证书。

## 回滚

将 `PREVIOUS_PATH` 替换为上次发布输出的 `PREVIOUS`，确认目录存在后执行：

```sh
set -e
test -d PREVIOUS_PATH
ln -s PREVIOUS_PATH /var/www/.deernova-rollback
mv -Tf /var/www/.deernova-rollback /var/www/deernova
nginx -t && systemctl reload nginx
```

## 关键冒烟（每次发布）

1. 构建成功，首页和规范页没有未替换的模板占位符。
2. `https://deernova.me/` 和 `https://www.deernova.me/` 返回 200，证书校验通过。
3. 两个域名的 HTTP 地址跳转到 HTTPS。
4. 首页麋鹿画面正常，主题切换与产品菜单可操作，HandyPick 排在首位并在新标签页打开公开仓库，Deernova Style 能进入规范页，两个入口显示用途说明。
5. 规范页内容、样式、图片和 token 下载正常；浏览器无新增脚本错误。
6. 首页和规范页备案号为 `京ICP备2026076994号-1`，链接指向工信部备案系统。
7. 不存在的路径和 `/.git/config` 不返回私有文件；旧版本目录保留以便回滚。

这是发布冒烟清单，不新增单元测试或测试框架。

## 怎样连接服务器开发

日常改静态网页用本机开发服务即可。需要查服务日志或操作后台时，目前可用阿里云云助手发送命令；它不依赖公网 SSH。

若后续需要长期远程开发，可单独配置 SSH 密钥、非 root 开发用户，并把安全组 22 端口限定为自己的出口 IP，然后用终端 SSH 或 VS Code Remote - SSH 连接。当前部署流程没有配置该通道。业务 API、数据库建议有独立开发环境，再发布到生产服务器。

后续需要自动发布时，可以增加 GitHub Actions 的构建与发布流程，并为其设置专用部署凭据；当前流程为手动发布，没有配置自动发布。
