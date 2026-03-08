import { createEffect, createMemo, onCleanup, type JSX, type ValidComponent } from "solid-js";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { useDialogRootContext } from "../../dialog/root/DialogRootContext";
import { useTooltipPositionerContext } from "../positioner/TooltipPositionerContext";
import { TooltipPopupDataAttributes } from "./TooltipPopupDataAttributes";

/**
 * A container for the tooltip contents.
 */
export function TooltipPopup(props: TooltipPopup.Props) {
  const tooltipRootContext = useDialogRootContext();
  const positionerContext = useTooltipPositionerContext(true);

  const generatedId = useBaseUiId();
  const id = createMemo<string>(() => (typeof props.id === "string" ? props.id : generatedId));

  createEffect(id, (popupId) => {
    tooltipRootContext.setPopupId(popupId);

    onCleanup(() => {
      if (tooltipRootContext.popupId() === popupId) {
        tooltipRootContext.setPopupId(undefined);
      }
    });
  });

  const side = createMemo(() => positionerContext?.side() ?? "top");
  const align = createMemo(() => positionerContext?.align() ?? "center");

  const elementProps = createMemo<JSX.HTMLAttributes<HTMLDivElement>>(() => {
    const { children: _children, id: _id, render: _render, ref: _ref, ...rest } = props;
    void _children;
    void _id;
    void _render;
    void _ref;
    return rest;
  });

  return (
    <div
      {...elementProps()}
      id={id()}
      ref={(element) => {
        tooltipRootContext.setPopupElement(element);
        callRef(props.ref, element);
      }}
      role="tooltip"
      hidden={!tooltipRootContext.mounted()}
      {...{
        [TooltipPopupDataAttributes.open]: tooltipRootContext.open() ? "" : undefined,
        [TooltipPopupDataAttributes.closed]: tooltipRootContext.open() ? undefined : "",
        [TooltipPopupDataAttributes.side]: side(),
        [TooltipPopupDataAttributes.align]: align(),
      }}
    >
      {props.children}
    </div>
  );
}

export interface TooltipPopupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: ValidComponent | undefined;
}

export interface TooltipPopupState {
  open: boolean;
}

export namespace TooltipPopup {
  export type Props = TooltipPopupProps;
  export type State = TooltipPopupState;
}

function callRef<TElement extends HTMLElement>(
  ref: JSX.Ref<TElement> | undefined,
  element: TElement | null,
): void {
  if (typeof ref === "function" && element !== null) {
    ref(element);
  }
}
