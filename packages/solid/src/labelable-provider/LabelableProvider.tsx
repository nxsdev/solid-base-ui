import { createSignal, type JSX } from "solid-js";
import { combineProps, type DomProps } from "../merge-props";
import { useBaseUiId } from "../utils/useBaseUiId";
import {
  LabelableContext,
  useLabelableContext,
  type MessageIdsSetter,
  type LabelableContextValue,
} from "./LabelableContext";

/**
 * Provides label/control/description association state.
 */
export function LabelableProvider(props: LabelableProvider.Props) {
  const defaultId = useBaseUiId();
  const initialControlId = props.controlId === undefined ? defaultId : props.controlId;

  const [controlId, setControlId] = createSignal<string | null | undefined>(initialControlId, {
    pureWrite: true,
  });
  const [labelId, setLabelIdSignal] = createSignal<string | undefined>(props.labelId, {
    pureWrite: true,
  });
  const [messageIds, setMessageIdsSignal] = createSignal<string[]>([], { pureWrite: true });
  const registrations = new Map<symbol, string | null>();

  const { messageIds: parentMessageIds } = useLabelableContext();

  const registerControlId = (source: symbol, nextId: string | null | undefined) => {
    if (nextId === undefined) {
      registrations.delete(source);
      return;
    }

    registrations.set(source, nextId);

    setControlId((prev) => {
      if (registrations.size === 0) {
        return undefined;
      }

      let nextControlId: string | null | undefined;
      for (const registeredId of registrations.values()) {
        if (prev !== undefined && registeredId === prev) {
          return prev;
        }

        if (nextControlId === undefined) {
          nextControlId = registeredId;
        }
      }

      return nextControlId;
    });
  };

  const setLabelId = (next: string | undefined) => {
    setLabelIdSignal(() => next);
  };

  const setMessageIds = (next: MessageIdsSetter) => {
    setMessageIdsSignal((previous) => (typeof next === "function" ? next(previous) : next));
  };

  const getDescriptionProps = <TElement extends HTMLElement>(
    externalProps: DomProps<TElement>,
  ): DomProps<TElement> => {
    const ariaDescribedBy = parentMessageIds().concat(messageIds()).join(" ") || undefined;
    const baseProps: DomProps<TElement> = {
      "aria-describedby": ariaDescribedBy,
    };
    return combineProps(baseProps, externalProps);
  };

  const contextValue: LabelableContextValue = {
    controlId,
    registerControlId,
    labelId,
    setLabelId,
    messageIds,
    setMessageIds,
    getDescriptionProps,
  };

  return <LabelableContext value={contextValue}>{props.children}</LabelableContext>;
}

export interface LabelableProviderProps {
  controlId?: string | null | undefined;
  labelId?: string | undefined;
  children?: JSX.Element | undefined;
}

export namespace LabelableProvider {
  export type Props = LabelableProviderProps;
}
