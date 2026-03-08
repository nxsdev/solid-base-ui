import { render, waitFor, within } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Accordion } from "..";

describe("Accordion.Item", () => {
  test("renders as a div and receives index data attribute", async () => {
    const rendered = render(() => (
      <Accordion.Root>
        <Accordion.Item data-testid="item">
          <Accordion.Header>
            <Accordion.Trigger>Trigger</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>Panel</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const item = within(rendered.container).getByTestId("item");

    expect(item.tagName).toBe("DIV");

    await waitFor(() => {
      expect(item.getAttribute("data-index")).toBe("0");
    });
  });
});
