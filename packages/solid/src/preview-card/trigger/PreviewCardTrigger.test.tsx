import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { PreviewCard } from "..";

describe("PreviewCard.Trigger", () => {
  test("disabled trigger does not open preview card", async () => {
    render(() => (
      <PreviewCard.Root>
        <PreviewCard.Trigger delay={0} disabled href="#">
          Open
        </PreviewCard.Trigger>
        <PreviewCard.Portal>
          <PreviewCard.Positioner>
            <PreviewCard.Popup>Content</PreviewCard.Popup>
          </PreviewCard.Positioner>
        </PreviewCard.Portal>
      </PreviewCard.Root>
    ));

    const trigger = screen.getByRole("link", { name: "Open" });
    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    expect(trigger.getAttribute("aria-disabled")).toBe("true");
  });
});
