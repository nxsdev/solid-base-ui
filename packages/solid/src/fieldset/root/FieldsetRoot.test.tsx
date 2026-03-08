import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Fieldset } from "..";

describe("Fieldset.Root", () => {
  test("renders fieldset element", () => {
    const rendered = render(() => <Fieldset.Root data-testid="fieldset" />);

    const fieldset = rendered.getByTestId("fieldset");
    expect(fieldset.tagName).toBe("FIELDSET");
    expect(rendered.getByRole("group")).toBe(fieldset);
  });

  test("disabled prop is reflected to DOM attributes", () => {
    const rendered = render(() => <Fieldset.Root disabled data-testid="fieldset" />);
    const fieldset = rendered.getByTestId("fieldset") as HTMLFieldSetElement;

    expect(fieldset.disabled).toBe(true);
    expect(fieldset.getAttribute("data-disabled")).toBe("");
  });
});
