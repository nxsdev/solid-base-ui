import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Field } from "..";
import { Form } from "../../form";

describe("Field.Error", () => {
  test("renders on submit when control is invalid and links aria-describedby", async () => {
    const rendered = render(() => (
      <Form>
        <Field.Root>
          <Field.Control data-testid="control" required />
          <Field.Error data-testid="error">Message</Field.Error>
        </Field.Root>
        <button type="submit">Submit</button>
      </Form>
    ));

    const control = rendered.getByTestId("control");
    expect(rendered.queryByTestId("error")).toBeNull();

    fireEvent.click(rendered.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      const error = rendered.getByTestId("error");
      expect(error.textContent).toBe("Message");
      expect(control.getAttribute("aria-describedby")).toBe(error.getAttribute("id"));
    });
  });

  test("match=true always renders", () => {
    const rendered = render(() => (
      <Field.Root>
        <Field.Control />
        <Field.Error data-testid="error" match>
          Message
        </Field.Error>
      </Field.Root>
    ));

    expect(rendered.getByTestId("error").textContent).toBe("Message");
  });
});
