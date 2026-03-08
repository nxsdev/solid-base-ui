import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Menu } from "..";

describe("Menu.GroupLabel", () => {
  test("associates the generated label id with the group", () => {
    render(() => (
      <Menu.Root open>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Group>
                <Menu.GroupLabel>Group label</Menu.GroupLabel>
              </Menu.Group>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    ));

    const group = screen.getByRole("group");
    const label = screen.getByText("Group label");

    expect(label.getAttribute("role")).toBe("presentation");
    expect(group.getAttribute("aria-labelledby")).toBe(label.id);
  });

  test("uses the provided id for aria-labelledby", () => {
    render(() => (
      <Menu.Root open>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Group>
                <Menu.GroupLabel id="group-label">Group label</Menu.GroupLabel>
              </Menu.Group>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    ));

    expect(screen.getByRole("group").getAttribute("aria-labelledby")).toBe("group-label");
  });
});
