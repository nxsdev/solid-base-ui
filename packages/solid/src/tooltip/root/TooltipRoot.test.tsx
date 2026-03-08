import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Tooltip } from "..";

describe("Tooltip.Root", () => {
  test("opens on hover and closes on unhover", async () => {
    render(() => (
      <Tooltip.Root>
        <Tooltip.Trigger delay={0} closeDelay={0}>
          Hover me
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Content</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    ));

    const trigger = screen.getByRole("button", { name: "Hover me" });

    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).not.toBeNull();
    });

    fireEvent.pointerLeave(trigger, { pointerType: "mouse" });

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).toBeNull();
    });
  });

  test("opens on focus and closes on blur", async () => {
    render(() => (
      <Tooltip.Root>
        <Tooltip.Trigger delay={0} closeDelay={0}>
          Focus me
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Content</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    ));

    const trigger = screen.getByRole("button", { name: "Focus me" });

    fireEvent.focus(trigger);

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).not.toBeNull();
    });

    fireEvent.blur(trigger);

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).toBeNull();
    });
  });
});
