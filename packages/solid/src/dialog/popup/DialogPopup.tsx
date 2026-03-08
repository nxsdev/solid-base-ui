import { createEffect, createMemo, onCleanup, type JSX, type ValidComponent } from "solid-js";
import { useBaseUiId } from "../../utils/useBaseUiId";
import type { DialogInteractionType } from "../root/DialogRoot";
import { useDialogPortalContext } from "../portal/DialogPortalContext";
import { useDialogRootContext } from "../root/DialogRootContext";
import { DialogPopupCssVars } from "./DialogPopupCssVars";
import { DialogPopupDataAttributes } from "./DialogPopupDataAttributes";

/**
 * A container for the dialog contents.
 */
export function DialogPopup(props: DialogPopup.Props) {
  useDialogPortalContext();

  const dialogRootContext = useDialogRootContext();

  const generatedId = useBaseUiId();
  const id = createMemo<string>(() => (typeof props.id === "string" ? props.id : generatedId));

  createEffect(id, (popupId) => {
    dialogRootContext.setPopupId(popupId);

    onCleanup(() => {
      if (dialogRootContext.popupId() === popupId) {
        dialogRootContext.setPopupId(undefined);
      }
    });
  });

  createEffect(
    () => [props.initialFocus, props.finalFocus] as const,
    ([initialFocus, finalFocus]) => {
      dialogRootContext.setInitialFocusResolver(() =>
        resolveFocusTarget({
          option: initialFocus,
          interactionType: "keyboard",
          fallback: () => getDefaultInitialFocusTarget(dialogRootContext.popupElement()),
        }),
      );

      dialogRootContext.setFinalFocusResolver(() =>
        resolveFocusTarget({
          option: finalFocus,
          interactionType: "keyboard",
          fallback: () => undefined,
        }),
      );

      onCleanup(() => {
        dialogRootContext.setInitialFocusResolver(null);
        dialogRootContext.setFinalFocusResolver(null);
      });
    },
  );

  const nestedDialogOpen = createMemo<boolean>(() => dialogRootContext.nestedOpenDialogCount() > 0);

  const style = createMemo<JSX.CSSProperties>(() => {
    const inputStyle = toStyleObject(props.style);

    return {
      [DialogPopupCssVars.nestedDialogs]: String(dialogRootContext.nestedOpenDialogCount()),
      ...inputStyle,
    };
  });

  const elementProps = createMemo<JSX.HTMLAttributes<HTMLDivElement>>(() => {
    const {
      children: _children,
      id: _id,
      render: _render,
      initialFocus: _initialFocus,
      finalFocus: _finalFocus,
      ref: _ref,
      style: _style,
      ...rest
    } = props;
    void _children;
    void _id;
    void _render;
    void _initialFocus;
    void _finalFocus;
    void _ref;
    void _style;
    return rest;
  });

  return (
    <div
      {...elementProps()}
      id={id()}
      ref={(element) => {
        dialogRootContext.setPopupElement(element);
        callRef(props.ref, element);
      }}
      role={dialogRootContext.role()}
      tabindex={-1}
      hidden={!dialogRootContext.mounted()}
      aria-modal={dialogRootContext.modal() === true ? "true" : undefined}
      aria-labelledby={dialogRootContext.titleElementId()}
      aria-describedby={dialogRootContext.descriptionElementId()}
      {...{
        [DialogPopupDataAttributes.open]: dialogRootContext.open() ? "" : undefined,
        [DialogPopupDataAttributes.closed]: dialogRootContext.open() ? undefined : "",
        [DialogPopupDataAttributes.nested]: dialogRootContext.nested() ? "" : undefined,
        [DialogPopupDataAttributes.nestedDialogOpen]: nestedDialogOpen() ? "" : undefined,
      }}
      style={style()}
    >
      {props.children}
    </div>
  );
}

export type DialogFocusOption =
  | boolean
  | { current: HTMLElement | null }
  | ((interactionType: DialogInteractionType) => boolean | HTMLElement | null | void);

export interface DialogPopupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  initialFocus?: DialogFocusOption | undefined;
  finalFocus?: DialogFocusOption | undefined;
  render?: ValidComponent | undefined;
}

export interface DialogPopupState {
  open: boolean;
  nested: boolean;
  nestedDialogOpen: boolean;
}

export namespace DialogPopup {
  export type Props = DialogPopupProps;
  export type State = DialogPopupState;
}

interface ResolveFocusTargetOptions {
  option: DialogFocusOption | undefined;
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

function toStyleObject(style: JSX.CSSProperties | string | boolean | undefined): JSX.CSSProperties {
  if (style === undefined || typeof style === "string" || typeof style === "boolean") {
    return {};
  }

  return style;
}

function callRef<TElement extends HTMLElement>(
  ref: JSX.Ref<TElement> | undefined,
  element: TElement | null,
): void {
  if (typeof ref === "function" && element !== null) {
    ref(element);
  }
}
