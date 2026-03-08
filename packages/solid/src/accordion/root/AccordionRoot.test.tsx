import { createSignal } from "solid-js";
import { fireEvent, render, waitFor, within } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { DirectionProvider } from "../../direction-provider";
import { Accordion } from "..";

const PANEL_CONTENT_1 = "Panel contents 1";
const PANEL_CONTENT_2 = "Panel contents 2";

describe("Accordion.Root", () => {
  test("sets ARIA attributes between trigger and panel", async () => {
    const rendered = render(() => (
      <Accordion.Root defaultValue={[0]}>
        <Accordion.Item value={0}>
          <Accordion.Header>
            <Accordion.Trigger>Trigger 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>{PANEL_CONTENT_1}</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const scope = within(rendered.container);
    const root = rendered.container.firstElementChild;
    const trigger = scope.getByRole("button", { name: "Trigger 1" });
    const panel = scope.getByText(PANEL_CONTENT_1);

    expect(root?.getAttribute("role")).toBe("region");
    expect(panel.getAttribute("id")).toBe(trigger.getAttribute("aria-controls"));
    expect(panel.getAttribute("role")).toBe("region");
    expect(trigger.getAttribute("id")).toBe(panel.getAttribute("aria-labelledby"));
  });

  test("references manual panel id in trigger aria-controls", async () => {
    const rendered = render(() => (
      <Accordion.Root defaultValue={[0]}>
        <Accordion.Item value={0}>
          <Accordion.Header>
            <Accordion.Trigger>Trigger 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel id="custom-panel-id">{PANEL_CONTENT_1}</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const scope = within(rendered.container);
    const trigger = scope.getByRole("button", { name: "Trigger 1" });
    const panel = scope.getByText(PANEL_CONTENT_1);

    await waitFor(() => {
      expect(trigger.getAttribute("aria-controls")).toBe("custom-panel-id");
      expect(panel.getAttribute("id")).toBe("custom-panel-id");
    });
  });

  test("uncontrolled mode toggles open state", async () => {
    const rendered = render(() => (
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger">Trigger 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>{PANEL_CONTENT_1}</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const scope = within(rendered.container);
    const trigger = scope.getByTestId("trigger");

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(scope.queryByText(PANEL_CONTENT_1)).toBeNull();

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(trigger.getAttribute("data-panel-open")).toBe("");
      expect(scope.queryByText(PANEL_CONTENT_1)).not.toBeNull();
    });

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      expect(scope.queryByText(PANEL_CONTENT_1)).toBeNull();
    });
  });

  test("controlled mode follows value prop", async () => {
    const [value, setValue] = createSignal<unknown[]>([]);

    const rendered = render(() => (
      <>
        <Accordion.Root value={value()}>
          <Accordion.Item value={0}>
            <Accordion.Header>
              <Accordion.Trigger data-testid="trigger">Trigger 1</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>{PANEL_CONTENT_1}</Accordion.Panel>
          </Accordion.Item>
        </Accordion.Root>
        <button data-testid="external-open" onClick={() => setValue([0])}>
          open
        </button>
        <button data-testid="external-close" onClick={() => setValue([])}>
          close
        </button>
      </>
    ));

    const scope = within(rendered.container);
    const trigger = scope.getByTestId("trigger");

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(scope.queryByText(PANEL_CONTENT_1)).toBeNull();

    fireEvent.click(scope.getByTestId("external-open"));

    await waitFor(() => {
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(scope.queryByText(PANEL_CONTENT_1)).not.toBeNull();
    });

    fireEvent.click(scope.getByTestId("external-close"));

    await waitFor(() => {
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      expect(scope.queryByText(PANEL_CONTENT_1)).toBeNull();
    });
  });

  test("defaultValue opens matching custom value", () => {
    const rendered = render(() => (
      <Accordion.Root defaultValue={["first"]}>
        <Accordion.Item value="first">
          <Accordion.Header>
            <Accordion.Trigger>Trigger 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>{PANEL_CONTENT_1}</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="second">
          <Accordion.Header>
            <Accordion.Trigger>Trigger 2</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>{PANEL_CONTENT_2}</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const scope = within(rendered.container);

    expect(scope.queryByText(PANEL_CONTENT_1)).not.toBeNull();
    expect(scope.queryByText(PANEL_CONTENT_2)).toBeNull();
  });

  test("disabled root propagates disabled data attributes", () => {
    const rendered = render(() => (
      <Accordion.Root defaultValue={[0]} disabled>
        <Accordion.Item data-testid="item1" value={0}>
          <Accordion.Header>
            <Accordion.Trigger>Trigger 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>{PANEL_CONTENT_1}</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item data-testid="item2" value={1}>
          <Accordion.Header>
            <Accordion.Trigger>Trigger 2</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>{PANEL_CONTENT_2}</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const scope = within(rendered.container);
    const item1 = scope.getByTestId("item1");
    const item2 = scope.getByTestId("item2");
    const panel1 = scope.getByText(PANEL_CONTENT_1);
    const headings = scope.getAllByRole("heading");
    const triggers = scope.getAllByRole("button");

    [...headings, ...triggers, item1, item2, panel1].forEach((element) => {
      expect(element.getAttribute("data-disabled")).toBe("");
    });
  });

  test("non-native trigger toggles with Enter and Space", async () => {
    const rendered = render(() => (
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger nativeButton={false} render="span" data-testid="trigger">
              Trigger 1
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>{PANEL_CONTENT_1}</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const scope = within(rendered.container);
    const trigger = scope.getByTestId("trigger");

    trigger.focus();
    fireEvent.keyDown(trigger, { key: "Enter" });

    await waitFor(() => {
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(scope.queryByText(PANEL_CONTENT_1)).not.toBeNull();
    });

    fireEvent.keyDown(trigger, { key: " " });

    await waitFor(() => {
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      expect(scope.queryByText(PANEL_CONTENT_1)).toBeNull();
    });
  });

  test("ArrowUp and ArrowDown move focus between enabled triggers", async () => {
    const rendered = render(() => (
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger1">Trigger 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>1</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item disabled>
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger2">Trigger 2</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>2</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger3">Trigger 3</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>3</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const scope = within(rendered.container);
    const trigger1 = scope.getByTestId("trigger1");
    const trigger3 = scope.getByTestId("trigger3");

    trigger1.focus();
    fireEvent.keyDown(trigger1, { key: "ArrowDown" });

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger3);
    });

    fireEvent.keyDown(trigger3, { key: "ArrowUp" });

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger1);
    });
  });

  test("Home and End keys move focus to first and last trigger", async () => {
    const rendered = render(() => (
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger1">Trigger 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>1</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger2">Trigger 2</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>2</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger3">Trigger 3</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>3</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const scope = within(rendered.container);
    const trigger1 = scope.getByTestId("trigger1");
    const trigger3 = scope.getByTestId("trigger3");

    trigger1.focus();
    fireEvent.keyDown(trigger1, { key: "End" });

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger3);
    });

    fireEvent.keyDown(trigger3, { key: "Home" });

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger1);
    });
  });

  test("loopFocus=false stops on the last trigger", async () => {
    const rendered = render(() => (
      <Accordion.Root loopFocus={false}>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger1">Trigger 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>1</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger2">Trigger 2</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>2</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const scope = within(rendered.container);
    const trigger1 = scope.getByTestId("trigger1");
    const trigger2 = scope.getByTestId("trigger2");

    trigger1.focus();
    fireEvent.keyDown(trigger1, { key: "ArrowDown" });

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger2);
    });

    fireEvent.keyDown(trigger2, { key: "ArrowDown" });

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger2);
    });
  });

  test("multiple=true allows multiple open items", async () => {
    const rendered = render(() => (
      <Accordion.Root multiple>
        <Accordion.Item value="one">
          <Accordion.Header>
            <Accordion.Trigger>Trigger 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>{PANEL_CONTENT_1}</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="two">
          <Accordion.Header>
            <Accordion.Trigger>Trigger 2</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>{PANEL_CONTENT_2}</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const scope = within(rendered.container);
    const trigger1 = scope.getByRole("button", { name: "Trigger 1" });
    const trigger2 = scope.getByRole("button", { name: "Trigger 2" });

    fireEvent.click(trigger1);
    fireEvent.click(trigger2);

    await waitFor(() => {
      expect(scope.queryByText(PANEL_CONTENT_1)).not.toBeNull();
      expect(scope.queryByText(PANEL_CONTENT_2)).not.toBeNull();
      expect(trigger1.getAttribute("data-panel-open")).toBe("");
      expect(trigger2.getAttribute("data-panel-open")).toBe("");
    });
  });

  test("multiple=false keeps only one item open", async () => {
    const rendered = render(() => (
      <Accordion.Root multiple={false}>
        <Accordion.Item value="one">
          <Accordion.Header>
            <Accordion.Trigger>Trigger 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>{PANEL_CONTENT_1}</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="two">
          <Accordion.Header>
            <Accordion.Trigger>Trigger 2</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>{PANEL_CONTENT_2}</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const scope = within(rendered.container);
    const trigger1 = scope.getByRole("button", { name: "Trigger 1" });
    const trigger2 = scope.getByRole("button", { name: "Trigger 2" });

    fireEvent.click(trigger1);

    await waitFor(() => {
      expect(scope.queryByText(PANEL_CONTENT_1)).not.toBeNull();
      expect(scope.queryByText(PANEL_CONTENT_2)).toBeNull();
    });

    fireEvent.click(trigger2);

    await waitFor(() => {
      expect(scope.queryByText(PANEL_CONTENT_1)).toBeNull();
      expect(scope.queryByText(PANEL_CONTENT_2)).not.toBeNull();
    });
  });

  test("horizontal orientation uses ArrowLeft and ArrowRight", async () => {
    const rendered = render(() => (
      <Accordion.Root orientation="horizontal">
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger1">Trigger 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>1</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger2">Trigger 2</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>2</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const scope = within(rendered.container);
    const trigger1 = scope.getByTestId("trigger1");
    const trigger2 = scope.getByTestId("trigger2");

    trigger1.focus();
    fireEvent.keyDown(trigger1, { key: "ArrowRight" });

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger2);
    });

    fireEvent.keyDown(trigger2, { key: "ArrowLeft" });

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger1);
    });
  });

  test("RTL horizontal orientation reverses ArrowLeft and ArrowRight", async () => {
    const rendered = render(() => (
      <DirectionProvider direction="rtl">
        <Accordion.Root orientation="horizontal">
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Trigger data-testid="trigger1">Trigger 1</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>1</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>
              <Accordion.Trigger data-testid="trigger2">Trigger 2</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>2</Accordion.Panel>
          </Accordion.Item>
        </Accordion.Root>
      </DirectionProvider>
    ));

    const scope = within(rendered.container);
    const trigger1 = scope.getByTestId("trigger1");
    const trigger2 = scope.getByTestId("trigger2");

    trigger1.focus();
    fireEvent.keyDown(trigger1, { key: "ArrowLeft" });

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger2);
    });

    fireEvent.keyDown(trigger2, { key: "ArrowRight" });

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger1);
    });
  });

  test("onValueChange receives next value and reason", async () => {
    const onValueChange = vi.fn();

    const rendered = render(() => (
      <Accordion.Root onValueChange={onValueChange} multiple>
        <Accordion.Item value="one">
          <Accordion.Header>
            <Accordion.Trigger>Trigger 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>1</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="two">
          <Accordion.Header>
            <Accordion.Trigger>Trigger 2</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>2</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const scope = within(rendered.container);
    const trigger1 = scope.getByRole("button", { name: "Trigger 1" });
    const trigger2 = scope.getByRole("button", { name: "Trigger 2" });

    fireEvent.click(trigger1);
    fireEvent.click(trigger2);

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledTimes(2);
      expect(onValueChange.mock.calls[0]?.[0]).toEqual(["one"]);
      expect(onValueChange.mock.calls[0]?.[1]?.reason).toBe("trigger-press");
      expect(onValueChange.mock.calls[1]?.[0]).toEqual(["one", "two"]);
    });
  });

  test("onValueChange can cancel updates", async () => {
    const onValueChange = vi.fn((_: unknown[], details) => {
      details.cancel();
    });

    const rendered = render(() => (
      <Accordion.Root onValueChange={onValueChange}>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger">Trigger 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>{PANEL_CONTENT_1}</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const scope = within(rendered.container);
    const trigger = scope.getByTestId("trigger");

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(scope.queryByText(PANEL_CONTENT_1)).toBeNull();
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
    });
  });
});
