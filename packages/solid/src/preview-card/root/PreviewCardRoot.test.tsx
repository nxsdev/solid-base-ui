import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { PreviewCard } from "..";

describe("PreviewCard.Root", () => {
  test("opens on hover and closes on unhover", async () => {
    render(() => (
      <PreviewCard.Root>
        <PreviewCard.Trigger delay={0} closeDelay={0} href="#">
          Hover me
        </PreviewCard.Trigger>
        <PreviewCard.Portal>
          <PreviewCard.Positioner>
            <PreviewCard.Popup>Content</PreviewCard.Popup>
          </PreviewCard.Positioner>
        </PreviewCard.Portal>
      </PreviewCard.Root>
    ));

    const trigger = screen.getByRole("link", { name: "Hover me" });

    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).not.toBeNull();
    });

    fireEvent.pointerLeave(trigger, { pointerType: "mouse" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  test("passes payload from the active trigger", async () => {
    render(() => (
      <PreviewCard.Root>
        {({ payload }) => (
          <>
            <PreviewCard.Trigger payload={"one"} delay={0} href="#">
              One
            </PreviewCard.Trigger>
            <PreviewCard.Trigger payload={"two"} delay={0} href="#">
              Two
            </PreviewCard.Trigger>
            <PreviewCard.Portal>
              <PreviewCard.Positioner>
                <PreviewCard.Popup>
                  <span data-testid="payload">{String(payload)}</span>
                </PreviewCard.Popup>
              </PreviewCard.Positioner>
            </PreviewCard.Portal>
          </>
        )}
      </PreviewCard.Root>
    ));

    fireEvent.pointerEnter(screen.getByRole("link", { name: "One" }), { pointerType: "mouse" });

    await waitFor(() => {
      expect(screen.getByTestId("payload").textContent).toBe("one");
    });

    fireEvent.pointerEnter(screen.getByRole("link", { name: "Two" }), { pointerType: "mouse" });

    await waitFor(() => {
      expect(screen.getByTestId("payload").textContent).toBe("two");
    });
  });
});
