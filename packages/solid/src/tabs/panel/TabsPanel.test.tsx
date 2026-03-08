import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Tabs } from "..";

describe("Tabs.Panel", () => {
  test("unmounts inactive panel when keepMounted=false", async () => {
    const rendered = render(() => (
      <Tabs.Root defaultValue="tab-1">
        <Tabs.List>
          <Tabs.Tab value="tab-1">Tab 1</Tabs.Tab>
          <Tabs.Tab value="tab-2">Tab 2</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="tab-1">Panel 1</Tabs.Panel>
        <Tabs.Panel value="tab-2">Panel 2</Tabs.Panel>
      </Tabs.Root>
    ));

    expect(rendered.getByText("Panel 1")).toBeTruthy();
    expect(rendered.queryByText("Panel 2")).toBeNull();

    fireEvent.click(rendered.getByRole("tab", { name: "Tab 2" }));

    await waitFor(() => {
      expect(rendered.queryByText("Panel 1")).toBeNull();
      expect(rendered.getByText("Panel 2")).toBeTruthy();
    });
  });

  test("keeps panel mounted and hidden when keepMounted=true", async () => {
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

    const panels = rendered.getAllByRole("tabpanel", { hidden: true });

    expect(panels[0]?.hasAttribute("hidden")).toBe(false);
    expect(panels[1]?.hasAttribute("hidden")).toBe(true);

    fireEvent.click(rendered.getByRole("tab", { name: "Tab 2" }));

    await waitFor(() => {
      const nextPanels = rendered.getAllByRole("tabpanel", { hidden: true });
      expect(nextPanels[0]?.hasAttribute("hidden")).toBe(true);
      expect(nextPanels[1]?.hasAttribute("hidden")).toBe(false);
    });
  });
});
