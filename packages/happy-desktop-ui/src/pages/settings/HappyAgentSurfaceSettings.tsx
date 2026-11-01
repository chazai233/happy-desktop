import { translate } from "../../localization/translate";
import {
    HappyAgentAutoJoinSettings,
    type HappyAgentAutoJoinSettingsProps,
} from "./HappyAgentAutoJoinSettings";

export type HappyAgentSurfaceSettingsProps = HappyAgentAutoJoinSettingsProps;

/** One connection's per-user preference; the server owns all membership changes. */
export function HappyAgentSurfaceSettings(props: HappyAgentSurfaceSettingsProps) {
    return (
        <HappyAgentAutoJoinSettings
            {...props}
            entity="Surface"
            label={translate("Join other people’s docs, lists and calendars")}
            description={translate(
                "Except ones you left. Turning this off keeps the ones you joined.",
            )}
            unsupportedMessage="Update this connection’s Happy Agent to change this preference."
        />
    );
}
