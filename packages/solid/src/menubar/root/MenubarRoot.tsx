import {
  createEffect,
  createSignal,
  onCleanup,
  type JSX,
  type ValidComponent,
  omit,
} from "solid-js";
import { CompositeRoot } from "../../composite/root/CompositeRoot";
import type { Orientation as OrientationType } from "../../types";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { resolveBoolean } from "../../utils/resolveBoolean";
import { MenubarDataAttributes } from "./MenubarDataAttributes";
import type { MenubarRootInteractionType } from "./MenubarRootContext";
import { MenubarRootContext, type MenubarRootContextValue } from "./MenubarRootContext";

type MenubarInteractionType = MenubarRootInteractionType;

/**
 * The container for menus.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Menubar](https://xxxxx.com/solid/components/menubar)
 */
export function MenubarRoot(props: MenubarRoot.Props) {
  const [contentElement, setContentElement] = createSignal<HTMLElement | null>(null, {
    pureWrite: true,
  });
  const [hasSubmenuOpen, setHasSubmenuOpen] = createSignal(false);
  const [allowMouseUpTrigger, setAllowMouseUpTrigger] = createSignal(false);
  const [openMethod, setOpenMethod] = createSignal<MenubarInteractionType | null>(null);
  const [openedWithTouch, setOpenedWithTouch] = createSignal(false);

  const modal = () => resolveBoolean(props.modal, true);
  const disabled = () => resolveBoolean(props.disabled, false);
  const loopFocus = () => resolveBoolean(props.loopFocus, true);
  const orientation = (): OrientationType => props.orientation ?? "horizontal";

  const generatedId = useBaseUiId();
  const rootId = (): string | undefined => {
    if (typeof props.id === "string" && props.id !== "") {
      return props.id;
    }
    return generatedId;
  };

  const setHasSubmenuOpenValue = (open: boolean, interactionType?: MenubarInteractionType) => {
    if (interactionType !== undefined) {
      setOpenMethod(interactionType);
      setOpenedWithTouch(interactionType === "touch");
    }

    setHasSubmenuOpen(open);
    if (!open) {
      setOpenMethod(null);
      setOpenedWithTouch(false);
    }
  };

  let restoreScrollLock: (() => void) | null = null;

  createEffect(
    () => [modal(), hasSubmenuOpen(), openMethod()] as const,
    ([isModal, isOpen, method]) => {
      if (typeof document === "undefined") {
        return;
      }

      const shouldLock = isModal && isOpen && method !== "touch" && !openedWithTouch();

      if (shouldLock) {
        if (restoreScrollLock === null) {
          const previousOverflow = document.body.style.overflow;
          document.body.style.overflow = "hidden";
          restoreScrollLock = () => {
            document.body.style.overflow = previousOverflow;
          };
        }
        return;
      }

      if (restoreScrollLock !== null) {
        restoreScrollLock();
        restoreScrollLock = null;
      }
    },
  );

  onCleanup(() => {
    if (restoreScrollLock !== null) {
      restoreScrollLock();
      restoreScrollLock = null;
    }
  });

  const contextValue: MenubarRootContextValue = {
    modal,
    disabled,
    contentElement,
    hasSubmenuOpen,
    orientation,
    allowMouseUpTrigger,
    rootId,
    setContentElement,
    setHasSubmenuOpen: setHasSubmenuOpenValue,
    setAllowMouseUpTrigger,
  };

  const elementProps = () => omit(props, ...ROOT_OMITTED_PROP_KEYS);

  return (
    <MenubarRootContext value={contextValue}>
      <CompositeRoot
        id={rootId()}
        role={typeof props.role === "string" ? props.role : "menubar"}
        aria-orientation={orientation()}
        data-disabled={disabled() ? "" : undefined}
        onPointerDown={(
          event: PointerEvent & { currentTarget: HTMLDivElement; target: EventTarget & Element },
        ) => {
          if (!hasSubmenuOpen()) {
            const interactionType = getInteractionTypeFromPointer(event.pointerType);
            if (interactionType === "touch") {
              setOpenMethod(interactionType);
              setOpenedWithTouch(true);
            } else if (interactionType === "mouse" || interactionType === "pen") {
              setOpenMethod(interactionType);
              setOpenedWithTouch(false);
            } else if (!openedWithTouch()) {
              setOpenMethod(interactionType);
              setOpenedWithTouch(false);
            }
          }
          callEventHandler(props.onPointerDown, event);
        }}
        onTouchStart={(
          event: TouchEvent & { currentTarget: HTMLDivElement; target: EventTarget & Element },
        ) => {
          if (!hasSubmenuOpen()) {
            setOpenMethod("touch");
            setOpenedWithTouch(true);
          }
          callEventHandler(props.onTouchStart, event);
        }}
        {...{
          [MenubarDataAttributes.modal]: modal() ? "" : undefined,
          [MenubarDataAttributes.orientation]: orientation(),
          [MenubarDataAttributes.hasSubmenuOpen]: hasSubmenuOpen() ? "true" : "false",
        }}
        orientation={orientation()}
        loopFocus={loopFocus()}
        highlightItemOnHover={hasSubmenuOpen()}
        rootRef={setContentElement}
        render={props.render}
        {...elementProps()}
      >
        {props.children}
      </CompositeRoot>
    </MenubarRootContext>
  );
}

export type MenubarRootOrientation = OrientationType;

export interface MenubarRootState {
  /** The orientation of the menubar. */
  orientation: MenubarRoot.Orientation;
  /** Whether the menubar is modal. */
  modal: boolean;
  /** Whether any submenu within the menubar is open. */
  hasSubmenuOpen: boolean;
}

export interface MenubarRootProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  "data-testid"?: string | undefined;
  /**
   * Whether the menubar is modal.
   * @default true
   */
  modal?: boolean | undefined;
  /**
   * Whether the whole menubar is disabled.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * The orientation of the menubar.
   * @default 'horizontal'
   */
  orientation?: MenubarRoot.Orientation | undefined;
  /**
   * Whether to loop keyboard focus back to the first item
   * when the end of the list is reached while using the arrow keys.
   * @default true
   */
  loopFocus?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export namespace MenubarRoot {
  export type Orientation = MenubarRootOrientation;
  export type State = MenubarRootState;
  export type Props = MenubarRootProps;
}

const ROOT_OMITTED_PROP_KEYS = [
  "children",
  "disabled",
  "id",
  "loopFocus",
  "modal",
  "onPointerDown",
  "onTouchStart",
  "orientation",
  "render",
  "role",
] as const satisfies ReadonlyArray<keyof MenubarRootProps>;

function getInteractionTypeFromPointer(pointerType: string): MenubarInteractionType {
  if (pointerType === "touch" || pointerType === "mouse" || pointerType === "pen") {
    return pointerType;
  }

  return "";
}

function callEventHandler<TElement extends HTMLElement, TEvent extends Event>(
  handler: JSX.EventHandlerUnion<TElement, TEvent> | undefined,
  event: TEvent & { currentTarget: TElement; target: EventTarget & Element },
): void {
  if (handler === undefined) {
    return;
  }

  if (typeof handler === "function") {
    handler(event);
    return;
  }

  handler[0](handler[1], event);
}
