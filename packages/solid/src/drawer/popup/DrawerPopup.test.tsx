import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { DrawerPreview as Drawer } from "..";

describe("Drawer.Popup", () => {
  test("defaults initial focus to the popup element", async () => {
    render(() => (
      <div>
        <input />
        <Drawer.Root modal={false}>
          <Drawer.Trigger>Open</Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Viewport>
              <Drawer.Popup data-testid="popup">
                <input data-testid="popup-input" />
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId("popup"));
      expect(document.activeElement).not.toBe(screen.getByTestId("popup-input"));
    });
  });
});
