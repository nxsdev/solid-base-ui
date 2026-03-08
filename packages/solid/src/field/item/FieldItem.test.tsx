import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Field } from "..";

describe("Field.Item", () => {
  test("renders a div with propagated field state attributes", () => {
    const rendered = render(() => (
      <Field.Root>
        <Field.Item data-testid="item">Item</Field.Item>
      </Field.Root>
    ));

    const item = rendered.getByTestId("item");
    expect(item.tagName.toLowerCase()).toBe("div");
    expect(item.getAttribute("data-valid")).toBeNull();
    expect(item.textContent).toBe("Item");
  });
});
