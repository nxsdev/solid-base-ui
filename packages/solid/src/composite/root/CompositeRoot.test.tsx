import { createSignal } from "solid-js";
import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { DirectionProvider } from "../../direction-provider";
import { CompositeItem } from "../item/CompositeItem";
import { CompositeRoot } from "./CompositeRoot";

describe("CompositeRoot", () => {
  test("uncontrolled mode keyboard navigation", async () => {
    const rendered = render(() => (
      <CompositeRoot>
        <CompositeItem data-testid="1">1</CompositeItem>
        <CompositeItem data-testid="2">2</CompositeItem>
        <CompositeItem data-testid="3">3</CompositeItem>
      </CompositeRoot>
    ));

    const item1 = rendered.getByTestId("1");
    const item2 = rendered.getByTestId("2");
    const item3 = rendered.getByTestId("3");

    await waitFor(() => {
      expect(item1.getAttribute("tabindex")).toBe("0");
    });

    item1.focus();
    fireEvent.keyDown(item1, { key: "ArrowDown" });

    await waitFor(() => {
      expect(item2.getAttribute("tabindex")).toBe("0");
      expect(document.activeElement).toBe(item2);
    });

    fireEvent.keyDown(item2, { key: "ArrowDown" });

    await waitFor(() => {
      expect(item3.getAttribute("tabindex")).toBe("0");
      expect(document.activeElement).toBe(item3);
    });

    fireEvent.keyDown(item3, { key: "ArrowUp" });

    await waitFor(() => {
      expect(item2.getAttribute("tabindex")).toBe("0");
      expect(document.activeElement).toBe(item2);
    });
  });

  test("controlled highlightedIndex", async () => {
    const [highlightedIndex, setHighlightedIndex] = createSignal(0);

    const rendered = render(() => (
      <CompositeRoot
        highlightedIndex={highlightedIndex()}
        onHighlightedIndexChange={setHighlightedIndex}
      >
        <CompositeItem data-testid="1">1</CompositeItem>
        <CompositeItem data-testid="2">2</CompositeItem>
        <CompositeItem data-testid="3">3</CompositeItem>
      </CompositeRoot>
    ));

    const item1 = rendered.getByTestId("1");
    const item2 = rendered.getByTestId("2");

    await waitFor(() => {
      expect(item1.getAttribute("tabindex")).toBe("0");
    });

    item1.focus();
    fireEvent.keyDown(item1, { key: "ArrowDown" });

    await waitFor(() => {
      expect(highlightedIndex()).toBe(1);
      expect(item2.getAttribute("tabindex")).toBe("0");
      expect(document.activeElement).toBe(item2);
    });
  });

  test("Home and End key behavior", async () => {
    const rendered = render(() => (
      <CompositeRoot enableHomeAndEndKeys>
        <CompositeItem data-testid="1">1</CompositeItem>
        <CompositeItem data-testid="2">2</CompositeItem>
        <CompositeItem data-testid="3">3</CompositeItem>
      </CompositeRoot>
    ));

    const item1 = rendered.getByTestId("1");
    const item3 = rendered.getByTestId("3");

    await waitFor(() => {
      expect(item1.getAttribute("tabindex")).toBe("0");
    });

    item3.focus();
    await waitFor(() => {
      expect(item3.getAttribute("tabindex")).toBe("0");
      expect(document.activeElement).toBe(item3);
    });

    fireEvent.keyDown(item3, { key: "Home" });

    await waitFor(() => {
      expect(item1.getAttribute("tabindex")).toBe("0");
      expect(document.activeElement).toBe(item1);
    });

    fireEvent.keyDown(item1, { key: "End" });

    await waitFor(() => {
      expect(item3.getAttribute("tabindex")).toBe("0");
      expect(document.activeElement).toBe(item3);
    });
  });

  test("disabledIndices skips disabled item", async () => {
    const rendered = render(() => (
      <CompositeRoot disabledIndices={[1]}>
        <CompositeItem data-testid="1">1</CompositeItem>
        <CompositeItem data-testid="2">2</CompositeItem>
        <CompositeItem data-testid="3">3</CompositeItem>
      </CompositeRoot>
    ));

    const item1 = rendered.getByTestId("1");
    const item3 = rendered.getByTestId("3");

    await waitFor(() => {
      expect(item1.getAttribute("tabindex")).toBe("0");
    });

    item1.focus();
    fireEvent.keyDown(item1, { key: "ArrowDown" });

    await waitFor(() => {
      expect(item3.getAttribute("tabindex")).toBe("0");
      expect(document.activeElement).toBe(item3);
    });
  });

  test("modifierKeys behavior", async () => {
    const rendered = render(() => (
      <CompositeRoot modifierKeys={["Alt", "Meta"]}>
        <CompositeItem data-testid="1">1</CompositeItem>
        <CompositeItem data-testid="2">2</CompositeItem>
        <CompositeItem data-testid="3">3</CompositeItem>
      </CompositeRoot>
    ));

    const item1 = rendered.getByTestId("1");
    const item2 = rendered.getByTestId("2");
    const item3 = rendered.getByTestId("3");

    await waitFor(() => {
      expect(item1.getAttribute("tabindex")).toBe("0");
    });

    item1.focus();

    fireEvent.keyDown(item1, { key: "ArrowDown", shiftKey: true });

    await waitFor(() => {
      expect(document.activeElement).toBe(item1);
    });

    fireEvent.keyDown(item1, { key: "ArrowDown", ctrlKey: true });

    await waitFor(() => {
      expect(document.activeElement).toBe(item1);
    });

    fireEvent.keyDown(item1, { key: "ArrowDown", altKey: true });

    await waitFor(() => {
      expect(document.activeElement).toBe(item2);
    });

    fireEvent.keyDown(item2, { key: "ArrowDown", metaKey: true });

    await waitFor(() => {
      expect(document.activeElement).toBe(item3);
    });
  });

  test("rtl horizontal orientation", async () => {
    const rendered = render(() => (
      <DirectionProvider direction="rtl">
        <CompositeRoot orientation="horizontal">
          <CompositeItem data-testid="1">1</CompositeItem>
          <CompositeItem data-testid="2">2</CompositeItem>
          <CompositeItem data-testid="3">3</CompositeItem>
        </CompositeRoot>
      </DirectionProvider>
    ));

    const item1 = rendered.getByTestId("1");
    const item2 = rendered.getByTestId("2");

    await waitFor(() => {
      expect(item1.getAttribute("tabindex")).toBe("0");
    });

    item1.focus();
    fireEvent.keyDown(item1, { key: "ArrowLeft" });

    await waitFor(() => {
      expect(item2.getAttribute("tabindex")).toBe("0");
      expect(document.activeElement).toBe(item2);
    });
  });
});
