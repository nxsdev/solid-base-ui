import { createContext, useContext } from "solid-js";
import type { Accessor } from "solid-js";
import type { DomProps } from "../merge-props";

export type MessageIdsSetter = string[] | ((previous: string[]) => string[]);

export interface LabelableContextValue {
  /**
   * The id of the labelable control. When `null`, association is implicit.
   */
  controlId: Accessor<string | null | undefined>;
  registerControlId: (source: symbol, id: string | null | undefined) => void;
  /**
   * The id of the associated label.
   */
  labelId: Accessor<string | undefined>;
  setLabelId: (next: string | undefined) => void;
  /**
   * Ids of description / message elements.
   */
  messageIds: Accessor<string[]>;
  setMessageIds: (next: MessageIdsSetter) => void;
  getDescriptionProps: <TElement extends HTMLElement>(
    externalProps: DomProps<TElement>,
  ) => DomProps<TElement>;
}

const DEFAULT_LABELABLE_CONTEXT: LabelableContextValue = {
  controlId: () => undefined,
  registerControlId: () => {},
  labelId: () => undefined,
  setLabelId: () => {},
  messageIds: () => [],
  setMessageIds: () => {},
  getDescriptionProps: (externalProps) => externalProps,
};

/**
 * Context for labelable controls (label / description association).
 */
export const LabelableContext = createContext<LabelableContextValue>(DEFAULT_LABELABLE_CONTEXT);

export function useLabelableContext(): LabelableContextValue {
  return useContext(LabelableContext);
}
