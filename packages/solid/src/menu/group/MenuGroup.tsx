import { Dynamic } from "../../internal/Dynamic";
import { createMemo, createSignal, omit, type JSX, type ValidComponent } from "solid-js";
import { MenuGroupContext, type MenuGroupContextValue } from "./MenuGroupContext";

/**
 * Groups related menu items with the corresponding label.
 */
export function MenuGroup(props: MenuGroup.Props) {
  const [labelId, setLabelId] = createSignal<string | undefined>(undefined, {
    pureWrite: true,
  });
  const component = createMemo<ValidComponent>(() => props.render ?? "div");
  const elementProps = createMemo(() => omit(props, ...GROUP_OMITTED_PROP_KEYS));

  const contextValue: MenuGroupContextValue = {
    setLabelId(id) {
      setLabelId(() => id);
    },
  };

  return (
    <MenuGroupContext value={contextValue}>
      <Dynamic component={component()} role="group" aria-labelledby={labelId()} {...elementProps()}>
        {props.children}
      </Dynamic>
    </MenuGroupContext>
  );
}

export interface MenuGroupState {}

export interface MenuGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: ValidComponent | undefined;
}

export namespace MenuGroup {
  export type State = MenuGroupState;
  export type Props = MenuGroupProps;
}

const GROUP_OMITTED_PROP_KEYS = ["children", "render"] as const satisfies ReadonlyArray<
  keyof MenuGroupProps
>;
