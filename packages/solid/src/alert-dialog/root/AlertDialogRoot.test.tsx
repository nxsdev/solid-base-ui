import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { AlertDialog } from "..";

describe("AlertDialog.Root", () => {
  test("renders popup with alertdialog role and ARIA links", async () => {
    render(() => (
      <AlertDialog.Root>
        <AlertDialog.Trigger>Open</AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Popup>
            <AlertDialog.Title>Alert title</AlertDialog.Title>
            <AlertDialog.Description>Alert description</AlertDialog.Description>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      const popup = screen.getByRole("alertdialog");
      const title = screen.getByText("Alert title");
      const description = screen.getByText("Alert description");

      expect(popup.getAttribute("aria-labelledby")).toBe(title.getAttribute("id"));
      expect(popup.getAttribute("aria-describedby")).toBe(description.getAttribute("id"));
    });
  });

  test("outside press does not close the alert dialog", async () => {
    const onOpenChange = vi.fn();

    render(() => (
      <AlertDialog.Root defaultOpen onOpenChange={onOpenChange}>
        <AlertDialog.Portal>
          <AlertDialog.Popup>Content</AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    ));

    fireEvent.click(screen.getByRole("presentation"));

    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).not.toBeNull();
      expect(onOpenChange).toHaveBeenCalledTimes(0);
    });
  });

  test("escape key closes and reports reason", async () => {
    const onOpenChange = vi.fn();

    render(() => (
      <AlertDialog.Root defaultOpen onOpenChange={onOpenChange}>
        <AlertDialog.Portal>
          <AlertDialog.Popup>Content</AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    ));

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).toBeNull();
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange.mock.calls[0]?.[1]?.reason).toBe("escape-key");
    });
  });

  test("supports detached triggers via handle", async () => {
    const handle = AlertDialog.createHandle<number>();

    render(() => (
      <>
        <AlertDialog.Trigger handle={handle} payload={7}>
          Open detached
        </AlertDialog.Trigger>

        <AlertDialog.Root handle={handle}>
          {({ payload }) => (
            <AlertDialog.Portal>
              <AlertDialog.Popup>
                <span data-testid="payload">{String(payload)}</span>
                <AlertDialog.Close>Close</AlertDialog.Close>
              </AlertDialog.Popup>
            </AlertDialog.Portal>
          )}
        </AlertDialog.Root>
      </>
    ));

    await waitFor(() => {
      expect(handle.store).not.toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Open detached" }));

    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).not.toBeNull();
      expect(screen.getByTestId("payload").textContent).toBe("7");
    });

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).toBeNull();
    });
  });
});
