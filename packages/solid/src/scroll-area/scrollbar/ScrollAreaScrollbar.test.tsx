import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { SCROLL_TIMEOUT } from "../constants";
import { ScrollArea } from "..";

describe("ScrollArea.Scrollbar", () => {
  test("updates scrolling attributes per orientation", async () => {
    vi.useFakeTimers();

    const rendered = render(() => (
      <ScrollArea.Root style={{ width: "200px", height: "200px" }}>
        <ScrollArea.Viewport data-testid="viewport">
          <div />
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" data-testid="vertical" keepMounted>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
        <ScrollArea.Scrollbar orientation="horizontal" data-testid="horizontal" keepMounted>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    ));

    const viewport = rendered.getByTestId("viewport") as HTMLDivElement;
    const vertical = rendered.getByTestId("vertical");
    const horizontal = rendered.getByTestId("horizontal");

    mockViewportMetrics(viewport, {
      clientWidth: 200,
      clientHeight: 200,
      scrollWidth: 1000,
      scrollHeight: 1000,
      scrollLeft: 0,
      scrollTop: 0,
    });

    fireEvent.pointerEnter(viewport);
    viewport.scrollTop = 10;
    fireEvent.scroll(viewport);
    expect(vertical.getAttribute("data-scrolling")).toBe("");
    expect(horizontal.getAttribute("data-scrolling")).toBeNull();

    await vi.advanceTimersByTimeAsync(SCROLL_TIMEOUT);
    expect(vertical.getAttribute("data-scrolling")).toBeNull();

    fireEvent.pointerEnter(viewport);
    viewport.scrollLeft = 12;
    fireEvent.scroll(viewport);
    expect(horizontal.getAttribute("data-scrolling")).toBe("");

    await vi.advanceTimersByTimeAsync(SCROLL_TIMEOUT);
    expect(horizontal.getAttribute("data-scrolling")).toBeNull();

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
