import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Menu } from "..";

describe("Menu.Arrow", () => {
  test("reflects popup state and positioner attrs", () => {
    render(() => (
      <Menu.Root open>
        <Menu.Portal>
          <Menu.Positioner side="right" align="end">
            <Menu.Popup>
              <Menu.Arrow data-testid="arrow" />
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    ));

    const arrow = screen.getByTestId("arrow");

    expect(arrow.getAttribute("data-open")).toBe("");
    expect(arrow.getAttribute("data-side")).toBe("right");
    expect(arrow.getAttribute("data-align")).toBe("end");
  });
});
