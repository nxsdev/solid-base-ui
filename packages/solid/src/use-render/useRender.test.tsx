import { render } from "@solidjs/testing-library";
import type { JSX } from "solid-js";
import { describe, expect, test } from "vitest";
import { useRender } from "./useRender";

describe("useRender", () => {
  test("renders fallback tag when render is undefined", () => {
    const view = render(() =>
      useRender<
        HTMLButtonElement,
        JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
          "data-testid"?: string | undefined;
        }
      >({
        defaultTagName: "button",
        props: {
          type: "button",
          "data-testid": "trigger",
        },
        children: "Open",
      }),
    );

    const trigger = view.getByTestId("trigger");
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.textContent).toBe("Open");
  });

  test("renders custom render tag", () => {
    const view = render(() =>
      useRender({
        render: "span",
        defaultTagName: "button",
        props: {
          "data-testid": "trigger",
        },
      }),
    );

    const trigger = view.getByTestId("trigger");
    expect(trigger.tagName).toBe("SPAN");
  });

  test("returns null when disabled", () => {
    const view = render(() =>
      useRender({
        enabled: false,
        defaultTagName: "button",
      }),
    );

    expect(view.container.firstChild).toBeNull();
  });
});
