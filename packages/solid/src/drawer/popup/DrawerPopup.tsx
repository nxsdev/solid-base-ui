import {
  createEffect,
  createMemo,
  onCleanup,
  untrack,
  type JSX,
  type ValidComponent,
} from "solid-js";
import { useBaseUiId } from "../../utils/useBaseUiId";
import type { DialogInteractionType } from "../../dialog/root/DialogRoot";
import { useDialogPortalContext } from "../../dialog/portal/DialogPortalContext";
import { useDialogRootContext } from "../../dialog/root/DialogRootContext";
import { useDrawerRootContext } from "../root/DrawerRootContext";
import { DrawerPopupCssVars } from "./DrawerPopupCssVars";
import { DrawerPopupDataAttributes } from "./DrawerPopupDataAttributes";

/**
 * A container for the drawer contents.
 */
export function DrawerPopup(props: DrawerPopup.Props) {
  useDialogPortalContext();

  const dialogRootContext = useDialogRootContext();
  const drawerRootContext = useDrawerRootContext();

  const generatedId = useBaseUiId();
  const id = createMemo<string>(() => (typeof props.id === "string" ? props.id : generatedId));

  createEffect(id, (popupId) => {
    dialogRootContext.setPopupId(popupId);

    onCleanup(() => {
      if (untrack(dialogRootContext.popupId) === popupId) {
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
          fallback: () => untrack(dialogRootContext.popupElement),
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

  createEffect(
    () => [dialogRootContext.open(), dialogRootContext.popupElement(), props.initialFocus] as const,
    ([open, popupElement, initialFocus]) => {
      if (!open || popupElement === null || !shouldFocusPopupByDefault(initialFocus)) {
        return;
      }

      queueMicrotask(() => {
        const stillOpen = untrack(dialogRootContext.open);
        const currentPopupElement = untrack(dialogRootContext.popupElement);

        if (!stillOpen || currentPopupElement !== popupElement) {
          return;
        }

        popupElement.focus();
      });
    },
  );

  createEffect(
    () => [dialogRootContext.open(), drawerRootContext.frontmostHeight()] as const,
    ([open, frontmostHeight]) => {
      drawerRootContext.notifyParentFrontmostHeight?.(open ? frontmostHeight : 0);
    },
  );

  createEffect(dialogRootContext.popupElement, (element) => {
    if (element === null) {
      drawerRootContext.onPopupHeightChange(0);
      return;
    }

    const measure = () => {
      drawerRootContext.onPopupHeightChange(element.offsetHeight);
    };

    measure();

    if (typeof ResizeObserver !== "function") {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    onCleanup(() => {
      observer.disconnect();
    });
  });

  const nestedDrawerOpen = createMemo<boolean>(() => dialogRootContext.nestedOpenDialogCount() > 0);
  const expanded = createMemo<boolean>(() => {
    const snapPoints = drawerRootContext.snapPoints();
    const activeSnapPoint = drawerRootContext.activeSnapPoint();

    if (snapPoints === undefined || snapPoints.length === 0 || activeSnapPoint === null) {
      return false;
    }

    const expandedSnapPoint = findExpandedSnapPoint(snapPoints);

    return expandedSnapPoint !== undefined && Object.is(expandedSnapPoint, activeSnapPoint);
  });

  const style = createMemo<JSX.CSSProperties>(() => {
    const inputStyle = toStyleObject(props.style);
    const popupHeight = drawerRootContext.popupHeight();
    const frontmostHeight = drawerRootContext.frontmostHeight();

    return {
      [DrawerPopupCssVars.nestedDrawers]: String(dialogRootContext.nestedOpenDialogCount()),
      [DrawerPopupCssVars.height]: popupHeight > 0 ? `${popupHeight}px` : undefined,
      [DrawerPopupCssVars.frontmostHeight]:
        frontmostHeight > 0 ? `${frontmostHeight}px` : undefined,
      [DrawerPopupCssVars.swipeMovementX]: "0px",
      [DrawerPopupCssVars.swipeMovementY]: "0px",
      [DrawerPopupCssVars.snapPointOffset]: "0px",
      [DrawerPopupCssVars.swipeStrength]: "1",
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

  const popupAttributes = createMemo<JSX.HTMLAttributes<HTMLDivElement>>(() => {
    const open = dialogRootContext.open();

    return {
      role: dialogRootContext.role(),
      tabindex: -1,
      hidden: !dialogRootContext.mounted(),
      "aria-modal": dialogRootContext.modal() === true ? "true" : undefined,
      "aria-labelledby": dialogRootContext.titleElementId(),
      "aria-describedby": dialogRootContext.descriptionElementId(),
      [DrawerPopupDataAttributes.open]: open ? "" : undefined,
      [DrawerPopupDataAttributes.closed]: open ? undefined : "",
      [DrawerPopupDataAttributes.expanded]: expanded() ? "" : undefined,
      [DrawerPopupDataAttributes.nestedDrawerOpen]: nestedDrawerOpen() ? "" : undefined,
      [DrawerPopupDataAttributes.nestedDrawerSwiping]: drawerRootContext.nestedSwiping()
        ? ""
        : undefined,
      [DrawerPopupDataAttributes.swipeDirection]: drawerRootContext.swipeDirection(),
    };
  });

  return (
    <div
      {...elementProps()}
      {...popupAttributes()}
      id={id()}
      ref={(element) => {
        dialogRootContext.setPopupElement(element);
        callRef(props.ref, element);
      }}
      style={style()}
    >
      {props.children}
    </div>
  );
}

export type DrawerFocusOption =
  | boolean
  | { current: HTMLElement | null }
  | ((interactionType: DialogInteractionType) => boolean | HTMLElement | null | void);

export interface DrawerPopupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  initialFocus?: DrawerFocusOption | undefined;
  finalFocus?: DrawerFocusOption | undefined;
  render?: ValidComponent | undefined;
}

export interface DrawerPopupState {
  open: boolean;
  expanded: boolean;
  nestedDrawerOpen: boolean;
  nestedDrawerSwiping: boolean;
  swiping: boolean;
  swipeDirection: "up" | "down" | "left" | "right";
}

export namespace DrawerPopup {
  export type Props = DrawerPopupProps;
  export type State = DrawerPopupState;
}

interface ResolveFocusTargetOptions {
  option: DrawerFocusOption | undefined;
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

function shouldFocusPopupByDefault(initialFocus: DrawerFocusOption | undefined): boolean {
  return initialFocus === undefined || initialFocus === true || initialFocus === null;
}

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

function findExpandedSnapPoint(
  snapPoints: readonly (string | number)[],
): string | number | undefined {
  let candidate: string | number | undefined;
  let candidateScore = Number.NEGATIVE_INFINITY;

  for (const snapPoint of snapPoints) {
    const score = resolveSnapPointScore(snapPoint);

    if (score > candidateScore) {
      candidate = snapPoint;
      candidateScore = score;
    }
  }

  return candidate;
}

function resolveSnapPointScore(snapPoint: string | number): number {
  if (typeof snapPoint === "number") {
    return snapPoint;
  }

  const trimmed = snapPoint.trim();

  if (trimmed.endsWith("%")) {
    const value = Number.parseFloat(trimmed.slice(0, Math.max(0, trimmed.length - 1)));
    return Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY;
  }

  if (trimmed.endsWith("px")) {
    const value = Number.parseFloat(trimmed.slice(0, Math.max(0, trimmed.length - 2)));
    return Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY;
  }

  const value = Number.parseFloat(trimmed);
  return Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY;
}
