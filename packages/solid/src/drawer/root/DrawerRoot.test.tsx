import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { DrawerPreview as Drawer } from "..";

describe("Drawer.Root", () => {
  test("opens and closes in uncontrolled mode", async () => {
    render(() => (
      <Drawer.Root>
        <Drawer.Trigger>Open</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Close>Close</Drawer.Close>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
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

  test("reports trigger and close reasons", async () => {
    const onOpenChange = vi.fn();

    render(() => (
      <Drawer.Root onOpenChange={onOpenChange}>
        <Drawer.Trigger>Open</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Close>Close</Drawer.Close>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledTimes(1);
    });

    expect(onOpenChange.mock.calls[0]?.[1]?.reason).toBe("trigger-press");

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledTimes(2);
    });

    expect(onOpenChange.mock.calls[1]?.[1]?.reason).toBe("close-press");
  });

  test("outside press closes by default", async () => {
    const onOpenChange = vi.fn();

    render(() => (
      <div>
        <div data-testid="outside">outside</div>
        <Drawer.Root defaultOpen onOpenChange={onOpenChange}>
          <Drawer.Portal>
            <Drawer.Viewport>
              <Drawer.Popup>Content</Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    ));

    fireEvent.click(screen.getByTestId("outside"));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange.mock.calls[0]?.[1]?.reason).toBe("outside-press");
    });
  });

  test("supports detached triggers via handle", async () => {
    const handle = Drawer.createHandle<number>();

    render(() => (
      <>
        <Drawer.Trigger handle={handle} payload={99}>
          Open detached
        </Drawer.Trigger>

        <Drawer.Root handle={handle}>
          {({ payload }) => (
            <Drawer.Portal>
              <Drawer.Viewport>
                <Drawer.Popup>
                  <span data-testid="payload">{String(payload)}</span>
                  <Drawer.Close>Close</Drawer.Close>
                </Drawer.Popup>
              </Drawer.Viewport>
            </Drawer.Portal>
          )}
        </Drawer.Root>
      </>
    ));

    await waitFor(() => {
      expect(handle.store).not.toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Open detached" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).not.toBeNull();
      expect(screen.getByTestId("payload").textContent).toBe("99");
    });
  });
});
