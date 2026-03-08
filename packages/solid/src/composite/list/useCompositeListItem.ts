import { createSignal, createTrackedEffect, onCleanup, untrack, type Accessor } from "solid-js";
import { useCompositeListContext } from "./CompositeListContext";

export interface UseCompositeListItemParameters {
  index?: number | undefined;
  label?: string | null | undefined;
  metadata?: Record<string, unknown> | undefined;
  textRef?: { current: HTMLElement | null } | undefined;
  /**
   * Enables guessing indexes to avoid an extra update after mount.
   */
  indexGuessBehavior?: IndexGuessBehavior | undefined;
}

export interface UseCompositeListItemReturnValue {
  ref: (node: HTMLElement | null) => void;
  index: Accessor<number>;
}

export enum IndexGuessBehavior {
  None,
  GuessFromOrder,
}

/**
 * Registers an item in CompositeList and exposes its resolved index.
 */
export function useCompositeListItem(
  params: UseCompositeListItemParameters = {},
): UseCompositeListItemReturnValue {
  const { register, unregister, subscribeMapChange, elementsRef, labelsRef, nextIndexRef } =
    useCompositeListContext();

  let guessedIndex = -1;
  const getInitialIndex = (): number => {
    if (params.index !== undefined) {
      return params.index;
    }

    if (params.indexGuessBehavior === IndexGuessBehavior.GuessFromOrder) {
      if (guessedIndex === -1) {
        guessedIndex = nextIndexRef.current;
        nextIndexRef.current += 1;
      }
      return guessedIndex;
    }

    return -1;
  };

  const [index, setIndex] = createSignal<number>(getInitialIndex(), {
    pureWrite: true,
  });

  const [componentRef, setComponentRef] = createSignal<HTMLElement | null>(null, {
    pureWrite: true,
  });

  const setElementAndLabelByIndex = (targetIndex: number, node: HTMLElement) => {
    elementsRef.current[targetIndex] = node;

    if (labelsRef !== undefined) {
      const isLabelDefined = params.label !== undefined;
      if (isLabelDefined) {
        labelsRef.current[targetIndex] = params.label ?? null;
      } else {
        labelsRef.current[targetIndex] =
          params.textRef?.current?.textContent ?? node.textContent ?? null;
      }
    }
  };

  const ref = (node: HTMLElement | null) => {
    setComponentRef((previous) => (previous === node ? previous : node));

    if (node !== null) {
      const currentIndex = untrack(index);
      if (currentIndex !== -1) {
        setElementAndLabelByIndex(currentIndex, node);
      }
    }
  };

  createTrackedEffect(() => {
    const node = componentRef();

    if (params.index !== undefined || node === null) {
      return;
    }

    const unsubscribe = subscribeMapChange((map) => {
      const mappedIndex = map.get(node)?.index;
      if (mappedIndex !== undefined) {
        setIndex(mappedIndex);
        setElementAndLabelByIndex(mappedIndex, node);
      }
    });

    register(node, params.metadata);

    onCleanup(() => {
      unsubscribe();
      unregister(node);
    });
  });

  return {
    ref,
    index,
  };
}
