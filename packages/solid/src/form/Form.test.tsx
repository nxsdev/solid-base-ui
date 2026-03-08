import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { Field } from "../field";
import { Form } from "./Form";

describe("Form", () => {
  test("does not submit when there are invalid fields", async () => {
    const onSubmit = vi.fn((event: SubmitEvent & { preventDefault: () => void }) => {
      event.preventDefault();
    });

    const rendered = render(() => (
      <Form onSubmit={onSubmit}>
        <Field.Root>
          <Field.Control data-testid="control" required />
          <Field.Error data-testid="error">Error</Field.Error>
        </Field.Root>
        <button type="submit">Submit</button>
      </Form>
    ));

    fireEvent.click(rendered.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(0);
      expect(rendered.getByTestId("error").textContent).toBe("Error");
      expect(document.activeElement).toBe(rendered.getByTestId("control"));
    });
  });

  test("calls onFormSubmit with collected values", async () => {
    const onFormSubmit = vi.fn();

    const rendered = render(() => (
      <Form onFormSubmit={onFormSubmit}>
        <Field.Root name="name">
          <Field.Control defaultValue="Alice" />
        </Field.Root>
        <button type="submit">Submit</button>
      </Form>
    ));

    fireEvent.click(rendered.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(onFormSubmit).toHaveBeenCalledTimes(1);
      expect(onFormSubmit.mock.calls[0]?.[0]).toEqual({ name: "Alice" });
      expect(onFormSubmit.mock.calls[0]?.[1]?.reason).toBe("none");
    });
  });
});
