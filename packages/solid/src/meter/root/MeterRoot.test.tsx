import { createSignal } from "solid-js";
import { render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Meter } from "..";

describe("Meter.Root", () => {
  test("sets ARIA attributes", async () => {
    const rendered = render(() => (
      <Meter.Root value={30}>
        <Meter.Label>Battery Level</Meter.Label>
        <Meter.Track>
          <Meter.Indicator />
        </Meter.Track>
      </Meter.Root>
    ));

    const meter = rendered.getByRole("meter");
    const label = rendered.getByText("Battery Level");

    expect(meter.getAttribute("aria-valuenow")).toBe("30");
    expect(meter.getAttribute("aria-valuemin")).toBe("0");
    expect(meter.getAttribute("aria-valuemax")).toBe("100");
    expect(meter.getAttribute("aria-valuetext")).toBe("30%");
    await waitFor(() => {
      expect(meter.getAttribute("aria-labelledby")).toBe(label.getAttribute("id"));
    });
  });

  test("updates aria-valuenow when value changes", async () => {
    const [value, setValue] = createSignal(50);
    const rendered = render(() => (
      <>
        <Meter.Root value={value()}>
          <Meter.Track>
            <Meter.Indicator />
          </Meter.Track>
        </Meter.Root>
        <button data-testid="set" onClick={() => setValue(77)}>
          set
        </button>
      </>
    ));

    const meter = rendered.getByRole("meter");
    expect(meter.getAttribute("aria-valuenow")).toBe("50");

    rendered.getByTestId("set").click();

    await waitFor(() => {
      expect(meter.getAttribute("aria-valuenow")).toBe("77");
    });
  });

  test("format prop formats value and aria-valuetext", () => {
    const format: Intl.NumberFormatOptions = {
      style: "currency",
      currency: "USD",
    };
    const expected = new Intl.NumberFormat(undefined, format).format(30);

    const rendered = render(() => (
      <Meter.Root value={30} format={format}>
        <Meter.Value data-testid="value" />
      </Meter.Root>
    ));

    expect(rendered.getByTestId("value").textContent).toBe(expected);
    expect(rendered.getByRole("meter").getAttribute("aria-valuetext")).toBe(expected);
  });
});
