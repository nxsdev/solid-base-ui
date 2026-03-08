import { Dynamic } from "../../internal/Dynamic";
import { Show, createMemo, omit, type JSX, type ValidComponent } from "solid-js";
import { useMenuRadioItemContext } from "../radio-item/MenuRadioItemContext";
import { MenuRadioItemIndicatorDataAttributes } from "./MenuRadioItemIndicatorDataAttributes";

/**
 * Indicates whether the radio item is selected.
 */
export function MenuRadioItemIndicator(props: MenuRadioItemIndicator.Props) {
  const itemContext = useMenuRadioItemContext();
  const shouldRender = createMemo(() => props.keepMounted || itemContext.checked());
  const component = createMemo<ValidComponent>(() => props.render ?? "span");
  const elementProps = createMemo(() => omit(props, ...RADIO_INDICATOR_OMITTED_PROP_KEYS));

  return (
    <Show when={shouldRender()}>
      <Dynamic
        component={component()}
        aria-hidden="true"
        {...elementProps()}
        {...{
          [MenuRadioItemIndicatorDataAttributes.checked]: itemContext.checked() ? "" : undefined,
          [MenuRadioItemIndicatorDataAttributes.unchecked]: itemContext.checked() ? undefined : "",
          [MenuRadioItemIndicatorDataAttributes.disabled]: itemContext.disabled() ? "" : undefined,
          [MenuRadioItemIndicatorDataAttributes.highlighted]: itemContext.highlighted()
            ? ""
            : undefined,
        }}
      >
        {props.children}
      </Dynamic>
    </Show>
  );
}

export interface MenuRadioItemIndicatorState {
  checked: boolean;
  disabled: boolean;
  highlighted: boolean;
  transitionStatus: "idle";
}

export interface MenuRadioItemIndicatorProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  keepMounted?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export namespace MenuRadioItemIndicator {
  export type State = MenuRadioItemIndicatorState;
  export type Props = MenuRadioItemIndicatorProps;
}

const RADIO_INDICATOR_OMITTED_PROP_KEYS = [
  "children",
  "keepMounted",
  "render",
] as const satisfies ReadonlyArray<keyof MenuRadioItemIndicatorProps>;
