import { createSignal } from "solid-js";
import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { ToggleGroup } from "../toggle-group";
import { Toggle } from "./Toggle";

describe("Toggle", () => {
  test("uncontrolled pressed state", async () => {
    const rendered = render(() => <Toggle defaultPressed={false} />);
    const button = rendered.getByRole("button");

    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.getAttribute("data-pressed")).toBeNull();

    fireEvent.click(button);

    await waitFor(() => {
      expect(button.getAttribute("aria-pressed")).toBe("true");
      expect(button.getAttribute("data-pressed")).toBe("");
    });
  });

  test("controlled pressed state", async () => {
    const [pressed, setPressed] = createSignal(false);

    const rendered = render(() => (
      <>
        <Toggle pressed={pressed()} aria-label="toggle" />
        <button data-testid="set" onClick={() => setPressed((prev) => !prev)}>
          set
        </button>
      </>
    ));

    const toggle = rendered.getByRole("button", { name: "toggle" });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(rendered.getByTestId("set"));
    await waitFor(() => {
      expect(toggle.getAttribute("aria-pressed")).toBe("true");
    });
  });

  test("onPressedChange is called", () => {
    const onPressedChange = vi.fn();
    const rendered = render(() => (
      <Toggle defaultPressed={false} onPressedChange={onPressedChange} />
    ));
    const button = rendered.getByRole("button");

    fireEvent.click(button);

    expect(onPressedChange).toHaveBeenCalledTimes(1);
    expect(onPressedChange.mock.calls[0]?.[0]).toBe(true);
    expect(onPressedChange.mock.calls[0]?.[1]?.reason).toBe("none");
  });

  test("disabled blocks interactions", () => {
    const onPressedChange = vi.fn();
    const rendered = render(() => <Toggle disabled onPressedChange={onPressedChange} />);
    const button = rendered.getByRole("button");

    expect(button.getAttribute("disabled")).toBe("");
    expect(button.getAttribute("data-disabled")).toBe("");

    fireEvent.click(button);

    expect(onPressedChange).toHaveBeenCalledTimes(0);
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  test("reads pressed state from ToggleGroup", async () => {
    const rendered = render(() => (
      <ToggleGroup defaultValue={["left"]}>
        <Toggle value="left" />
        <Toggle value="right" />
      </ToggleGroup>
    ));

    const [left, right] = rendered.getAllByRole("button");
    if (!left || !right) {
      throw new Error("Expected two toggle buttons.");
    }
    expect(left.getAttribute("aria-pressed")).toBe("true");
    expect(right.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(right);

    await waitFor(() => {
      expect(left.getAttribute("aria-pressed")).toBe("false");
      expect(right.getAttribute("aria-pressed")).toBe("true");
    });
  });
});
