import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { Menu } from "..";

describe("Menu.Root", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  test("opens and closes with trigger and item click", async () => {
    render(() => (
      <Menu.Root>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item data-testid="item-1">Item 1</Menu.Item>
              <Menu.Item>Item 2</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    ));

    const trigger = screen.getByRole("button", { name: "Open" });

    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("menu")).not.toBeNull();
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(trigger.getAttribute("data-popup-open")).toBe("");
    });

    fireEvent.click(screen.getByTestId("item-1"));

    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
    });
  });
});
