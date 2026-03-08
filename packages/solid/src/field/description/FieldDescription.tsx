import { createRenderEffect, onCleanup, type JSX, type ValidComponent, omit } from "solid-js";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { useLabelableContext } from "../../labelable-provider";
import { getFieldStateDataAttributes } from "../utils/constants";
import type { FieldRoot } from "../root/FieldRoot";
import { useFieldRootContext } from "../root/FieldRootContext";

/**
 * Additional field description text.
 */
export function FieldDescription(props: FieldDescription.Props) {
  const rootContext = useFieldRootContext(false);
  const labelableContext = useLabelableContext();

  const id = typeof props.id === "string" && props.id !== "" ? props.id : useBaseUiId();

  createRenderEffect(
    () => id,
    (resolvedId) => {
      labelableContext.setMessageIds((previous) => previous.concat(resolvedId));
      const control = rootContext.validation.inputRef();

      if (control !== null) {
        const nextValue = mergeIdReferences(control.getAttribute("aria-describedby"), resolvedId);
        if (nextValue === undefined) {
          control.removeAttribute("aria-describedby");
        } else {
          control.setAttribute("aria-describedby", nextValue);
        }
      }

      onCleanup(() => {
        labelableContext.setMessageIds((previous) =>
          previous.filter((item) => item !== resolvedId),
        );

        if (control !== null) {
          const nextValue = removeIdReference(control.getAttribute("aria-describedby"), resolvedId);
          if (nextValue === undefined) {
            control.removeAttribute("aria-describedby");
          } else {
            control.setAttribute("aria-describedby", nextValue);
          }
        }
      });
    },
  );

  const elementProps = () => omit(props, ...DESCRIPTION_OMITTED_PROP_KEYS);

  return (
    <p id={id} {...getFieldStateDataAttributes(rootContext.state())} {...elementProps()}>
      {props.children}
    </p>
  );
}

export type FieldDescriptionState = FieldRoot.State;

export interface FieldDescriptionProps extends JSX.HTMLAttributes<HTMLParagraphElement> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export namespace FieldDescription {
  export type State = FieldDescriptionState;
  export type Props = FieldDescriptionProps;
}

const DESCRIPTION_OMITTED_PROP_KEYS = ["children", "render"] as const satisfies ReadonlyArray<
  keyof FieldDescriptionProps
>;

function mergeIdReferences(
  currentValue: string | null | undefined,
  nextValue: string | undefined,
): string | undefined {
  if (nextValue === undefined || nextValue === "") {
    return currentValue === null ? undefined : currentValue;
  }

  const ids = new Set<string>();

  if (typeof currentValue === "string") {
    currentValue
      .split(/\s+/)
      .map((entry) => entry.trim())
      .filter((entry) => entry !== "")
      .forEach((entry) => ids.add(entry));
  }

  ids.add(nextValue);

  if (ids.size === 0) {
    return undefined;
  }

  return Array.from(ids).join(" ");
}

function removeIdReference(
  currentValue: string | null | undefined,
  removedValue: string,
): string | undefined {
  if (currentValue === null || currentValue === undefined || currentValue === "") {
    return undefined;
  }

  const ids = currentValue
    .split(/\s+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "" && entry !== removedValue);

  if (ids.length === 0) {
    return undefined;
  }

  return ids.join(" ");
}
