# 简体中文界面

此分支基于 `slopus/happy-desktop` 的桌面源码 0.0.102，提供简体中文界面。
桌面版本与 Happy Agent 后台版本分别编号，后台 0.4.x 并不代表桌面源码过旧。

首次加载默认使用简体中文。在 **设置 → 通用 → 语言** 中可以选择 `English`。
选择保存在当前渲染器来源的本地存储中，下次加载窗口时生效。修改语言不会主动
重新加载窗口、停止代理或丢弃正在编辑的草稿。重新打开窗口前请正常保存工作。
不同安装、浏览器来源及桌面应用配置可能分别保留各自的语言选择。

## 覆盖范围

覆盖主导航、聊天输入与工具执行记录、权限批准、模型推理强度与访问模式、
项目和工作区操作、任务与机器人、登录引导、产物、待办、日历、共享文档，
以及通用、账户、服务商、密钥、密码、隐私、语音、手机连接和开发工具设置。
身份验证、配额耗尽、网络错误和自动重试使用明确的中文提示模板。

以下内容保留原文：用户与代理的消息、用户命名的项目和文件、模型与服务商名称、
标识符、源代码、CLI 命令、提示词内容、日志、第三方网页，以及后台直接返回的
未知错误。Electron 原生菜单和宿主/后台提供的部分状态文案仍为英文；第三方编辑器
自身的某些菜单和外部账户用量标签也可能保留英文。这里没有进行后台或模型协议翻译。

## 本地构建

需要 Node.js 24+ 和 pnpm 10.28.1。先在仓库根目录执行：

```powershell
pnpm install --frozen-lockfile
pnpm --filter happy-desktop-state --filter happy-desktop-ui --filter happy-desktop-app typecheck
pnpm --dir packages/happy-desktop-electron build
```

如需在 Windows 上生成此 fork 的未签名社区安装包和免安装 ZIP，执行：

```powershell
pnpm desktop:win:zh-cn
```

可在命令后传入版本，例如 `pnpm desktop:win:zh-cn 0.0.102-zh-CN.2`。
输出位于 `packages/happy-desktop-electron/release/zh-cn/`，包含安装程序、ZIP 和
`SHA256SUMS.txt`。构建命令不会上传或安装它们。
上游原有 `dist:win` 与强制签名的官方发行流程保留不变。公开发行版的签名与发布要求见
[releases.md](releases.md)；本地构建不等于已签名的官方发行版。官方更新可能替换此
分支的中文渲染器。此改动本身不安装、替换或重启你正在使用的 Happy。

## 维护翻译

集中词典位于 `packages/happy-desktop-ui/src/localization/zh-CN.ts`。
英文原文是强类型键，同时也是切换为英文时的回退文案。新增界面文字时，先添加
词条，再在明确的显示位置调用 `translate("English copy")`。
动态文字使用 `translate("Remove {0}", item.name)`；占位符从 0 开始，译文必须
保留相同的占位符。插值在翻译之后仅执行一次，用户文本中的 `{0}`、美元符号等
不会被当作模板重新解释。不要把 `translate` 用于用户内容、API 参数或协议值。

推理强度按 `HappyAgentThinkingLevel` 枚举在 UI 层映射，权限按
`HappyAgentPermissionMode` 枚举显示，发送给后台的值不变。
语言选择的内存状态由 `happy-desktop-state` 管理，持久化由 app 层负责。
已有英文几何和行为验证夹具固定使用英文，以便继续检查原有布局契约。
