import { createMemo, type JSX, type ValidComponent } from "solid-js";
import { Dynamic } from "@solidjs/web";
import { combinePropsList } from "../../merge-props/combineProps";
import { useCompositeItem, IndexGuessBehavior } from "./useCompositeItem";

/**
 * Internal composite item with roving tab index behavior.
 */
export function CompositeItem(props: CompositeItem.Props) {
  const { compositeProps, compositeRef } = useCompositeItem<HTMLElement>({
    metadata: props.metadata,
    indexGuessBehavior: props.indexGuessBehavior,
  });

  const elementProps = createMemo(() => {
    const {
      render: _render,
      metadata: _metadata,
      indexGuessBehavior: _indexGuessBehavior,
      children: _children,
      ref: _ref,
      ...rest
    } = props;

    void _render;
    void _metadata;
    void _indexGuessBehavior;
    void _children;
    void _ref;

    return rest;
  });

  const mergedProps = () => combinePropsList([compositeProps(), elementProps()]);

  const handleRef: JSX.Ref<HTMLElement> = (node) => {
    compositeRef(node);

    if (typeof props.ref === "function") {
      props.ref(node);
    }
  };

  return (
    <Dynamic component={props.render ?? "div"} ref={handleRef} {...mergedProps()}>
      {props.children}
    </Dynamic>
  );
}

export interface CompositeItemProps extends Omit<JSX.HTMLAttributes<HTMLElement>, "onChange"> {
  render?: ValidComponent | undefined;
  metadata?: Record<string, unknown> | undefined;
  indexGuessBehavior?: IndexGuessBehavior | undefined;
}

export namespace CompositeItem {
  export type Props = CompositeItemProps;
}
