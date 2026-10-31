import { zhCN, type TranslationKey } from "./zh-CN";

export type UiLocale = "zh-CN" | "en";
export const UI_LOCALE_STORAGE_KEY = "happy.desktop.uiLocale";

/** Chosen once per renderer lifetime so language changes never discard an active draft. */
function initialLocale(): UiLocale {
    try {
        return globalThis.localStorage?.getItem(UI_LOCALE_STORAGE_KEY) === "en" ? "en" : "zh-CN";
    } catch {
        return "zh-CN";
    }
}

export const uiLocale: UiLocale = initialLocale();

/**
 * Only explicitly marked, compile-time UI copy enters here. Substitution happens
 * once, after translation: user text, paths, model IDs and braces inside values
 * are preserved verbatim and are never interpreted as another template.
 */
export function translate(key: TranslationKey, ...values: readonly (string | number)[]): string {
    const template: string =
        uiLocale === "zh-CN"
            ? (zhCN[key] ?? key)
            : key
                  .replaceAll("&apos;", "'")
                  .replaceAll("&quot;", '"')
                  .replaceAll("&lt;", "<")
                  .replaceAll("&gt;", ">")
                  .replaceAll("&amp;", "&");
    return template.replace(/\{(\d+)\}/g, (placeholder, index: string) =>
        values[Number(index)] === undefined ? placeholder : String(values[Number(index)]),
    );
}
