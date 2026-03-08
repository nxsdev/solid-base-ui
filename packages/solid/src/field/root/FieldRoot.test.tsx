import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Field } from "..";
import { Fieldset } from "../../fieldset";

describe("Field.Root", () => {
  test("tracks touched/dirty/filled/focused state via Field.Control", async () => {
    const rendered = render(() => (
      <Field.Root data-testid="root">
        <Field.Control data-testid="control" />
      </Field.Root>
    ));

    const root = rendered.getByTestId("root");
    const control = rendered.getByTestId("control");

    fireEvent.focus(control);
    fireEvent.input(control, { target: { value: "a" } });
    fireEvent.blur(control);

    await waitFor(() => {
      expect(root.getAttribute("data-touched")).toBe("");
      expect(root.getAttribute("data-dirty")).toBe("");
      expect(root.getAttribute("data-filled")).toBe("");
      expect(root.getAttribute("data-focused")).toBeNull();
    });
  });

  test("inherits disabled state from Fieldset.Root", () => {
    const rendered = render(() => (
      <Fieldset.Root disabled>
        <Field.Root>
          <Field.Control data-testid="control" />
        </Field.Root>
      </Fieldset.Root>
    ));

    const control = rendered.getByTestId("control") as HTMLInputElement;
    expect(control.disabled).toBe(true);
    expect(control.getAttribute("data-disabled")).toBe("");
  });
});
