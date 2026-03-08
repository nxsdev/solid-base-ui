import { Dynamic } from "../../internal/Dynamic";
import {
  createMemo,
  createRenderEffect,
  createSignal,
  omit,
  onCleanup,
  type JSX,
  type ValidComponent,
} from "solid-js";
import { combinePropsList, type DomProps } from "../../merge-props/combineProps";
import { useButton, type ButtonPropsForUseButton } from "../../use-button";
import { createChangeEventDetails } from "../../utils/createChangeEventDetails";
import { resolveBoolean } from "../../utils/resolveBoolean";
import { useMenuPopupContext } from "../popup/MenuPopupContext";
import { useMenuRadioGroupContext } from "../radio-group/MenuRadioGroupContext";
import { useMenuRootContext } from "../root/MenuRootContext";
import { MenuRadioItemContext, type MenuRadioItemContextValue } from "./MenuRadioItemContext";
import { MenuRadioItemDataAttributes } from "./MenuRadioItemDataAttributes";

/**
 * A menu item that works like a radio button in a given group.
 */
export function MenuRadioItem(props: MenuRadioItem.Props) {
  const menuRootContext = useMenuRootContext();
  const radioGroupContext = useMenuRadioGroupContext();
  const popupContext = useMenuPopupContext();
  const groupDisabled = createMemo<boolean>(() => radioGroupContext.disabled());
  const disabled = createMemo<boolean>(
    () => groupDisabled() || resolveBoolean(props.disabled, false),
  );
  const closeOnClick = createMemo<boolean>(() => resolveBoolean(props.closeOnClick, false));
  const nativeButton = createMemo<boolean>(() => resolveBoolean(props.nativeButton, false));
  const checked = createMemo<boolean>(() => radioGroupContext.value() === props.value);
  const [itemElement, setItemElement] = createSignal<HTMLElement | null>(null, {
    pureWrite: true,
  });

  createRenderEffect(itemElement, (element) => {
    if (element === null) {
      return;
    }

    const unregister = popupContext.registerItem(element, disabled);
    onCleanup(unregister);
  });

  const index = createMemo<number>(() => popupContext.indexOf(itemElement()));
  const highlighted = createMemo<boolean>(() => popupContext.highlightedIndex() === index());
  const { getButtonProps, buttonRef } = useButton<HTMLElement>({
    disabled,
    focusableWhenDisabled: true,
    native: nativeButton,
    composite: true,
  });

  const component = createMemo<ValidComponent>(
    () => props.render ?? (nativeButton() ? "button" : "div"),
  );
  const baseProps = createMemo(() => omit(props, ...RADIO_ITEM_OMITTED_PROP_KEYS));
  const buttonProps = createMemo(() =>
    getButtonProps({
      ...baseProps(),
      role: "menuitemradio",
      tabindex: highlighted() ? 0 : -1,
      disabled: disabled(),
      "aria-checked": checked() ? "true" : "false",
    } satisfies ButtonPropsForUseButton<HTMLElement>),
  );
  const controlProps = createMemo<DomProps<HTMLElement>>(() => ({
    role: "menuitemradio",
    "aria-checked": checked() ? "true" : "false",
    [MenuRadioItemDataAttributes.checked]: checked() ? "" : undefined,
    [MenuRadioItemDataAttributes.unchecked]: checked() ? undefined : "",
    [MenuRadioItemDataAttributes.highlighted]: highlighted() ? "" : undefined,
    [MenuRadioItemDataAttributes.disabled]: disabled() ? "" : undefined,
    onFocus() {
      popupContext.setHighlightedIndex(index());
      menuRootContext.setOpenedSubmenuIndex(null);
    },
    onMouseMove() {
      const element = itemElement();
      if (
        !menuRootContext.highlightItemOnHover() ||
        element === null ||
        disabled() ||
        highlighted()
      ) {
        return;
      }

      element.focus();
    },
    onClick(event) {
      if (event.defaultPrevented || disabled()) {
        return;
      }

      const details = createChangeEventDetails(event, event.currentTarget, "item-press");
      radioGroupContext.setValue(props.value, details);

      if (details.isCanceled || !closeOnClick()) {
        return;
      }

      menuRootContext.store.requestClose(event, "close-press", event.currentTarget);
    },
  }));
  const mergedProps = createMemo(() =>
    combinePropsList<HTMLElement>([controlProps(), buttonProps()]),
  );

  const contextValue: MenuRadioItemContextValue = {
    checked,
    highlighted,
    disabled,
  };

  const handleRef: JSX.Ref<HTMLElement> = (node) => {
    setItemElement((previous) => (previous === node ? previous : node));
    buttonRef(node);

    if (typeof props.ref === "function") {
      props.ref(node);
    }
  };

  return (
    <MenuRadioItemContext value={contextValue}>
      <Dynamic component={component()} ref={handleRef} {...mergedProps()}>
        {props.children}
      </Dynamic>
    </MenuRadioItemContext>
  );
}

export interface MenuRadioItemState {
  disabled: boolean;
  highlighted: boolean;
  checked: boolean;
}

export interface MenuRadioItemProps extends Omit<ButtonPropsForUseButton<HTMLElement>, "disabled"> {
  value: unknown;
  disabled?: boolean | undefined;
  closeOnClick?: boolean | undefined;
  nativeButton?: boolean | undefined;
  label?: string | undefined;
  render?: ValidComponent | undefined;
}

export namespace MenuRadioItem {
  export type State = MenuRadioItemState;
  export type Props = MenuRadioItemProps;
}

const RADIO_ITEM_OMITTED_PROP_KEYS = [
  "children",
  "value",
  "disabled",
  "closeOnClick",
  "nativeButton",
  "label",
  "render",
  "ref",
] as const satisfies ReadonlyArray<keyof MenuRadioItemProps>;
