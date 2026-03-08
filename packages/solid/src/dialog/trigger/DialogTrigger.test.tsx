import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Dialog } from "..";

describe("Dialog.Trigger", () => {
  test("throws outside Dialog.Root when handle is missing", () => {
    expect(() => {
      render(() => <Dialog.Trigger>Open</Dialog.Trigger>);
    }).toThrowError(
      "Base UI: <Dialog.Trigger> must be used within <Dialog.Root> or provided with a handle.",
    );
  });

  test("supports detached triggers via handle", async () => {
    const handle = Dialog.createHandle<number>();

    render(() => (
      <>
        <Dialog.Trigger handle={handle} payload={42}>
          Open detached
        </Dialog.Trigger>

        <Dialog.Root handle={handle}>
          {({ payload }) => (
            <Dialog.Portal>
              <Dialog.Popup>
                <span data-testid="payload">{String(payload)}</span>
                <Dialog.Close>Close</Dialog.Close>
              </Dialog.Popup>
            </Dialog.Portal>
          )}
        </Dialog.Root>
      </>
    ));

    await waitFor(() => {
      expect(handle.store).not.toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Open detached" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).not.toBeNull();
      expect(screen.getByTestId("payload").textContent).toBe("42");
    });

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  test("marks only the active trigger as expanded", async () => {
    render(() => (
      <Dialog.Root>
        <Dialog.Trigger>First</Dialog.Trigger>
        <Dialog.Trigger>Second</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Popup>Content</Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    ));

    const first = screen.getByRole("button", { name: "First" });
    const second = screen.getByRole("button", { name: "Second" });

    expect(first.getAttribute("aria-expanded")).toBe("false");
    expect(second.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(first);

    await waitFor(() => {
      expect(first.getAttribute("aria-expanded")).toBe("true");
      expect(first.getAttribute("data-popup-open")).toBe("");
      expect(second.getAttribute("aria-expanded")).toBe("false");
    });
  });
});
