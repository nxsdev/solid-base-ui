import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Popover } from "..";

describe("Popover.Trigger", () => {
  test("disabled trigger does not open popover", async () => {
    render(() => (
      <Popover.Root>
        <Popover.Trigger disabled>Open</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Popup>Content</Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    ));

    const trigger = screen.getByRole("button", { name: "Open" });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    expect(trigger.getAttribute("disabled")).not.toBeNull();
  });

  test("supports hover-open and hover-close", async () => {
    render(() => (
      <Popover.Root>
        <Popover.Trigger openOnHover delay={0} closeDelay={0}>
          Hover me
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Popup>Content</Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    ));

    const trigger = screen.getByRole("button", { name: "Hover me" });

    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).not.toBeNull();
    });

    fireEvent.pointerLeave(trigger, { pointerType: "mouse" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
