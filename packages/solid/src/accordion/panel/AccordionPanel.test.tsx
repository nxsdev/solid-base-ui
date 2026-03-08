import { fireEvent, render, waitFor, within } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Accordion } from "..";

describe("Accordion.Panel", () => {
  test("respects keepMounted", async () => {
    const rendered = render(() => (
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger">Trigger</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel keepMounted data-testid="panel">
            Panel
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const scope = within(rendered.container);
    const trigger = scope.getByTestId("trigger");
    const panel = scope.getByTestId("panel");

    expect(panel.getAttribute("hidden")).toBe("");

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(panel.getAttribute("hidden")).toBeNull();
      expect(panel.getAttribute("data-open")).toBe("");
    });
  });
});
