import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { PreviewCard } from "..";

describe("PreviewCard.Popup", () => {
  test("receives side and align attributes from positioner", async () => {
    render(() => (
      <PreviewCard.Root>
        <PreviewCard.Trigger delay={0} href="#">
          Open
        </PreviewCard.Trigger>
        <PreviewCard.Portal>
          <PreviewCard.Positioner side="top" align="start">
            <PreviewCard.Popup data-testid="popup">Content</PreviewCard.Popup>
          </PreviewCard.Positioner>
        </PreviewCard.Portal>
      </PreviewCard.Root>
    ));

    fireEvent.pointerEnter(screen.getByRole("link", { name: "Open" }), {
      pointerType: "mouse",
    });

    await waitFor(() => {
      const popup = screen.getByTestId("popup");
      expect(popup.getAttribute("data-side")).toBe("top");
      expect(popup.getAttribute("data-align")).toBe("start");
    });
  });
});
