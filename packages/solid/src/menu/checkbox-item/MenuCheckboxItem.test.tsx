import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Menu } from "..";

describe("Menu.CheckboxItem", () => {
  test("toggles checked state and indicator", async () => {
    render(() => (
      <Menu.Root open>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.CheckboxItem data-testid="item">
                Option
                <Menu.CheckboxItemIndicator data-testid="indicator" keepMounted />
              </Menu.CheckboxItem>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    ));

    expect(screen.getByTestId("indicator").getAttribute("data-unchecked")).toBe("");

    fireEvent.click(screen.getByTestId("item"));

    await waitFor(() => {
      expect(screen.getByTestId("item").getAttribute("aria-checked")).toBe("true");
      expect(screen.getByTestId("indicator").getAttribute("data-checked")).toBe("");
    });
  });
});
