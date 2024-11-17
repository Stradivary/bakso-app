import { afterEach, beforeAll, expect, vi } from "vitest";

import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// setupTests.ts
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// Mock implementation
beforeAll(() => {
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
});

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});
