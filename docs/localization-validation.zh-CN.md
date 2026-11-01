# 0.0.102-zh-CN.1 验证记录

这是 Windows x64 未签名社区预览版。构建流程没有安装、替换或重启开发机器现有的 Happy。

已通过：

- `happy-desktop-state`、`happy-desktop-ui`、`happy-desktop-app`、`happy-desktop-electron` 类型检查；最终文字修复后再次通过 UI/app 类型检查。
- UI/app/renderer 构建，以及包含最终修复的 Windows NSIS 安装包与 ZIP 构建。
- 中英文设置保存、下次加载生效、用户占位符文本与 CLI 命令保留的浏览器检查。
- 发行前定位到 JSX 空格和时间格式回归后，复查 `AgentActivityRow.test.tsx`、`ComposerModelControlAccounts.test.tsx`、`happyAgentComposerModelUsage.test.tsx`：Chromium/Firefox 共 38 项全部通过。
- 对照原始上游 JSX 的 45 处译文与动态内容空格边界，补齐丢失空格。时间格式继续遵循系统区域设置。
- 打包内容中的版本、中文词典、Windows 原生模块与模块引用检查，以及使用独立临时配置、隐藏窗口启动实际打包程序的中文欢迎页冒烟检查。

未全部通过的检查：

- 修复前仅运行一次 UI cheap 全套：1,593 项通过、76 项失败、28 项跳过。发现的上述汉化回归已修复并通过定向复查；没有再次运行全套，因此不能宣称全套通过。
- 将未修改的上游 `Button`/`Icon` 及其测试放入独立目录对照，仍有 5 项失败、7 项通过，包括图标数量断言和像素几何问题。只证明这些对照失败并非本次汉化引入，没有逐项证明其余失败的来源。
- gym cheap 通用 Playwright 测量检查：10 项通过、4 项失败，涉及未修改的像素/文字几何测量。
- 没有运行会写入注册表、修改安装目录的 NSIS 安装流程；启动验证使用 ZIP 对应的打包程序。

完整范围和保留英文的边界见 [localization.zh-CN.md](localization.zh-CN.md)。
