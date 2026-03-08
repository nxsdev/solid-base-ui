import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { Toolbar } from "..";

describe("Toolbar.Button", () => {
  test("renders a button", () => {
    const rendered = render(() => (
      <Toolbar.Root>
        <Toolbar.Button data-testid="button">Button</Toolbar.Button>
      </Toolbar.Root>
    ));

    const button = rendered.getByTestId("button");
    expect(button.getAttribute("role")).toBeNull();
    expect(button.tagName).toBe("BUTTON");
  });

  test("disabled blocks interactions and keeps focusability by default", () => {
    const handleClick = vi.fn();
    const handleMouseDown = vi.fn();
    const handlePointerDown = vi.fn();
    const handleKeyDown = vi.fn();

    const rendered = render(() => (
      <Toolbar.Root>
        <Toolbar.Button
          disabled
          data-testid="button"
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
        >
          Button
        </Toolbar.Button>
      </Toolbar.Root>
    ));

    const button = rendered.getByTestId("button");

    expect(button.hasAttribute("disabled")).toBe(false);
    expect(button.getAttribute("data-disabled")).toBe("");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.getAttribute("data-focusable")).toBe("");

    fireEvent.click(button);
    fireEvent.mouseDown(button);
    fireEvent.pointerDown(button);
    fireEvent.keyDown(button, { key: " " });
    fireEvent.keyDown(button, { key: "Enter" });

    expect(handleClick).toHaveBeenCalledTimes(0);
    expect(handleMouseDown).toHaveBeenCalledTimes(0);
    expect(handlePointerDown).toHaveBeenCalledTimes(0);
    expect(handleKeyDown).toHaveBeenCalledTimes(0);
  });

  test("focusableWhenDisabled=false uses native disabled attribute", () => {
    const rendered = render(() => (
      <Toolbar.Root>
        <Toolbar.Button disabled focusableWhenDisabled={false} data-testid="button">
          Button
        </Toolbar.Button>
      </Toolbar.Root>
    ));

    const button = rendered.getByTestId("button");

    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("data-disabled")).toBe("");
    expect(button.hasAttribute("data-focusable")).toBe(false);
  });
});
