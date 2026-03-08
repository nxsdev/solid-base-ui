import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Toolbar } from "..";

describe("Toolbar.Separator", () => {
  test("uses opposite orientation from toolbar", () => {
    const rendered = render(() => (
      <Toolbar.Root orientation="horizontal">
        <Toolbar.Separator data-testid="separator" />
      </Toolbar.Root>
    ));

    const separator = rendered.getByTestId("separator");

    expect(separator.getAttribute("role")).toBe("separator");
    expect(separator.getAttribute("aria-orientation")).toBe("vertical");
    expect(separator.getAttribute("data-orientation")).toBe("vertical");
  });
});
