import { translate } from "./localization/translate";
import type {
    ConversationErrorAssistance,
    ConversationFailure,
    ConversationFailureResolution,
    ConversationPoolMemberFailure,
    ConversationRetrying,
} from "happy-desktop-state";
import { conversationErrorAssistanceText } from "./conversationErrorAssistanceText";
import type { ConversationSwitchTarget } from "./conversationSwitchTargets";
import { localMoment, type LocalTimeZone } from "./localTime";

/**
 * Everything a failure card says, written here from the failure's kind and
 * typed fields so it can be translated. The daemon's `message` is read only
 * for a kind this client does not know. The card and its exact row geometry
 * share these functions.
 */

/** One run of the card's message: prose, or a command the reader can copy. */
export type ConversationFailureSegment =
    | { readonly kind: "text"; readonly text: string }
    | { readonly kind: "code"; readonly text: string };

/**
 * The clock a card tells a reset time on: the viewer's own zone unless pinned.
 * `now` is the owner's surface clock; without it the time carries its date.
 */
export interface ConversationFailureClock {
    readonly now?: number;
    readonly zone?: LocalTimeZone;
}

const text = (value: string): ConversationFailureSegment => ({ kind: "text", text: value });

function until(resetsAt: number | null, clock: ConversationFailureClock): string {
    return resetsAt === null
        ? ""
        : translate(" until {0}", localMoment(resetsAt, clock.now, clock.zone));
}

/** One sentence for an account a pool set aside, after the sentence before it. */
function poolMemberMessage(
    member: ConversationPoolMemberFailure,
    clock: ConversationFailureClock,
): readonly ConversationFailureSegment[] {
    const name = member.provider.label;
    switch (member.reason) {
        case "signin_missing":
            return member.command === null
                ? [text(translate(" {0} isn't signed in.", name))]
                : [
                      text(translate(" {0} isn't signed in: run ", name)),
                      { kind: "code", text: member.command },
                      text("."),
                  ];
        case "usage_limit":
            return [
                text(translate(" {0} is out of usage{1}.", name, until(member.resetsAt, clock))),
            ];
        case "rate_limited":
            return [text(translate(" {0} is rate-limited.", name))];
        case "provider_unavailable":
            return [text(translate(" {0} is overloaded.", name))];
        case "network":
            return [text(translate(" {0} couldn't be reached.", name))];
        case "other":
            return [text(translate(" {0} couldn't be used.", name))];
    }
}

/** The card's message line, without its action. */
export function conversationFailureMessage(
    failure: ConversationFailure,
    clock: ConversationFailureClock,
): readonly ConversationFailureSegment[] {
    switch (failure.kind) {
        case "signin_missing":
            return failure.command === null || failure.product === null
                ? [
                      text(
                          translate(
                              "{0} couldn't authenticate. Check its sign-in settings, then retry.",
                              failure.provider.label,
                          ),
                      ),
                  ]
                : [
                      text(translate("{0} isn't signed in. Run ", failure.product)),
                      { kind: "code", text: failure.command },
                      text(translate(", then retry.")),
                  ];
        case "usage_limit":
            return [
                text(
                    translate(
                        "{0} usage limit reached{1}.",
                        failure.provider.vendorName,
                        until(failure.resetsAt, clock),
                    ),
                ),
            ];
        case "no_account_available":
            // A daemon that names the accounts it set aside says why for each,
            // so a signed-out one is not mistaken for a spent one.
            return failure.members === undefined || failure.members.length === 0
                ? [
                      text(
                          translate(
                              "Every account in “{0}” is out of usage{1}.",
                              failure.poolName,
                              until(failure.resetsAt, clock),
                          ),
                      ),
                  ]
                : [
                      text(translate("No account in “{0}” can take this turn.", failure.poolName)),
                      ...failure.members.flatMap((member) => poolMemberMessage(member, clock)),
                  ];
        case "rate_limited":
            return [
                text(
                    translate(
                        "{0} is rate-limited. Try again in a minute.",
                        failure.provider.vendorName,
                    ),
                ),
            ];
        case "provider_unavailable":
            return [
                text(
                    translate(
                        "{0} is overloaded right now. Try again in a moment.",
                        failure.provider.vendorName,
                    ),
                ),
            ];
        case "network":
            return [
                text(
                    translate(
                        "Couldn't reach {0}. Check your connection, then retry.",
                        failure.provider.vendorName,
                    ),
                ),
            ];
        case "context_too_long":
            return [
                text(
                    translate(
                        "This conversation is too long for {0}, even after a reset.",
                        failure.modelName ?? failure.modelId,
                    ),
                ),
            ];
        case "provider_disabled":
            return [
                text(
                    translate(
                        "{0} is turned off. Turn it on in Settings, then retry.",
                        failure.provider.label,
                    ),
                ),
            ];
        case "internal":
            return [text(translate("Something went wrong: {0}", failure.detail))];
        case "unknown":
            return [text(failure.message)];
    }
}

/** The action on the message line: New chat once a reset has already failed, otherwise Retry. */
export function conversationFailureLineAction(failure: ConversationFailure): "retry" | "newChat" {
    return failure.kind === "context_too_long" ? "newChat" : "retry";
}

const LINE_ACTION_LABEL = { retry: translate("Retry"), newChat: translate("New chat") } as const;

/** "account · model", as a switch target names itself. */
export function conversationFailureTargetLabel(target: {
    readonly providerLabel: string;
    readonly modelId: string;
    readonly modelName?: string;
}): string {
    return `${target.providerLabel} · ${target.modelName ?? target.modelId}`;
}

/** The split button's main segment. */
export function conversationFailureSwitchLabel(target: ConversationSwitchTarget): string {
    return translate("Switch to {0} and continue", conversationFailureTargetLabel(target));
}

/**
 * The targets in list order, cut where their service changes, each part named
 * by its service as the model picker names it.
 */
export function conversationFailureTargetGroups(
    targets: readonly ConversationSwitchTarget[],
): readonly {
    readonly group: string;
    readonly label: string;
    readonly targets: readonly ConversationSwitchTarget[];
}[] {
    const groups: { group: string; label: string; targets: ConversationSwitchTarget[] }[] = [];
    for (const target of targets) {
        const last = groups.at(-1);
        if (last?.group === target.service) last.targets.push(target);
        else groups.push({ group: target.service, label: target.serviceLabel, targets: [target] });
    }
    return groups;
}

/** The stable identity of a target, for the picked one to be remembered by. */
export function conversationFailureTargetKey(
    target: Pick<ConversationSwitchTarget, "providerId" | "modelId">,
): string {
    return `${target.providerId}\u0000${target.modelId}`;
}

/** The muted line a card keeps once it has been acted on. */
export function conversationFailureResolutionText(
    resolution: ConversationFailureResolution,
): string {
    switch (resolution.action) {
        case "retried":
            return translate("Retried");
        case "switched":
            return translate("Switched to {0}", conversationFailureTargetLabel(resolution));
        case "handled":
            return translate("Handled");
    }
}

/** What a failure card shows besides its message, shared with its exact row geometry. */
export interface ConversationFailureCardLayout {
    /** The button after the message, and whether it is the card's one primary. */
    readonly lineAction?: { readonly label: string; readonly primary: boolean };
    /** The switch split button's targets, when switching is offered. */
    readonly switchTargets?: readonly ConversationSwitchTarget[];
    readonly assistance?: ReturnType<typeof conversationErrorAssistanceText>;
    /** The muted record of what was done, in place of the actions. */
    readonly resolution?: string;
}

/**
 * Which buttons a card carries. A resolved card records what was done and
 * offers nothing; one the conversation has moved past offers only Ask Chief of
 * Staff. Otherwise the switch is offered when the live catalog has another
 * account to move to, and is then the one primary; without it, the message
 * line's own action is.
 */
export function conversationFailureCardLayout(
    failure: ConversationFailure,
    options: {
        readonly current: boolean;
        readonly actions: {
            readonly retry: boolean;
            readonly newChat: boolean;
            readonly switch: boolean;
        };
        /** Every account the failed turn could continue on, from the live catalog. */
        readonly targets?: readonly ConversationSwitchTarget[];
        readonly assistance?: ConversationErrorAssistance;
    },
): ConversationFailureCardLayout {
    if (failure.resolution !== undefined)
        return { resolution: conversationFailureResolutionText(failure.resolution) };
    const assistance = options.assistance
        ? conversationErrorAssistanceText(options.assistance)
        : undefined;
    if (!options.current) return assistance ? { assistance } : {};
    const switchTargets =
        options.actions.switch && options.targets !== undefined && options.targets.length > 0
            ? options.targets
            : undefined;
    const action = conversationFailureLineAction(failure);
    const lineAction = (action === "retry" ? options.actions.retry : options.actions.newChat)
        ? { label: LINE_ACTION_LABEL[action], primary: switchTargets === undefined }
        : undefined;
    return {
        ...(lineAction ? { lineAction } : {}),
        ...(switchTargets ? { switchTargets } : {}),
        ...(assistance ? { assistance } : {}),
    };
}

/** The working line while the provider retries on its own, or after a context reset. */
export function conversationRetryingLabel(retrying: ConversationRetrying): string {
    const count = `(${String(retrying.attempt)}/${String(retrying.maxAttempts)})`;
    switch (retrying.kind) {
        case "context_too_long":
            return translate("Context full — resetting, then retrying…");
        case "provider_unavailable":
            return translate("{0} is overloaded — retrying {1}…", retrying.vendorName, count);
        case "rate_limited":
            return translate("{0} is rate-limited — retrying {1}…", retrying.vendorName, count);
        case "network":
            return translate("Couldn't reach {0} — retrying {1}…", retrying.vendorName, count);
        default:
            return translate("{0} — retrying {1}…", retrying.vendorName, count);
    }
}
