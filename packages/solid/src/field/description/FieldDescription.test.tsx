import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Field } from "..";

describe("Field.Description", () => {
  test("automatically links description via aria-describedby", () => {
    const rendered = render(() => (
      <Field.Root>
        <Field.Control data-testid="control" />
        <Field.Description data-testid="description">Description</Field.Description>
      </Field.Root>
    ));

    const control = rendered.getByTestId("control");
    const description = rendered.getByTestId("description");

    expect(control.getAttribute("aria-describedby")).toBe(description.getAttribute("id"));
  });
});
