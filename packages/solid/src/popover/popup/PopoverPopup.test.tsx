import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Popover } from "..";

describe("Popover.Popup", () => {
  test("moves focus to first focusable element by default", async () => {
    render(() => (
      <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Popup>
              <input data-testid="first-input" />
              <button>Action</button>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId("first-input"));
    });
  });

  test("receives side and align attributes from positioner", async () => {
    render(() => (
      <Popover.Root defaultOpen>
        <Popover.Portal>
          <Popover.Positioner side="top" align="start">
            <Popover.Popup data-testid="popup">Content</Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    ));

    await waitFor(() => {
      const popup = screen.getByTestId("popup");
      expect(popup.getAttribute("data-side")).toBe("top");
      expect(popup.getAttribute("data-align")).toBe("start");
    });
  });
});
