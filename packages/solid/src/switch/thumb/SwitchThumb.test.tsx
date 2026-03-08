import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { SwitchRoot } from "../root/SwitchRoot";
import { SwitchThumb } from "./SwitchThumb";

describe("Switch.Thumb", () => {
  test("inherits root state data attributes", () => {
    const rendered = render(() => (
      <SwitchRoot aria-label="switch" defaultChecked disabled readOnly required>
        <SwitchThumb data-testid="thumb" />
      </SwitchRoot>
    ));

    const thumb = rendered.getByTestId("thumb");

    expect(thumb.getAttribute("data-checked")).toBe("");
    expect(thumb.getAttribute("data-disabled")).toBe("");
    expect(thumb.getAttribute("data-readonly")).toBe("");
    expect(thumb.getAttribute("data-required")).toBe("");
    expect(thumb.getAttribute("data-filled")).toBe("");
  });

  test("tracks checked state changes from root", async () => {
    const rendered = render(() => (
      <SwitchRoot aria-label="switch">
        <SwitchThumb data-testid="thumb" />
      </SwitchRoot>
    ));

    const switchElement = rendered.getByRole("switch", { name: "switch" });
    const thumb = rendered.getByTestId("thumb");

    expect(thumb.getAttribute("data-unchecked")).toBe("");
    expect(thumb.getAttribute("data-checked")).toBeNull();

    fireEvent.click(switchElement);

    await waitFor(() => {
      expect(thumb.getAttribute("data-checked")).toBe("");
      expect(thumb.getAttribute("data-unchecked")).toBeNull();
    });
  });
});
