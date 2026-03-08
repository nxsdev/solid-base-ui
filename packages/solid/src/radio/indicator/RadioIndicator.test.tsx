import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { RadioGroup } from "../../radio-group";
import { RadioRoot } from "../root/RadioRoot";
import { RadioIndicator } from "./RadioIndicator";

describe("Radio.Indicator", () => {
  test("does not render by default when unchecked", () => {
    const rendered = render(() => (
      <RadioGroup defaultValue="b">
        <RadioRoot value="a">
          <RadioIndicator data-testid="indicator" />
        </RadioRoot>
        <RadioRoot value="b" />
      </RadioGroup>
    ));

    expect(rendered.queryByTestId("indicator")).toBeNull();
  });

  test("renders when checked", () => {
    const rendered = render(() => (
      <RadioGroup defaultValue="a">
        <RadioRoot value="a">
          <RadioIndicator data-testid="indicator" />
        </RadioRoot>
      </RadioGroup>
    ));

    expect(rendered.getByTestId("indicator")).not.toBeNull();
  });

  test("keepMounted keeps indicator rendered", () => {
    const rendered = render(() => (
      <RadioGroup defaultValue="b">
        <RadioRoot value="a">
          <RadioIndicator data-testid="indicator" keepMounted />
        </RadioRoot>
        <RadioRoot value="b" />
      </RadioGroup>
    ));

    expect(rendered.getByTestId("indicator")).not.toBeNull();
  });

  test("inherits root state data attributes", () => {
    const rendered = render(() => (
      <RadioGroup defaultValue="a" disabled readOnly required>
        <RadioRoot value="a">
          <RadioIndicator data-testid="indicator" />
        </RadioRoot>
      </RadioGroup>
    ));

    const indicator = rendered.getByTestId("indicator");
    expect(indicator.getAttribute("data-checked")).toBe("");
    expect(indicator.getAttribute("data-disabled")).toBe("");
    expect(indicator.getAttribute("data-readonly")).toBe("");
    expect(indicator.getAttribute("data-required")).toBe("");
  });

  test("tracks checked state changes from root", async () => {
    const rendered = render(() => (
      <RadioGroup defaultValue="a">
        <RadioRoot value="a" data-testid="a">
          <RadioIndicator data-testid="indicator-a" keepMounted />
        </RadioRoot>
        <RadioRoot value="b" data-testid="b">
          <RadioIndicator data-testid="indicator-b" keepMounted />
        </RadioRoot>
      </RadioGroup>
    ));

    const radioB = rendered.getByTestId("b");
    const indicatorA = rendered.getByTestId("indicator-a");
    const indicatorB = rendered.getByTestId("indicator-b");

    expect(indicatorA.getAttribute("data-checked")).toBe("");
    expect(indicatorB.getAttribute("data-unchecked")).toBe("");

    fireEvent.click(radioB);

    await waitFor(() => {
      expect(indicatorA.getAttribute("data-unchecked")).toBe("");
      expect(indicatorA.getAttribute("data-checked")).toBeNull();
      expect(indicatorB.getAttribute("data-checked")).toBe("");
      expect(indicatorB.getAttribute("data-unchecked")).toBeNull();
    });
  });
});
