import { createSignal } from "solid-js";
import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { CheckboxRoot } from "./CheckboxRoot";

function getCheckboxInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (input === null) {
    throw new Error("Expected hidden checkbox input to be rendered.");
  }
  return input;
}

describe("Checkbox.Root", () => {
  test("uncontrolled checked state toggles on click", async () => {
    const rendered = render(() => <CheckboxRoot aria-label="checkbox" />);
    const checkbox = rendered.getByRole("checkbox", { name: "checkbox" });
    const input = getCheckboxInput(rendered.container);

    expect(checkbox.getAttribute("aria-checked")).toBe("false");
    expect(checkbox.getAttribute("data-unchecked")).toBe("");
    expect(input.checked).toBe(false);

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox.getAttribute("aria-checked")).toBe("true");
      expect(checkbox.getAttribute("data-checked")).toBe("");
      expect(checkbox.getAttribute("data-unchecked")).toBeNull();
      expect(input.checked).toBe(true);
    });
  });

  test("controlled checked state is driven by props", async () => {
    const [checked, setChecked] = createSignal(false);

    const rendered = render(() => (
      <>
        <CheckboxRoot aria-label="checkbox" checked={checked()} />
        <button data-testid="set" onClick={() => setChecked((prev) => !prev)}>
          set
        </button>
      </>
    ));

    const checkbox = rendered.getByRole("checkbox", { name: "checkbox" });
    expect(checkbox.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(rendered.getByTestId("set"));

    await waitFor(() => {
      expect(checkbox.getAttribute("aria-checked")).toBe("true");
    });
  });

  test("supports Enter and Space keyboard activation", async () => {
    const rendered = render(() => <CheckboxRoot aria-label="checkbox" />);
    const checkbox = rendered.getByRole("checkbox", { name: "checkbox" });

    fireEvent.keyDown(checkbox, { key: "Enter" });
    await waitFor(() => {
      expect(checkbox.getAttribute("aria-checked")).toBe("true");
    });

    fireEvent.keyDown(checkbox, { key: " " });
    expect(checkbox.getAttribute("aria-checked")).toBe("true");

    fireEvent.keyUp(checkbox, { key: " " });
    await waitFor(() => {
      expect(checkbox.getAttribute("aria-checked")).toBe("false");
    });
  });

  test("onCheckedChange can cancel state update", async () => {
    const onCheckedChange = vi.fn((_: boolean, details) => {
      details.cancel();
    });

    const rendered = render(() => (
      <CheckboxRoot aria-label="checkbox" onCheckedChange={onCheckedChange} />
    ));
    const checkbox = rendered.getByRole("checkbox", { name: "checkbox" });

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(onCheckedChange).toHaveBeenCalledTimes(1);
      expect(onCheckedChange.mock.calls[0]?.[0]).toBe(true);
      expect(onCheckedChange.mock.calls[0]?.[1]?.reason).toBe("none");
      expect(checkbox.getAttribute("aria-checked")).toBe("false");
    });
  });

  test("disabled blocks interactions", async () => {
    const rendered = render(() => <CheckboxRoot aria-label="checkbox" disabled />);
    const checkbox = rendered.getByRole("checkbox", { name: "checkbox" });

    expect(checkbox.hasAttribute("disabled")).toBe(false);
    expect(checkbox.getAttribute("aria-disabled")).toBe("true");
    expect(checkbox.getAttribute("data-disabled")).toBe("");

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox.getAttribute("aria-checked")).toBe("false");
    });
  });

  test("readOnly and required attributes are reflected", async () => {
    const rendered = render(() => <CheckboxRoot aria-label="checkbox" readOnly required />);
    const checkbox = rendered.getByRole("checkbox", { name: "checkbox" });

    expect(checkbox.getAttribute("aria-readonly")).toBe("true");
    expect(checkbox.getAttribute("aria-required")).toBe("true");
    expect(checkbox.getAttribute("data-readonly")).toBe("");
    expect(checkbox.getAttribute("data-required")).toBe("");

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox.getAttribute("aria-checked")).toBe("false");
    });
  });

  test("indeterminate sets mixed state and blocks toggling", async () => {
    const rendered = render(() => <CheckboxRoot aria-label="checkbox" indeterminate />);
    const checkbox = rendered.getByRole("checkbox", { name: "checkbox" });

    expect(checkbox.getAttribute("aria-checked")).toBe("mixed");
    expect(checkbox.getAttribute("data-indeterminate")).toBe("");
    expect(checkbox.getAttribute("data-checked")).toBeNull();
    expect(checkbox.getAttribute("data-unchecked")).toBeNull();

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox.getAttribute("aria-checked")).toBe("mixed");
    });
  });

  test("name and value are set only on the hidden input", () => {
    const rendered = render(() => (
      <CheckboxRoot aria-label="checkbox" name="checkbox-name" value="1" />
    ));
    const checkbox = rendered.getByRole("checkbox", { name: "checkbox" });
    const input = getCheckboxInput(rendered.container);

    expect(input.getAttribute("name")).toBe("checkbox-name");
    expect(input.getAttribute("value")).toBe("1");
    expect(checkbox.getAttribute("name")).toBeNull();
    expect(checkbox.getAttribute("value")).toBeNull();
  });

  test("renders hidden unchecked input while unchecked", async () => {
    const rendered = render(() => (
      <CheckboxRoot aria-label="checkbox" name="checkbox-name" uncheckedValue="off" />
    ));

    const checkbox = rendered.getByRole("checkbox", { name: "checkbox" });
    const getHiddenUnchecked = () =>
      rendered.container.querySelector('input[type="hidden"][name="checkbox-name"]');

    expect(getHiddenUnchecked()?.getAttribute("value")).toBe("off");

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(getHiddenUnchecked()).toBeNull();
    });
  });

  test("inputRef receives hidden input element", () => {
    const inputRef = vi.fn();
    const rendered = render(() => <CheckboxRoot aria-label="checkbox" inputRef={inputRef} />);
    const input = getCheckboxInput(rendered.container);

    expect(inputRef).toHaveBeenCalledTimes(1);
    expect(inputRef).toHaveBeenCalledWith(input);
  });

  test("clicking explicitly linked label toggles the checkbox", async () => {
    const rendered = render(() => (
      <div>
        <label for="my-checkbox">Toggle</label>
        <CheckboxRoot id="my-checkbox" aria-label="checkbox" />
      </div>
    ));

    const checkbox = rendered.getByRole("checkbox", { name: "checkbox" });

    fireEvent.click(rendered.getByText("Toggle"));

    await waitFor(() => {
      expect(checkbox.getAttribute("aria-checked")).toBe("true");
    });
  });

  test("nativeButton associates id with root, not hidden input", () => {
    const rendered = render(() => (
      <CheckboxRoot id="my-checkbox" nativeButton aria-label="checkbox" />
    ));
    const checkbox = rendered.getByRole("checkbox", { name: "checkbox" });
    const input = getCheckboxInput(rendered.container);

    expect(checkbox.getAttribute("id")).toBe("my-checkbox");
    expect(input.getAttribute("id")).not.toBe("my-checkbox");
  });

  test("extra role prop can override built-in role", () => {
    const rendered = render(() => <CheckboxRoot role="switch" data-testid="checkbox" />);
    const checkbox = rendered.getByTestId("checkbox");

    expect(checkbox.getAttribute("role")).toBe("switch");
  });
});
