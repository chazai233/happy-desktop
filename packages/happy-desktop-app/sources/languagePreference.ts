import { languageStoreCreate } from "happy-desktop-state";
import { translate, uiLocale, UI_LOCALE_STORAGE_KEY } from "happy-desktop-ui";

/** The local renderer preference never changes the agent, model, or native configuration. */
const language = languageStoreCreate(uiLocale, (event) => {
    try {
        globalThis.localStorage.setItem(UI_LOCALE_STORAGE_KEY, event.locale);
    } catch {
        language.writer.languageSaveFailed(translate("Could not save the language preference."));
    }
});

export const languagePreferenceStore = language.store;

if (typeof document !== "undefined") document.documentElement.lang = uiLocale;
