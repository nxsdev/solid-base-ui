import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { ScrollArea } from "..";
import { SCROLL_TIMEOUT } from "../constants";

describe("ScrollArea.Viewport", () => {
  test("applies overflow data attributes", () => {
    const rendered = render(() => (
      <ScrollArea.Root style={{ width: "200px", height: "200px" }}>
        <ScrollArea.Viewport data-testid="viewport">
          <div />
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    ));

    const viewport = rendered.getByTestId("viewport") as HTMLDivElement;
    mockViewportMetrics(viewport, {
      clientWidth: 200,
      clientHeight: 200,
      scrollWidth: 1000,
      scrollHeight: 1000,
      scrollLeft: 0,
      scrollTop: 0,
    });

    fireEvent.scroll(viewport);

    expect(viewport.getAttribute("data-has-overflow-x")).toBe("");
    expect(viewport.getAttribute("data-has-overflow-y")).toBe("");
    expect(viewport.getAttribute("data-overflow-x-start")).toBeNull();
    expect(viewport.getAttribute("data-overflow-x-end")).toBe("");
    expect(viewport.getAttribute("data-overflow-y-start")).toBeNull();
    expect(viewport.getAttribute("data-overflow-y-end")).toBe("");
  });

  test("applies the scrollbar disable utility class", () => {
    const rendered = render(() => (
      <ScrollArea.Root>
        <ScrollArea.Viewport data-testid="viewport" />
      </ScrollArea.Root>
    ));

    const viewport = rendered.getByTestId("viewport");
    expect(viewport.className).toContain("base-ui-disable-scrollbar");
  });

  test("updates data-scrolling only after user interaction", async () => {
    vi.useFakeTimers();

    const rendered = render(() => (
      <ScrollArea.Root style={{ width: "200px", height: "200px" }}>
        <ScrollArea.Viewport data-testid="viewport">
          <div />
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    ));

    const viewport = rendered.getByTestId("viewport") as HTMLDivElement;
    mockViewportMetrics(viewport, {
      clientWidth: 200,
      clientHeight: 200,
      scrollWidth: 1000,
      scrollHeight: 1000,
      scrollLeft: 0,
      scrollTop: 0,
    });

    fireEvent.scroll(viewport);
    expect(viewport.getAttribute("data-scrolling")).toBeNull();

    fireEvent.pointerEnter(viewport);
    viewport.scrollTop = 1;
    fireEvent.scroll(viewport);
    await waitFor(() => {
      expect(viewport.getAttribute("data-scrolling")).toBe("");
    });

    await vi.advanceTimersByTimeAsync(SCROLL_TIMEOUT);
    await waitFor(() => {
      expect(viewport.getAttribute("data-scrolling")).toBeNull();
    });

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
