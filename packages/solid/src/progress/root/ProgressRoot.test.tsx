import { createSignal } from "solid-js";
import { render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Progress } from "..";

describe("Progress.Root", () => {
  test("sets ARIA attributes", async () => {
    const rendered = render(() => (
      <Progress.Root value={30}>
        <Progress.Label>Downloading</Progress.Label>
        <Progress.Value />
        <Progress.Track>
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>
    ));

    const progressbar = rendered.getByRole("progressbar");
    const label = rendered.getByText("Downloading");

    expect(progressbar.getAttribute("aria-valuenow")).toBe("30");
    expect(progressbar.getAttribute("aria-valuemin")).toBe("0");
    expect(progressbar.getAttribute("aria-valuemax")).toBe("100");
    expect(progressbar.getAttribute("aria-valuetext")).toBe(
      (0.3).toLocaleString(undefined, { style: "percent" }),
    );

    await waitFor(() => {
      expect(progressbar.getAttribute("aria-labelledby")).toBe(label.getAttribute("id"));
    });
  });

  test("updates aria-valuenow when value changes", async () => {
    const [value, setValue] = createSignal(50);

    const rendered = render(() => (
      <>
        <Progress.Root value={value()}>
          <Progress.Track>
            <Progress.Indicator />
          </Progress.Track>
        </Progress.Root>
        <button data-testid="set" onClick={() => setValue(77)}>
          set
        </button>
      </>
    ));

    const progressbar = rendered.getByRole("progressbar");
    expect(progressbar.getAttribute("aria-valuenow")).toBe("50");

    rendered.getByTestId("set").click();

    await waitFor(() => {
      expect(progressbar.getAttribute("aria-valuenow")).toBe("77");
    });
  });

  test("format prop formats value and aria-valuetext", () => {
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
    expect(rendered.getByRole("progressbar").getAttribute("aria-valuetext")).toBe(expected);
  });

  test("locale prop controls value formatting", () => {
    const expected = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(70.51);

    const rendered = render(() => (
      <Progress.Root
        value={70.51}
        format={{
          style: "decimal",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }}
        locale="de-DE"
      >
        <Progress.Value data-testid="value" />
      </Progress.Root>
    ));

    expect(rendered.getByTestId("value").textContent).toBe(expected);
  });

  test("indeterminate value sets indeterminate semantics", () => {
    const rendered = render(() => (
      <Progress.Root value={null}>
        <Progress.Value data-testid="value" />
      </Progress.Root>
    ));

    const progressbar = rendered.getByRole("progressbar");

    expect(progressbar.hasAttribute("aria-valuenow")).toBe(false);
    expect(progressbar.getAttribute("aria-valuetext")).toBe("indeterminate progress");
    expect(progressbar.getAttribute("data-indeterminate")).toBe("");
    expect(progressbar.getAttribute("data-progressing")).toBeNull();
    expect(rendered.getByTestId("value").textContent).toBe("");
  });

  test("getAriaValueText can override default aria-valuetext", () => {
    const rendered = render(() => (
      <Progress.Root value={15} getAriaValueText={(_, value) => `value:${value ?? "none"}`} />
    ));

    expect(rendered.getByRole("progressbar").getAttribute("aria-valuetext")).toBe("value:15");
  });
});
