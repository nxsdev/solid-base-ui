import { createEffect, createMemo, onCleanup, type JSX, type ValidComponent } from "solid-js";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { useDialogPortalContext } from "../../dialog/portal/DialogPortalContext";
import type { DialogInteractionType } from "../../dialog/root/DialogRoot";
import { useDialogRootContext } from "../../dialog/root/DialogRootContext";
import { usePopoverPositionerContext } from "../positioner/PopoverPositionerContext";
import { PopoverPopupDataAttributes } from "./PopoverPopupDataAttributes";

/**
 * A container for the popover contents.
 */
export function PopoverPopup(props: PopoverPopup.Props) {
  useDialogPortalContext();

  const popoverRootContext = useDialogRootContext();
  const positionerContext = usePopoverPositionerContext(true);

  const generatedId = useBaseUiId();
  const id = createMemo<string>(() => (typeof props.id === "string" ? props.id : generatedId));

  createEffect(id, (popupId) => {
    popoverRootContext.setPopupId(popupId);

    onCleanup(() => {
      if (popoverRootContext.popupId() === popupId) {
        popoverRootContext.setPopupId(undefined);
      }
    });
  });

  createEffect(
    () => [props.initialFocus, props.finalFocus] as const,
    ([initialFocus, finalFocus]) => {
      popoverRootContext.setInitialFocusResolver(() =>
        resolveFocusTarget({
          option: initialFocus,
          interactionType: "keyboard",
          fallback: () => getDefaultInitialFocusTarget(popoverRootContext.popupElement()),
        }),
      );

      popoverRootContext.setFinalFocusResolver(() =>
        resolveFocusTarget({
          option: finalFocus,
          interactionType: "keyboard",
          fallback: () => undefined,
        }),
      );

      onCleanup(() => {
        popoverRootContext.setInitialFocusResolver(null);
        popoverRootContext.setFinalFocusResolver(null);
      });
    },
  );

  const side = createMemo(() => positionerContext?.side() ?? "bottom");
  const align = createMemo(() => positionerContext?.align() ?? "center");

  const elementProps = createMemo<JSX.HTMLAttributes<HTMLDivElement>>(() => {
    const {
      children: _children,
      id: _id,
      render: _render,
      initialFocus: _initialFocus,
      finalFocus: _finalFocus,
      ref: _ref,
      ...rest
    } = props;
    void _children;
    void _id;
    void _render;
    void _initialFocus;
    void _finalFocus;
    void _ref;
    return rest;
  });

  return (
    <div
      {...elementProps()}
      id={id()}
      ref={(element) => {
        popoverRootContext.setPopupElement(element);
        callRef(props.ref, element);
      }}
      role={popoverRootContext.role()}
      tabindex={-1}
      hidden={!popoverRootContext.mounted()}
      aria-modal={popoverRootContext.modal() === true ? "true" : undefined}
      aria-labelledby={popoverRootContext.titleElementId()}
      aria-describedby={popoverRootContext.descriptionElementId()}
      {...{
        [PopoverPopupDataAttributes.open]: popoverRootContext.open() ? "" : undefined,
        [PopoverPopupDataAttributes.closed]: popoverRootContext.open() ? undefined : "",
        [PopoverPopupDataAttributes.side]: side(),
        [PopoverPopupDataAttributes.align]: align(),
      }}
    >
      {props.children}
    </div>
  );
}

export type PopoverFocusOption =
  | boolean
  | { current: HTMLElement | null }
  | ((interactionType: DialogInteractionType) => boolean | HTMLElement | null | void);

export interface PopoverPopupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  initialFocus?: PopoverFocusOption | undefined;
  finalFocus?: PopoverFocusOption | undefined;
  render?: ValidComponent | undefined;
}

export interface PopoverPopupState {
  open: boolean;
}

export namespace PopoverPopup {
  export type Props = PopoverPopupProps;
  export type State = PopoverPopupState;
}

interface ResolveFocusTargetOptions {
  option: PopoverFocusOption | undefined;
  interactionType: DialogInteractionType;
  fallback: () => HTMLElement | null | undefined;
}

function resolveFocusTarget(parameters: ResolveFocusTargetOptions): HTMLElement | null | undefined {
  const { option, interactionType, fallback } = parameters;

  if (option === undefined || option === true || option === null) {
    return fallback();
  }

  if (option === false) {
    return null;
  }

  if (typeof option === "function") {
    const value = option(interactionType);

    if (value === true || value === null) {
      return fallback();
    }

    if (value === false || value === undefined) {
      return null;
    }

    return value;
  }

  return option.current ?? fallback();
}

function getDefaultInitialFocusTarget(
  popupElement: HTMLElement | null,
): HTMLElement | null | undefined {
  if (popupElement === null) {
    return undefined;
  }

  const focusableElement = popupElement.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
  if (focusableElement !== null) {
    return focusableElement;
  }

  return popupElement;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function callRef<TElement extends HTMLElement>(
  ref: JSX.Ref<TElement> | undefined,
  element: TElement | null,
): void {
  if (typeof ref === "function" && element !== null) {
    ref(element);
  }
}
