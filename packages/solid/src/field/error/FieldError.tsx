import { For, Show, createEffect, createMemo, type JSX, type ValidComponent, omit } from "solid-js";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { useFormContext } from "../../form/FormContext";
import { useLabelableContext } from "../../labelable-provider";
import { getFieldStateDataAttributes } from "../utils/constants";
import type { FieldRoot } from "../root/FieldRoot";
import { useFieldRootContext } from "../root/FieldRootContext";

/**
 * Displays a message when the field is invalid.
 */
export function FieldError(props: FieldError.Props) {
  const rootContext = useFieldRootContext(false);
  const formContext = useFormContext();
  const labelableContext = useLabelableContext();

  const id = typeof props.id === "string" && props.id !== "" ? props.id : useBaseUiId();

  const formError = createMemo<string | string[] | undefined>(() => {
    const fieldName = rootContext.name();

    if (fieldName === undefined) {
      return undefined;
    }

    return formContext.errors()[fieldName];
  });

  const rendered = createMemo<boolean>(() => {
    const matched = props.match;

    if (formError() !== undefined) {
      return true;
    }

    if (matched === true) {
      return true;
    }

    if (matched !== undefined && matched !== false) {
      return rootContext.validityData().state[matched] === true;
    }

    return rootContext.validityData().state.valid === false;
  });

  createEffect(rendered, (isRendered) => {
    if (!isRendered) {
      return;
    }

    labelableContext.setMessageIds((previous) => previous.concat(id));

    return () => {
      labelableContext.setMessageIds((previous) => previous.filter((item) => item !== id));
    };
  });

  const computedMessage = createMemo<JSX.Element>(() => {
    const fieldError = formError();

    if (fieldError !== undefined) {
      if (Array.isArray(fieldError)) {
        return (
          <ul>
            <For each={fieldError}>{(message) => <li>{message()}</li>}</For>
          </ul>
        );
      }

      return fieldError;
    }

    if (rootContext.validityData().errors.length > 1) {
      return (
        <ul>
          <For each={rootContext.validityData().errors}>{(message) => <li>{message()}</li>}</For>
        </ul>
      );
    }

    if (rootContext.validityData().error !== "") {
      return rootContext.validityData().error;
    }

    return "";
  });

  const content = createMemo<JSX.Element>(() => {
    if (props.children !== undefined) {
      return props.children;
    }

    return computedMessage();
  });

  const elementProps = createMemo(() => omit(props, ...ERROR_OMITTED_PROP_KEYS));

  return (
    <Show when={rendered()}>
      <div id={id} {...getFieldStateDataAttributes(rootContext.state())} {...elementProps()}>
        {content()}
      </div>
    </Show>
  );
}

export interface FieldErrorState extends FieldRoot.State {
  transitionStatus: "idle";
}

export interface FieldErrorProps extends JSX.HTMLAttributes<HTMLDivElement> {
  "data-testid"?: string | undefined;
  match?: boolean | keyof ValidityState | undefined;
  render?: ValidComponent | undefined;
}

export namespace FieldError {
  export type State = FieldErrorState;
  export type Props = FieldErrorProps;
}

const ERROR_OMITTED_PROP_KEYS = ["children", "match", "render"] as const satisfies ReadonlyArray<
  keyof FieldErrorProps
>;
