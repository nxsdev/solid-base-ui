import { createSignal } from "solid-js";
import { describe, expect, test } from "vitest";
import { render, waitFor } from "@solidjs/testing-library";
import { ScrollArea } from "../scroll-area";
import { useCSPContext } from "./CSPContext";
import { CSPProvider } from "./CSPProvider";

function CSPConsumer() {
  const context = useCSPContext();
  return (
    <span data-testid="csp-values">
      {context.nonce() ?? "none"}|{String(context.disableStyleElements())}
    </span>
  );
}

function queryDisableScrollbarStyle(): HTMLStyleElement | null {
  const styles = Array.from(document.querySelectorAll("style"));
  return (
    styles.find((styleElement) =>
      styleElement.textContent?.includes(".base-ui-disable-scrollbar"),
    ) ?? null
  );
}

describe("CSPProvider", () => {
  test("uses default context values when provider is missing", () => {
    const rendered = render(() => <CSPConsumer />);
    expect(rendered.getByTestId("csp-values").textContent).toBe("none|false");
  });

  test("provides nonce and disableStyleElements", () => {
    const rendered = render(() => (
      <CSPProvider nonce="test-nonce" disableStyleElements>
        <CSPConsumer />
      </CSPProvider>
    ));

    expect(rendered.getByTestId("csp-values").textContent).toBe("test-nonce|true");
  });

  test("updates when provider props change", async () => {
    const [disableStyleElements, setDisableStyleElements] = createSignal(false);
    const [nonce, setNonce] = createSignal<string | undefined>(undefined);

    const rendered = render(() => (
      <CSPProvider nonce={nonce()} disableStyleElements={disableStyleElements()}>
        <CSPConsumer />
      </CSPProvider>
    ));

    expect(rendered.getByTestId("csp-values").textContent).toBe("none|false");

    setDisableStyleElements(true);
    setNonce("next-nonce");
    await waitFor(() => {
      expect(rendered.getByTestId("csp-values").textContent).toBe("next-nonce|true");
    });
  });

  test("does not render inline style tags when disableStyleElements is true", () => {
    render(() => (
      <CSPProvider disableStyleElements>
        <ScrollArea.Root>
          <ScrollArea.Viewport />
        </ScrollArea.Root>
      </CSPProvider>
    ));

    expect(queryDisableScrollbarStyle()).toBeNull();
  });

  test("applies nonce to inline style tags", () => {
    render(() => (
      <CSPProvider nonce="test-nonce">
        <ScrollArea.Root>
          <ScrollArea.Viewport />
        </ScrollArea.Root>
      </CSPProvider>
    ));

    const styleElement = queryDisableScrollbarStyle();
    expect(styleElement).not.toBeNull();
    expect(styleElement?.getAttribute("nonce")).toBe("test-nonce");
  });

  test("renders inline style tags by default", () => {
    render(() => (
      <ScrollArea.Root>
        <ScrollArea.Viewport />
      </ScrollArea.Root>
    ));

    expect(queryDisableScrollbarStyle()).not.toBeNull();
  });
});
