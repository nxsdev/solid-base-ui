import {
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  onCleanup,
  type Accessor,
  type JSX,
  untrack,
} from "solid-js";
import type { CollapsibleTransitionStatus } from "../root/CollapsibleRoot";
import { useCollapsibleRootContext } from "../root/CollapsibleRootContext";
import { CollapsiblePanelCssVars } from "./CollapsiblePanelCssVars";

export interface UseCollapsiblePanelParameters {
  hiddenUntilFound: Accessor<boolean>;
  keepMounted: Accessor<boolean>;
  onTransitionStatusChange?: ((status: CollapsibleTransitionStatus) => void) | undefined;
}

export interface UseCollapsiblePanelReturnValue {
  hidden: Accessor<boolean | "until-found" | undefined>;
  ref: (node: HTMLDivElement | null) => void;
  shouldRender: Accessor<boolean>;
  style: Accessor<JSX.CSSProperties>;
  transitionStatus: Accessor<CollapsibleTransitionStatus>;
}

type MotionKind = "none" | "transition" | "animation";

interface Dimensions {
  height: number | undefined;
  width: number | undefined;
}

export function useCollapsiblePanel(
  parameters: UseCollapsiblePanelParameters,
): UseCollapsiblePanelReturnValue {
  const context = useCollapsibleRootContext();
  const handleBeforeMatch = (event: Event): void => {
    context.onOpenChange(true, event, undefined, "none");
  };

  const [panelElement, setPanelElement] = createSignal<HTMLDivElement | null>(null, {
    pureWrite: true,
  });
  const [present, setPresent] = createSignal(
    untrack(() => context.open() || parameters.keepMounted() || parameters.hiddenUntilFound()),
    { pureWrite: true },
  );
  const [transitionStatus, setTransitionStatus] = createSignal<CollapsibleTransitionStatus>(
    "idle",
    { pureWrite: true },
  );
  const [dimensions, setDimensions] = createSignal<Dimensions>(
    {
      height: undefined,
      width: undefined,
    },
    { pureWrite: true },
  );

  let cleanupMotion: (() => void) | undefined;
  let startingFrame = -1;

  const cancelStartingFrame = (): void => {
    if (startingFrame !== -1) {
      cancelAnimationFrame(startingFrame);
      startingFrame = -1;
    }
  };

  const cleanupActiveMotion = (): void => {
    cleanupMotion?.();
    cleanupMotion = undefined;
  };

  const setMeasuredDimensions = (element: HTMLElement): void => {
    setDimensions({
      height: element.scrollHeight,
      width: element.scrollWidth,
    });
  };

  const clearDimensions = (): void => {
    setDimensions({
      height: undefined,
      width: undefined,
    });
  };

  const updateTransitionStatus = (status: CollapsibleTransitionStatus): void => {
    setTransitionStatus(status);
    parameters.onTransitionStatusChange?.(status);
  };

  const syncBeforeMatchListener = (
    element: HTMLDivElement | null,
    hiddenUntilFound: boolean,
  ): void => {
    if (element === null) {
      return;
    }

    element.removeEventListener("beforematch", handleBeforeMatch);

    if (hiddenUntilFound) {
      element.addEventListener("beforematch", handleBeforeMatch);
    }
  };

  const finishOpen = (): void => {
    updateTransitionStatus("idle");
    clearDimensions();
  };

  const finishClose = (): void => {
    updateTransitionStatus("idle");
    clearDimensions();

    if (!parameters.keepMounted() && !parameters.hiddenUntilFound()) {
      setPresent(false);
    }
  };

  const hidden = createMemo<boolean | "until-found" | undefined>(() => {
    if (context.open()) {
      return undefined;
    }

    if (transitionStatus() === "ending") {
      return undefined;
    }

    if (parameters.hiddenUntilFound()) {
      return "until-found";
    }

    if (parameters.keepMounted()) {
      return true;
    }

    return undefined;
  });

  const style = createMemo<JSX.CSSProperties>(() => ({
    [CollapsiblePanelCssVars.collapsiblePanelHeight]:
      dimensions().height === undefined ? "auto" : `${dimensions().height}px`,
    [CollapsiblePanelCssVars.collapsiblePanelWidth]:
      dimensions().width === undefined ? "auto" : `${dimensions().width}px`,
  }));

  createEffect(
    () =>
      [
        context.open(),
        parameters.keepMounted(),
        parameters.hiddenUntilFound(),
        panelElement(),
      ] as const,
    ([open, _keepMounted, _hiddenUntilFound, element]) => {
      if (open) {
        setPresent(true);
      }

      cancelStartingFrame();
      cleanupActiveMotion();

      if (element === null) {
        if (!open) {
          updateTransitionStatus("idle");
        }
        return;
      }

      const motion = getMotionKind(element);

      if (open) {
        setMeasuredDimensions(element);

        if (motion === "none") {
          finishOpen();
          return;
        }

        updateTransitionStatus("starting");
        startingFrame = requestAnimationFrame(() => {
          startingFrame = -1;
          finishOpen();
        });
        return;
      }

      if (!parameters.keepMounted() && !parameters.hiddenUntilFound() && motion === "none") {
        finishClose();
        return;
      }

      if (motion === "none") {
        updateTransitionStatus("idle");
        clearDimensions();
        return;
      }

      setMeasuredDimensions(element);
      updateTransitionStatus("ending");
      cleanupMotion = waitForMotionComplete(element, finishClose);
    },
  );

  createEffect(
    () => [parameters.keepMounted(), parameters.hiddenUntilFound()] as const,
    ([keepMounted, hiddenUntilFound]) => {
      if (keepMounted || hiddenUntilFound) {
        setPresent(true);
      } else if (!context.open() && transitionStatus() === "idle") {
        setPresent(false);
      }
    },
  );

  createRenderEffect(
    () => [panelElement(), parameters.hiddenUntilFound()] as const,
    ([element, hiddenUntilFound]) => {
      syncBeforeMatchListener(element, hiddenUntilFound);

      onCleanup(() => {
        element?.removeEventListener("beforematch", handleBeforeMatch);
      });
    },
  );

  onCleanup(() => {
    cancelStartingFrame();
    cleanupActiveMotion();
  });

  return {
    hidden,
    ref: (node) => {
      syncBeforeMatchListener(node, parameters.hiddenUntilFound());
      setPanelElement(node);
    },
    shouldRender: () => parameters.keepMounted() || parameters.hiddenUntilFound() || present(),
    style,
    transitionStatus,
  };
}

function getMotionKind(element: HTMLElement): MotionKind {
  const styles = getComputedStyle(element);
  const hasTransition = getMaxTime(styles.transitionDuration, styles.transitionDelay) > 0;
  const hasAnimation =
    hasNamedAnimation(styles.animationName) &&
    getMaxTime(styles.animationDuration, styles.animationDelay) > 0;

  if (hasTransition) {
    return "transition";
  }

  if (hasAnimation) {
    return "animation";
  }

  return "none";
}

function hasNamedAnimation(animationName: string): boolean {
  return animationName
    .split(",")
    .map((entry) => entry.trim())
    .some((entry) => entry !== "" && entry !== "none");
}

function getMaxTime(durationList: string, delayList: string): number {
  const durations = parseTimes(durationList);
  const delays = parseTimes(delayList);
  const length = Math.max(durations.length, delays.length);

  let max = 0;

  for (let index = 0; index < length; index += 1) {
    const duration = durations[index % Math.max(durations.length, 1)] ?? 0;
    const delay = delays[index % Math.max(delays.length, 1)] ?? 0;
    max = Math.max(max, duration + delay);
  }

  return max;
}

function parseTimes(value: string): number[] {
  return value.split(",").map((entry) => {
    const trimmed = entry.trim();

    if (trimmed.endsWith("ms")) {
      return Number.parseFloat(trimmed);
    }

    if (trimmed.endsWith("s")) {
      return Number.parseFloat(trimmed) * 1000;
    }

    return 0;
  });
}

function waitForMotionComplete(element: HTMLElement, onComplete: () => void): () => void {
  let settled = false;

  const complete = (): void => {
    if (settled) {
      return;
    }

    settled = true;
    cleanup();
    onComplete();
  };

  const handleEvent = (event: Event): void => {
    if (event.target === element) {
      complete();
    }
  };

  const timeout = window.setTimeout(() => {
    complete();
  }, getFallbackTimeout(element));

  const cleanup = (): void => {
    clearTimeout(timeout);
    element.removeEventListener("transitionend", handleEvent);
    element.removeEventListener("animationend", handleEvent);
    element.removeEventListener("transitioncancel", handleEvent);
    element.removeEventListener("animationcancel", handleEvent);
  };

  element.addEventListener("transitionend", handleEvent);
  element.addEventListener("animationend", handleEvent);
  element.addEventListener("transitioncancel", handleEvent);
  element.addEventListener("animationcancel", handleEvent);

  return cleanup;
}

function getFallbackTimeout(element: HTMLElement): number {
  const styles = getComputedStyle(element);
  const transitionTime = getMaxTime(styles.transitionDuration, styles.transitionDelay);
  const animationTime = hasNamedAnimation(styles.animationName)
    ? getMaxTime(styles.animationDuration, styles.animationDelay)
    : 0;

  return Math.max(transitionTime, animationTime, 0) + 50;
}
