import { translate } from "./localization/translate";
import type { ConversationErrorAssistance } from "happy-desktop-state";

/** Shared by the card and its exact virtual-row text geometry. */
export function conversationErrorAssistanceText(assistance: ConversationErrorAssistance): {
    readonly label: string;
    readonly detail?: string;
    readonly disabled: boolean;
} {
    const name = assistance.chiefName ?? translate("Chief of Staff");
    switch (assistance.status) {
        case "ready":
            return { label: translate("Ask {0}", name), disabled: false };
        case "pending":
            return { label: translate("Preparing {0} draft…", name), disabled: true };
        case "prepared":
            return { label: translate("Draft prepared in {0}", name), disabled: true };
        case "failed":
            return {
                label: translate("Ask {0}", name),
                detail: translate("Could not prepare the draft: {0}", assistance.reason),
                disabled: false,
            };
        case "unavailable":
            return {
                label: translate("Ask {0}", name),
                detail: assistance.reason,
                disabled: true,
            };
    }
}
