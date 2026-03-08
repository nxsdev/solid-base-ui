import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { DirectionProvider } from "../../direction-provider";
import { Toolbar } from "..";

describe("Toolbar.Root", () => {
  test("has role=toolbar and default horizontal orientation", () => {
    const rendered = render(() => <Toolbar.Root data-testid="toolbar" />);

    const toolbar = rendered.getByTestId("toolbar");
    expect(toolbar.getAttribute("role")).toBe("toolbar");
    expect(toolbar.getAttribute("aria-orientation")).toBe("horizontal");
    expect(toolbar.getAttribute("data-orientation")).toBe("horizontal");
  });

  test("keyboard navigation moves focus across items", async () => {
    const rendered = render(() => (
      <Toolbar.Root>
        <Toolbar.Button data-testid="button-1">One</Toolbar.Button>
        <Toolbar.Link data-testid="link" href="https://base-ui.com">
          Link
        </Toolbar.Link>
        <Toolbar.Group>
          <Toolbar.Button data-testid="button-2">Two</Toolbar.Button>
        </Toolbar.Group>
        <Toolbar.Input data-testid="input" defaultValue="" />
      </Toolbar.Root>
    ));

    const button1 = rendered.getByTestId("button-1");
    const link = rendered.getByTestId("link");
    const button2 = rendered.getByTestId("button-2");
    const input = rendered.getByTestId("input");

    await waitFor(() => {
      expect(button1.getAttribute("tabindex")).toBe("0");
    });

    button1.focus();
    fireEvent.keyDown(button1, { key: "ArrowRight" });

    await waitFor(() => {
      expect(document.activeElement).toBe(link);
    });

    fireEvent.keyDown(link, { key: "ArrowRight" });

    await waitFor(() => {
      expect(document.activeElement).toBe(button2);
    });

    fireEvent.keyDown(button2, { key: "ArrowRight" });

    await waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
  });

  test("rtl horizontal orientation reverses ArrowLeft and ArrowRight", async () => {
    const rendered = render(() => (
      <DirectionProvider direction="rtl">
        <Toolbar.Root orientation="horizontal">
          <Toolbar.Button data-testid="button-1">One</Toolbar.Button>
          <Toolbar.Button data-testid="button-2">Two</Toolbar.Button>
        </Toolbar.Root>
      </DirectionProvider>
    ));

    const button1 = rendered.getByTestId("button-1");
    const button2 = rendered.getByTestId("button-2");

    await waitFor(() => {
      expect(button1.getAttribute("tabindex")).toBe("0");
    });

    button1.focus();
    fireEvent.keyDown(button1, { key: "ArrowLeft" });

    await waitFor(() => {
      expect(document.activeElement).toBe(button2);
    });
  });

  test("disabled toolbar disables buttons and inputs but not links", () => {
    const rendered = render(() => (
      <Toolbar.Root disabled>
        <Toolbar.Button data-testid="button">Button</Toolbar.Button>
        <Toolbar.Link data-testid="link" href="https://base-ui.com">
          Link
        </Toolbar.Link>
        <Toolbar.Input data-testid="input" defaultValue="" />
        <Toolbar.Group data-testid="group">
          <Toolbar.Button data-testid="group-button">Group Button</Toolbar.Button>
        </Toolbar.Group>
      </Toolbar.Root>
    ));

    const button = rendered.getByTestId("button");
    const input = rendered.getByTestId("input");
    const groupButton = rendered.getByTestId("group-button");
    const group = rendered.getByTestId("group");
    const link = rendered.getByTestId("link");

    expect(button.getAttribute("data-disabled")).toBe("");
    expect(button.getAttribute("aria-disabled")).toBe("true");

    expect(input.getAttribute("data-disabled")).toBe("");
    expect(input.getAttribute("aria-disabled")).toBe("true");

    expect(groupButton.getAttribute("data-disabled")).toBe("");
    expect(groupButton.getAttribute("aria-disabled")).toBe("true");
    expect(group.getAttribute("data-disabled")).toBe("");

    expect(link.hasAttribute("data-disabled")).toBe(false);
    expect(link.hasAttribute("aria-disabled")).toBe(false);
  });

  test("focusableWhenDisabled=false items are skipped in roving focus", async () => {
    const rendered = render(() => (
      <Toolbar.Root>
        <Toolbar.Button data-testid="button-1" disabled>
          One
        </Toolbar.Button>
        <Toolbar.Button data-testid="button-2" disabled focusableWhenDisabled={false}>
          Two
        </Toolbar.Button>
        <Toolbar.Input data-testid="input" disabled defaultValue="" />
      </Toolbar.Root>
    ));

    const button1 = rendered.getByTestId("button-1");
    const button2 = rendered.getByTestId("button-2");
    const input = rendered.getByTestId("input");

    await waitFor(() => {
      expect(button1.getAttribute("tabindex")).toBe("0");
    });

    expect(button2.hasAttribute("disabled")).toBe(true);

    button1.focus();
    fireEvent.keyDown(button1, { key: "ArrowRight" });

    await waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
  });
});
