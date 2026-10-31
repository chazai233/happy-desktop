import { translate } from "../../localization/translate";
import { Banner } from "../../Banner";
import { Box } from "../../Box";
import { Button } from "../../Button";
import { CopyButton } from "../../CopyButton";
import { FormRow } from "../../FormRow";
import { HappyAgentSettingsSection } from "./HappyAgentSettingsShell";
import { HappyAgentSettingsStatus } from "./HappyAgentSettingsStatus";

export type HappyAgentProfilerStatus =
    | "stopped"
    | "starting"
    | "running"
    | "stopping"
    | "partial"
    | "error"
    | "unavailable";

export interface HappyAgentProfilerCapabilities {
    readonly liveDebuggerAttach: boolean;
    readonly nativeTrace: boolean;
    readonly processMetrics: boolean;
    readonly reactAttribution: boolean;
    readonly reactDevtoolsProfiling: boolean;
    readonly rendererMetrics: boolean;
}

export interface HappyAgentProfilerSettingsProps {
    readonly artifactPath?: string;
    readonly capabilities: HappyAgentProfilerCapabilities;
    readonly error?: string;
    readonly onStart: () => void;
    readonly onStop: () => void;
    readonly partialReason?: string;
    readonly status: HappyAgentProfilerStatus;
    readonly supported: boolean;
}

/**
 * The profile control stays beside the live debugger controls in Dev Tools.
 * It describes the build capability explicitly: a normal renderer can still
 * capture native CDP timings, but cannot acquire React attribution after boot.
 */
export function HappyAgentProfilerSettings(props: HappyAgentProfilerSettingsProps) {
    const running = props.status === "running";
    const pending = props.status === "starting" || props.status === "stopping";
    const unavailable =
        !props.supported || (!props.capabilities.nativeTrace && props.status === "unavailable");
    return (
        <>
            {props.error ? (
                <Banner tone="danger" title={translate("Profiler unavailable")}>
                    {props.error}
                </Banner>
            ) : null}
            {unavailable ? (
                <Banner tone="neutral" title={translate("Electron desktop only")}>
                    {translate(
                        "Native tracing and process metrics are available in Happy’s Electron desktop window.",
                    )}
                </Banner>
            ) : null}
            <HappyAgentSettingsSection
                description={translate(
                    "A bounded renderer trace with React commits, hook changes and process metrics",
                )}
                title={translate("React renderer profile")}
            >
                <FormRow
                    control={
                        <Box style={{ alignItems: "center", display: "flex", gap: 8 }}>
                            <Button
                                disabled={unavailable || pending || running}
                                loading={props.status === "starting"}
                                onClick={props.onStart}
                                size="small"
                                variant="secondary"
                            >
                                {translate("Start profile")}
                            </Button>
                            <Button
                                disabled={unavailable || pending || !running}
                                loading={props.status === "stopping"}
                                onClick={props.onStop}
                                size="small"
                                variant="secondary"
                            >
                                {translate("Stop and save")}
                            </Button>
                        </Box>
                    }
                    description={statusDescription(props.status, props.partialReason)}
                    label={translate("Capture")}
                />
                <FormRow
                    control={
                        <HappyAgentSettingsStatus
                            label={
                                props.capabilities.reactAttribution
                                    ? translate("Available")
                                    : translate("Unavailable")
                            }
                            variant={props.capabilities.reactAttribution ? "success" : "neutral"}
                        />
                    }
                    description={translate(
                        "Needs a profile build; standard builds capture native data only",
                    )}
                    label={translate("React attribution")}
                />
                <FormRow
                    control={
                        <HappyAgentSettingsStatus
                            label={
                                props.capabilities.liveDebuggerAttach
                                    ? translate("Available during capture")
                                    : translate("Unavailable")
                            }
                            variant={props.capabilities.liveDebuggerAttach ? "success" : "neutral"}
                        />
                    }
                    description={translate(
                        "An attached renderer debugger stays attached while capturing",
                    )}
                    label={translate("Live debugger")}
                />
                <FormRow
                    control={
                        <HappyAgentSettingsStatus
                            label={
                                props.capabilities.reactDevtoolsProfiling
                                    ? translate("Available")
                                    : translate("Unavailable")
                            }
                            variant={
                                props.capabilities.reactDevtoolsProfiling ? "success" : "neutral"
                            }
                        />
                    }
                    description={translate(
                        "The React DevTools backend loaded before React started",
                    )}
                    label={translate("React DevTools profiling")}
                />
                {props.artifactPath ? (
                    <FormRow
                        control={
                            <CopyButton
                                label={translate("Copy profiler artifact path")}
                                text={props.artifactPath}
                            />
                        }
                        description={props.artifactPath}
                        label={translate("Last artifact")}
                    />
                ) : null}
            </HappyAgentSettingsSection>
        </>
    );
}

function statusDescription(status: HappyAgentProfilerStatus, partialReason?: string): string {
    if (status === "starting") return translate("Starting the native trace…");
    if (status === "running")
        return translate("Capturing until Stop or the one-minute safety limit.");
    if (status === "stopping") return translate("Stopping React and writing the artifact…");
    if (status === "partial")
        return partialReason
            ? translate("Saved a partial artifact: {0}", partialReason)
            : translate("Saved a partial artifact.");
    if (status === "error") return translate("The last capture failed.");
    return translate("No profile is currently running.");
}
