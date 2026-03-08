import { describe, expect, test } from "vitest";
import { createSignal } from "solid-js";
import { render, waitFor } from "@solidjs/testing-library";
import { DirectionProvider } from "./DirectionProvider";
import { useDirection } from "./DirectionContext";

function DirectionConsumer() {
  return <span data-testid="direction">{useDirection()}</span>;
}

describe("DirectionProvider", () => {
  test("falls back to ltr when provider is missing", () => {
    const rendered = render(() => <DirectionConsumer />);
    expect(rendered.getByTestId("direction").textContent).toBe("ltr");
  });

  test("provides direction to consumers", () => {
    const rendered = render(() => (
      <DirectionProvider direction="rtl">
        <DirectionConsumer />
      </DirectionProvider>
    ));

    expect(rendered.getByTestId("direction").textContent).toBe("rtl");
  });

  test("updates when direction prop changes", async () => {
    const [direction, setDirection] = createSignal<"ltr" | "rtl">("ltr");

    const rendered = render(() => (
      <DirectionProvider direction={direction()}>
        <DirectionConsumer />
      </DirectionProvider>
    ));

    expect(rendered.getByTestId("direction").textContent).toBe("ltr");

    setDirection("rtl");
    await waitFor(() => {
      expect(rendered.getByTestId("direction").textContent).toBe("rtl");
    });
  });
});
