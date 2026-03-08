import { render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { useMediaQuery } from "./index";

class TestMediaQueryList implements MediaQueryList {
  media: string;
  matches: boolean;
  onchange: ((this: MediaQueryList, event: MediaQueryListEvent) => unknown) | null = null;
  private listeners = new Set<EventListener>();
  private objectListenerWrappers = new WeakMap<EventListenerObject, (event: Event) => void>();

  constructor(media: string, matches: boolean) {
    this.media = media;
    this.matches = matches;
  }

  setMatches(nextMatches: boolean): void {
    this.matches = nextMatches;
    this.dispatchEvent(new Event("change"));
  }

  addEventListener(
    _type: string,
    listener: EventListenerOrEventListenerObject | null,
    _options?: boolean | AddEventListenerOptions,
  ): void {
    if (typeof listener === "function") {
      this.listeners.add(listener);
      return;
    }

    if (listener && typeof listener.handleEvent === "function") {
      const wrapper = (event: Event) => listener.handleEvent(event);
      this.objectListenerWrappers.set(listener, wrapper);
      this.listeners.add(wrapper);
    }
  }

  removeEventListener(
    _type: string,
    listener: EventListenerOrEventListenerObject | null,
    _options?: boolean | EventListenerOptions,
  ): void {
    if (typeof listener === "function") {
      this.listeners.delete(listener);
      return;
    }

    if (listener && typeof listener.handleEvent === "function") {
      const wrapper = this.objectListenerWrappers.get(listener);
      if (!wrapper) {
        return;
      }

      this.listeners.delete(wrapper);
      this.objectListenerWrappers.delete(listener);
    }
  }

  dispatchEvent(event: Event): boolean {
    for (const listener of this.listeners) {
      listener.call(this, event);
    }
    return true;
  }

  addListener(_listener: ((this: MediaQueryList, event: MediaQueryListEvent) => unknown) | null) {}

  removeListener(
    _listener: ((this: MediaQueryList, event: MediaQueryListEvent) => unknown) | null,
  ) {}
}

function createMatchMediaMock(initialMatches = false) {
  const mediaQueryLists = new Map<string, TestMediaQueryList>();

  const matchMedia = (query: string): MediaQueryList => {
    const existing = mediaQueryLists.get(query);
    if (existing) {
      return existing;
    }

    const mediaQueryList = new TestMediaQueryList(query, initialMatches);
    mediaQueryLists.set(query, mediaQueryList);
    return mediaQueryList;
  };

  return {
    matchMedia,
    setMatches(query: string, matches: boolean): void {
      const mediaQueryList = mediaQueryLists.get(query);
      if (!mediaQueryList) {
        return;
      }
      mediaQueryList.setMatches(matches);
    },
  };
}

function setWindowMatchMedia(
  matchMedia: ((query: string) => MediaQueryList) | undefined,
): () => void {
  const previous = window.matchMedia;

  if (matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: matchMedia,
    });
  } else {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: undefined,
    });
  }

  return () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: previous,
    });
  };
}

function Consumer(props: { query: string; options?: useMediaQuery.Options | undefined }) {
  const matches = useMediaQuery(props.query, props.options);
  return <span data-testid="match">{String(matches())}</span>;
}

describe("useMediaQuery", () => {
  test("falls back to defaultMatches when matchMedia is unavailable", () => {
    const restore = setWindowMatchMedia(undefined);
    const rendered = render(() => (
      <Consumer query="(min-width: 600px)" options={{ defaultMatches: true }} />
    ));
    expect(rendered.getByTestId("match").textContent).toBe("true");
    restore();
  });

  test("reads matchMedia and reacts to changes", async () => {
    const query = "(min-width: 600px)";
    const mock = createMatchMediaMock(false);
    const restore = setWindowMatchMedia(mock.matchMedia);

    const rendered = render(() => <Consumer query={query} />);
    expect(rendered.getByTestId("match").textContent).toBe("false");

    mock.setMatches(query, true);

    await waitFor(() => {
      expect(rendered.getByTestId("match").textContent).toBe("true");
    });

    restore();
  });
});
