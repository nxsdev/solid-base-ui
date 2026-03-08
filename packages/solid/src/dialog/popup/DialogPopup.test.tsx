import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Dialog } from "..";

describe("Dialog.Popup", () => {
  test("portal keepMounted keeps popup in the DOM while closed", () => {
    render(() => (
      <Dialog.Root open={false} modal={false}>
        <Dialog.Portal keepMounted>
          <Dialog.Popup>Content</Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    ));

    const popup = screen.queryByRole("dialog", { hidden: true });
    expect(popup).not.toBeNull();
    expect(popup?.hasAttribute("hidden")).toBe(true);
  });

  test("moves focus to the first focusable element by default", async () => {
    render(() => (
      <Dialog.Root modal={false}>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Popup>
            <input data-testid="first-input" />
            <button>Action</button>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      const input = screen.getByTestId("first-input");
      expect(document.activeElement).toBe(input);
    });
  });

  test("does not move focus when initialFocus is false", async () => {
    render(() => (
      <Dialog.Root modal={false}>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Popup initialFocus={false}>
            <input data-testid="first-input" />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(document.activeElement).not.toBe(screen.getByTestId("first-input"));
    });
  });
});
