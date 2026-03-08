import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  test("native disabled uses disabled attribute and blocks interactions", () => {
    const handleClick = vi.fn();
    const handleMouseDown = vi.fn();
    const handlePointerDown = vi.fn();
    const handleKeyDown = vi.fn();

    const rendered = render(() => (
      <Button
        disabled
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
      />
    ));

    const button = rendered.getByRole("button");

    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("data-disabled")).toBe("");
    expect(button.hasAttribute("aria-disabled")).toBe(false);

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

  test("custom element disabled uses aria-disabled and tabIndex -1", () => {
    const handleClick = vi.fn();
    const handleMouseDown = vi.fn();
    const handlePointerDown = vi.fn();
    const handleKeyDown = vi.fn();

    const rendered = render(() => (
      <Button
        disabled
        nativeButton={false}
        render="span"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
      />
    ));

    const button = rendered.getByRole("button");

    expect(button.hasAttribute("disabled")).toBe(false);
    expect(button.getAttribute("data-disabled")).toBe("");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.tabIndex).toBe(-1);

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

  test("native button keeps focusability when focusableWhenDisabled is true", () => {
    const handleClick = vi.fn();
    const handleMouseDown = vi.fn();
    const handlePointerDown = vi.fn();
    const handleKeyDown = vi.fn();

    const rendered = render(() => (
      <Button
        disabled
        focusableWhenDisabled
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
      />
    ));

    const button = rendered.getByRole("button");

    expect(button.hasAttribute("disabled")).toBe(false);
    expect(button.getAttribute("data-disabled")).toBe("");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.tabIndex).toBe(0);

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

  test("custom element keeps focusability when focusableWhenDisabled is true", () => {
    const handleClick = vi.fn();
    const handleMouseDown = vi.fn();
    const handlePointerDown = vi.fn();
    const handleKeyDown = vi.fn();

    const rendered = render(() => (
      <Button
        disabled
        focusableWhenDisabled
        nativeButton={false}
        render="span"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
      />
    ));

    const button = rendered.getByRole("button");

    expect(button.hasAttribute("disabled")).toBe(false);
    expect(button.getAttribute("data-disabled")).toBe("");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.tabIndex).toBe(0);

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
});
