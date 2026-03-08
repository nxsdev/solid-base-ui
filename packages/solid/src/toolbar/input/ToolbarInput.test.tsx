import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { Toolbar } from "..";

describe("Toolbar.Input", () => {
  test("renders a textbox", () => {
    const rendered = render(() => (
      <Toolbar.Root>
        <Toolbar.Input data-testid="input" defaultValue="" />
      </Toolbar.Root>
    ));

    const input = rendered.getByTestId("input");
    expect(input.tagName).toBe("INPUT");
    expect(input.getAttribute("data-orientation")).toBe("horizontal");
  });

  test("disabled input exposes aria-disabled and blocks click", () => {
    const handleClick = vi.fn();

    const rendered = render(() => (
      <Toolbar.Root>
        <Toolbar.Input disabled data-testid="input" defaultValue="" onClick={handleClick} />
      </Toolbar.Root>
    ));

    const input = rendered.getByTestId("input");

    expect(input.getAttribute("data-disabled")).toBe("");
    expect(input.getAttribute("aria-disabled")).toBe("true");
    expect(input.getAttribute("data-focusable")).toBe("");

    fireEvent.click(input);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("disabled keydown prevents non-arrow horizontal keys", () => {
    const rendered = render(() => (
      <Toolbar.Root>
        <Toolbar.Input disabled data-testid="input" defaultValue="" />
      </Toolbar.Root>
    ));

    const input = rendered.getByTestId("input");

    const preventedA = !fireEvent.keyDown(input, { key: "a" });
    const preventedLeft = !fireEvent.keyDown(input, { key: "ArrowLeft" });

    expect(preventedA).toBe(true);
    expect(preventedLeft).toBe(true);
  });
});
