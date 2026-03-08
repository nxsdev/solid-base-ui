import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { CheckboxRoot } from "../root/CheckboxRoot";
import { CheckboxIndicator } from "./CheckboxIndicator";

describe("Checkbox.Indicator", () => {
  test("does not render by default", () => {
    const rendered = render(() => (
      <CheckboxRoot aria-label="checkbox">
        <CheckboxIndicator data-testid="indicator" />
      </CheckboxRoot>
    ));

    expect(rendered.queryByTestId("indicator")).toBeNull();
  });

  test("renders when checked", () => {
    const rendered = render(() => (
      <CheckboxRoot aria-label="checkbox" checked>
        <CheckboxIndicator data-testid="indicator" />
      </CheckboxRoot>
    ));

    expect(rendered.getByTestId("indicator")).not.toBeNull();
  });

  test("renders when indeterminate", () => {
    const rendered = render(() => (
      <CheckboxRoot aria-label="checkbox" indeterminate>
        <CheckboxIndicator data-testid="indicator" />
      </CheckboxRoot>
    ));

    const indicator = rendered.getByTestId("indicator");
    expect(indicator.getAttribute("data-indeterminate")).toBe("");
  });

  test("spreads extra props", () => {
    const rendered = render(() => (
      <CheckboxRoot aria-label="checkbox" checked>
        <CheckboxIndicator data-testid="indicator" data-extra-prop="Lorem ipsum" />
      </CheckboxRoot>
    ));

    expect(rendered.getByTestId("indicator").getAttribute("data-extra-prop")).toBe("Lorem ipsum");
  });

  test("keepMounted keeps indicator rendered while unchecked", () => {
    const rendered = render(() => (
      <CheckboxRoot aria-label="checkbox">
        <CheckboxIndicator data-testid="indicator" keepMounted />
      </CheckboxRoot>
    ));

    expect(rendered.getByTestId("indicator")).not.toBeNull();
  });

  test("inherits root state data attributes", () => {
    const rendered = render(() => (
      <CheckboxRoot aria-label="checkbox" defaultChecked disabled readOnly required>
        <CheckboxIndicator data-testid="indicator" />
      </CheckboxRoot>
    ));

    const indicator = rendered.getByTestId("indicator");

    expect(indicator.getAttribute("data-checked")).toBe("");
    expect(indicator.getAttribute("data-disabled")).toBe("");
    expect(indicator.getAttribute("data-readonly")).toBe("");
    expect(indicator.getAttribute("data-required")).toBe("");
    expect(indicator.getAttribute("data-filled")).toBe("");
  });

  test("tracks checked state changes from root", async () => {
    const rendered = render(() => (
      <CheckboxRoot aria-label="checkbox">
        <CheckboxIndicator data-testid="indicator" keepMounted />
      </CheckboxRoot>
    ));

    const checkbox = rendered.getByRole("checkbox", { name: "checkbox" });
    const indicator = rendered.getByTestId("indicator");

    expect(indicator.getAttribute("data-unchecked")).toBe("");
    expect(indicator.getAttribute("data-checked")).toBeNull();

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(indicator.getAttribute("data-checked")).toBe("");
      expect(indicator.getAttribute("data-unchecked")).toBeNull();
    });
  });
});
