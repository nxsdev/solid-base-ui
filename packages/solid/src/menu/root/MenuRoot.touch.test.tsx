import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { Menu } from "..";

describe("Menu.Root touch interaction", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  test("does not apply body scroll lock when opened by touch", async () => {
    render(() => (
      <Menu.Root>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item>Item</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    ));

    const trigger = screen.getByRole("button", { name: "Open" });

    fireEvent.pointerDown(trigger, { pointerType: "touch" });
    fireEvent.touchStart(trigger);
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("menu")).not.toBeNull();
      expect(document.body.style.overflow).toBe("");
    });

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });
});
