import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Progress } from "..";

describe("Progress.Indicator", () => {
  test("sets percentage width style from value", () => {
    const rendered = render(() => (
      <Progress.Root value={33} min={0} max={100}>
        <Progress.Track>
          <Progress.Indicator data-testid="indicator" />
        </Progress.Track>
      </Progress.Root>
    ));

    const indicator = rendered.getByTestId("indicator");
    expect(indicator.style.width).toBe("33%");
    expect(indicator.style.height).toBe("inherit");
    expect(indicator.style.insetInlineStart).toBe("0px");
  });

  test("sets zero width when value is 0", () => {
    const rendered = render(() => (
      <Progress.Root value={0}>
        <Progress.Track>
          <Progress.Indicator data-testid="indicator" />
        </Progress.Track>
      </Progress.Root>
    ));

    expect(rendered.getByTestId("indicator").style.width).toBe("0%");
  });

  test("keeps internal styles empty when value is indeterminate", () => {
    const rendered = render(() => (
      <Progress.Root value={null}>
        <Progress.Track>
          <Progress.Indicator data-testid="indicator" />
        </Progress.Track>
      </Progress.Root>
    ));

    const indicator = rendered.getByTestId("indicator");

    expect(indicator.style.width).toBe("");
    expect(indicator.style.insetInlineStart).toBe("");
    expect(indicator.getAttribute("data-indeterminate")).toBe("");
  });
});
