import { fireEvent, render, waitFor, within } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { Collapsible } from "..";

const PANEL_CONTENT = "This is panel content";

describe("Collapsible.Panel", () => {
  test("keepMounted keeps panel mounted while closed", async () => {
    const rendered = render(() => (
      <Collapsible.Root defaultOpen={false}>
        <Collapsible.Trigger data-testid="trigger">Toggle</Collapsible.Trigger>
        <Collapsible.Panel keepMounted data-testid="panel">
          {PANEL_CONTENT}
        </Collapsible.Panel>
      </Collapsible.Root>
    ));
    const scope = within(rendered.container);

    const panel = scope.getByTestId("panel");

    expect(scope.getByTestId("trigger").getAttribute("aria-expanded")).toBe("false");
    expect(panel.getAttribute("hidden")).not.toBeNull();
    expect(panel.getAttribute("data-closed")).toBe("");

    fireEvent.click(scope.getByTestId("trigger"));

    await waitFor(() => {
      expect(scope.getByTestId("trigger").getAttribute("aria-expanded")).toBe("true");
      expect(panel.hasAttribute("hidden")).toBe(false);
      expect(panel.getAttribute("data-open")).toBe("");
    });

    fireEvent.click(scope.getByTestId("trigger"));

    await waitFor(() => {
      expect(scope.getByTestId("trigger").getAttribute("aria-expanded")).toBe("false");
      expect(panel.getAttribute("hidden")).not.toBeNull();
      expect(panel.getAttribute("data-closed")).toBe("");
    });
  });

  test("unmounts when closed and keepMounted=false", async () => {
    const rendered = render(() => (
      <Collapsible.Root defaultOpen={false}>
        <Collapsible.Trigger data-testid="trigger">Toggle</Collapsible.Trigger>
        <Collapsible.Panel data-testid="panel">{PANEL_CONTENT}</Collapsible.Panel>
      </Collapsible.Root>
    ));
    const scope = within(rendered.container);

    expect(scope.queryByTestId("panel")).toBeNull();

    fireEvent.click(scope.getByTestId("trigger"));

    await waitFor(() => {
      expect(scope.getByTestId("panel")).not.toBeNull();
    });

    fireEvent.click(scope.getByTestId("trigger"));

    await waitFor(() => {
      expect(scope.queryByTestId("panel")).toBeNull();
    });
  });

  test("hiddenUntilFound keeps panel mounted and opens on beforematch", async () => {
    const onOpenChange = vi.fn();

    const rendered = render(() => (
      <Collapsible.Root defaultOpen={false} onOpenChange={onOpenChange}>
        <Collapsible.Trigger data-testid="trigger">Toggle</Collapsible.Trigger>
        <Collapsible.Panel hiddenUntilFound keepMounted data-testid="panel">
          {PANEL_CONTENT}
        </Collapsible.Panel>
      </Collapsible.Root>
    ));
    const scope = within(rendered.container);
    const panel = scope.getByTestId("panel");

    expect(panel.getAttribute("hidden")).toBe("until-found");
    expect(scope.getByTestId("trigger").getAttribute("aria-expanded")).toBe("false");

    panel.dispatchEvent(
      new window.Event("beforematch", {
        bubbles: true,
        cancelable: false,
      }),
    );

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange.mock.calls[0]?.[0]).toBe(true);
      expect(onOpenChange.mock.calls[0]?.[1]?.reason).toBe("none");
      expect(panel.hasAttribute("hidden")).toBe(false);
      expect(panel.getAttribute("data-open")).toBe("");
      expect(scope.getByTestId("trigger").getAttribute("aria-expanded")).toBe("true");
    });
  });
});
