import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Tabs } from "..";

describe("Tabs.Root", () => {
  test("sets initial selected tab and panel from defaultValue", () => {
    const rendered = render(() => (
      <Tabs.Root defaultValue="tab-2">
        <Tabs.List>
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
    const panels = rendered.getAllByRole("tabpanel", { hidden: true });

    expect(tab1.getAttribute("aria-selected")).toBe("false");
    expect(tab2.getAttribute("aria-selected")).toBe("true");
    expect(panels[0]?.hasAttribute("hidden")).toBe(true);
    expect(panels[1]?.hasAttribute("hidden")).toBe(false);
  });

  test("click switches active tab and panel", async () => {
    const rendered = render(() => (
      <Tabs.Root defaultValue="tab-1">
        <Tabs.List>
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

    fireEvent.click(tab2);

    await waitFor(() => {
      expect(tab1.getAttribute("aria-selected")).toBe("false");
      expect(tab2.getAttribute("aria-selected")).toBe("true");
    });
  });

  test("links tab and panel by aria-controls / aria-labelledby", async () => {
    const rendered = render(() => (
      <Tabs.Root defaultValue="tab-1">
        <Tabs.List>
          <Tabs.Tab value="tab-1">Tab 1</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="tab-1" keepMounted>
          Panel 1
        </Tabs.Panel>
      </Tabs.Root>
    ));

    const tab = rendered.getByRole("tab", { name: "Tab 1" });
    const panel = rendered.getByRole("tabpanel");

    await waitFor(() => {
      expect(tab.getAttribute("aria-controls")).toBe(panel.getAttribute("id"));
      expect(panel.getAttribute("aria-labelledby")).toBe(tab.getAttribute("id"));
    });
  });

  test("uncontrolled mode falls back to first enabled tab", async () => {
    const rendered = render(() => (
      <Tabs.Root>
        <Tabs.List>
          <Tabs.Tab value="tab-1" disabled>
            Tab 1
          </Tabs.Tab>
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

    await waitFor(() => {
      expect(tab1.getAttribute("aria-selected")).toBe("false");
      expect(tab2.getAttribute("aria-selected")).toBe("true");
    });
  });
});
