import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Field } from "..";
import { Form } from "../../form";

describe("Field.Validity", () => {
  test("exposes validity state to render function", async () => {
    const rendered = render(() => (
      <Form>
        <Field.Root>
          <Field.Control data-testid="control" required />
          <Field.Validity>
            {(state) => <span data-testid="validity">{String(state.validity.valid)}</span>}
          </Field.Validity>
        </Field.Root>
        <button type="submit">Submit</button>
      </Form>
    ));

    const control = rendered.getByTestId("control");

    expect(rendered.getByTestId("validity").textContent).toBe("null");

    fireEvent.click(rendered.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(rendered.getByTestId("validity").textContent).toBe("false");
    });

    fireEvent.input(control, { target: { value: "ok" } });

    await waitFor(() => {
      expect(rendered.getByTestId("validity").textContent).toBe("true");
    });
  });
});
