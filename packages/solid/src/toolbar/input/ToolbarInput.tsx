import { Dynamic } from "../../internal/Dynamic";
import { createMemo, type JSX, type ValidComponent } from "solid-js";
import { useCompositeItem } from "../../composite/item/useCompositeItem";
import { ARROW_LEFT, ARROW_RIGHT, stopEvent } from "../../composite/composite";
import { combinePropsList, type DomProps } from "../../merge-props/combineProps";
import { useFocusableWhenDisabled } from "../../use-focusable-when-disabled";
import { resolveBoolean } from "../../utils/resolveBoolean";
import type { ToolbarRoot } from "../root/ToolbarRoot";
import { useToolbarGroupContext } from "../group/ToolbarGroupContext";
import { useToolbarRootContext } from "../root/ToolbarRootContext";

/**
 * A native input element that integrates with toolbar keyboard navigation.
 */
export function ToolbarInput(props: ToolbarInput.Props) {
  const rootContext = useToolbarRootContext();
  const groupContext = useToolbarGroupContext(true);

  const focusableWhenDisabled = createMemo(() => resolveBoolean(props.focusableWhenDisabled, true));
  const disabled = createMemo(
    () =>
      rootContext.disabled() ||
      (groupContext?.disabled() ?? false) ||
      resolveBoolean(props.disabled, false),
  );

  const itemMetadata: ToolbarRoot.ItemMetadata = {
    get focusableWhenDisabled() {
      return focusableWhenDisabled();
    },
  };

  const { compositeProps, compositeRef } = useCompositeItem<HTMLInputElement>({
    metadata: itemMetadata,
  });

  const focusableProps = createMemo(
    () =>
      useFocusableWhenDisabled<HTMLInputElement>({
        composite: true,
        disabled: disabled(),
        focusableWhenDisabled: focusableWhenDisabled(),
        isNativeButton: false,
      }).props,
  );

  const focusableDomProps = createMemo<DomProps<HTMLInputElement>>(() => ({
    ...focusableProps(),
  }));

  const defaultProps = createMemo<DomProps<HTMLInputElement>>(() => ({
    onClick(event) {
      if (disabled()) {
        event.preventDefault();
      }
    },
    onPointerDown(event) {
      if (disabled()) {
        event.preventDefault();
      }
    },
    onKeyDown(event) {
      if (disabled() && event.key !== ARROW_LEFT && event.key !== ARROW_RIGHT) {
        stopEvent(event);
      }
    },
  }));

  const component = createMemo<ValidComponent>(() => props.render ?? "input");

  const elementProps = createMemo<Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "ref">>(() => {
    const {
      render: _render,
      children: _children,
      disabled: _disabled,
      focusableWhenDisabled: _focusableWhenDisabled,
      ref: _ref,
      ...rest
    } = props;
    void _render;
    void _children;
    void _disabled;
    void _focusableWhenDisabled;
    void _ref;
    return rest;
  });

  const mergedProps = createMemo(() =>
    combinePropsList<HTMLInputElement>([
      compositeProps(),
      defaultProps(),
      focusableDomProps(),
      elementProps(),
    ]),
  );

  const handleRef: JSX.Ref<HTMLInputElement> = (node) => {
    compositeRef(node);

    if (typeof props.ref === "function") {
      props.ref(node);
    }
  };

  return (
    <Dynamic
      component={component()}
      ref={handleRef}
      data-disabled={disabled() ? "" : undefined}
      data-orientation={rootContext.orientation()}
      data-focusable={focusableWhenDisabled() ? "" : undefined}
      {...mergedProps()}
    >
      {props.children}
    </Dynamic>
  );
}

export interface ToolbarInputState extends ToolbarRoot.State {
  disabled: boolean;
  focusable: boolean;
}

export interface ToolbarInputProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  "data-testid"?: string | undefined;
  disabled?: boolean | undefined;
  focusableWhenDisabled?: boolean | undefined;
  defaultValue?: JSX.InputHTMLAttributes<HTMLInputElement>["value"] | undefined;
  render?: ValidComponent | undefined;
}

export namespace ToolbarInput {
  export type State = ToolbarInputState;
  export type Props = ToolbarInputProps;
}
