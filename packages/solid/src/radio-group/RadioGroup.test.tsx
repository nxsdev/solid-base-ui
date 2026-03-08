import { createSignal } from "solid-js";
import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { Radio } from "../radio";
import { RadioGroup } from "./RadioGroup";

describe("RadioGroup", () => {
  test("controlled value updates selected radio", async () => {
    const [value, setValue] = createSignal("a");

    const rendered = render(() => (
      <RadioGroup value={value()} onValueChange={setValue}>
        <Radio.Root value="a" data-testid="a" />
        <Radio.Root value="b" data-testid="b" />
      </RadioGroup>
    ));

    const radioA = rendered.getByTestId("a");
    const radioB = rendered.getByTestId("b");

    expect(radioA.getAttribute("aria-checked")).toBe("true");
    expect(radioB.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(radioB);

    await waitFor(() => {
      expect(radioA.getAttribute("aria-checked")).toBe("false");
      expect(radioB.getAttribute("aria-checked")).toBe("true");
    });
  });

  test("onValueChange is called with next value", async () => {
    const onValueChange = vi.fn();

    const rendered = render(() => (
      <RadioGroup onValueChange={onValueChange}>
        <Radio.Root value="a" data-testid="a" />
      </RadioGroup>
    ));

    fireEvent.click(rendered.getByTestId("a"));

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange.mock.calls[0]?.[0]).toBe("a");
      expect(onValueChange.mock.calls[0]?.[1]?.reason).toBe("none");
    });
  });

  test("defaultValue sets initial selected radio", () => {
    const rendered = render(() => (
      <RadioGroup defaultValue="b">
        <Radio.Root value="a" data-testid="a" />
        <Radio.Root value="b" data-testid="b" />
      </RadioGroup>
    ));

    expect(rendered.getByTestId("a").getAttribute("aria-checked")).toBe("false");
    expect(rendered.getByTestId("b").getAttribute("aria-checked")).toBe("true");
  });

  test("disabled group blocks interactions", () => {
    const rendered = render(() => (
      <RadioGroup disabled defaultValue="a">
        <Radio.Root value="a" data-testid="a" />
        <Radio.Root value="b" data-testid="b" />
      </RadioGroup>
    ));

    const radioA = rendered.getByTestId("a");
    const radioB = rendered.getByTestId("b");

    expect(radioA.getAttribute("aria-disabled")).toBe("true");
    expect(radioB.getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(radioB);
    expect(radioA.getAttribute("aria-checked")).toBe("true");
    expect(radioB.getAttribute("aria-checked")).toBe("false");
  });

  test("name is forwarded to hidden input", () => {
    const rendered = render(() => (
      <RadioGroup name="fruit">
        <Radio.Root value="apple" data-testid="radio" />
      </RadioGroup>
    ));

    const radio = rendered.getByTestId("radio");
    const input = radio.nextElementSibling as HTMLInputElement | null;

    expect(input).not.toBeNull();
    expect(input?.getAttribute("name")).toBe("fruit");
    expect(input?.getAttribute("value")).toBe("apple");
  });
});
