import type { JSX, ValidComponent } from "solid-js";
import type { ProgressRootState } from "../root/ProgressRoot";
import { useProgressRootContext } from "../root/ProgressRootContext";
import { getProgressStatusDataAttributes } from "../root/stateAttributesMapping";

export type ProgressValueRenderProp = (formattedValue: string, value: number | null) => JSX.Element;

/**
 * A text element displaying the current value.
 */
export function ProgressValue(props: ProgressValue.Props) {
  const context = useProgressRootContext();

  const content = () => {
    const value = context.value();
    const formattedValue = context.formattedValue();

    if (typeof props.children === "function") {
      const formattedValueArg = value === null ? "indeterminate" : formattedValue;
      return props.children(formattedValueArg, value);
    }

    if (props.children !== undefined) {
      return props.children;
    }

    if (value === null) {
      return null;
    }

    return formattedValue;
  };

  return (
    <span
      aria-hidden="true"
      class={props.class}
      style={props.style}
      data-testid={props["data-testid"]}
      {...getProgressStatusDataAttributes(context.status())}
    >
      {content()}
    </span>
  );
}

export interface ProgressValueProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> {
  "data-testid"?: string | undefined;
  children?: JSX.Element | ProgressValueRenderProp | undefined;
  render?: ValidComponent | undefined;
}

export interface ProgressValueState extends ProgressRootState {}

export namespace ProgressValue {
  export type Props = ProgressValueProps;
  export type State = ProgressValueState;
}
