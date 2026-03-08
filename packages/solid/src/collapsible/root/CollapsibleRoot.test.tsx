import { createSignal } from "solid-js";
import { fireEvent, render, waitFor, within } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { Collapsible } from "..";

const PANEL_CONTENT = "This is panel content";

describe("Collapsible.Root", () => {
  test("sets ARIA attributes between trigger and panel", () => {
    const rendered = render(() => (
      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger data-testid="trigger">Toggle</Collapsible.Trigger>
        <Collapsible.Panel data-testid="panel">{PANEL_CONTENT}</Collapsible.Panel>
      </Collapsible.Root>
    ));
    const scope = within(rendered.container);

    const trigger = scope.getByTestId("trigger");
    const panel = scope.getByTestId("panel");

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    return waitFor(() => {
      expect(trigger.getAttribute("aria-controls")).toBe(panel.getAttribute("id"));
    });
  });

  test("references manual panel id in trigger aria-controls", () => {
    const rendered = render(() => (
      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger data-testid="trigger">Toggle</Collapsible.Trigger>
        <Collapsible.Panel id="custom-panel-id" data-testid="panel">
          {PANEL_CONTENT}
        </Collapsible.Panel>
      </Collapsible.Root>
    ));
    const scope = within(rendered.container);

    const trigger = scope.getByTestId("trigger");
    const panel = scope.getByTestId("panel");
    expect(panel.getAttribute("id")).toBe("custom-panel-id");
    return waitFor(() => {
      expect(trigger.getAttribute("aria-controls")).toBe("custom-panel-id");
    });
  });

  test("disabled status is forwarded to trigger", () => {
    const rendered = render(() => (
      <Collapsible.Root disabled>
        <Collapsible.Trigger data-testid="trigger">Toggle</Collapsible.Trigger>
        <Collapsible.Panel>{PANEL_CONTENT}</Collapsible.Panel>
      </Collapsible.Root>
    ));

    expect(within(rendered.container).getByTestId("trigger").getAttribute("data-disabled")).toBe(
      "",
    );
  });

  test("onOpenChange receives reason and can cancel update", async () => {
    const onOpenChange = vi.fn((_: boolean, details) => {
      details.cancel();
    });

    const rendered = render(() => (
      <Collapsible.Root onOpenChange={onOpenChange}>
        <Collapsible.Trigger data-testid="trigger">Toggle</Collapsible.Trigger>
        <Collapsible.Panel>{PANEL_CONTENT}</Collapsible.Panel>
      </Collapsible.Root>
    ));
    const scope = within(rendered.container);

    fireEvent.click(scope.getByTestId("trigger"));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange.mock.calls[0]?.[0]).toBe(true);
      expect(onOpenChange.mock.calls[0]?.[1]?.reason).toBe("trigger-press");
      expect(scope.queryByText(PANEL_CONTENT)).toBeNull();
    });
  });

  test("controlled mode follows props", async () => {
    const [open, setOpen] = createSignal(false);

    const rendered = render(() => (
      <>
        <Collapsible.Root open={open()}>
          <Collapsible.Trigger data-testid="trigger">Toggle</Collapsible.Trigger>
          <Collapsible.Panel>{PANEL_CONTENT}</Collapsible.Panel>
        </Collapsible.Root>
        <button data-testid="external" onClick={() => setOpen((prev) => !prev)}>
          external
        </button>
      </>
    ));
    const scope = within(rendered.container);

    expect(scope.getByTestId("trigger").getAttribute("aria-expanded")).toBe("false");
    expect(scope.queryByText(PANEL_CONTENT)).toBeNull();

    fireEvent.click(scope.getByTestId("external"));

    await waitFor(() => {
      expect(scope.getByTestId("trigger").getAttribute("aria-expanded")).toBe("true");
      expect(scope.queryByText(PANEL_CONTENT)).not.toBeNull();
    });
  });

  test("uncontrolled mode toggles with trigger", async () => {
    const rendered = render(() => (
      <Collapsible.Root defaultOpen={false}>
        <Collapsible.Trigger data-testid="trigger">Toggle</Collapsible.Trigger>
        <Collapsible.Panel>{PANEL_CONTENT}</Collapsible.Panel>
      </Collapsible.Root>
    ));
    const scope = within(rendered.container);

    expect(scope.getByTestId("trigger").getAttribute("aria-expanded")).toBe("false");
    expect(scope.queryByText(PANEL_CONTENT)).toBeNull();

    const clickTrigger = () => fireEvent.click(scope.getByTestId("trigger"));

    clickTrigger();

    await waitFor(() => {
      expect(scope.getByTestId("trigger").getAttribute("aria-expanded")).toBe("true");
      expect(scope.queryByText(PANEL_CONTENT)).not.toBeNull();
      expect(scope.getByTestId("trigger").getAttribute("data-panel-open")).toBe("");
    });

    clickTrigger();

    await waitFor(() => {
      expect(scope.getByTestId("trigger").getAttribute("aria-expanded")).toBe("false");
      expect(scope.queryByText(PANEL_CONTENT)).toBeNull();
      expect(scope.getByTestId("trigger").getAttribute("data-panel-open")).toBeNull();
    });
  });
});
