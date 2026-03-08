import { createMemo, createSignal, type JSX, type ValidComponent, omit } from "solid-js";
import type { Orientation as OrientationType } from "../../types";
import { CompositeRoot } from "../../composite/root/CompositeRoot";
import type { CompositeMetadata } from "../../composite/list/CompositeList";
import { resolveBoolean } from "../../utils/resolveBoolean";
import { ToolbarRootContext, type ToolbarRootContextValue } from "./ToolbarRootContext";

/**
 * A container for grouping a set of controls, such as buttons or inputs.
 */
export function ToolbarRoot(props: ToolbarRoot.Props) {
  const [itemMap, setItemMap] = createSignal<Map<Element, CompositeMetadata>>(new Map());

  const disabled = createMemo(() => resolveBoolean(props.disabled, false));
  const loopFocus = createMemo(() => resolveBoolean(props.loopFocus, true));
  const orientation = createMemo<OrientationType>(() => props.orientation ?? "horizontal");

  const disabledIndices = createMemo<number[]>(() => {
    const output: number[] = [];

    itemMap().forEach((itemMetadata) => {
      if (itemMetadata.index !== undefined && itemMetadata.focusableWhenDisabled === false) {
        output.push(itemMetadata.index);
      }
    });

    return output;
  });

  const contextValue: ToolbarRootContextValue = {
    disabled,
    orientation,
    setItemMap,
  };

  const elementProps = createMemo(() => omit(props, ...ROOT_OMITTED_PROP_KEYS));

  return (
    <ToolbarRootContext value={contextValue}>
      <CompositeRoot
        role={typeof props.role === "string" ? props.role : "toolbar"}
        aria-orientation={orientation()}
        data-disabled={disabled() ? "" : undefined}
        data-orientation={orientation()}
        orientation={orientation()}
        loopFocus={loopFocus()}
        onMapChange={(newMap) => {
          setItemMap(() => newMap);
        }}
        disabledIndices={disabledIndices()}
        render={props.render}
        {...elementProps()}
      >
        {props.children}
      </CompositeRoot>
    </ToolbarRootContext>
  );
}

export type ToolbarRootItemMetadata = {
  focusableWhenDisabled: boolean;
} & Record<string, unknown>;

export type ToolbarRootOrientation = OrientationType;

export interface ToolbarRootState {
  disabled: boolean;
  orientation: ToolbarRoot.Orientation;
}

export interface ToolbarRootProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  "data-testid"?: string | undefined;
  disabled?: boolean | undefined;
  orientation?: ToolbarRoot.Orientation | undefined;
  loopFocus?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export namespace ToolbarRoot {
  export type ItemMetadata = ToolbarRootItemMetadata;
  export type Orientation = ToolbarRootOrientation;
  export type State = ToolbarRootState;
  export type Props = ToolbarRootProps;
}

const ROOT_OMITTED_PROP_KEYS = [
  "children",
  "disabled",
  "orientation",
  "loopFocus",
  "render",
  "role",
] as const satisfies ReadonlyArray<keyof ToolbarRootProps>;
