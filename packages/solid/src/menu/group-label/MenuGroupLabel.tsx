import { Dynamic } from "../../internal/Dynamic";
import {
  createMemo,
  createRenderEffect,
  omit,
  onCleanup,
  type JSX,
  type ValidComponent,
} from "solid-js";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { useMenuGroupContext } from "../group/MenuGroupContext";

/**
 * An accessible label that is automatically associated with its parent group.
 */
export function MenuGroupLabel(props: MenuGroupLabel.Props) {
  const groupContext = useMenuGroupContext();
  const generatedId = useBaseUiId();
  const id = createMemo<string>(() => (typeof props.id === "string" ? props.id : generatedId));
  const component = createMemo<ValidComponent>(() => props.render ?? "div");
  const elementProps = createMemo(() => omit(props, ...GROUP_LABEL_OMITTED_PROP_KEYS));

  createRenderEffect(id, (nextId) => {
    groupContext.setLabelId(nextId);

    onCleanup(() => {
      groupContext.setLabelId(undefined);
    });
  });

  return (
    <Dynamic component={component()} id={id()} role="presentation" {...elementProps()}>
      {props.children}
    </Dynamic>
  );
}

export interface MenuGroupLabelState {}

export interface MenuGroupLabelProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: ValidComponent | undefined;
}

export namespace MenuGroupLabel {
  export type State = MenuGroupLabelState;
  export type Props = MenuGroupLabelProps;
}

const GROUP_LABEL_OMITTED_PROP_KEYS = ["children", "id", "render"] as const satisfies ReadonlyArray<
  keyof MenuGroupLabelProps
>;
