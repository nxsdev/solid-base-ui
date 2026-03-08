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
import { useButton } from "../../use-button";
import { resolveBoolean } from "../../utils/resolveBoolean";
import { useMenuPopupContext } from "../popup/MenuPopupContext";
import { useMenuRootContext } from "../root/MenuRootContext";
import { MenuLinkItemDataAttributes } from "./MenuLinkItemDataAttributes";

/**
 * A link in the menu that can be used to navigate to a different page or section.
 */
export function MenuLinkItem(props: MenuLinkItem.Props) {
  const menuRootContext = useMenuRootContext();
  const popupContext = useMenuPopupContext();
  const closeOnClick = createMemo<boolean>(() => resolveBoolean(props.closeOnClick, false));
  const [itemElement, setItemElement] = createSignal<HTMLAnchorElement | null>(null, {
    pureWrite: true,
  });

  createRenderEffect(itemElement, (element) => {
    if (element === null) {
      return;
    }

    const unregister = popupContext.registerItem(element, () => false);
    onCleanup(unregister);
  });

  const index = createMemo<number>(() => popupContext.indexOf(itemElement()));
  const highlighted = createMemo<boolean>(() => popupContext.highlightedIndex() === index());
  const { getButtonProps, buttonRef } = useButton<HTMLAnchorElement>({
    disabled: () => false,
    native: () => false,
    composite: true,
  });

  const component = createMemo<ValidComponent>(() => props.render ?? "a");
  const baseProps = createMemo(() => omit(props, ...LINK_ITEM_OMITTED_PROP_KEYS));
  const buttonProps = createMemo(() =>
    getButtonProps({
      ...baseProps(),
      role: "menuitem",
      tabindex: highlighted() ? 0 : -1,
    }),
  );
  const controlProps = createMemo<DomProps<HTMLAnchorElement>>(() => ({
    role: "menuitem",
    [MenuLinkItemDataAttributes.highlighted]: highlighted() ? "" : undefined,
    onFocus() {
      popupContext.setHighlightedIndex(index());
      menuRootContext.setOpenedSubmenuIndex(null);
    },
    onMouseMove() {
      const element = itemElement();
      if (!menuRootContext.highlightItemOnHover() || element === null || highlighted()) {
        return;
      }

      element.focus();
    },
    onClick(event) {
      if (event.defaultPrevented || !closeOnClick()) {
        return;
      }

      menuRootContext.store.requestClose(event, "link-press", event.currentTarget);
    },
  }));
  const mergedProps = createMemo(() =>
    combinePropsList<HTMLAnchorElement>([controlProps(), buttonProps()]),
  );

  const handleRef: JSX.Ref<HTMLAnchorElement> = (node) => {
    setItemElement((previous) => (previous === node ? previous : node));
    buttonRef(node);

    if (typeof props.ref === "function") {
      props.ref(node);
    }
  };

  return (
    <Dynamic component={component()} ref={handleRef} {...mergedProps()}>
      {props.children}
    </Dynamic>
  );
}

export interface MenuLinkItemState {
  highlighted: boolean;
}

export interface MenuLinkItemProps extends Omit<
  JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
  "onChange"
> {
  label?: string | undefined;
  closeOnClick?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export namespace MenuLinkItem {
  export type State = MenuLinkItemState;
  export type Props = MenuLinkItemProps;
}

const LINK_ITEM_OMITTED_PROP_KEYS = [
  "children",
  "closeOnClick",
  "label",
  "render",
  "ref",
  "type",
] as const satisfies ReadonlyArray<keyof MenuLinkItemProps>;
