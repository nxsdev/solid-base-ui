import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { SCROLL_TIMEOUT } from "../constants";
import { ScrollArea } from "..";

describe("ScrollArea.Root", () => {
  test("sets and clears data-scrolling while viewport is scrolling", async () => {
    vi.useFakeTimers();

    const rendered = render(() => (
      <ScrollArea.Root data-testid="root" style={{ width: "200px", height: "200px" }}>
        <ScrollArea.Viewport data-testid="viewport" />
        <div />
      </ScrollArea.Root>
    ));

    const root = rendered.getByTestId("root");
    const viewport = rendered.getByTestId("viewport") as HTMLDivElement;
    mockViewportMetrics(viewport, {
      clientWidth: 200,
      clientHeight: 200,
      scrollWidth: 1000,
      scrollHeight: 1000,
      scrollLeft: 0,
      scrollTop: 0,
    });

    fireEvent.pointerEnter(viewport);
    viewport.scrollTop = 30;
    viewport.dispatchEvent(new Event("scroll"));

    expect(root.getAttribute("data-scrolling")).toBe("");

    await vi.advanceTimersByTimeAsync(SCROLL_TIMEOUT);
    expect(root.getAttribute("data-scrolling")).toBeNull();
    vi.useRealTimers();
  });
});

function mockViewportMetrics(
  viewport: HTMLDivElement,
  metrics: {
    clientWidth: number;
    clientHeight: number;
    scrollWidth: number;
    scrollHeight: number;
    scrollLeft: number;
    scrollTop: number;
  },
): void {
  defineMetric(viewport, "clientWidth", metrics.clientWidth);
  defineMetric(viewport, "clientHeight", metrics.clientHeight);
  defineMetric(viewport, "scrollWidth", metrics.scrollWidth);
  defineMetric(viewport, "scrollHeight", metrics.scrollHeight);
  defineMetric(viewport, "scrollLeft", metrics.scrollLeft, true);
  defineMetric(viewport, "scrollTop", metrics.scrollTop, true);
}

function defineMetric(element: HTMLElement, key: string, value: number, writable = false): void {
  Object.defineProperty(element, key, {
    configurable: true,
    writable,
    value,
  });
}
