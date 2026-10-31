import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// The existing behavior fixtures assert English copy; the product defaults to Chinese.
globalThis.localStorage.setItem("happy.desktop.uiLocale", "en");

class TestResizeObserver implements ResizeObserver {
    constructor(_callback: ResizeObserverCallback) {}

    disconnect() {}
    observe(_target: Element, _options?: ResizeObserverOptions) {}
    unobserve(_target: Element) {}
}

globalThis.ResizeObserver = TestResizeObserver;

afterEach(cleanup);
