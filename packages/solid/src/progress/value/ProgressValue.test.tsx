import { render } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { Progress } from "..";

describe("Progress.Value", () => {
  test("renders formatted value by default", () => {
    const rendered = render(() => (
      <Progress.Root value={30}>
        <Progress.Value data-testid="value" />
      </Progress.Root>
    ));

    expect(rendered.getByTestId("value").textContent).toBe(
      (0.3).toLocaleString(undefined, { style: "percent" }),
    );
  });

  test("renders formatted value when format is provided", () => {
    const format: Intl.NumberFormatOptions = {
      style: "currency",
      currency: "USD",
    };
    const expected = new Intl.NumberFormat(undefined, format).format(30);

    const rendered = render(() => (
      <Progress.Root value={30} format={format}>
        <Progress.Value data-testid="value" />
      </Progress.Root>
    ));

    expect(rendered.getByTestId("value").textContent).toBe(expected);
  });

  test("supports render function child for determinate value", () => {
    const renderSpy = vi.fn((formattedValue: string, value: number | null) => {
      return `${formattedValue}-${value}`;
    });

    const rendered = render(() => (
      <Progress.Root value={30}>
        <Progress.Value data-testid="value">{renderSpy}</Progress.Value>
      </Progress.Root>
    ));

    expect(renderSpy).toHaveBeenCalled();
    expect(renderSpy.mock.lastCall?.[0]).toBe(
      (0.3).toLocaleString(undefined, { style: "percent" }),
    );
    expect(renderSpy.mock.lastCall?.[1]).toBe(30);
    expect(rendered.getByTestId("value").textContent).toBe(
      `${(0.3).toLocaleString(undefined, { style: "percent" })}-30`,
    );
  });

  test("passes indeterminate marker to render function child", () => {
    const renderSpy = vi.fn((formattedValue: string, value: number | null) => {
      return `${formattedValue}-${value}`;
    });

    const rendered = render(() => (
      <Progress.Root value={null}>
        <Progress.Value data-testid="value">{renderSpy}</Progress.Value>
      </Progress.Root>
    ));

    expect(renderSpy).toHaveBeenCalled();
    expect(renderSpy.mock.lastCall?.[0]).toBe("indeterminate");
    expect(renderSpy.mock.lastCall?.[1]).toBeNull();
    expect(rendered.getByTestId("value").textContent).toBe("indeterminate-null");
  });
});
