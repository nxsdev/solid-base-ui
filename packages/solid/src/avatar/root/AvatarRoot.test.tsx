import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Avatar } from "..";

describe("Avatar.Root", () => {
  test("renders span container", () => {
    const rendered = render(() => <Avatar.Root data-testid="root" />);

    const root = rendered.getByTestId("root");
    expect(root.tagName).toBe("SPAN");
  });

  test("renders children", () => {
    const rendered = render(() => (
      <Avatar.Root>
        <Avatar.Fallback data-testid="fallback">AC</Avatar.Fallback>
      </Avatar.Root>
    ));

    expect(rendered.getByTestId("fallback").textContent).toBe("AC");
  });

  test("forwards html attributes and supports render override", () => {
    const rendered = render(() => (
      <Avatar.Root
        data-testid="root"
        id="avatar-root"
        role="img"
        render="div"
        aria-label="avatar"
      />
    ));

    const root = rendered.getByTestId("root");
    expect(root.tagName).toBe("DIV");
    expect(root.getAttribute("id")).toBe("avatar-root");
    expect(root.getAttribute("role")).toBe("img");
    expect(root.getAttribute("aria-label")).toBe("avatar");
  });
});
