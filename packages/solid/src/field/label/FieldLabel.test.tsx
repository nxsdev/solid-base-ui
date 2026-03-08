import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Field } from "..";

describe("Field.Label", () => {
  test("automatically associates htmlFor with Field.Control", () => {
    const rendered = render(() => (
      <Field.Root>
        <Field.Control data-testid="control" />
        <Field.Label data-testid="label">Label</Field.Label>
      </Field.Root>
    ));

    const label = rendered.getByTestId("label");
    const control = rendered.getByTestId("control");

    expect(label.getAttribute("for")).toBe(control.getAttribute("id"));
  });

  test("nativeLabel=false focuses associated control on click", async () => {
    const rendered = render(() => (
      <Field.Root>
        <Field.Control data-testid="control" />
        <Field.Label nativeLabel={false} data-testid="label">
          Label
        </Field.Label>
      </Field.Root>
    ));

    const label = rendered.getByTestId("label");
    const control = rendered.getByTestId("control");

    fireEvent.click(label);

    await waitFor(() => {
      expect(document.activeElement).toBe(control);
    });
  });
});
