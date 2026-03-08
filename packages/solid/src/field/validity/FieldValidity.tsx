import { createMemo, type JSX } from "solid-js";
import type { FieldValidityData } from "../root/FieldRoot";
import { useFieldRootContext } from "../root/FieldRootContext";
import { getCombinedFieldValidityData } from "../utils/getCombinedFieldValidityData";

/**
 * Displays custom UI based on the field validity state.
 */
export function FieldValidity(props: FieldValidity.Props) {
  const rootContext = useFieldRootContext(false);

  const combinedValidityData = createMemo(() =>
    getCombinedFieldValidityData(rootContext.validityData(), rootContext.invalid()),
  );

  const state = createMemo<FieldValidityState>(() => ({
    ...combinedValidityData(),
    validity: combinedValidityData().state,
    transitionStatus: "idle",
  }));

  const renderedChildren = createMemo(() => props.children(state()));

  return <>{renderedChildren()}</>;
}

export interface FieldValidityState extends Omit<FieldValidityData, "state"> {
  validity: FieldValidityData["state"];
  transitionStatus: "idle";
}

export interface FieldValidityProps {
  children: (state: FieldValidity.State) => JSX.Element;
}

export namespace FieldValidity {
  export type State = FieldValidityState;
  export type Props = FieldValidityProps;
}
