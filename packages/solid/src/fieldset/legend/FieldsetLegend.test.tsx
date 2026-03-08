import { render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Fieldset } from "..";

describe("Fieldset.Legend", () => {
  test("sets aria-labelledby on fieldset automatically", async () => {
    const rendered = render(() => (
      <Fieldset.Root>
        <Fieldset.Legend data-testid="legend">Legend</Fieldset.Legend>
      </Fieldset.Root>
    ));

    const fieldset = rendered.getByRole("group");
    const legend = rendered.getByTestId("legend");

    await waitFor(() => {
      expect(fieldset.getAttribute("aria-labelledby")).toBe(legend.getAttribute("id"));
    });
  });

  test("uses custom legend id for aria-labelledby", async () => {
    const rendered = render(() => (
      <Fieldset.Root>
        <Fieldset.Legend data-testid="legend" id="legend-id" />
      </Fieldset.Root>
    ));

    await waitFor(() => {
      expect(rendered.getByRole("group").getAttribute("aria-labelledby")).toBe("legend-id");
    });
  });

  test("inherits disabled state attribute from root", () => {
    const rendered = render(() => (
      <Fieldset.Root disabled>
        <Fieldset.Legend data-testid="legend">Legend</Fieldset.Legend>
      </Fieldset.Root>
    ));

    expect(rendered.getByTestId("legend").getAttribute("data-disabled")).toBe("");
  });
});
