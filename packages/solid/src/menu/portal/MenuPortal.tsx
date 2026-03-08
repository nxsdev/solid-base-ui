import { Show, createMemo, type JSX } from "solid-js";
import { Portal } from "@solidjs/web";
import { useMenuRootContext } from "../root/MenuRootContext";
import { useMenuSubmenuRootContext } from "../submenu-root/MenuSubmenuRootContext";
import { MenuPortalContext } from "./MenuPortalContext";

/**
 * A portal element that moves the popup to a different part of the DOM.
 * By default, the portal element is appended to `<body>`.
 */
export function MenuPortal(props: MenuPortal.Props) {
  const submenuRootContext = useMenuSubmenuRootContext(true);
  const menuRootContext = submenuRootContext?.menu() ?? useMenuRootContext();
  const keepMounted = props.keepMounted ?? false;
  const mountProps = createMemo<{ mount?: Element }>(() =>
    props.container === undefined ? {} : { mount: props.container },
  );

  if (submenuRootContext !== null && submenuRootContext.menu() === null) {
    return null;
  }

  return (
    <MenuPortalContext value={keepMounted}>
      <MenuPortalBody
        children={props.children}
        keepMounted={keepMounted}
        menuRootContext={menuRootContext}
        mountProps={mountProps}
      />
    </MenuPortalContext>
  );
}

interface MenuPortalBodyProps {
  children: JSX.Element | undefined;
  keepMounted: boolean;
  menuRootContext: ReturnType<typeof useMenuRootContext>;
  mountProps: () => { mount?: Element };
}

function MenuPortalBody(props: MenuPortalBodyProps) {
  const shouldRender = createMemo<boolean>(
    () => props.menuRootContext.mounted() || props.keepMounted,
  );

  return (
    <Portal {...props.mountProps()}>
      <Show when={shouldRender()}>{props.children}</Show>
    </Portal>
  );
}

export interface MenuPortalProps {
  /**
   * Whether to keep the portal mounted in the DOM while the popup is hidden.
   * @default false
   */
  keepMounted?: boolean | undefined;
  /**
   * A parent element to render the portal into.
   */
  container?: Element | undefined;
  children?: JSX.Element | undefined;
}

export namespace MenuPortal {
  export type Props = MenuPortalProps;
}
