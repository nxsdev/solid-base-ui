import { createEffect, createMemo, createSignal, onCleanup, untrack, type JSX } from "solid-js";
import type { BaseUIChangeEventDetails } from "../../types";
import { createChangeEventDetails } from "../../utils/createChangeEventDetails";
import { useBaseUiId } from "../../utils/useBaseUiId";
import {
  DialogRoot,
  type DialogRootActions,
  type DialogRootActionsRef,
  type DialogRootChangeEventDetails,
  type DialogRootChangeEventReason,
  type DialogRootChildrenRenderProps,
} from "../../dialog/root/DialogRoot";
import { useDialogRootContext } from "../../dialog/root/DialogRootContext";
import type { DialogHandle } from "../../dialog/store/DialogHandle";
import { useDrawerProviderContext } from "../provider/DrawerProviderContext";
import {
  DrawerRootContext,
  type DrawerNestedSwipeProgressStore,
  type DrawerRootContextValue,
  type DrawerSnapPoint,
  type DrawerSwipeDirection,
  useDrawerRootContext,
} from "./DrawerRootContext";

/**
 * Groups all parts of the drawer.
 * Doesn't render its own HTML element.
 */
export function DrawerRoot<Payload = unknown>(props: DrawerRoot.Props<Payload>) {
  const parentDrawerRootContext = useDrawerRootContext(true);
  const drawerProviderContext = useDrawerProviderContext(true);
  const drawerId = useBaseUiId();

  const notifyParentSwipeProgressChange = parentDrawerRootContext?.onNestedSwipeProgressChange;
  const notifyParentFrontmostHeight = parentDrawerRootContext?.onNestedFrontmostHeightChange;
  const notifyParentSwipingChange = parentDrawerRootContext?.onNestedSwipingChange;
  const notifyParentHasNestedDrawer = parentDrawerRootContext?.onNestedDrawerPresenceChange;

  const [popupHeight, setPopupHeight] = createSignal(0);
  const [frontmostHeight, setFrontmostHeight] = createSignal(0);
  const [hasNestedDrawer, setHasNestedDrawer] = createSignal(false);
  const [nestedSwiping, setNestedSwiping] = createSignal(false);
  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(
    untrack(() => props.open ?? props.defaultOpen ?? false),
  );

  let nestedSwipeProgress = 0;
  const nestedSwipeProgressListeners = new Set<() => void>();
  const nestedSwipeProgressStore: DrawerNestedSwipeProgressStore = {
    getSnapshot() {
      return nestedSwipeProgress;
    },
    subscribe(listener) {
      nestedSwipeProgressListeners.add(listener);

      return () => {
        nestedSwipeProgressListeners.delete(listener);
      };
    },
  };

  const swipeDirection = createMemo<DrawerSwipeDirection>(() => props.swipeDirection ?? "down");
  const snapToSequentialPoints = createMemo<boolean>(() => props.snapToSequentialPoints ?? false);
  const snapPoints = createMemo<readonly DrawerSnapPoint[] | undefined>(() => props.snapPoints);
  const resolvedDefaultSnapPoint = createMemo<DrawerSnapPoint | null>(() => {
    if (props.defaultSnapPoint !== undefined) {
      return props.defaultSnapPoint;
    }

    return props.snapPoints?.[0] ?? null;
  });

  const [activeSnapPointState, setActiveSnapPointState] = createSignal<DrawerSnapPoint | null>(
    untrack(() => props.snapPoint ?? resolvedDefaultSnapPoint()),
  );

  const activeSnapPoint = createMemo<DrawerSnapPoint | null>(() => {
    const controlledSnapPoint = props.snapPoint;
    if (controlledSnapPoint !== undefined) {
      return controlledSnapPoint;
    }

    const current = activeSnapPointState();
    const currentSnapPoints = snapPoints();

    if (currentSnapPoints === undefined || currentSnapPoints.length === 0) {
      return current;
    }

    if (current === null || !currentSnapPoints.some((snapPoint) => Object.is(snapPoint, current))) {
      return resolvedDefaultSnapPoint();
    }

    return current;
  });

  const setActiveSnapPoint = (
    nextSnapPoint: DrawerSnapPoint | null,
    eventDetails?: DrawerRoot.SnapPointChangeEventDetails,
  ) => {
    const resolvedEventDetails = eventDetails ?? createChangeEventDetails();

    props.onSnapPointChange?.(nextSnapPoint, resolvedEventDetails);

    if (resolvedEventDetails.isCanceled) {
      return;
    }

    if (props.snapPoint === undefined) {
      setActiveSnapPointState(() => nextSnapPoint);
    }
  };

  const onPopupHeightChange = (height: number) => {
    setPopupHeight(() => height);
    const nestedDrawerPresent = untrack(hasNestedDrawer);

    if (!nestedDrawerPresent && height > 0) {
      setFrontmostHeight(() => height);
      return;
    }

    if (!nestedDrawerPresent && height <= 0) {
      setFrontmostHeight(() => 0);
    }
  };

  const onNestedFrontmostHeightChange = (height: number) => {
    if (height > 0) {
      setFrontmostHeight(() => height);
      return;
    }

    const currentPopupHeight = untrack(popupHeight);
    if (currentPopupHeight > 0) {
      setFrontmostHeight(() => currentPopupHeight);
      return;
    }

    setFrontmostHeight(() => 0);
  };

  const onNestedDrawerPresenceChange = (present: boolean) => {
    setHasNestedDrawer(() => present);
  };

  const onNestedSwipeProgressChange = (progress: number) => {
    nestedSwipeProgress = Number.isFinite(progress) ? progress : 0;

    nestedSwipeProgressListeners.forEach((listener) => {
      listener();
    });

    notifyParentSwipeProgressChange?.(nestedSwipeProgress);
  };

  const onNestedSwipingChange = (swiping: boolean) => {
    setNestedSwiping(() => swiping);
    notifyParentSwipingChange?.(swiping);
  };

  const providerOpen = createMemo<boolean>(() => props.open ?? uncontrolledOpen());

  createEffect(providerOpen, (open) => {
    drawerProviderContext?.setDrawerOpen(drawerId, open);
    notifyParentHasNestedDrawer?.(open);
  });

  createEffect(
    () => [providerOpen(), frontmostHeight()] as const,
    ([open, height]) => {
      notifyParentFrontmostHeight?.(open ? height : 0);
    },
  );

  onCleanup(() => {
    drawerProviderContext?.removeDrawer(drawerId);
    notifyParentHasNestedDrawer?.(false);
    notifyParentFrontmostHeight?.(0);
    notifyParentSwipingChange?.(false);
    notifyParentSwipeProgressChange?.(0);
  });

  const onDialogOpenChange = (open: boolean, eventDetails: DialogRoot.ChangeEventDetails) => {
    props.onOpenChange?.(open, eventDetails);

    if (eventDetails.isCanceled) {
      return;
    }

    if (props.open === undefined) {
      setUncontrolledOpen(() => open);
    }

    const currentSnapPoints = snapPoints();
    if (!open && currentSnapPoints !== undefined && currentSnapPoints.length > 0) {
      setActiveSnapPoint(
        resolvedDefaultSnapPoint(),
        createChangeEventDetails(eventDetails.event, eventDetails.trigger),
      );
    }
  };

  const contextValue: DrawerRootContextValue = {
    swipeDirection,
    snapToSequentialPoints,
    snapPoints,
    activeSnapPoint,
    setActiveSnapPoint,
    frontmostHeight,
    popupHeight,
    hasNestedDrawer,
    nestedSwiping,
    nestedSwipeProgressStore,
    onNestedDrawerPresenceChange,
    onPopupHeightChange,
    onNestedFrontmostHeightChange,
    onNestedSwipingChange,
    onNestedSwipeProgressChange,
    notifyParentFrontmostHeight,
    notifyParentSwipingChange,
    notifyParentSwipeProgressChange,
    notifyParentHasNestedDrawer,
  };

  return (
    <DialogRoot<Payload>
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={onDialogOpenChange}
      onOpenChangeComplete={props.onOpenChangeComplete}
      disablePointerDismissal={props.disablePointerDismissal}
      modal={props.modal}
      actionsRef={props.actionsRef}
      handle={props.handle}
      triggerId={props.triggerId}
      defaultTriggerId={props.defaultTriggerId}
    >
      <DrawerRootContext value={contextValue}>
        <DrawerRootChildrenRenderer<Payload> children={props.children} />
      </DrawerRootContext>
    </DialogRoot>
  );
}

export interface DrawerRootProps<Payload = unknown> {
  /**
   * Whether the drawer is currently open.
   */
  open?: boolean | undefined;
  /**
   * Whether the drawer is initially open.
   */
  defaultOpen?: boolean | undefined;
  /**
   * Determines if the drawer enters a modal state when open.
   * @default true
   */
  modal?: DialogRoot.Modal | undefined;
  /**
   * Event handler called when the drawer is opened or closed.
   */
  onOpenChange?: ((open: boolean, eventDetails: DrawerRoot.ChangeEventDetails) => void) | undefined;
  /**
   * Event handler called after open/close work is complete.
   */
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  /**
   * Whether pointer interactions outside the drawer dismiss it.
   * @default false
   */
  disablePointerDismissal?: boolean | undefined;
  /**
   * A ref to imperative drawer actions.
   */
  actionsRef?: DrawerRoot.ActionsRef | undefined;
  /**
   * A handle used to bind detached triggers.
   */
  handle?: DialogHandle<Payload> | undefined;
  /**
   * ID of the trigger associated with this drawer.
   */
  triggerId?: string | null | undefined;
  /**
   * Initial trigger ID for uncontrolled mode.
   */
  defaultTriggerId?: string | null | undefined;
  /**
   * The content of the drawer.
   */
  children?: JSX.Element | ((props: DrawerRoot.ChildrenRenderProps<Payload>) => JSX.Element);
  /**
   * The swipe direction used to dismiss the drawer.
   * @default "down"
   */
  swipeDirection?: DrawerSwipeDirection | undefined;
  /**
   * Whether snap points can only move sequentially.
   * @default false
   */
  snapToSequentialPoints?: boolean | undefined;
  /**
   * Snap points used by the drawer.
   */
  snapPoints?: readonly DrawerSnapPoint[] | undefined;
  /**
   * Controlled active snap point.
   */
  snapPoint?: DrawerSnapPoint | null | undefined;
  /**
   * Initial snap point for uncontrolled mode.
   */
  defaultSnapPoint?: DrawerSnapPoint | null | undefined;
  /**
   * Event handler called when the snap point changes.
   */
  onSnapPointChange?: (
    snapPoint: DrawerSnapPoint | null,
    eventDetails: DrawerRoot.SnapPointChangeEventDetails,
  ) => void;
}

export type DrawerRootActions = DialogRootActions;
export type DrawerRootActionsRef = DialogRootActionsRef;
export type DrawerRootChangeEventReason = DialogRootChangeEventReason;
export type DrawerRootChangeEventDetails = DialogRootChangeEventDetails;
export type DrawerRootChildrenRenderProps<Payload = unknown> =
  DialogRootChildrenRenderProps<Payload>;

export type DrawerRootSnapPointChangeEventReason = "none";
export type DrawerRootSnapPointChangeEventDetails =
  BaseUIChangeEventDetails<DrawerRootSnapPointChangeEventReason>;

export namespace DrawerRoot {
  export type Props<Payload = unknown> = DrawerRootProps<Payload>;
  export type Actions = DrawerRootActions;
  export type ActionsRef = DrawerRootActionsRef;
  export type ChangeEventReason = DrawerRootChangeEventReason;
  export type ChangeEventDetails = DrawerRootChangeEventDetails;
  export type ChildrenRenderProps<Payload = unknown> = DrawerRootChildrenRenderProps<Payload>;
  export type SnapPointChangeEventReason = DrawerRootSnapPointChangeEventReason;
  export type SnapPointChangeEventDetails = DrawerRootSnapPointChangeEventDetails;
}

interface DrawerRootChildrenRendererProps<Payload = unknown> {
  children: DrawerRootProps<Payload>["children"];
}

function DrawerRootChildrenRenderer<Payload = unknown>(
  props: DrawerRootChildrenRendererProps<Payload>,
) {
  const dialogRootContext = useDialogRootContext();

  if (typeof props.children === "function") {
    const renderChildren = props.children as (
      props: DrawerRoot.ChildrenRenderProps<Payload>,
    ) => JSX.Element;

    return (
      <>
        {renderChildren({
          payload: dialogRootContext.payload() as Payload | undefined,
        })}
      </>
    );
  }

  return <>{props.children}</>;
}
