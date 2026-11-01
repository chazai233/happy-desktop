import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { packagedMainModulesVerify } from "./verify-packaged-main-modules.mjs";

// A separate, explicitly unsigned community build. The official signed release
// builder and the Electron host source keep their existing security contracts.
if (process.platform !== "win32")
    throw new Error("Build the Windows community package on Windows.");
const workspace = fileURLToPath(new URL("..", import.meta.url));
const desktop = join(workspace, "packages", "happy-desktop-electron");
const metadata = JSON.parse(await readFile(join(desktop, "package.json"), "utf8"));
const version = process.argv[2] ?? `${metadata.version}-zh-CN.1`;
if (!/^\d+\.\d+\.\d+-zh-CN\.\d+$/u.test(version))
    throw new Error("Use a community version such as 0.0.102-zh-CN.1.");
const pnpm = process.env.npm_execpath;
if (!pnpm) throw new Error("Run through pnpm desktop:win:zh-cn [version].");
const environment = {
    ...process.env,
    RELEASE_VERSION: version,
    CSC_IDENTITY_AUTO_DISCOVERY: "false",
};
execFileSync(process.execPath, [pnpm, "--dir", desktop, "build"], {
    cwd: workspace,
    env: environment,
    stdio: "inherit",
    windowsHide: true,
});

const require = createRequire(join(desktop, "package.json"));
const { build, Platform, Arch } = require("electron-builder");
const output = join(desktop, "release", "zh-cn");
await build({
    projectDir: desktop,
    publish: "never",
    targets: Platform.WINDOWS.createTarget(["nsis", "zip"], Arch.x64),
    config: {
        ...structuredClone(metadata.build),
        forceCodeSigning: false,
        extraMetadata: { version },
        directories: { ...metadata.build.directories, output },
        files: [
            ...metadata.build.files,
            "!node_modules/usb/prebuilds/{android,darwin,linux}-*{,/**}",
        ],
        publish: {
            provider: "github",
            owner: "chazai233",
            repo: "happy-desktop",
            releaseType: "prerelease",
        },
    },
});
packagedMainModulesVerify(join(output, "win-unpacked", "resources", "app.asar"), [
    "dist/main.js",
    "dist/happyAgentRendererUtility.js",
]);

const assets = (await readdir(output))
    .filter((name) => name === `Happy-${version}-x64.exe` || name === `Happy-${version}-x64.zip`)
    .sort();
if (assets.length !== 2) throw new Error("Expected both an installer and a standalone ZIP.");
const hashes = await Promise.all(
    assets.map(async (name) => {
        const bytes = await readFile(join(output, name));
        return `${createHash("sha256").update(bytes).digest("hex")}  ${name}`;
    }),
);
await writeFile(join(output, "SHA256SUMS.txt"), `${hashes.join("\n")}\n`);
console.log(
    `Community build ${version} is ready in ${output}. Nothing was published or installed.`,
);
