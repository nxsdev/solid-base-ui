import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { combineProps, combinePropsList } from "./combineProps";

describe("combineProps", () => {
  test("merges class and style", () => {
    const merged = combineProps<HTMLElement>(
      {
        class: "base",
        style: { color: "red" },
      },
      {
        class: "external",
        style: { background: "black" },
      },
    );

    expect(merged.class).toBe("external base");

    const style = merged.style;
    expect(style).toEqual(
      expect.objectContaining({
        color: "red",
        background: "black",
      }),
    );
  });

  test("chains event handlers in external then internal order", () => {
    const calls: string[] = [];
    const internal = vi.fn(() => calls.push("internal"));
    const external = vi.fn(() => calls.push("external"));

    const props = combineProps<HTMLButtonElement>({ onClick: internal }, { onClick: external });

    const rendered = render(() => <button {...props}>Run</button>);
    fireEvent.click(rendered.getByRole("button", { name: "Run" }));

    expect(calls).toEqual(["external", "internal"]);
  });

  test("combines multiple prop objects", () => {
    const merged = combinePropsList<HTMLElement>([
      { role: "button", tabindex: 0 },
      { tabindex: 1 },
      { "data-testid": "trigger" },
    ]);

    expect(merged.role).toBe("button");
    expect(merged.tabindex).toBe(1);
    expect(merged["data-testid"]).toBe("trigger");
  });
});
