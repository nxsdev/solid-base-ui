import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Menu } from "..";

describe("Menu.LinkItem", () => {
  test("renders an anchor with menuitem role", () => {
    render(() => (
      <Menu.Root defaultOpen>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.LinkItem href="/docs">Docs</Menu.LinkItem>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    ));

    const link = screen.getByRole("menuitem", { name: "Docs" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/docs");
  });

  test("does not close the menu by default", async () => {
    render(() => (
      <Menu.Root defaultOpen>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.LinkItem href="/docs">Docs</Menu.LinkItem>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    ));

    fireEvent.click(screen.getByRole("menuitem", { name: "Docs" }));

    await waitFor(() => {
      expect(screen.getByRole("menu")).not.toBeNull();
    });
  });

  test("closes the menu when closeOnClick is true", async () => {
    render(() => (
      <Menu.Root defaultOpen>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.LinkItem href="/docs" closeOnClick>
                Docs
              </Menu.LinkItem>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    ));

    fireEvent.click(screen.getByRole("menuitem", { name: "Docs" }));

    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });
});
