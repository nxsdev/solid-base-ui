import { Dynamic } from "../../internal/Dynamic";
import { Show, createMemo, omit, type JSX, type ValidComponent } from "solid-js";
import { useMenuCheckboxItemContext } from "../checkbox-item/MenuCheckboxItemContext";
import { MenuCheckboxItemIndicatorDataAttributes } from "./MenuCheckboxItemIndicatorDataAttributes";

/**
 * Indicates whether the checkbox item is ticked.
 */
export function MenuCheckboxItemIndicator(props: MenuCheckboxItemIndicator.Props) {
  const itemContext = useMenuCheckboxItemContext();
  const shouldRender = createMemo(() => props.keepMounted || itemContext.checked());
  const component = createMemo<ValidComponent>(() => props.render ?? "span");
  const elementProps = createMemo(() => omit(props, ...CHECKBOX_INDICATOR_OMITTED_PROP_KEYS));

  return (
    <Show when={shouldRender()}>
      <Dynamic
        component={component()}
        aria-hidden="true"
        {...elementProps()}
        {...{
          [MenuCheckboxItemIndicatorDataAttributes.checked]: itemContext.checked() ? "" : undefined,
          [MenuCheckboxItemIndicatorDataAttributes.unchecked]: itemContext.checked()
            ? undefined
            : "",
          [MenuCheckboxItemIndicatorDataAttributes.disabled]: itemContext.disabled()
            ? ""
            : undefined,
          [MenuCheckboxItemIndicatorDataAttributes.highlighted]: itemContext.highlighted()
            ? ""
            : undefined,
        }}
      >
        {props.children}
      </Dynamic>
    </Show>
  );
}

export interface MenuCheckboxItemIndicatorState {
  checked: boolean;
  disabled: boolean;
  highlighted: boolean;
  transitionStatus: "idle";
}

export interface MenuCheckboxItemIndicatorProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  keepMounted?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export namespace MenuCheckboxItemIndicator {
  export type State = MenuCheckboxItemIndicatorState;
  export type Props = MenuCheckboxItemIndicatorProps;
}

const CHECKBOX_INDICATOR_OMITTED_PROP_KEYS = [
  "children",
  "keepMounted",
  "render",
] as const satisfies ReadonlyArray<keyof MenuCheckboxItemIndicatorProps>;
