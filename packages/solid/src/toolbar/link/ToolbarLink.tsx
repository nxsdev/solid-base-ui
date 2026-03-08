import { Dynamic } from "../../internal/Dynamic";
import { createMemo, type JSX, type ValidComponent } from "solid-js";
import { useCompositeItem } from "../../composite/item/useCompositeItem";
import { combinePropsList } from "../../merge-props/combineProps";
import type { ToolbarRoot } from "../root/ToolbarRoot";
import { useToolbarRootContext } from "../root/ToolbarRootContext";

const TOOLBAR_LINK_METADATA: ToolbarRoot.ItemMetadata = {
  focusableWhenDisabled: true,
};

/**
 * A link that integrates with toolbar keyboard navigation.
 */
export function ToolbarLink(props: ToolbarLink.Props) {
  const rootContext = useToolbarRootContext();

  const { compositeProps, compositeRef } = useCompositeItem<HTMLAnchorElement>({
    metadata: TOOLBAR_LINK_METADATA,
  });

  const component = createMemo<ValidComponent>(() => props.render ?? "a");
  const elementProps = createMemo<Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "ref">>(() => {
    const { render: _render, children: _children, ref: _ref, ...rest } = props;
    void _render;
    void _children;
    void _ref;
    return rest;
  });
  const mergedProps = createMemo(() =>
    combinePropsList<HTMLAnchorElement>([compositeProps(), elementProps()]),
  );

  const handleRef: JSX.Ref<HTMLAnchorElement> = (node) => {
    compositeRef(node);

    if (typeof props.ref === "function") {
      props.ref(node);
    }
  };

  return (
    <Dynamic
      component={component()}
      ref={handleRef}
      data-orientation={rootContext.orientation()}
      {...mergedProps()}
    >
      {props.children}
    </Dynamic>
  );
}

export interface ToolbarLinkState {
  orientation: ToolbarRoot.Orientation;
}

export interface ToolbarLinkProps extends Omit<
  JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
  "onChange"
> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export namespace ToolbarLink {
  export type State = ToolbarLinkState;
  export type Props = ToolbarLinkProps;
}
