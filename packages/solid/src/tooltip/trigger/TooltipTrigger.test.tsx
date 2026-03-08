import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Tooltip } from "..";

describe("Tooltip.Trigger", () => {
  test("disabled trigger does not open tooltip", async () => {
    render(() => (
      <Tooltip.Root>
        <Tooltip.Trigger disabled delay={0} closeDelay={0}>
          Trigger
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Content</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    ));

    const trigger = screen.getByRole("button", { name: "Trigger" });
    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).toBeNull();
    });

    expect(trigger.getAttribute("disabled")).not.toBeNull();
  });
});
