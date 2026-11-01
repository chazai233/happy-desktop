import { translate } from "../../localization/translate";
import type {
    HappyAgentCompletionSound,
    HappyAgentMenusSnapshot,
    HappyAgentPermissionMode,
} from "happy-desktop-state";
import { Banner } from "../../Banner";
import { Box } from "../../Box";
import { Button } from "../../Button";
import { ComposerModelControl, type ComposerModelControlProps } from "../../ComposerModelControl";
import { FormRow } from "../../FormRow";
import { HappyAgentSessionControls } from "../../HappyAgentSessionControls";
import { SegmentedControl } from "../../SegmentedControl";
import { Select, type SelectOption } from "../../Select";
import { Spinner } from "../../Spinner";
import { SIDEBAR_THEME_OPTIONS } from "../../SidebarFooter";
import { SIDEBAR_KEEP_AWAKE_OPTIONS, type SidebarKeepAwakeMode } from "../../SidebarKeepAwakeMenu";
import { Switch } from "../../Switch";
import { HappyAgentProductAnalyticsSettings } from "./HappyAgentProductAnalyticsSettings";
import { HappyAgentSettingsSection } from "./HappyAgentSettingsShell";

export type HappyAgentAppearanceChoice = "system" | "light" | "dark" | "midnight" | "custom";
export type HappyAgentScrollbarVisibilityChoice = "always" | "automatic";
/** Where a clicked web link opens: the side panel's browser tab, or the machine's browser. */
export type HappyAgentLinkOpenPlacementChoice = "panel" | "browser";

export type HappyAgentGeneralSettingsProps = {
    language?: { readonly locale: "zh-CN" | "en"; readonly error?: string };
    onLanguageChange?: (locale: "zh-CN" | "en") => void;
    appearance: HappyAgentAppearanceChoice;
    appearanceModes?: readonly HappyAgentAppearanceChoice[];
    scrollbarVisibility: HappyAgentScrollbarVisibilityChoice;
    linkOpenPlacement: HappyAgentLinkOpenPlacementChoice;
    /**
     * The model and effort a new session starts on, in the composer's own model
     * pill. Its account headers are read-only: a new session runs on the account
     * last picked in a conversation's model menu. Absent once the catalog failed.
     */
    defaultModel?: ComposerModelControlProps;
    /**
     * The default model's menus, whose access list the composer's own access
     * picker shows; absent until the catalog is read.
     */
    defaultAccessMenus?: HappyAgentMenusSnapshot;
    /** Set while the catalog is still being read, so the pickers say so. */
    loading?: boolean;
    error?: string;
    /** Why daemon-backed defaults cannot currently be changed. Appearance remains local. */
    unavailable?: string;
    /** Whether active session, project, and workspace titles shimmer. */
    titleShimmerEnabled: boolean;
    /**
     * Whether the sidebar leaves out every connection's Projects section. Absent
     * where the host keeps no such choice, which offers no control.
     */
    projectsHidden?: boolean;
    onProjectsHiddenChange?: (hidden: boolean) => void;
    /** "Show in status bar" switches; absent where the host keeps no such choice. */
    statusBar?: {
        themeShown: boolean;
        keepAwakeShown: boolean;
        onThemeShownChange: (shown: boolean) => void;
        onKeepAwakeShownChange: (shown: boolean) => void;
    };
    /** When the computer is kept from sleeping; absent where the host cannot. */
    keepAwake?: SidebarKeepAwakeMode;
    onKeepAwakeChange?: (mode: SidebarKeepAwakeMode) => void;
    /**
     * When this connection chimes for a finished conversation. Absent where the
     * host plays no sound, which offers no control.
     */
    completionSound?: HappyAgentCompletionSound;
    onCompletionSoundChange?: (sound: HappyAgentCompletionSound) => void;
    /** Whether this window sends product analytics events. Absent where the host sends none. */
    usageAnalyticsEnabled?: boolean;
    onUsageAnalyticsChange?: (enabled: boolean) => void;
    /** Absent where the host does not manage updates. */
    previewUpdatesEnabled?: boolean;
    onPreviewUpdatesChange?: (enabled: boolean) => void;
    /** Application updates download automatically; only a completed download can be applied. */
    desktopUpdate?: {
        action: "refresh" | "restart";
        detail?: string;
        status: "available" | "downloading" | "downloaded";
        version?: string;
    };
    onDesktopUpdateApply?: () => void;
    /** The managed Happy Agent installation, absent outside the native desktop shell. */
    agent?: {
        availableVersion?: string;
        error?: string;
        installedVersion?: string;
        managed: boolean;
        message?: string;
        operation: "idle" | "checking" | "downloading" | "upgrading";
        runningVersion?: string;
        runtime: "stopped" | "starting" | "ready";
        updateAvailable: boolean;
        /**
         * A newer version already downloaded and waiting on the person. Its
         * presence turns the offer from "fetch this" into "stop the agent and
         * run it", which is the only half of an update anyone has to decide.
         */
        readyVersion?: string;
        /** Every version that can be run, newest first; empty before the first check. */
        versions: readonly {
            downloaded: boolean;
            prerelease: boolean;
            version: string;
        }[];
    };
    onAppearanceChange: (appearance: HappyAgentAppearanceChoice) => void;
    onScrollbarVisibilityChange: (visibility: HappyAgentScrollbarVisibilityChoice) => void;
    onLinkOpenPlacementChange: (placement: HappyAgentLinkOpenPlacementChoice) => void;
    onTitleShimmerChange: (enabled: boolean) => void;
    onPermissionModeChange: (mode: HappyAgentPermissionMode) => void;
    onAgentCheck?: () => void;
    onAgentUpgrade?: () => void;
    onAgentVersionSelect?: (version: string) => void;
    /** Drains and restarts the agent on the version it is already running. */
    onAgentRestart?: () => void;
};

const appearanceSegments = SIDEBAR_THEME_OPTIONS.map(({ mode, label }) => ({ value: mode, label }));

const keepAwakeOptions = SIDEBAR_KEEP_AWAKE_OPTIONS.map(({ mode, label }) => ({
    value: mode,
    label,
}));

function statusBarRow(
    id: string,
    label: string,
    shown: boolean,
    onChange: (shown: boolean) => void,
) {
    return (
        <FormRow
            control={
                <Switch
                    aria-label={label}
                    checked={shown}
                    id={`happy-agent-settings-status-bar-${id}`}
                    onChange={onChange}
                    size="small"
                />
            }
            htmlFor={`happy-agent-settings-status-bar-${id}`}
            label={label}
        />
    );
}

const scrollbarSegments = [
    { value: "automatic", label: translate("Automatic") },
    { value: "always", label: translate("Always visible") },
];

const completionSoundSegments = [
    { value: "always", label: translate("Always") },
    { value: "focused", label: translate("When focused") },
    { value: "never", label: translate("Never") },
];

const linkOpenSegments = [
    { value: "panel", label: translate("Side panel") },
    { value: "browser", label: translate("Browser") },
];

/**
 * The General category: how the window looks, and what a new session on this
 * machine starts with. The model list is the daemon's catalog, so the picker
 * names one model rather than a per-provider matrix of defaults — the providers
 * already decide which models exist.
 */
export function HappyAgentGeneralSettings(props: HappyAgentGeneralSettingsProps) {
    return (
        <>
            {props.language && props.onLanguageChange ? (
                <HappyAgentSettingsSection title={translate("Language")}>
                    <FormRow
                        label={translate("Interface language")}
                        description={translate(
                            "Saved for the next time this window loads. Your current work stays open.",
                        )}
                        control={
                            <Select
                                aria-label={translate("Interface language")}
                                value={props.language.locale}
                                onValueChange={(value) => {
                                    if (value === "zh-CN" || value === "en")
                                        props.onLanguageChange?.(value);
                                }}
                                options={[
                                    { value: "zh-CN", label: "简体中文" },
                                    { value: "en", label: "English" },
                                ]}
                                error={props.language.error}
                                size="small"
                            />
                        }
                    />
                </HappyAgentSettingsSection>
            ) : null}
            {props.error ? (
                <Banner tone="danger" title={translate("Models unavailable")}>
                    {props.error}
                </Banner>
            ) : null}
            {props.unavailable ? (
                <Banner tone="neutral" title={translate("Happy Agent reconnecting")}>
                    {props.unavailable}
                </Banner>
            ) : null}
            <HappyAgentSettingsSection title={translate("Appearance")}>
                <FormRow
                    control={
                        <SegmentedControl
                            onChange={(value) =>
                                props.onAppearanceChange(value as HappyAgentAppearanceChoice)
                            }
                            segments={appearanceSegments.filter(
                                (option) => props.appearanceModes?.includes(option.value) ?? true,
                            )}
                            size="small"
                            value={props.appearance}
                        />
                    }
                    label={translate("Theme")}
                />
                {props.statusBar
                    ? statusBarRow(
                          "theme",
                          translate("Theme switch in status bar"),
                          props.statusBar.themeShown,
                          props.statusBar.onThemeShownChange,
                      )
                    : null}
                <FormRow
                    control={
                        <SegmentedControl
                            onChange={(value) =>
                                props.onScrollbarVisibilityChange(
                                    value as HappyAgentScrollbarVisibilityChoice,
                                )
                            }
                            segments={scrollbarSegments}
                            size="small"
                            value={props.scrollbarVisibility}
                        />
                    }
                    description={translate(
                        "Automatic hides them two seconds after scrolling stops",
                    )}
                    label={translate("Scrollbars")}
                />
                <FormRow
                    control={
                        <Switch
                            aria-label={translate("Shimmer active titles")}
                            checked={props.titleShimmerEnabled}
                            id="happy-agent-settings-title-shimmer"
                            onChange={props.onTitleShimmerChange}
                            size="small"
                        />
                    }
                    description={translate("Animate running session, project, and workspace names")}
                    htmlFor="happy-agent-settings-title-shimmer"
                    label={translate("Shimmer active titles")}
                />
                {props.onProjectsHiddenChange ? (
                    <FormRow
                        control={
                            <Switch
                                aria-label={translate("Hide projects")}
                                checked={props.projectsHidden === true}
                                id="happy-agent-settings-projects-hidden"
                                onChange={props.onProjectsHiddenChange}
                                size="small"
                            />
                        }
                        description={translate(
                            "Leave Projects out of the sidebar on every connection. Bots and tasks stay.",
                        )}
                        htmlFor="happy-agent-settings-projects-hidden"
                        label={translate("Hide projects")}
                    />
                ) : null}
            </HappyAgentSettingsSection>
            {props.keepAwake && props.onKeepAwakeChange ? (
                <HappyAgentSettingsSection title={translate("Keep awake")}>
                    <FormRow
                        control={
                            <Box width={280}>
                                <Select
                                    aria-label={translate("Keep computer awake")}
                                    fullWidth
                                    id="happy-agent-settings-keep-awake"
                                    onValueChange={(value) =>
                                        props.onKeepAwakeChange?.(value as SidebarKeepAwakeMode)
                                    }
                                    options={keepAwakeOptions}
                                    size="small"
                                    value={props.keepAwake}
                                />
                            </Box>
                        }
                        description={translate(
                            "Only agents on this computer count. The display can still sleep.",
                        )}
                        htmlFor="happy-agent-settings-keep-awake"
                        label={translate("Keep computer awake")}
                    />
                    {props.statusBar
                        ? statusBarRow(
                              "keep-awake",
                              translate("Keep-awake switch in status bar"),
                              props.statusBar.keepAwakeShown,
                              props.statusBar.onKeepAwakeShownChange,
                          )
                        : null}
                </HappyAgentSettingsSection>
            ) : null}
            {props.completionSound && props.onCompletionSoundChange ? (
                <HappyAgentSettingsSection title={translate("Sound")}>
                    <FormRow
                        control={
                            <SegmentedControl
                                aria-label={translate("Completion sound")}
                                onChange={(value) =>
                                    props.onCompletionSoundChange?.(
                                        value as HappyAgentCompletionSound,
                                    )
                                }
                                segments={completionSoundSegments}
                                size="small"
                                value={props.completionSound}
                            />
                        }
                        description={translate(
                            "Plays when a conversation finishes. Saved per connection.",
                        )}
                        label={translate("Completion sound")}
                    />
                </HappyAgentSettingsSection>
            ) : null}
            <HappyAgentSettingsSection title={translate("Links")}>
                <FormRow
                    control={
                        <SegmentedControl
                            aria-label={translate("Open links in")}
                            onChange={(value) =>
                                props.onLinkOpenPlacementChange(
                                    value as HappyAgentLinkOpenPlacementChoice,
                                )
                            }
                            segments={linkOpenSegments}
                            size="small"
                            value={props.linkOpenPlacement}
                        />
                    }
                    description={translate("A link's own menu can always open it the other way")}
                    label={translate("Open links in")}
                />
            </HappyAgentSettingsSection>
            <HappyAgentSettingsSection
                description={translate("Saved to your account, so they follow you across devices.")}
                title={translate("New sessions")}
            >
                <FormRow
                    control={
                        props.loading ? (
                            <Box className="happy-agent-settings__pending">
                                <Spinner size={16} />
                                <span>{translate("Reading the model catalog…")}</span>
                            </Box>
                        ) : props.defaultModel ? (
                            <ComposerModelControl
                                {...props.defaultModel}
                                data-testid="happy-agent-settings-default-model"
                                disabled={
                                    props.defaultModel.disabled === true ||
                                    props.unavailable !== undefined
                                }
                            />
                        ) : null
                    }
                    description={translate("Runs on the account you last picked in a chat")}
                    label={translate("Default model")}
                />
                <FormRow
                    control={
                        <HappyAgentSessionControls
                            data-testid="happy-agent-settings-default-access"
                            disabled={
                                props.defaultAccessMenus === undefined ||
                                props.unavailable !== undefined
                            }
                            fields={["permission"]}
                            menus={props.defaultAccessMenus}
                            onEffortChange={() => undefined}
                            onModelChange={() => undefined}
                            onPermissionModeChange={props.onPermissionModeChange}
                            onServiceTierChange={() => undefined}
                            variant="ghost"
                        />
                    }
                    description={translate("What a new session may do without asking")}
                    label={translate("Default access mode")}
                />
            </HappyAgentSettingsSection>
            {props.agent || props.onPreviewUpdatesChange || props.desktopUpdate ? (
                <HappyAgentSettingsSection title={translate("Happy Agent")}>
                    {props.agent ? (
                        <FormRow
                            control={
                                <Box className="happy-agent-settings__agent-control">
                                    {/* Downloading says so right here and nowhere else.
                                        It interrupts nobody, so it gets a line in the
                                        row it belongs to rather than the window. */}
                                    {props.agent.managed &&
                                    (props.agent.operation === "checking" ||
                                        props.agent.operation === "downloading") ? (
                                        <Box className="happy-agent-settings__pending">
                                            <Spinner size={16} />
                                            <span>
                                                {props.agent.operation === "checking"
                                                    ? translate("Checking…")
                                                    : translate("Downloading…")}
                                            </span>
                                        </Box>
                                    ) : null}
                                    {props.agent.managed && props.onAgentVersionSelect ? (
                                        <Box width={220}>
                                            <Select
                                                aria-label={translate("Happy Agent version")}
                                                disabled={
                                                    props.agent.operation !== "idle" ||
                                                    props.agent.versions.length === 0
                                                }
                                                fullWidth
                                                id="happy-agent-settings-agent-version"
                                                onValueChange={props.onAgentVersionSelect}
                                                options={agentVersionOptions(
                                                    props.agent.versions,
                                                    props.agent.availableVersion,
                                                )}
                                                placeholder={
                                                    props.agent.versions.length === 0
                                                        ? translate("No versions read yet")
                                                        : translate("Choose a version")
                                                }
                                                size="small"
                                                value={props.agent.installedVersion}
                                            />
                                        </Box>
                                    ) : (
                                        <span className="happy-agent-settings__agent-version">
                                            {!props.agent.managed
                                                ? translate("External")
                                                : props.agent.installedVersion
                                                  ? `v${props.agent.installedVersion}`
                                                  : translate("Not installed")}
                                        </span>
                                    )}
                                    {props.agent.managed &&
                                    props.agent.updateAvailable &&
                                    props.onAgentUpgrade ? (
                                        <Button
                                            loading={props.agent.operation === "upgrading"}
                                            onClick={props.onAgentUpgrade}
                                            size="small"
                                            variant="secondary"
                                        >
                                            {/* "Install" once the bytes are already here,
                                                which is the ordinary case: the fetch
                                                happened on its own, and what is left to
                                                agree to is the interruption. */}
                                            {props.agent.readyVersion
                                                ? translate(
                                                      "Install v{0}",
                                                      props.agent.readyVersion,
                                                  )
                                                : props.agent.availableVersion
                                                  ? translate(
                                                        "Update to {0}",
                                                        props.agent.availableVersion,
                                                    )
                                                  : translate("Update")}
                                        </Button>
                                    ) : null}
                                    {props.agent.managed && props.onAgentCheck ? (
                                        <Button
                                            disabled={props.agent.operation !== "idle"}
                                            onClick={props.onAgentCheck}
                                            size="small"
                                            variant="ghost"
                                        >
                                            {translate("Check for updates")}
                                        </Button>
                                    ) : null}
                                    {props.agent.managed && props.onAgentRestart ? (
                                        <Button
                                            disabled={props.agent.operation !== "idle"}
                                            onClick={props.onAgentRestart}
                                            size="small"
                                            variant="secondary"
                                        >
                                            {translate("Restart")}
                                        </Button>
                                    ) : null}
                                </Box>
                            }
                            description={translate(
                                "{0}. {1} Switching or restarting lets running work finish first.",
                                agentRuntimeLabel(props.agent.runtime, props.agent.runningVersion),
                                agentDescription(props.agent),
                            )}
                            label={translate("Version")}
                            layout="stacked"
                        />
                    ) : null}
                    {props.desktopUpdate ? (
                        <FormRow
                            control={
                                <Box className="happy-agent-settings__agent-control">
                                    <span aria-live="polite" role="status">
                                        {props.desktopUpdate.status === "downloaded"
                                            ? translate("Ready to {0}", props.desktopUpdate.action)
                                            : props.desktopUpdate.status === "downloading"
                                              ? translate(
                                                    "Downloading{0}",
                                                    props.desktopUpdate.detail
                                                        ? ` · ${props.desktopUpdate.detail}`
                                                        : "…",
                                                )
                                              : translate("Ready to download")}
                                    </span>
                                    {props.desktopUpdate.status === "downloaded" &&
                                    props.onDesktopUpdateApply ? (
                                        <Button
                                            onClick={props.onDesktopUpdateApply}
                                            size="small"
                                            variant="secondary"
                                        >
                                            {props.desktopUpdate.action === "refresh"
                                                ? translate("Refresh")
                                                : translate("Restart")}
                                        </Button>
                                    ) : null}
                                </Box>
                            }
                            description={
                                props.desktopUpdate.version
                                    ? translate(
                                          "Version {0} · Updates download automatically.",
                                          props.desktopUpdate.version,
                                      )
                                    : translate("Updates download automatically.")
                            }
                            label={translate("Desktop update")}
                        />
                    ) : null}
                    {props.onPreviewUpdatesChange ? (
                        <FormRow
                            control={
                                <Switch
                                    aria-label={translate("Preview updates")}
                                    checked={props.previewUpdatesEnabled === true}
                                    id="happy-agent-settings-preview-updates"
                                    onChange={props.onPreviewUpdatesChange}
                                    size="small"
                                />
                            }
                            description={translate(
                                "Offer preview Desktop and Happy Agent releases. Turning this off never downgrades.",
                            )}
                            htmlFor="happy-agent-settings-preview-updates"
                            label={translate("Preview updates")}
                        />
                    ) : null}
                </HappyAgentSettingsSection>
            ) : null}
            {props.usageAnalyticsEnabled !== undefined && props.onUsageAnalyticsChange ? (
                <HappyAgentProductAnalyticsSettings
                    enabled={props.usageAnalyticsEnabled}
                    onChange={props.onUsageAnalyticsChange}
                />
            ) : null}
        </>
    );
}

/**
 * The picker's rows. Each says what choosing it would cost — a version already
 * on this machine starts immediately, anything else is a download — and which
 * one the automatic check considers current.
 */
function agentVersionOptions(
    versions: NonNullable<HappyAgentGeneralSettingsProps["agent"]>["versions"],
    latestVersion: string | undefined,
): SelectOption[] {
    return versions.map((entry) => {
        const notes = [
            entry.version === latestVersion ? "Latest" : undefined,
            entry.prerelease ? "Pre-release" : undefined,
            entry.downloaded ? "Downloaded" : undefined,
        ].filter((note) => note !== undefined);
        return {
            label:
                notes.length > 0 ? `v${entry.version} · ${notes.join(" · ")}` : `v${entry.version}`,
            value: entry.version,
        };
    });
}

function agentDescription(agent: NonNullable<HappyAgentGeneralSettingsProps["agent"]>): string {
    if (!agent.managed)
        return translate("This daemon is supplied by an external development environment.");
    if (agent.error)
        return translate(
            "Happy Agent reported: {0} Update checks continue automatically.",
            agent.error,
        );
    return (
        agent.message ??
        (agent.updateAvailable
            ? translate("A newer verified release is ready.")
            : translate("Up to date."))
    );
}

function agentRuntimeLabel(
    runtime: NonNullable<HappyAgentGeneralSettingsProps["agent"]>["runtime"],
    runningVersion: string | undefined,
): string {
    switch (runtime) {
        case "ready":
            return runningVersion
                ? translate("Running · v{0}", runningVersion)
                : translate("Running");
        case "starting":
            return translate("Starting");
        case "stopped":
            return translate("Stopped");
    }
}
