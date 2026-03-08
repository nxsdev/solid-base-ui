import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { RadioGroup } from "../../radio-group";
import { RadioRoot } from "./RadioRoot";

describe("Radio.Root", () => {
  test("does not forward value prop to root element", () => {
    const rendered = render(() => (
      <RadioGroup>
        <RadioRoot value="test" data-testid="radio-root" />
      </RadioGroup>
    ));

    expect(rendered.getByTestId("radio-root").getAttribute("value")).toBeNull();
  });

  test("group click updates selected radio", async () => {
    const rendered = render(() => (
      <RadioGroup defaultValue="a">
        <RadioRoot value="a" data-testid="a" />
        <RadioRoot value="b" data-testid="b" />
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

  test("nativeButton associates id with root, not hidden input", () => {
    const rendered = render(() => (
      <RadioGroup defaultValue="b">
        <RadioRoot value="a" id="my-radio" nativeButton data-testid="a" />
        <RadioRoot value="b" data-testid="b" />
      </RadioGroup>
    ));

    const radioA = rendered.getByTestId("a");
    const hiddenInput = radioA.nextElementSibling as HTMLInputElement | null;

    expect(radioA.getAttribute("id")).toBe("my-radio");
    expect(hiddenInput?.getAttribute("id")).not.toBe("my-radio");
  });

  test("disabled uses aria-disabled and blocks interactions", () => {
    const rendered = render(() => (
      <RadioGroup disabled defaultValue="a">
        <RadioRoot value="a" data-testid="a" />
        <RadioRoot value="b" data-testid="b" />
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

  test("readOnly blocks interactions", () => {
    const rendered = render(() => (
      <RadioGroup readOnly defaultValue="a">
        <RadioRoot value="a" data-testid="a" />
        <RadioRoot value="b" data-testid="b" />
      </RadioGroup>
    ));

    const radioA = rendered.getByTestId("a");
    const radioB = rendered.getByTestId("b");

    expect(radioA.getAttribute("aria-readonly")).toBe("true");
    expect(radioB.getAttribute("aria-readonly")).toBe("true");

    fireEvent.click(radioB);
    expect(radioA.getAttribute("aria-checked")).toBe("true");
    expect(radioB.getAttribute("aria-checked")).toBe("false");
  });

  test("inputRef receives hidden input", () => {
    const inputRef = vi.fn();
    const rendered = render(() => (
      <RadioGroup>
        <RadioRoot value="a" data-testid="radio" inputRef={inputRef} />
      </RadioGroup>
    ));

    const radio = rendered.getByTestId("radio");
    const input = radio.nextElementSibling as HTMLInputElement | null;

    expect(input).not.toBeNull();
    expect(inputRef).toHaveBeenCalledTimes(1);
    expect(inputRef).toHaveBeenCalledWith(input);
  });

  test("extra role prop overrides built-in role", () => {
    const rendered = render(() => (
      <RadioGroup>
        <RadioRoot value="a" role="switch" data-testid="radio" />
      </RadioGroup>
    ));

    expect(rendered.getByTestId("radio").getAttribute("role")).toBe("switch");
  });
});
