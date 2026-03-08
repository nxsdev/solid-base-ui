import { createMemo, omit, type JSX, type ValidComponent } from "solid-js";
import { useMenuRootContext } from "../root/MenuRootContext";
import { MenuBackdropDataAttributes } from "./MenuBackdropDataAttributes";

/**
 * An overlay displayed beneath the menu popup.
 */
export function MenuBackdrop(props: MenuBackdrop.Props) {
  const menuRootContext = useMenuRootContext();
  const elementProps = createMemo(() => omit(props, ...BACKDROP_OMITTED_PROP_KEYS));
  const style = createMemo<JSX.CSSProperties>(() => ({
    "user-select": "none",
    "-webkit-user-select": "none",
    "pointer-events":
      menuRootContext.lastOpenChangeReason() === "trigger-hover" ? "none" : undefined,
    ...toStyleObject(props.style),
  }));

  return (
    <div
      {...elementProps()}
      role="presentation"
      hidden={!menuRootContext.mounted()}
      style={style()}
      {...{
        [MenuBackdropDataAttributes.open]: menuRootContext.open() ? "" : undefined,
        [MenuBackdropDataAttributes.closed]: menuRootContext.open() ? undefined : "",
      }}
    >
      {props.children}
    </div>
  );
}

export interface MenuBackdropState {
  open: boolean;
  transitionStatus: "idle";
}

export interface MenuBackdropProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: ValidComponent | undefined;
}

export namespace MenuBackdrop {
  export type State = MenuBackdropState;
  export type Props = MenuBackdropProps;
}

const BACKDROP_OMITTED_PROP_KEYS = ["children", "render", "style"] as const satisfies ReadonlyArray<
  keyof MenuBackdropProps
>;

function toStyleObject(style: JSX.CSSProperties | string | boolean | undefined): JSX.CSSProperties {
  if (style === undefined || typeof style === "string" || typeof style === "boolean") {
    return {};
  }

  return style;
}
