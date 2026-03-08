import { fireEvent, render, screen } from "@solidjs/testing-library";
import { beforeAll, describe, expect, test } from "vitest";
import { DrawerPreview as Drawer } from "..";

describe("Drawer.Viewport", () => {
  beforeAll(() => {
    if (typeof window.PointerEvent !== "function") {
      // jsdom fallback
      Object.defineProperty(window, "PointerEvent", {
        configurable: true,
        writable: true,
        value: window.MouseEvent,
      });
    }
  });

  test("clears text selection on pointer swipe start", () => {
    render(() => (
      <Drawer.Root open>
        <Drawer.Portal>
          <Drawer.Viewport data-testid="viewport">
            <Drawer.Popup>
              <Drawer.Content>
                <span data-testid="text">Selectable</span>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    ));

    const text = screen.getByTestId("text");
    const selection = window.getSelection();
    expect(selection).not.toBeNull();

    if (selection === null || text.firstChild === null) {
      return;
    }

    const range = document.createRange();
    range.setStart(text.firstChild, 0);
    range.setEnd(text.firstChild, 5);
    selection.removeAllRanges();
    selection.addRange(range);
    expect(selection.isCollapsed).toBe(false);

    fireEvent.pointerDown(screen.getByTestId("viewport"), {
      button: 0,
      buttons: 1,
      pointerId: 1,
      pointerType: "mouse",
    });

    expect(selection.rangeCount).toBe(0);
  });

  test("does not clear text selection on touch swipe start", () => {
    render(() => (
      <Drawer.Root open>
        <Drawer.Portal>
          <Drawer.Viewport data-testid="viewport">
            <Drawer.Popup>
              <Drawer.Content>
                <span data-testid="text">Selectable</span>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    ));

    const text = screen.getByTestId("text");
    const selection = window.getSelection();
    expect(selection).not.toBeNull();

    if (selection === null || text.firstChild === null) {
      return;
    }

    const range = document.createRange();
    range.setStart(text.firstChild, 0);
    range.setEnd(text.firstChild, 5);
    selection.removeAllRanges();
    selection.addRange(range);
    expect(selection.isCollapsed).toBe(false);

    fireEvent.pointerDown(screen.getByTestId("viewport"), {
      button: 0,
      buttons: 1,
      pointerId: 1,
      pointerType: "touch",
    });

    expect(selection.rangeCount).toBe(1);
  });
});
