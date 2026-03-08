import { createSignal } from "solid-js";
import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { LabelableProvider } from "../labelable-provider";
import { Input } from "./Input";

describe("Input", () => {
  test("uncontrolled toggles filled/dirty/touched/focused data attributes", async () => {
    const rendered = render(() => <Input defaultValue="" />);
    const input = rendered.getByRole("textbox");

    expect(input.getAttribute("data-filled")).toBeNull();
    expect(input.getAttribute("data-dirty")).toBeNull();
    expect(input.getAttribute("data-touched")).toBeNull();
    expect(input.getAttribute("data-focused")).toBeNull();

    fireEvent.focus(input);
    await waitFor(() => {
      expect(input.getAttribute("data-focused")).toBe("");
    });

    fireEvent.input(input, { target: { value: "abc" } });

    await waitFor(() => {
      expect(input.getAttribute("data-filled")).toBe("");
      expect(input.getAttribute("data-dirty")).toBe("");
    });

    fireEvent.blur(input);
    await waitFor(() => {
      expect(input.getAttribute("data-focused")).toBeNull();
      expect(input.getAttribute("data-touched")).toBe("");
    });
  });

  test("calls onValueChange with change details", () => {
    const handleValueChange = vi.fn();

    const rendered = render(() => <Input onValueChange={handleValueChange} />);
    const input = rendered.getByRole("textbox");

    fireEvent.input(input, { target: { value: "next" } });

    expect(handleValueChange).toHaveBeenCalledTimes(1);
    expect(handleValueChange.mock.calls[0]?.[0]).toBe("next");
    expect(handleValueChange.mock.calls[0]?.[1]?.reason).toBe("none");
  });

  test("controlled value is driven by props", async () => {
    const [value, setValue] = createSignal("first");

    const rendered = render(() => (
      <>
        <Input value={value()} />
        <button data-testid="set" onClick={() => setValue("second")}>
          set
        </button>
      </>
    ));

    const input = rendered.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("first");

    fireEvent.click(rendered.getByTestId("set"));

    await waitFor(() => {
      expect(input.value).toBe("second");
    });
  });

  test("uses label id from LabelableProvider when aria-labelledby is not provided", () => {
    const rendered = render(() => (
      <LabelableProvider labelId="label-id">
        <Input />
      </LabelableProvider>
    ));

    const input = rendered.getByRole("textbox");
    expect(input.getAttribute("aria-labelledby")).toBe("label-id");
  });

  test("disabled adds disabled + data-disabled", () => {
    const rendered = render(() => <Input disabled />);
    const input = rendered.getByRole("textbox");

    expect(input.getAttribute("disabled")).toBe("");
    expect(input.getAttribute("data-disabled")).toBe("");
  });
});
