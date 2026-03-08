import { render, screen, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Tooltip } from "..";

describe("Tooltip.Popup", () => {
  test("renders role=tooltip", async () => {
    render(() => (
      <Tooltip.Root defaultOpen>
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Content</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    ));

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).not.toBeNull();
    });
  });

  test("receives side and align attributes from positioner", async () => {
    render(() => (
      <Tooltip.Root defaultOpen>
        <Tooltip.Portal>
          <Tooltip.Positioner side="bottom" align="end">
            <Tooltip.Popup data-testid="popup">Content</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    ));

    await waitFor(() => {
      const popup = screen.getByTestId("popup");
      expect(popup.getAttribute("data-side")).toBe("bottom");
      expect(popup.getAttribute("data-align")).toBe("end");
    });
  });
});
