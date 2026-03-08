import { createSignal } from "solid-js";
import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { Checkbox } from "../checkbox";
import { CheckboxGroup } from "./CheckboxGroup";

describe("CheckboxGroup", () => {
  test("controlled value toggles checkboxes", async () => {
    const [value, setValue] = createSignal<string[]>(["red"]);

    const rendered = render(() => (
      <CheckboxGroup value={value()} onValueChange={(nextValue) => setValue(nextValue)}>
        <Checkbox.Root value="red" data-testid="red" />
        <Checkbox.Root value="green" data-testid="green" />
        <Checkbox.Root value="blue" data-testid="blue" />
      </CheckboxGroup>
    ));

    const red = rendered.getByTestId("red");
    const green = rendered.getByTestId("green");
    const blue = rendered.getByTestId("blue");

    expect(red.getAttribute("aria-checked")).toBe("true");
    expect(green.getAttribute("aria-checked")).toBe("false");
    expect(blue.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(green);

    await waitFor(() => {
      expect(red.getAttribute("aria-checked")).toBe("true");
      expect(green.getAttribute("aria-checked")).toBe("true");
      expect(blue.getAttribute("aria-checked")).toBe("false");
    });
  });

  test("onValueChange is called with next value", async () => {
    const onValueChange = vi.fn();
    const [value, setValue] = createSignal<string[]>([]);

    const rendered = render(() => (
      <CheckboxGroup
        value={value()}
        onValueChange={(nextValue, details) => {
          setValue(nextValue);
          onValueChange(nextValue, details);
        }}
      >
        <Checkbox.Root value="red" data-testid="red" />
        <Checkbox.Root value="green" data-testid="green" />
      </CheckboxGroup>
    ));

    fireEvent.click(rendered.getByTestId("red"));

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange.mock.calls[0]?.[0]).toEqual(["red"]);
      expect(onValueChange.mock.calls[0]?.[1]?.reason).toBe("none");
    });
  });

  test("defaultValue sets initial state for uncontrolled group", async () => {
    const rendered = render(() => (
      <CheckboxGroup defaultValue={["green"]}>
        <Checkbox.Root value="red" data-testid="red" />
        <Checkbox.Root value="green" data-testid="green" />
      </CheckboxGroup>
    ));

    const red = rendered.getByTestId("red");
    const green = rendered.getByTestId("green");

    expect(red.getAttribute("aria-checked")).toBe("false");
    expect(green.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(red);

    await waitFor(() => {
      expect(red.getAttribute("aria-checked")).toBe("true");
      expect(green.getAttribute("aria-checked")).toBe("true");
    });
  });

  test("disabled group disables all child checkboxes", () => {
    const rendered = render(() => (
      <CheckboxGroup disabled>
        <Checkbox.Root value="red" data-testid="red" />
        <Checkbox.Root value="green" data-testid="green" />
      </CheckboxGroup>
    ));

    expect(rendered.getByTestId("red").getAttribute("aria-disabled")).toBe("true");
    expect(rendered.getByTestId("green").getAttribute("aria-disabled")).toBe("true");
  });

  test("data-disabled is applied to group root", () => {
    const rendered = render(() => (
      <CheckboxGroup disabled data-testid="group">
        <Checkbox.Root value="red" />
      </CheckboxGroup>
    ));

    expect(rendered.getByTestId("group").getAttribute("data-disabled")).toBe("");
  });
});
