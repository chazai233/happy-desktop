export type UiLanguage = "zh-CN" | "en";

export interface LanguageSnapshot {
    readonly locale: UiLanguage;
    readonly error?: string;
}

export interface LanguageStore {
    get(): LanguageSnapshot;
    subscribe(listener: () => void): () => void;
    languageSelect(locale: UiLanguage): void;
}

/** Memory only; the renderer owns persistence and supplies save outcomes privately. */
export function languageStoreCreate(
    locale: UiLanguage,
    onOutput: (event: {
        readonly type: "languageSelected";
        readonly locale: UiLanguage;
    }) => void = () => undefined,
): { store: LanguageStore; writer: { languageSaveFailed(message: string): void } } {
    let snapshot: LanguageSnapshot = { locale };
    const listeners = new Set<() => void>();
    const publish = (next: LanguageSnapshot) => {
        snapshot = next;
        for (const listener of listeners) listener();
    };
    return {
        store: {
            get: () => snapshot,
            subscribe(listener) {
                listeners.add(listener);
                return () => {
                    listeners.delete(listener);
                };
            },
            languageSelect(next) {
                publish({ locale: next });
                onOutput({ type: "languageSelected", locale: next });
            },
        },
        writer: {
            languageSaveFailed(message) {
                publish({ ...snapshot, error: message });
            },
        },
    };
}
