import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Toolbar } from "..";

describe("Toolbar.Group", () => {
  test("renders a group element", () => {
    const rendered = render(() => (
      <Toolbar.Root>
        <Toolbar.Group data-testid="group" />
      </Toolbar.Root>
    ));

    const group = rendered.getByTestId("group");
    expect(group.getAttribute("role")).toBe("group");
  });

  test("disabled group disables contained button and input but not link", () => {
    const rendered = render(() => (
      <Toolbar.Root>
        <Toolbar.Group disabled data-testid="group">
          <Toolbar.Button data-testid="button">Button</Toolbar.Button>
          <Toolbar.Link data-testid="link" href="https://base-ui.com">
            Link
          </Toolbar.Link>
          <Toolbar.Input data-testid="input" defaultValue="" />
        </Toolbar.Group>
      </Toolbar.Root>
    ));

    const group = rendered.getByTestId("group");
    const button = rendered.getByTestId("button");
    const link = rendered.getByTestId("link");
    const input = rendered.getByTestId("input");

    expect(group.getAttribute("data-disabled")).toBe("");

    expect(button.getAttribute("data-disabled")).toBe("");
    expect(button.getAttribute("aria-disabled")).toBe("true");

    expect(input.getAttribute("data-disabled")).toBe("");
    expect(input.getAttribute("aria-disabled")).toBe("true");

    expect(link.hasAttribute("data-disabled")).toBe(false);
    expect(link.hasAttribute("aria-disabled")).toBe(false);
  });
});
