import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Menu } from "..";

describe("Menu.Backdrop", () => {
  test("sets pointer-events none when opened by hover", async () => {
    render(() => (
      <Menu.Root>
        <Menu.Trigger delay={0} openOnHover>
          Open
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Backdrop data-testid="backdrop" />
          <Menu.Positioner>
            <Menu.Popup />
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    ));

    fireEvent.pointerEnter(screen.getByRole("button", { name: "Open" }), {
      pointerType: "mouse",
    });

    await waitFor(() => {
      expect(screen.getByTestId("backdrop").style.pointerEvents).toBe("none");
    });
  });

  test("does not set pointer-events none when opened by click", async () => {
    render(() => (
      <Menu.Root>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Portal>
          <Menu.Backdrop data-testid="backdrop" />
          <Menu.Positioner>
            <Menu.Popup />
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByTestId("backdrop").style.pointerEvents).not.toBe("none");
    });
  });
});
