# Happy 简体中文版

基于 [slopus/happy-desktop](https://github.com/slopus/happy-desktop) 的简体中文社区构建，
适用于 **Windows 10/11 x64**。桌面版本 **0.0.102-zh-CN.1**，默认中文，保留英文切换。
上游作者与 MIT 许可证保持不变；本仓库并非官方发行渠道。

**[下载 Windows 安装程序](https://github.com/chazai233/happy-desktop/releases/download/v0.0.102-zh-CN.1/Happy-0.0.102-zh-CN.1-x64.exe)** ·
**[下载免安装 ZIP](https://github.com/chazai233/happy-desktop/releases/download/v0.0.102-zh-CN.1/Happy-0.0.102-zh-CN.1-x64.zip)** ·
[发行说明与校验值](https://github.com/chazai233/happy-desktop/releases/tag/v0.0.102-zh-CN.1)

## 下载与安装

1. 下载上方 `.exe` 安装程序；保存工作并退出旧版 Happy 后运行，按提示完成安装。
2. 如不想安装，下载 ZIP，**完整解压**到一个文件夹，运行其中的 `Happy.exe`。
   不要直接在压缩包内启动，也不要只拷贝单个 EXE。
3. 首次启动按原版引导连接 Happy Agent 并登录模型账户；已有环境继续使用原版的配置读取流程。
   桌面应用与 Happy Agent 分别编号，后台 0.4.x 与本桌面版本并不冲突。
4. 在 **设置 → 通用 → 语言** 可选择 `English`，下次加载窗口时生效。

这是**未附带官方数字签名**的社区包，Windows 可能显示“未知发布者”。请从本仓库下载，
并与发行页 `SHA256SUMS.txt` 核对；可在 PowerShell 中运行：

```powershell
Get-FileHash .\Happy-0.0.102-zh-CN.1-x64.exe -Algorithm SHA256
```

## 配置与覆盖范围

汉化不修改模型协议、API 参数、CLI 命令或用户消息，也未增加重置中转配置的逻辑。
原有 `~/.happy`、`~/.claude/settings.json` 与 `~/.codex/config.toml` 保持原版处理方式；
不会把你的代理地址、密钥或对话翻译成中文。本仓库的构建与发布过程不替换本机正在运行的应用。

主要导航、聊天、任务、项目、权限、设置、登录、产物及常见错误提示已汉化。
Electron 原生菜单、后台直接提供的部分状态和未知错误、第三方网页或编辑器菜单仍可能为英文。
请从本仓库发行页手动获取后续中文版本；应用内原版更新流程仍可能安装官方版本并恢复英文 UI。

开发者可参考[中文构建与翻译维护说明](docs/localization.zh-CN.md)，或在 Windows 上运行
`pnpm desktop:win:zh-cn` 重新构建同类社区包。该命令只打包，不安装、不发布。

English: This fork provides a Simplified Chinese Windows community build with an English language option.
Download the installer or standalone ZIP above. It is not an officially signed release. User content,
model protocols, credentials and proxy configuration are not translated or reset by this localization.

---

## 上游项目说明 / Upstream README

<div align="center">

<h1>Any Model. Your Subscription.<br><em>Happy Harness.</em></h1>

<p>Orchestrate Claude, Codex, Grok, Gemini, and more in one app</p>

<p>Free and open source</p>

</div>

https://github.com/user-attachments/assets/b3580704-f9e0-441e-80be-3f83f6a08ab5

<p align="center">
<a href="https://happy.engineering/#download"><picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/slopus/happy-desktop/main/.github/download-desktop-dark.svg"><img width="212" height="39" alt="Download Desktop for macOS, Windows, and Linux" src="https://raw.githubusercontent.com/slopus/happy-desktop/main/.github/download-desktop-light.svg" /></picture></a>
</p>

<p align="center">
<a href="https://apps.apple.com/us/app/happy-codex-claude-code-app/id6748571505"><picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/slopus/happy-desktop/main/.github/app-store-rating-dark.svg"><img width="150" height="56" alt="Download on the App Store. Rated 4.9 stars from 1,000+ ratings" src="https://raw.githubusercontent.com/slopus/happy-desktop/main/.github/app-store-rating-light.svg" /></picture></a>&nbsp;&nbsp;&nbsp;<a href="https://play.google.com/store/apps/details?id=com.ex3ndr.happy"><picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/slopus/happy-desktop/main/.github/google-play-rating-dark.svg"><img width="150" height="56" alt="Get it on Google Play. Rated 5.0 stars from 3.1k+ reviews" src="https://raw.githubusercontent.com/slopus/happy-desktop/main/.github/google-play-rating-light.svg" /></picture></a>
</p>

## What you get

1. **Any model: Claude, Codex, Grok, Gemini, and more.** Gemini runs through
   Antigravity, and OpenCode or any Agent Client Protocol agent plugs in as a
   harness. Give every task the model that fits, and delegate to subagents on
   any of them.
2. **Reuse your subscriptions.** Sign in with the Claude, Codex, and Grok
   subscriptions you already pay for; Antigravity, OpenCode, and ACP agents
   keep their own logins. Happy adds a harness, not another bill.
3. **Open source MIT.** It runs on your own hardware and your projects stay
   ordinary folders. Read the code, fork it, ship your own build.
4. **End-to-end encrypted mobile app.** Left your desk? The same sessions are
   already on your phone, and what moves between your devices is encrypted.
5. **Natively multiplayer.** Invite a colleague or a friend into the session.
   You both watch the same agent work, and either of you can steer it.

#### Resources

<p align="center">
<a href="https://happy.engineering/">Website</a> · <a href="https://happy.engineering/welcome/">Documentation</a> · <a href="https://discord.gg/fX9WBAhyfD">Discord</a> · <a href="https://github.com/slopus/happy-desktop/blob/main/DEVELOPMENT.md">Development guide</a> · <a href="https://github.com/slopus/happy-desktop/blob/main/LICENSE">MIT License</a>
</p>

## How Happy fits together

| Repository                                                                            | What it is                                                                 |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [slopus/happy](https://github.com/slopus/happy)                                       | The mobile app (iOS, Android, web), the original CLI, and the relay server |
| **[slopus/happy-desktop](https://github.com/slopus/happy-desktop)** ← this repository | **The desktop app for macOS, Windows, and Linux**                          |
| [slopus/happy-agent](https://github.com/slopus/happy-agent)                           | Happy Agent, the open-source agent runtime the desktop app runs on         |
| [slopus/slopus.github.io](https://github.com/slopus/slopus.github.io)                 | The website and docs at happy.engineering                                  |

## Original Happy CLI

The original CLI wraps the Claude Code and Codex harnesses directly in your
terminal and lets you continue from your phone.

For multi-model sessions and teams, move to the desktop app and Happy Harness.

```sh
npm install -g happy

# Start Claude Code
happy claude

# Or start Codex
happy codex
```
