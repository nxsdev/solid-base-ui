import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Popover } from "..";

describe("Popover.Root", () => {
  test("opens and closes in uncontrolled mode", async () => {
    render(() => (
      <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Popup>
              <Popover.Close>Close</Popover.Close>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
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

  test("is non-modal by default and closes on outside click", async () => {
    render(() => (
      <div>
        <button data-testid="outside">outside</button>
        <Popover.Root defaultOpen>
          <Popover.Portal>
            <Popover.Positioner>
              <Popover.Popup>Content</Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </div>
    ));

    expect(screen.getByRole("dialog")).not.toBeNull();

    fireEvent.click(screen.getByTestId("outside"));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  test("passes payload from the active trigger", async () => {
    render(() => (
      <Popover.Root>
        {({ payload }) => (
          <>
            <Popover.Trigger payload={"one"}>One</Popover.Trigger>
            <Popover.Trigger payload={"two"}>Two</Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner>
                <Popover.Popup>
                  <span data-testid="payload">{String(payload)}</span>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </>
        )}
      </Popover.Root>
    ));

    fireEvent.click(screen.getByRole("button", { name: "One" }));

    await waitFor(() => {
      expect(screen.getByTestId("payload").textContent).toBe("one");
    });

    fireEvent.click(screen.getByRole("button", { name: "Two" }));

    await waitFor(() => {
      expect(screen.getByTestId("payload").textContent).toBe("two");
    });
  });
});
