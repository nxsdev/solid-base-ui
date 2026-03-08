import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Tabs } from "..";

describe("Tabs.Indicator", () => {
  test("inherits orientation and activation-direction data attributes", () => {
    const rendered = render(() => (
      <Tabs.Root orientation="vertical" defaultValue="tab-1">
        <Tabs.List>
          <Tabs.Tab value="tab-1">Tab 1</Tabs.Tab>
        </Tabs.List>
        <Tabs.Indicator data-testid="indicator" />
      </Tabs.Root>
    ));

    const indicator = rendered.getByTestId("indicator");

    expect(indicator.getAttribute("data-orientation")).toBe("vertical");
    expect(indicator.getAttribute("data-activation-direction")).toBe("none");
  });
});
