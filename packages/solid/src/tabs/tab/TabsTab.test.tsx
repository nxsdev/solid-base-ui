import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Tabs } from "..";

describe("Tabs.Tab", () => {
  test("disabled tab does not activate on click", async () => {
    const rendered = render(() => (
      <Tabs.Root defaultValue="tab-1">
        <Tabs.List>
          <Tabs.Tab value="tab-1">Tab 1</Tabs.Tab>
          <Tabs.Tab value="tab-2" disabled>
            Tab 2
          </Tabs.Tab>
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
      expect(tab1.getAttribute("aria-selected")).toBe("true");
      expect(tab2.getAttribute("aria-selected")).toBe("false");
      expect(tab2.getAttribute("data-disabled")).toBe("");
    });
  });
});
