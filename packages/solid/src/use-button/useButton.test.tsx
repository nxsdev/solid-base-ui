import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { useButton, type ButtonPropsForUseButton } from "./useButton";

function NonNativeButton(props: ButtonPropsForUseButton<HTMLElement>) {
  const { getButtonProps } = useButton({ native: false });
  return <span {...getButtonProps(props)} />;
}

describe("useButton", () => {
  test("non-native button activates on Enter and Space", () => {
    const handleClick = vi.fn();
    const rendered = render(() => <NonNativeButton onClick={handleClick} />);

    const button = rendered.getByRole("button");
    expect(button.tabIndex).toBe(0);

    fireEvent.keyDown(button, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(button, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyUp(button, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  test("composite non-native button activates Space on keydown only", () => {
    const handleClick = vi.fn();

    function CompositeButton(props: ButtonPropsForUseButton<HTMLElement>) {
      const { getButtonProps } = useButton({
        native: false,
        composite: true,
      });
      return <span {...getButtonProps(props)} />;
    }

    const rendered = render(() => <CompositeButton onClick={handleClick} />);
    const button = rendered.getByRole("button");

    fireEvent.keyDown(button, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyUp(button, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("disabled focusable non-native button keeps focusability and blocks interactions", () => {
    const handleClick = vi.fn();
    const handleMouseDown = vi.fn();
    const handlePointerDown = vi.fn();
    const handleKeyDown = vi.fn();
    const handleKeyUp = vi.fn();

    function DisabledFocusableButton(props: ButtonPropsForUseButton<HTMLElement>) {
      const { getButtonProps } = useButton({
        native: false,
        disabled: true,
        focusableWhenDisabled: true,
      });
      return <span {...getButtonProps(props)} />;
    }

    const rendered = render(() => (
      <DisabledFocusableButton
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      />
    ));

    const button = rendered.getByRole("button");

    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.getAttribute("data-disabled")).toBe("");
    expect(button.tabIndex).toBe(0);

    fireEvent.click(button);
    fireEvent.mouseDown(button);
    fireEvent.pointerDown(button);
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.keyUp(button, { key: " " });

    expect(handleClick).toHaveBeenCalledTimes(0);
    expect(handleMouseDown).toHaveBeenCalledTimes(0);
    expect(handlePointerDown).toHaveBeenCalledTimes(0);
    expect(handleKeyDown).toHaveBeenCalledTimes(0);
    expect(handleKeyUp).toHaveBeenCalledTimes(0);
  });

  test("native button defaults type to button and keeps explicit type", () => {
    function DefaultTypeButton() {
      const { getButtonProps } = useButton<HTMLButtonElement>();
      return <button {...getButtonProps()}>Default</button>;
    }

    function SubmitTypeButton() {
      const { getButtonProps } = useButton<HTMLButtonElement>();
      return <button {...getButtonProps({ type: "submit" })}>Submit</button>;
    }

    const defaultTypeView = render(() => <DefaultTypeButton />);
    expect(defaultTypeView.getByRole("button").getAttribute("type")).toBe("button");

    defaultTypeView.unmount();

    const submitTypeView = render(() => <SubmitTypeButton />);
    expect(submitTypeView.getByRole("button").getAttribute("type")).toBe("submit");
  });
});
