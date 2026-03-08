import { createSignal } from "solid-js";
import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { Dialog } from "..";

describe("Dialog.Root", () => {
  test("opens and closes in uncontrolled mode", async () => {
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

    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).not.toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  test("supports controlled open state", async () => {
    const [open, setOpen] = createSignal(false);

    render(() => (
      <>
        <Dialog.Root open={open()}>
          <Dialog.Trigger>Open</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Popup>Content</Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
        <button data-testid="external" onClick={() => setOpen((prev) => !prev)}>
          external
        </button>
      </>
    ));

    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByTestId("external"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).not.toBeNull();
    });

    fireEvent.click(screen.getByTestId("external"));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  test("passes payload from the active trigger", async () => {
    render(() => (
      <Dialog.Root>
        {({ payload }) => (
          <>
            <Dialog.Trigger payload={1}>One</Dialog.Trigger>
            <Dialog.Trigger payload={2}>Two</Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Popup>
                <span data-testid="payload">{String(payload)}</span>
              </Dialog.Popup>
            </Dialog.Portal>
          </>
        )}
      </Dialog.Root>
    ));

    fireEvent.click(screen.getByRole("button", { name: "One" }));

    await waitFor(() => {
      expect(screen.getByTestId("payload").textContent).toBe("1");
    });

    fireEvent.click(screen.getByRole("button", { name: "Two" }));

    await waitFor(() => {
      expect(screen.getByTestId("payload").textContent).toBe("2");
    });
  });

  test("onOpenChange receives trigger and close reasons", async () => {
    const onOpenChange = vi.fn();

    render(() => (
      <Dialog.Root onOpenChange={onOpenChange}>
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
      expect(onOpenChange).toHaveBeenCalledTimes(1);
    });

    expect(onOpenChange.mock.calls[0]?.[0]).toBe(true);
    expect(onOpenChange.mock.calls[0]?.[1]?.reason).toBe("trigger-press");

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledTimes(2);
    });

    expect(onOpenChange.mock.calls[1]?.[0]).toBe(false);
    expect(onOpenChange.mock.calls[1]?.[1]?.reason).toBe("close-press");
  });

  test("escape key closes the dialog", async () => {
    const onOpenChange = vi.fn();

    render(() => (
      <Dialog.Root defaultOpen onOpenChange={onOpenChange} modal={false}>
        <Dialog.Portal>
          <Dialog.Popup>Content</Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    ));

    expect(screen.getByRole("dialog")).not.toBeNull();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange.mock.calls[0]?.[1]?.reason).toBe("escape-key");
    });
  });

  test("outside click closes the non-modal dialog", async () => {
    render(() => (
      <div>
        <div data-testid="outside">outside</div>
        <Dialog.Root defaultOpen modal={false}>
          <Dialog.Portal>
            <Dialog.Popup>Content</Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    ));

    expect(screen.getByRole("dialog")).not.toBeNull();

    fireEvent.click(screen.getByTestId("outside"));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  test("disablePointerDismissal prevents outside close", async () => {
    render(() => (
      <div>
        <div data-testid="outside">outside</div>
        <Dialog.Root defaultOpen modal={false} disablePointerDismissal>
          <Dialog.Portal>
            <Dialog.Popup>Content</Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    ));

    fireEvent.click(screen.getByTestId("outside"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).not.toBeNull();
    });
  });

  test("links title and description with ARIA attributes", async () => {
    render(() => (
      <Dialog.Root defaultOpen modal={false}>
        <Dialog.Portal>
          <Dialog.Popup>
            <Dialog.Title>Dialog title</Dialog.Title>
            <Dialog.Description>Dialog description</Dialog.Description>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    ));

    const popup = screen.getByRole("dialog");
    const title = screen.getByText("Dialog title");
    const description = screen.getByText("Dialog description");

    await waitFor(() => {
      expect(popup.getAttribute("aria-labelledby")).toBe(title.getAttribute("id"));
      expect(popup.getAttribute("aria-describedby")).toBe(description.getAttribute("id"));
    });
  });
});
