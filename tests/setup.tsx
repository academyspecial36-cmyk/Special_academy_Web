import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import React from "react";

afterEach(() => {
  cleanup();
});

// Mock next/dynamic — eagerly loads the import and re-renders once resolved
// Avoids React.lazy + Suspense timing issues in test runners
vi.mock("next/dynamic", () => ({
  default: (importFunc: () => Promise<any>, options?: { loading?: React.ComponentType }) => {
    let loaded = false;
    let Component: any = null;
    const LoadingComponent = options?.loading || (() => null);
    const promise = importFunc().then((mod: any) => {
      Component = mod.default || mod;
      loaded = true;
    });
    return (props: any) => {
      const [ready, setReady] = React.useState(loaded);
      React.useEffect(() => {
        if (!ready) {
          promise.then(() => setReady(true));
        }
      }, [ready]);
      if (!ready) return React.createElement(LoadingComponent, {});
      return React.createElement(Component, props);
    };
  },
}));

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock crypto.randomUUID
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, "crypto", {
    value: {
      randomUUID: () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }),
    },
    writable: true,
  });
}

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver,
});

// Mock fetch
globalThis.fetch = vi.fn();
