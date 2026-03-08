import { createMemo, createSignal, type JSX, type ValidComponent } from "solid-js";
import { FieldsetRootContext, type FieldsetRootContextValue } from "./FieldsetRootContext";

/**
 * Groups a shared legend with related controls.
 */
export function FieldsetRoot(props: FieldsetRoot.Props) {
  const [legendId, setLegendId] = createSignal<string | undefined>(undefined);
  const disabled = createMemo<boolean>(() => props.disabled === true || props.disabled === "");

  const contextValue: FieldsetRootContextValue = {
    disabled,
    setLegendId,
  };

  return (
    <FieldsetRootContext value={contextValue}>
      <fieldset
        aria-labelledby={props["aria-labelledby"] ?? legendId()}
        disabled={disabled()}
        class={props.class}
        style={props.style}
        data-testid={props["data-testid"]}
        data-disabled={disabled() ? "" : undefined}
      >
        {props.children}
      </fieldset>
    </FieldsetRootContext>
  );
}

export interface FieldsetRootState {
  disabled: boolean;
}

export interface FieldsetRootProps extends JSX.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export namespace FieldsetRoot {
  export type State = FieldsetRootState;
  export type Props = FieldsetRootProps;
}
