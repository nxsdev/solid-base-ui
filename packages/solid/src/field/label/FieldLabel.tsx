import { Dynamic } from "@solidjs/web";
import {
  createMemo,
  createRenderEffect,
  onCleanup,
  type JSX,
  type ValidComponent,
  omit,
} from "solid-js";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { resolveBoolean } from "../../utils/resolveBoolean";
import { useLabelableContext } from "../../labelable-provider";
import { getFieldStateDataAttributes } from "../utils/constants";
import type { FieldRoot } from "../root/FieldRoot";
import { useFieldRootContext } from "../root/FieldRootContext";

/**
 * An accessible label associated with the field control.
 */
export function FieldLabel(props: FieldLabel.Props) {
  const rootContext = useFieldRootContext(false);
  const labelableContext = useLabelableContext();

  const generatedId = useBaseUiId();
  const nativeLabel = createMemo(() => resolveBoolean(props.nativeLabel, true));

  const labelId = createMemo<string>(() => {
    if (typeof props.id === "string" && props.id !== "") {
      return props.id;
    }

    return generatedId;
  });

  createRenderEffect(labelId, (nextLabelId) => {
    labelableContext.setLabelId(nextLabelId);
  });

  onCleanup(() => {
    labelableContext.setLabelId(undefined);
  });

  const component = createMemo<ValidComponent>(() => {
    if (props.render !== undefined) {
      return props.render;
    }

    return nativeLabel() ? "label" : "div";
  });

  const focusAssociatedControl = () => {
    const fieldControl = rootContext.validation.inputRef();
    if (fieldControl instanceof HTMLElement) {
      fieldControl.focus();
      return;
    }

    const controlId = labelableContext.controlId();

    if (controlId === null || controlId === undefined || controlId === "") {
      return;
    }

    const element = document.getElementById(controlId);

    if (element instanceof HTMLElement) {
      element.focus();
    }
  };

  const elementProps = createMemo(() => omit(props, ...LABEL_OMITTED_PROP_KEYS));

  return (
    <Dynamic
      component={component()}
      id={labelId()}
      for={nativeLabel() ? (labelableContext.controlId() ?? undefined) : undefined}
      onMouseDown={(
        event: MouseEvent & { currentTarget: HTMLElement; target: EventTarget & Element },
      ) => {
        callEventHandler(props.onMouseDown, event);

        if (event.defaultPrevented) {
          return;
        }

        if (event.detail > 1) {
          event.preventDefault();
        }

        if (!nativeLabel()) {
          return;
        }

        if (event.target.closest("button,input,select,textarea") !== null) {
          return;
        }
      }}
      onClick={(
        event: MouseEvent & { currentTarget: HTMLElement; target: EventTarget & Element },
      ) => {
        callEventHandler(props.onClick, event);

        if (event.defaultPrevented || nativeLabel()) {
          return;
        }

        if (event.target.closest("button,input,select,textarea") !== null) {
          return;
        }

        focusAssociatedControl();
      }}
      onPointerDown={(
        event: PointerEvent & { currentTarget: HTMLElement; target: EventTarget & Element },
      ) => {
        callEventHandler(props.onPointerDown, event);

        if (event.defaultPrevented || nativeLabel()) {
          return;
        }

        event.preventDefault();
      }}
      {...getFieldStateDataAttributes(rootContext.state())}
      {...elementProps()}
    >
      {props.children}
    </Dynamic>
  );
}

export type FieldLabelState = FieldRoot.State;

export interface FieldLabelProps extends JSX.HTMLAttributes<HTMLElement> {
  "data-testid"?: string | undefined;
  nativeLabel?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export namespace FieldLabel {
  export type State = FieldLabelState;
  export type Props = FieldLabelProps;
}

const LABEL_OMITTED_PROP_KEYS = [
  "children",
  "nativeLabel",
  "render",
] as const satisfies ReadonlyArray<keyof FieldLabelProps>;

function callEventHandler<TElement extends HTMLElement, TEvent extends Event>(
  handler: JSX.EventHandlerUnion<TElement, TEvent> | undefined,
  event: TEvent & {
    currentTarget: TElement;
    target: EventTarget & Element;
  },
): void {
  if (handler === undefined) {
    return;
  }

  if (typeof handler === "function") {
    handler(event);
    return;
  }

  handler[0](handler[1], event);
}
