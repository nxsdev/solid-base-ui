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
import { resolveBoolean } from "../../utils/resolveBoolean";
import { useMenuPopupContext } from "../popup/MenuPopupContext";
import { useMenuRootContext } from "../root/MenuRootContext";
import { MenuItemDataAttributes } from "./MenuItemDataAttributes";

/**
 * An individual interactive item in the menu.
 *
 * Documentation: [Base UI Menu](https://xxxxx.com/solid/components/menu)
 */
export function MenuItem(props: MenuItem.Props) {
  const menuRootContext = useMenuRootContext();
  const popupContext = useMenuPopupContext();

  const disabled = createMemo<boolean>(() => resolveBoolean(props.disabled, false));
  const closeOnClick = createMemo<boolean>(() => resolveBoolean(props.closeOnClick, true));
  const nativeButton = createMemo<boolean>(() => resolveBoolean(props.nativeButton, false));
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
  const isHighlighted = createMemo<boolean>(() => popupContext.highlightedIndex() === index());

  const { getButtonProps, buttonRef } = useButton<HTMLElement>({
    disabled,
    focusableWhenDisabled: true,
    native: nativeButton,
    composite: true,
  });

  const component = createMemo<ValidComponent>(() => {
    if (props.render !== undefined) {
      return props.render;
    }

    return nativeButton() ? "button" : "div";
  });

  const baseProps = createMemo(() => omit(props, ...ITEM_OMITTED_PROP_KEYS));

  const buttonProps = createMemo(() =>
    getButtonProps({
      ...baseProps(),
      role: "menuitem",
      tabindex: isHighlighted() ? 0 : -1,
      disabled: disabled(),
    } satisfies ButtonPropsForUseButton<HTMLElement>),
  );

  const controlProps = createMemo<DomProps<HTMLElement>>(() => ({
    role: "menuitem",
    [MenuItemDataAttributes.highlighted]: isHighlighted() ? "" : undefined,
    [MenuItemDataAttributes.disabled]: disabled() ? "" : undefined,
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
        isHighlighted()
      ) {
        return;
      }

      element.focus();
    },
    onClick(event) {
      if (event.defaultPrevented || disabled() || !closeOnClick()) {
        return;
      }

      menuRootContext.store.requestClose(event, "close-press", event.currentTarget);
    },
  }));

  const mergedProps = createMemo(() =>
    combinePropsList<HTMLElement>([controlProps(), buttonProps()]),
  );

  const handleRef: JSX.Ref<HTMLElement> = (node) => {
    setItemElement((previous) => (previous === node ? previous : node));
    buttonRef(node);

    if (typeof props.ref === "function" && node !== null) {
      props.ref(node);
    }
  };

  return (
    <Dynamic component={component()} ref={handleRef} {...mergedProps()}>
      {props.children}
    </Dynamic>
  );
}

export interface MenuItemState {
  /**
   * Whether the item should ignore user interaction.
   */
  disabled: boolean;
  /**
   * Whether the item is highlighted.
   */
  highlighted: boolean;
}

export interface MenuItemProps extends Omit<ButtonPropsForUseButton<HTMLElement>, "disabled"> {
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Whether to close the menu when the item is clicked.
   * @default true
   */
  closeOnClick?: boolean | undefined;
  /**
   * Whether the rendered element is a native button.
   * @default false
   */
  nativeButton?: boolean | undefined;
  /**
   * Reserved for typeahead support.
   */
  label?: string | undefined;
  render?: ValidComponent | undefined;
}

export namespace MenuItem {
  export type State = MenuItemState;
  export type Props = MenuItemProps;
}

const ITEM_OMITTED_PROP_KEYS = [
  "children",
  "disabled",
  "closeOnClick",
  "nativeButton",
  "label",
  "render",
  "ref",
] as const satisfies ReadonlyArray<keyof MenuItemProps>;
