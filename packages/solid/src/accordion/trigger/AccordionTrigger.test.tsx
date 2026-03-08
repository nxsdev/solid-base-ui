import { render, within } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Accordion } from "..";

describe("Accordion.Trigger", () => {
  test("renders as native button by default", () => {
    const rendered = render(() => (
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger">Trigger</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>Panel</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const trigger = within(rendered.container).getByTestId("trigger");

    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("type")).toBe("button");
  });

  test("keeps a non-native trigger tabbable", () => {
    const rendered = render(() => (
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger nativeButton={false} render="span">
              Trigger
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>Panel</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const trigger = within(rendered.container).getByRole("button", { name: "Trigger" });

    expect(trigger.getAttribute("tabindex")).toBe("0");
  });
});
