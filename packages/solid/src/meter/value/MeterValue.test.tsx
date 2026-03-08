import { render } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { Meter } from "..";

describe("Meter.Value", () => {
  test("renders formatted value by default", () => {
    const rendered = render(() => (
      <Meter.Root value={30}>
        <Meter.Value data-testid="value" />
      </Meter.Root>
    ));

    expect(rendered.getByTestId("value").textContent).toBe(
      (0.3).toLocaleString(undefined, { style: "percent" }),
    );
  });

  test("supports render function child", () => {
    const renderSpy = vi.fn(
      (formattedValue: string, value: number) => `${formattedValue}-${value}`,
    );

    const rendered = render(() => (
      <Meter.Root value={30}>
        <Meter.Value data-testid="value">{renderSpy}</Meter.Value>
      </Meter.Root>
    ));

    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(renderSpy.mock.calls[0]?.[0]).toBe(
      (0.3).toLocaleString(undefined, { style: "percent" }),
    );
    expect(renderSpy.mock.calls[0]?.[1]).toBe(30);
    expect(rendered.getByTestId("value").textContent).toBe(
      `${(0.3).toLocaleString(undefined, { style: "percent" })}-30`,
    );
  });
});
