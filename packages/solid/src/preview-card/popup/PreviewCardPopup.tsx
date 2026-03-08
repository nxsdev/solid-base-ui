import { createEffect, createMemo, onCleanup, type JSX, type ValidComponent } from "solid-js";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { useDialogPortalContext } from "../../dialog/portal/DialogPortalContext";
import type { DialogInteractionType } from "../../dialog/root/DialogRoot";
import { useDialogRootContext } from "../../dialog/root/DialogRootContext";
import { usePreviewCardPositionerContext } from "../positioner/PreviewCardPositionerContext";
import { PreviewCardPopupDataAttributes } from "./PreviewCardPopupDataAttributes";

/**
 * A container for the preview card contents.
 */
export function PreviewCardPopup(props: PreviewCardPopup.Props) {
  useDialogPortalContext();

  const previewCardRootContext = useDialogRootContext();
  const positionerContext = usePreviewCardPositionerContext(true);

  const generatedId = useBaseUiId();
  const id = createMemo<string>(() => (typeof props.id === "string" ? props.id : generatedId));

  createEffect(id, (popupId) => {
    previewCardRootContext.setPopupId(popupId);

    onCleanup(() => {
      if (previewCardRootContext.popupId() === popupId) {
        previewCardRootContext.setPopupId(undefined);
      }
    });
  });

  createEffect(
    () => [props.initialFocus, props.finalFocus] as const,
    ([initialFocus, finalFocus]) => {
      previewCardRootContext.setInitialFocusResolver(() =>
        resolveFocusTarget({
          option: initialFocus,
          interactionType: "keyboard",
          fallback: () => getDefaultInitialFocusTarget(previewCardRootContext.popupElement()),
        }),
      );

      previewCardRootContext.setFinalFocusResolver(() =>
        resolveFocusTarget({
          option: finalFocus,
          interactionType: "keyboard",
          fallback: () => undefined,
        }),
      );

      onCleanup(() => {
        previewCardRootContext.setInitialFocusResolver(null);
        previewCardRootContext.setFinalFocusResolver(null);
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
        previewCardRootContext.setPopupElement(element);
        callRef(props.ref, element);
      }}
      role={previewCardRootContext.role()}
      tabindex={-1}
      hidden={!previewCardRootContext.mounted()}
      aria-modal={previewCardRootContext.modal() === true ? "true" : undefined}
      aria-labelledby={previewCardRootContext.titleElementId()}
      aria-describedby={previewCardRootContext.descriptionElementId()}
      {...{
        [PreviewCardPopupDataAttributes.open]: previewCardRootContext.open() ? "" : undefined,
        [PreviewCardPopupDataAttributes.closed]: previewCardRootContext.open() ? undefined : "",
        [PreviewCardPopupDataAttributes.side]: side(),
        [PreviewCardPopupDataAttributes.align]: align(),
      }}
    >
      {props.children}
    </div>
  );
}

export type PreviewCardFocusOption =
  | boolean
  | { current: HTMLElement | null }
  | ((interactionType: DialogInteractionType) => boolean | HTMLElement | null | void);

export interface PreviewCardPopupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  initialFocus?: PreviewCardFocusOption | undefined;
  finalFocus?: PreviewCardFocusOption | undefined;
  render?: ValidComponent | undefined;
}

export interface PreviewCardPopupState {
  open: boolean;
}

export namespace PreviewCardPopup {
  export type Props = PreviewCardPopupProps;
  export type State = PreviewCardPopupState;
}

interface ResolveFocusTargetOptions {
  option: PreviewCardFocusOption | undefined;
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
