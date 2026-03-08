import { createSignal } from "solid-js";
import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { Toggle } from "../toggle";
import { ToggleGroup } from "./ToggleGroup";

describe("ToggleGroup", () => {
  test("renders role=group", () => {
    const rendered = render(() => <ToggleGroup aria-label="group" />);
    expect(rendered.getByRole("group", { name: "group" })).toBeTruthy();
  });

  test("uncontrolled single selection", async () => {
    const rendered = render(() => (
      <ToggleGroup>
        <Toggle value="one" />
        <Toggle value="two" />
      </ToggleGroup>
    ));

    const [one, two] = rendered.getAllByRole("button");
    if (!one || !two) {
      throw new Error("Expected two toggle buttons.");
    }

    expect(one.getAttribute("aria-pressed")).toBe("false");
    expect(two.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(one);
    await waitFor(() => {
      expect(one.getAttribute("aria-pressed")).toBe("true");
      expect(two.getAttribute("aria-pressed")).toBe("false");
    });

    fireEvent.click(two);
    await waitFor(() => {
      expect(one.getAttribute("aria-pressed")).toBe("false");
      expect(two.getAttribute("aria-pressed")).toBe("true");
    });
  });

  test("multiple=true allows multiple pressed items", async () => {
    const rendered = render(() => (
      <ToggleGroup multiple defaultValue={["one"]}>
        <Toggle value="one" />
        <Toggle value="two" />
      </ToggleGroup>
    ));

    const [one, two] = rendered.getAllByRole("button");
    if (!one || !two) {
      throw new Error("Expected two toggle buttons.");
    }
    expect(one.getAttribute("aria-pressed")).toBe("true");
    expect(two.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(two);
    await waitFor(() => {
      expect(one.getAttribute("aria-pressed")).toBe("true");
      expect(two.getAttribute("aria-pressed")).toBe("true");
    });
  });

  test("controlled value", async () => {
    const [value, setValue] = createSignal<string[]>(["two"]);

    const rendered = render(() => (
      <>
        <ToggleGroup value={value()}>
          <Toggle value="one" />
          <Toggle value="two" />
        </ToggleGroup>
        <button data-testid="set-one" onClick={() => setValue(["one"])}>
          set-one
        </button>
      </>
    ));

    const [one, two] = rendered.getAllByRole("button").slice(0, 2);
    if (!one || !two) {
      throw new Error("Expected two toggle buttons.");
    }
    expect(one.getAttribute("aria-pressed")).toBe("false");
    expect(two.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(rendered.getByTestId("set-one"));

    await waitFor(() => {
      expect(one.getAttribute("aria-pressed")).toBe("true");
      expect(two.getAttribute("aria-pressed")).toBe("false");
    });
  });

  test("onValueChange can cancel state update", async () => {
    const onValueChange = vi.fn((_: string[], details: ToggleGroup.ChangeEventDetails) => {
      details.cancel();
    });

    const rendered = render(() => (
      <ToggleGroup onValueChange={onValueChange}>
        <Toggle value="one" />
      </ToggleGroup>
    ));

    const button = rendered.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(button.getAttribute("aria-pressed")).toBe("false");
    });
  });

  test("disabled propagates to toggles", () => {
    const rendered = render(() => (
      <ToggleGroup disabled>
        <Toggle value="one" />
        <Toggle value="two" />
      </ToggleGroup>
    ));

    const [one, two] = rendered.getAllByRole("button");
    if (!one || !two) {
      throw new Error("Expected two toggle buttons.");
    }
    expect(one.getAttribute("data-disabled")).toBe("");
    expect(two.getAttribute("data-disabled")).toBe("");
  });

  test("orientation and multiple data attributes", () => {
    const rendered = render(() => (
      <ToggleGroup orientation="vertical" multiple>
        <Toggle value="one" />
      </ToggleGroup>
    ));

    const group = rendered.getByRole("group");
    expect(group.getAttribute("data-orientation")).toBe("vertical");
    expect(group.getAttribute("data-multiple")).toBe("");
  });
});
