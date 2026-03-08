import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Menu } from "..";

function NestedMenu() {
  return (
    <Menu.Root>
      <Menu.Trigger>Open</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Item>Item 1</Menu.Item>
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger data-testid="submenu-trigger">More</Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner>
                  <Menu.Popup>
                    <Menu.Item>Sub item</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.SubmenuRoot>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

describe("Menu.SubmenuTrigger", () => {
  test("opens submenu on hover", async () => {
    render(() => <NestedMenu />);

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getAllByRole("menu")).toHaveLength(1);
    });

    const submenuTrigger = screen.getByTestId("submenu-trigger");
    fireEvent.pointerEnter(submenuTrigger, { pointerType: "mouse" });

    await waitFor(() => {
      expect(screen.getAllByRole("menu")).toHaveLength(2);
      expect(submenuTrigger.getAttribute("data-popup-open")).toBe("");
    });
  });

  test("opens submenu with keyboard and closes with backward arrow", async () => {
    render(() => <NestedMenu />);

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    const submenuTrigger = await screen.findByRole("menuitem", { name: "More" });
    submenuTrigger.focus();

    fireEvent.keyDown(submenuTrigger, { key: "ArrowRight" });

    await waitFor(() => {
      expect(screen.getAllByRole("menu")).toHaveLength(2);
    });

    fireEvent.keyDown(submenuTrigger, { key: "ArrowLeft" });

    await waitFor(() => {
      expect(screen.getAllByRole("menu")).toHaveLength(1);
    });
  });
});
