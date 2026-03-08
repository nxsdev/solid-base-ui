import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Tabs } from "..";

describe("Tabs.List", () => {
  test("has role=tablist and vertical aria-orientation", () => {
    const rendered = render(() => (
      <Tabs.Root orientation="vertical">
        <Tabs.List data-testid="list">
          <Tabs.Tab value="tab-1">Tab 1</Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>
    ));

    const list = rendered.getByTestId("list");

    expect(list.getAttribute("role")).toBe("tablist");
    expect(list.getAttribute("aria-orientation")).toBe("vertical");
    expect(list.getAttribute("data-orientation")).toBe("vertical");
  });

  test("activateOnFocus=false requires Enter/Space to activate focused tab", async () => {
    const rendered = render(() => (
      <Tabs.Root defaultValue="tab-1">
        <Tabs.List activateOnFocus={false}>
          <Tabs.Tab value="tab-1">Tab 1</Tabs.Tab>
          <Tabs.Tab value="tab-2">Tab 2</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="tab-1" keepMounted>
          Panel 1
        </Tabs.Panel>
        <Tabs.Panel value="tab-2" keepMounted>
          Panel 2
        </Tabs.Panel>
      </Tabs.Root>
    ));

    const tab1 = rendered.getByRole("tab", { name: "Tab 1" });
    const tab2 = rendered.getByRole("tab", { name: "Tab 2" });

    tab1.focus();
    fireEvent.keyDown(tab1, { key: "ArrowRight" });

    await waitFor(() => {
      expect(document.activeElement).toBe(tab2);
      expect(tab1.getAttribute("aria-selected")).toBe("true");
      expect(tab2.getAttribute("aria-selected")).toBe("false");
    });

    fireEvent.keyDown(tab2, { key: "Enter" });

    await waitFor(() => {
      expect(tab2.getAttribute("aria-selected")).toBe("true");
    });
  });
});
