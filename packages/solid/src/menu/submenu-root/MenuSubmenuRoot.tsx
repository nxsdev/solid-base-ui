import {
  createMenuRootState,
  type CreateMenuRootStateResult,
  type MenuStateRecord,
  type MenuRootChangeEventDetails,
  type MenuRootChangeEventReason,
  type MenuRootProps,
} from "../root/MenuRoot";
import { createMemo, getOwner, runWithOwner, type Accessor, type JSX } from "solid-js";
import { useMenuRootContext } from "../root/MenuRootContext";
import { MenuSubmenuRootContext, type MenuSubmenuRootContextValue } from "./MenuSubmenuRootContext";

/**
 * Groups all parts of a submenu.
 * Doesn't render its own HTML element.
 *
 * Documentation: [Base UI Menu](https://xxxxx.com/solid/components/menu)
 */
export function MenuSubmenuRoot<Payload = unknown>(props: MenuSubmenuRoot.Props<Payload>) {
  const parentMenu = useMenuRootContext();
  const owner = getOwner();
  const createdMenus = new Map<string, CreateMenuRootStateResult<Payload>>();
  let activeTriggerId: string | null =
    typeof props.defaultTriggerId === "string" ? props.defaultTriggerId : null;

  const ensureSubmenuMenu = (triggerId: string): CreateMenuRootStateResult<Payload> => {
    activeTriggerId = triggerId;

    const existingMenu = createdMenus.get(triggerId);
    if (existingMenu !== undefined) {
      return existingMenu;
    }

    const stateRecord = parentMenu.acquireSubmenuStateRecord(
      triggerId,
      props.defaultOpen ?? false,
      props.defaultTriggerId ?? null,
    ) as MenuStateRecord<Payload>;
    const createMenu = () => createMenuRootState(props, parentMenu.store, stateRecord);
    const createdMenu = owner === null ? createMenu() : runWithOwner(owner, createMenu);
    createdMenus.set(triggerId, createdMenu);
    return createdMenu;
  };

  const menu = () =>
    activeTriggerId === null ? null : ensureSubmenuMenu(activeTriggerId).contextValue;
  const payload: Accessor<Payload | undefined> = () =>
    activeTriggerId === null ? undefined : ensureSubmenuMenu(activeTriggerId).payload();
  const submenuContextValue: MenuSubmenuRootContextValue = {
    parentMenu,
    menu,
    ensureMenu(triggerId) {
      return ensureSubmenuMenu(triggerId);
    },
  };

  return (
    <MenuSubmenuRootContext value={submenuContextValue}>
      <MenuSubmenuRootChildren children={props.children} payload={payload} />
    </MenuSubmenuRootContext>
  );
}

export interface MenuSubmenuRootProps<Payload = unknown> extends Omit<
  MenuRootProps<Payload>,
  "modal" | "onOpenChange"
> {
  /**
   * Event handler called when the submenu is opened or closed.
   */
  onOpenChange?:
    | ((open: boolean, eventDetails: MenuSubmenuRoot.ChangeEventDetails) => void)
    | undefined;
  /**
   * When in a submenu, determines whether pressing Escape closes only this submenu or the whole tree.
   * @default false
   */
  closeParentOnEsc?: boolean | undefined;
}

export interface MenuSubmenuRootState {}

export type MenuSubmenuRootChangeEventReason = MenuRootChangeEventReason;
export type MenuSubmenuRootChangeEventDetails = MenuRootChangeEventDetails;

export namespace MenuSubmenuRoot {
  export type Props<Payload = unknown> = MenuSubmenuRootProps<Payload>;
  export type State = MenuSubmenuRootState;
  export type ChangeEventReason = MenuSubmenuRootChangeEventReason;
  export type ChangeEventDetails = MenuSubmenuRootChangeEventDetails;
}

function isChildrenRenderFunction<Payload = unknown>(
  children: MenuSubmenuRootProps<Payload>["children"],
): children is (props: { payload: Payload | undefined }) => JSX.Element {
  return typeof children === "function" && children.length > 0;
}

interface MenuSubmenuRootChildrenProps<Payload = unknown> {
  children: MenuSubmenuRootProps<Payload>["children"];
  payload: Accessor<Payload | undefined>;
}

function MenuSubmenuRootChildren<Payload = unknown>(props: MenuSubmenuRootChildrenProps<Payload>) {
  const submenuChildren = props.children;

  if (isChildrenRenderFunction(submenuChildren)) {
    const rendered = createMemo(() => submenuChildren({ payload: props.payload() }));
    return <>{rendered()}</>;
  }

  return <>{submenuChildren}</>;
}
