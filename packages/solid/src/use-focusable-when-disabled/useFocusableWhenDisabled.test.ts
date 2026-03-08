import { describe, expect, test } from "vitest";
import { useFocusableWhenDisabled } from "./useFocusableWhenDisabled";

describe("useFocusableWhenDisabled", () => {
  test("native disabled button uses disabled attribute by default", () => {
    const result = useFocusableWhenDisabled({
      disabled: true,
      isNativeButton: true,
      tabIndex: 0,
    });

    expect(result.props.disabled).toBe(true);
    expect(result.props["aria-disabled"]).toBeUndefined();
    expect(result.props.tabindex).toBe(0);
  });

  test("native disabled button becomes focusable when configured", () => {
    const result = useFocusableWhenDisabled({
      disabled: true,
      isNativeButton: true,
      focusableWhenDisabled: true,
      tabIndex: 0,
    });

    expect(result.props.disabled).toBeUndefined();
    expect(result.props["aria-disabled"]).toBe("true");
    expect(result.props.tabindex).toBe(0);
  });

  test("non-native disabled button uses aria-disabled and tabindex -1", () => {
    const result = useFocusableWhenDisabled({
      disabled: true,
      isNativeButton: false,
      focusableWhenDisabled: false,
      tabIndex: 0,
    });

    expect(result.props.disabled).toBeUndefined();
    expect(result.props["aria-disabled"]).toBe("true");
    expect(result.props.tabindex).toBe(-1);
  });
});
