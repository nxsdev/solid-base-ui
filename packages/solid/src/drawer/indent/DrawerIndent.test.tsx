import { createSignal } from "solid-js";
import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { DrawerPreview as Drawer } from "..";

describe("Drawer.Indent", () => {
  test("sets data-active when a drawer is open", async () => {
    render(() => {
      const [open, setOpen] = createSignal(false);

      return (
        <>
          <Drawer.Provider>
            <Drawer.IndentBackground data-testid="bg" />
            <Drawer.Indent data-testid="indent">
              <Drawer.Root open={open()}>
                <Drawer.Trigger>Open</Drawer.Trigger>
              </Drawer.Root>
            </Drawer.Indent>
          </Drawer.Provider>
          <button data-testid="toggle" onClick={() => setOpen((prev) => !prev)}>
            toggle
          </button>
        </>
      );
    });

    expect(screen.getByTestId("indent").getAttribute("data-inactive")).toBe("");
    expect(screen.getByTestId("indent").getAttribute("data-active")).toBeNull();

    fireEvent.click(screen.getByTestId("toggle"));

    await waitFor(() => {
      expect(screen.getByTestId("indent").getAttribute("data-active")).toBe("");
      expect(screen.getByTestId("indent").getAttribute("data-inactive")).toBeNull();
      expect(screen.getByTestId("bg").getAttribute("data-active")).toBe("");
    });
  });
});
