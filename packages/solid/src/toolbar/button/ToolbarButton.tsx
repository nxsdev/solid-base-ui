import { Dynamic } from "../../internal/Dynamic";
import { createMemo, merge, omit, type JSX, type ValidComponent } from "solid-js";
import { useCompositeItem } from "../../composite/item/useCompositeItem";
import { combinePropsList } from "../../merge-props/combineProps";
import { useButton } from "../../use-button";
import type { ButtonPropsForUseButton } from "../../use-button";
import { resolveBoolean } from "../../utils/resolveBoolean";
import type { ToolbarRoot } from "../root/ToolbarRoot";
import { useToolbarGroupContext } from "../group/ToolbarGroupContext";
import { useToolbarRootContext } from "../root/ToolbarRootContext";

/**
 * A button that integrates with toolbar keyboard navigation.
 */
export function ToolbarButton(props: ToolbarButton.Props) {
  const rootContext = useToolbarRootContext();
  const groupContext = useToolbarGroupContext(true);

  const focusableWhenDisabled = createMemo(() => resolveBoolean(props.focusableWhenDisabled, true));
  const disabled = createMemo(
    () =>
      rootContext.disabled() ||
      (groupContext?.disabled() ?? false) ||
      resolveBoolean(props.disabled, false),
  );
  const nativeButton = createMemo(() => resolveBoolean(props.nativeButton, true));

  const itemMetadata: ToolbarRoot.ItemMetadata = {
    get focusableWhenDisabled() {
      return focusableWhenDisabled();
    },
  };

  const { compositeProps, compositeRef } = useCompositeItem<HTMLElement>({
    metadata: itemMetadata,
  });

  const { getButtonProps, buttonRef } = useButton<HTMLElement>({
    disabled,
    focusableWhenDisabled,
    native: nativeButton,
    composite: true,
  });

  const component = createMemo<ValidComponent>(() => {
    if (props.render !== undefined) {
      return props.render;
    }

    return nativeButton() ? "button" : "span";
  });

  const elementProps = createMemo(() => omit(props, ...BUTTON_OMITTED_PROP_KEYS));

  const buttonProps = createMemo(() =>
    getButtonProps(
      merge(elementProps(), {
        disabled: disabled(),
      }) satisfies ButtonPropsForUseButton<HTMLElement>,
    ),
  );

  const mergedProps = createMemo(() => combinePropsList([buttonProps(), compositeProps()]));

  const handleRef: JSX.Ref<HTMLElement> = (node) => {
    compositeRef(node);
    buttonRef(node);

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

export interface ToolbarButtonState extends ToolbarRoot.State {
  disabled: boolean;
  focusable: boolean;
}

export interface ToolbarButtonProps extends Omit<
  ButtonPropsForUseButton<HTMLElement>,
  "disabled" | "native"
> {
  "data-testid"?: string | undefined;
  disabled?: boolean | undefined;
  focusableWhenDisabled?: boolean | undefined;
  nativeButton?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export namespace ToolbarButton {
  export type State = ToolbarButtonState;
  export type Props = ToolbarButtonProps;
}

const BUTTON_OMITTED_PROP_KEYS = [
  "children",
  "disabled",
  "focusableWhenDisabled",
  "nativeButton",
  "render",
  "ref",
] as const satisfies ReadonlyArray<keyof ToolbarButtonProps>;
