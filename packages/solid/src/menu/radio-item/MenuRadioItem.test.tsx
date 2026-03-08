import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Menu } from "..";

describe("Menu.RadioItem", () => {
  test("tracks checked state within Menu.RadioGroup", async () => {
    render(() => (
      <Menu.Root open>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.RadioGroup defaultValue="b">
                <Menu.RadioItem value="a" data-testid="item-a">
                  A
                  <Menu.RadioItemIndicator data-testid="indicator-a" keepMounted />
                </Menu.RadioItem>
                <Menu.RadioItem value="b" data-testid="item-b">
                  B
                  <Menu.RadioItemIndicator data-testid="indicator-b" keepMounted />
                </Menu.RadioItem>
              </Menu.RadioGroup>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    ));

    expect(screen.getByTestId("indicator-a").getAttribute("data-unchecked")).toBe("");
    expect(screen.getByTestId("indicator-b").getAttribute("data-checked")).toBe("");

    fireEvent.click(screen.getByTestId("item-a"));

    await waitFor(() => {
      expect(screen.getByTestId("item-a").getAttribute("aria-checked")).toBe("true");
      expect(screen.getByTestId("indicator-a").getAttribute("data-checked")).toBe("");
      expect(screen.getByTestId("indicator-b").getAttribute("data-unchecked")).toBe("");
    });
  });
});
