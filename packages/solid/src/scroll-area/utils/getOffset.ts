export function getOffset(
  element: Element | null,
  prop: "margin" | "padding",
  axis: "x" | "y",
): number {
  if (element === null) {
    return 0;
  }

  const styles = getComputedStyle(element);
  const propAxis = axis === "x" ? "Inline" : "Block";

  if (axis === "x" && prop === "margin") {
    return parseFloat(styles[`${prop}InlineStart`]) * 2;
  }

  return (
    parseFloat(styles[`${prop}${propAxis}Start`]) + parseFloat(styles[`${prop}${propAxis}End`])
  );
}
