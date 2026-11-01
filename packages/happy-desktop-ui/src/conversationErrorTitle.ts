import { translate } from "./localization/translate";
import type { ConversationServiceNoticeEntry } from "happy-desktop-state";

/** One heading shared by the error renderer and its unmounted row-height model. */
export function conversationErrorTitle(entry: ConversationServiceNoticeEntry): string {
    if (entry.error?.code === "authentication_failed") return translate("Authentication failed");
    if (entry.retry === undefined) return entry.title ?? translate("Error");
    return entry.retry.attempt === undefined || entry.retry.attempt === 1
        ? translate("Connection Error")
        : translate("Connection Error (Attempt {0})", String(entry.retry.attempt));
}
