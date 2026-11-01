import type { HappyAgentThinkingLevel } from "happy-desktop-state";
import { translate } from "./translate";

/** Labels follow the closed effort enum; model names and IDs remain verbatim. */
export function thinkingLevelLabel(level: HappyAgentThinkingLevel): string {
    switch (level) {
        case "off":
            return translate("Off");
        case "on":
            return translate("Enabled");
        case "minimal":
            return translate("Minimal");
        case "low":
            return translate("Low");
        case "medium":
            return translate("Medium");
        case "high":
            return translate("High");
        case "xhigh":
            return translate("Extra High");
        case "max":
            return translate("Maximum");
        case "ultra":
            return translate("Ultra");
    }
}
