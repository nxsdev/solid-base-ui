import { fireEvent, render, waitFor, within } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Collapsible } from "..";

describe("Collapsible.Trigger", () => {
  test("renders button and toggles panel", async () => {
    const rendered = render(() => (
      <Collapsible.Root>
        <Collapsible.Trigger data-testid="trigger">Trigger</Collapsible.Trigger>
        <Collapsible.Panel data-testid="panel">Panel</Collapsible.Panel>
      </Collapsible.Root>
    ));
    const scope = within(rendered.container);

    expect(scope.getByTestId("trigger").tagName).toBe("BUTTON");
    expect(scope.queryByTestId("panel")).toBeNull();

    fireEvent.click(scope.getByTestId("trigger"));

    await waitFor(() => {
      expect(scope.getByTestId("trigger").getAttribute("aria-expanded")).toBe("true");
      expect(scope.getByTestId("panel")).not.toBeNull();
    });
  });

  test("nativeButton=false still renders a trigger button", () => {
    const rendered = render(() => (
      <Collapsible.Root>
        <Collapsible.Trigger nativeButton={false} data-testid="trigger">
          Trigger
        </Collapsible.Trigger>
      </Collapsible.Root>
    ));
    const scope = within(rendered.container);

    expect(scope.getByTestId("trigger").tagName).toBe("BUTTON");
  });
});
