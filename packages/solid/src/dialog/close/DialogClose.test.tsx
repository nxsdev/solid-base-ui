import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Dialog } from "..";

describe("Dialog.Close", () => {
  test("closes the dialog", async () => {
    render(() => (
      <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Popup>
            <Dialog.Close>Close</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).not.toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  test("disabled close button does not close", async () => {
    render(() => (
      <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Popup>
            <Dialog.Close disabled>Close</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).not.toBeNull();
    });

    const close = screen.getByRole("button", { name: "Close" });
    expect(close.getAttribute("data-disabled")).toBe("");

    fireEvent.click(close);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).not.toBeNull();
    });
  });
});
