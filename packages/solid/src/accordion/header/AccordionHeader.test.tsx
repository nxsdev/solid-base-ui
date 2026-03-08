import { render, within } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Accordion } from "..";

describe("Accordion.Header", () => {
  test("renders as h3", () => {
    const rendered = render(() => (
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Header data-testid="header">Header</Accordion.Header>
          <Accordion.Trigger>Trigger</Accordion.Trigger>
          <Accordion.Panel>Panel</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const header = within(rendered.container).getByTestId("header");

    expect(header.tagName).toBe("H3");
  });
});
