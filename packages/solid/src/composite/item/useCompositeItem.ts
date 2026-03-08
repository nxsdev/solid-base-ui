import { createMemo, type Accessor } from "solid-js";
import {
  IndexGuessBehavior,
  useCompositeListItem,
  type UseCompositeListItemParameters,
} from "../list/useCompositeListItem";
import { useCompositeRootContext } from "../root/CompositeRootContext";
import type { DomProps } from "../../merge-props/combineProps";

export interface UseCompositeItemParameters extends Pick<
  UseCompositeListItemParameters,
  "metadata" | "indexGuessBehavior"
> {}

export interface UseCompositeItemReturnValue<TElement extends HTMLElement = HTMLElement> {
  compositeProps: Accessor<DomProps<TElement>>;
  compositeRef: (node: TElement | null) => void;
  index: Accessor<number>;
}

export { IndexGuessBehavior };

export function useCompositeItem<TElement extends HTMLElement = HTMLElement>(
  params: UseCompositeItemParameters = {},
): UseCompositeItemReturnValue<TElement> {
  const { highlightItemOnHover, highlightedIndex, onHighlightedIndexChange } =
    useCompositeRootContext();

  const { ref, index } = useCompositeListItem({
    metadata: params.metadata,
    indexGuessBehavior: params.indexGuessBehavior,
  });

  const isHighlighted = createMemo(() => highlightedIndex() === index());

  let itemRef: TElement | null = null;

  const compositeRef = (node: TElement | null) => {
    itemRef = node;
    ref(node);
  };

  const compositeProps = createMemo<DomProps<TElement>>(() => ({
    tabindex: isHighlighted() ? 0 : -1,
    onFocus() {
      onHighlightedIndexChange(index());
    },
    onMouseMove() {
      if (!highlightItemOnHover() || itemRef === null) {
        return;
      }

      const disabled =
        itemRef.hasAttribute("disabled") || itemRef.getAttribute("aria-disabled") === "true";

      if (!isHighlighted() && !disabled) {
        itemRef.focus();
      }
    },
  }));

  return {
    compositeProps,
    compositeRef,
    index,
  };
}
