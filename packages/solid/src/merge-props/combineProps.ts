import type { JSX } from "solid-js";

type DataAttributes = {
  [K in `data-${string}`]?: string | number | boolean | undefined;
};

export type DomProps<TElement extends HTMLElement = HTMLElement> = JSX.HTMLAttributes<TElement> &
  DataAttributes & {
    role?: JSX.AriaAttributes["role"] | undefined;
  };

export function combineProps<TElement extends HTMLElement>(
  baseProps: DomProps<TElement> | undefined,
  overrideProps: DomProps<TElement> | undefined,
): DomProps<TElement> {
  const merged: DomProps<TElement> = { ...baseProps };
  const incoming = overrideProps ?? {};

  for (const propName in incoming) {
    const key = propName as keyof DomProps<TElement>;
    const incomingValue = incoming[key];

    if (
      propName === "class" &&
      typeof merged.class === "string" &&
      typeof incomingValue === "string"
    ) {
      merged.class = `${incomingValue} ${merged.class}`;
      continue;
    }

    if (propName === "style" && isStyleObject(merged.style) && isStyleObject(incomingValue)) {
      merged.style = {
        ...merged.style,
        ...incomingValue,
      };
      continue;
    }

    if (isEventProp(propName)) {
      const chained = chainEventHandlers(
        merged[key] as JSX.EventHandlerUnion<TElement, Event> | undefined,
        incomingValue as JSX.EventHandlerUnion<TElement, Event> | undefined,
      );
      merged[key] = chained as DomProps<TElement>[typeof key];
      continue;
    }

    merged[key] = incomingValue;
  }

  return merged;
}

export function combinePropsList<TElement extends HTMLElement>(
  propsList: Array<DomProps<TElement> | undefined>,
): DomProps<TElement> {
  let merged: DomProps<TElement> = {};

  for (const item of propsList) {
    merged = combineProps(merged, item);
  }

  return merged;
}

export function chainEventHandlers<TElement extends HTMLElement, TEvent extends Event>(
  internalHandler: JSX.EventHandlerUnion<TElement, TEvent> | undefined,
  externalHandler: JSX.EventHandlerUnion<TElement, TEvent> | undefined,
): JSX.EventHandlerUnion<TElement, TEvent> | undefined {
  if (externalHandler === undefined) {
    return internalHandler;
  }
  if (internalHandler === undefined) {
    return externalHandler;
  }

  return (event) => {
    runEventHandler(externalHandler, event);
    runEventHandler(internalHandler, event);
  };
}

function runEventHandler<TElement extends HTMLElement, TEvent extends Event>(
  handler: JSX.EventHandlerUnion<TElement, TEvent>,
  event: TEvent & {
    currentTarget: TElement;
    target: EventTarget & Element;
  },
): void {
  if (typeof handler === "function") {
    handler(event);
    return;
  }

  handler[0](handler[1], event);
}

function isStyleObject(value: unknown): value is JSX.CSSProperties {
  return typeof value === "object" && value !== null;
}

function isEventProp(propName: string): boolean {
  return /^on[A-Z]/.test(propName);
}
