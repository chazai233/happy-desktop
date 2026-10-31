import { translate } from "./localization/translate";
import { type CSSProperties } from "react";

export type AudienceValue = "people" | "agents";
export type AudienceToggleProps = {
    className?: string;
    "data-testid"?: string;
    disabled?: boolean;
    onChange?: (value: AudienceValue) => void;
    style?: CSSProperties;
    value: AudienceValue;
};
/**
 * C-065 AudienceToggle — a compact current-destination text control. It keeps
 * the composer quiet beneath the input while click and Shift+Tab switch the
 * host-owned audience.
 */
export function AudienceToggle(props: AudienceToggleProps) {
    return (
        <button
            aria-label={
                props.value === "people"
                    ? translate("Switch to talk to agents")
                    : translate("Switch to talk to people")
            }
            aria-pressed={props.value === "people"}
            className={["happy-audience-toggle", props.className].filter(Boolean).join(" ")}
            data-happy-desktop-ui="audience-toggle"
            data-testid={props["data-testid"]}
            data-value={props.value}
            disabled={props.disabled}
            onClick={() => props.onChange?.(props.value === "people" ? "agents" : "people")}
            style={props.style}
            title={translate(
                "Shift+Tab switches to talk to {0}",
                props.value === "people" ? "agents" : "people",
            )}
            type="button"
        >
            <span>
                {props.value === "people"
                    ? translate("Talk to people")
                    : translate("Talk to agents")}
            </span>
        </button>
    );
}
