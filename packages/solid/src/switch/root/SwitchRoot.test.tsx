import { createSignal } from "solid-js";
import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { SwitchRoot } from "./SwitchRoot";

describe("SwitchRoot", () => {
  test("uncontrolled checked state toggles on click", async () => {
    const rendered = render(() => <SwitchRoot aria-label="switch" />);
    const switchElement = rendered.getByRole("switch", { name: "switch" });

    expect(switchElement.getAttribute("aria-checked")).toBe("false");
    expect(switchElement.getAttribute("data-unchecked")).toBe("");

    fireEvent.click(switchElement);

    await waitFor(() => {
      expect(switchElement.getAttribute("aria-checked")).toBe("true");
      expect(switchElement.getAttribute("data-checked")).toBe("");
      expect(switchElement.getAttribute("data-unchecked")).toBeNull();
    });
  });

  test("controlled checked state is driven by props", async () => {
    const [checked, setChecked] = createSignal(false);

    const rendered = render(() => (
      <>
        <SwitchRoot aria-label="switch" checked={checked()} />
        <button data-testid="set" onClick={() => setChecked((prev) => !prev)}>
          set
        </button>
      </>
    ));

    const switchElement = rendered.getByRole("switch", { name: "switch" });
    expect(switchElement.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(rendered.getByTestId("set"));

    await waitFor(() => {
      expect(switchElement.getAttribute("aria-checked")).toBe("true");
    });
  });

  test("supports Enter and Space keyboard activation", async () => {
    const rendered = render(() => <SwitchRoot aria-label="switch" />);
    const switchElement = rendered.getByRole("switch", { name: "switch" });

    fireEvent.keyDown(switchElement, { key: "Enter" });
    await waitFor(() => {
      expect(switchElement.getAttribute("aria-checked")).toBe("true");
    });

    fireEvent.keyDown(switchElement, { key: " " });
    expect(switchElement.getAttribute("aria-checked")).toBe("true");

    fireEvent.keyUp(switchElement, { key: " " });
    await waitFor(() => {
      expect(switchElement.getAttribute("aria-checked")).toBe("false");
    });
  });

  test("onCheckedChange can cancel state update", async () => {
    const onCheckedChange = vi.fn((_: boolean, details) => {
      details.cancel();
    });

    const rendered = render(() => (
      <SwitchRoot aria-label="switch" onCheckedChange={onCheckedChange} />
    ));
    const switchElement = rendered.getByRole("switch", { name: "switch" });

    fireEvent.click(switchElement);

    await waitFor(() => {
      expect(onCheckedChange).toHaveBeenCalledTimes(1);
      expect(onCheckedChange.mock.calls[0]?.[0]).toBe(true);
      expect(onCheckedChange.mock.calls[0]?.[1]?.reason).toBe("none");
      expect(switchElement.getAttribute("aria-checked")).toBe("false");
    });
  });

  test("calls external onClick handler", () => {
    const onClick = vi.fn();
    const rendered = render(() => <SwitchRoot aria-label="switch" onClick={onClick} />);
    const switchElement = rendered.getByRole("switch", { name: "switch" });

    fireEvent.click(switchElement);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("disabled blocks interactions", async () => {
    const rendered = render(() => <SwitchRoot aria-label="switch" disabled />);
    const switchElement = rendered.getByRole("switch", { name: "switch" });

    expect(switchElement.hasAttribute("disabled")).toBe(false);
    expect(switchElement.getAttribute("aria-disabled")).toBe("true");
    expect(switchElement.getAttribute("data-disabled")).toBe("");

    fireEvent.click(switchElement);

    await waitFor(() => {
      expect(switchElement.getAttribute("aria-checked")).toBe("false");
    });
  });

  test("readOnly and required attributes are reflected", async () => {
    const rendered = render(() => <SwitchRoot aria-label="switch" readOnly required />);
    const switchElement = rendered.getByRole("switch", { name: "switch" });

    expect(switchElement.getAttribute("aria-readonly")).toBe("true");
    expect(switchElement.getAttribute("aria-required")).toBe("true");
    expect(switchElement.getAttribute("data-readonly")).toBe("");
    expect(switchElement.getAttribute("data-required")).toBe("");

    fireEvent.click(switchElement);

    await waitFor(() => {
      expect(switchElement.getAttribute("aria-checked")).toBe("false");
    });
  });

  test("name and value are set only on the hidden input", () => {
    const rendered = render(() => <SwitchRoot aria-label="switch" name="switch-name" value="1" />);

    const switchElement = rendered.getByRole("switch", { name: "switch" });
    const input = rendered.getByRole("checkbox", { hidden: true });

    expect(input.getAttribute("name")).toBe("switch-name");
    expect(input.getAttribute("value")).toBe("1");
    expect(switchElement.getAttribute("name")).toBeNull();
    expect(switchElement.getAttribute("value")).toBeNull();
  });

  test("renders hidden unchecked input while unchecked", async () => {
    const rendered = render(() => (
      <SwitchRoot aria-label="switch" name="switch-name" uncheckedValue="off" />
    ));

    const switchElement = rendered.getByRole("switch", { name: "switch" });
    const getHiddenUnchecked = () =>
      rendered.container.querySelector('input[type="hidden"][name="switch-name"]');

    expect(getHiddenUnchecked()?.getAttribute("value")).toBe("off");

    fireEvent.click(switchElement);

    await waitFor(() => {
      expect(getHiddenUnchecked()).toBeNull();
    });
  });

  test("inputRef receives native input element", () => {
    const inputRef = vi.fn();
    const rendered = render(() => <SwitchRoot aria-label="switch" inputRef={inputRef} />);
    const input = rendered.getByRole("checkbox", { hidden: true });

    expect(inputRef).toHaveBeenCalledTimes(1);
    expect(inputRef).toHaveBeenCalledWith(input);
  });

  test("clicking explicitly linked label toggles the switch", async () => {
    const rendered = render(() => (
      <div>
        <label for="my-switch">Toggle</label>
        <SwitchRoot id="my-switch" aria-label="switch" />
      </div>
    ));

    const switchElement = rendered.getByRole("switch", { name: "switch" });

    fireEvent.click(rendered.getByText("Toggle"));

    await waitFor(() => {
      expect(switchElement.getAttribute("aria-checked")).toBe("true");
    });
  });

  test("extra role prop can override built-in role", () => {
    const rendered = render(() => <SwitchRoot role="checkbox" data-testid="switch" />);
    const switchElement = rendered.getByTestId("switch");

    expect(switchElement.getAttribute("role")).toBe("checkbox");
  });
});
