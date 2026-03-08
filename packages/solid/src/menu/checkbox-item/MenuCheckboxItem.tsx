import { Dynamic } from "../../internal/Dynamic";
import {
  createMemo,
  createRenderEffect,
  createSignal,
  omit,
  onCleanup,
  untrack,
  type JSX,
  type ValidComponent,
} from "solid-js";
import { combinePropsList, type DomProps } from "../../merge-props/combineProps";
import { useButton, type ButtonPropsForUseButton } from "../../use-button";
import { createChangeEventDetails } from "../../utils/createChangeEventDetails";
import { resolveBoolean } from "../../utils/resolveBoolean";
import type { MenuRoot } from "../root/MenuRoot";
import { useMenuPopupContext } from "../popup/MenuPopupContext";
import { useMenuRootContext } from "../root/MenuRootContext";
import {
  MenuCheckboxItemContext,
  type MenuCheckboxItemContextValue,
} from "./MenuCheckboxItemContext";
import { MenuCheckboxItemDataAttributes } from "./MenuCheckboxItemDataAttributes";

/**
 * A menu item that toggles a setting on or off.
 */
export function MenuCheckboxItem(props: MenuCheckboxItem.Props) {
  const menuRootContext = useMenuRootContext();
  const popupContext = useMenuPopupContext();
  const initialChecked = untrack(() => Boolean(props.checked ?? props.defaultChecked));
  const [localChecked, setLocalChecked] = createSignal(initialChecked);
  const disabled = createMemo<boolean>(() => resolveBoolean(props.disabled, false));
  const closeOnClick = createMemo<boolean>(() => resolveBoolean(props.closeOnClick, false));
  const nativeButton = createMemo<boolean>(() => resolveBoolean(props.nativeButton, false));
  const checked = createMemo<boolean>(() => props.checked ?? localChecked());
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
  const baseProps = createMemo(() => omit(props, ...CHECKBOX_ITEM_OMITTED_PROP_KEYS));
  const buttonProps = createMemo(() =>
    getButtonProps({
      ...baseProps(),
      role: "menuitemcheckbox",
      tabindex: highlighted() ? 0 : -1,
      disabled: disabled(),
      "aria-checked": checked() ? "true" : "false",
    } satisfies ButtonPropsForUseButton<HTMLElement>),
  );
  const controlProps = createMemo<DomProps<HTMLElement>>(() => ({
    role: "menuitemcheckbox",
    "aria-checked": checked() ? "true" : "false",
    [MenuCheckboxItemDataAttributes.checked]: checked() ? "" : undefined,
    [MenuCheckboxItemDataAttributes.unchecked]: checked() ? undefined : "",
    [MenuCheckboxItemDataAttributes.highlighted]: highlighted() ? "" : undefined,
    [MenuCheckboxItemDataAttributes.disabled]: disabled() ? "" : undefined,
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

      const nextChecked = !checked();
      const details = createChangeEventDetails(event, event.currentTarget, "item-press");
      props.onCheckedChange?.(nextChecked, details);

      if (details.isCanceled) {
        return;
      }

      if (props.checked === undefined) {
        setLocalChecked(() => nextChecked);
      }

      if (!closeOnClick()) {
        return;
      }

      menuRootContext.store.requestClose(event, "close-press", event.currentTarget);
    },
  }));
  const mergedProps = createMemo(() =>
    combinePropsList<HTMLElement>([controlProps(), buttonProps()]),
  );

  const contextValue: MenuCheckboxItemContextValue = {
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
    <MenuCheckboxItemContext value={contextValue}>
      <Dynamic component={component()} ref={handleRef} {...mergedProps()}>
        {props.children}
      </Dynamic>
    </MenuCheckboxItemContext>
  );
}

export interface MenuCheckboxItemState {
  disabled: boolean;
  highlighted: boolean;
  checked: boolean;
}

export interface MenuCheckboxItemProps extends Omit<
  ButtonPropsForUseButton<HTMLElement>,
  "disabled"
> {
  checked?: boolean | undefined;
  defaultChecked?: boolean | undefined;
  onCheckedChange?:
    | ((checked: boolean, eventDetails: MenuRoot.ChangeEventDetails) => void)
    | undefined;
  disabled?: boolean | undefined;
  closeOnClick?: boolean | undefined;
  nativeButton?: boolean | undefined;
  label?: string | undefined;
  render?: ValidComponent | undefined;
}

export namespace MenuCheckboxItem {
  export type State = MenuCheckboxItemState;
  export type Props = MenuCheckboxItemProps;
  export type ChangeEventReason = MenuRoot.ChangeEventReason;
  export type ChangeEventDetails = MenuRoot.ChangeEventDetails;
}

const CHECKBOX_ITEM_OMITTED_PROP_KEYS = [
  "children",
  "checked",
  "defaultChecked",
  "onCheckedChange",
  "disabled",
  "closeOnClick",
  "nativeButton",
  "label",
  "render",
  "ref",
] as const satisfies ReadonlyArray<keyof MenuCheckboxItemProps>;
