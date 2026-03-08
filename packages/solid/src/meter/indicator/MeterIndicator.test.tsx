import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Meter } from "..";

describe("Meter.Indicator", () => {
  test("sets percentage width style from value", () => {
    const rendered = render(() => (
      <Meter.Root value={33} min={0} max={100}>
        <Meter.Track>
          <Meter.Indicator data-testid="indicator" />
        </Meter.Track>
      </Meter.Root>
    ));

    const indicator = rendered.getByTestId("indicator");
    expect(indicator.style.width).toBe("33%");
    expect(indicator.style.height).toBe("inherit");
  });

  test("sets zero width when max <= min", () => {
    const rendered = render(() => (
      <Meter.Root value={30} min={50} max={50}>
        <Meter.Track>
          <Meter.Indicator data-testid="indicator" />
        </Meter.Track>
      </Meter.Root>
    ));

    expect(rendered.getByTestId("indicator").style.width).toBe("0%");
  });
});
