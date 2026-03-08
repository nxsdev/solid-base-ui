import { createMemo, type JSX, omit } from "solid-js";
import { LabelableProvider } from "../../labelable-provider";
import { resolveBoolean } from "../../utils/resolveBoolean";
import { getFieldStateDataAttributes } from "../utils/constants";
import type { FieldRoot } from "../root/FieldRoot";
import { useFieldRootContext } from "../root/FieldRootContext";
import { FieldItemContext, type FieldItemContextValue } from "./FieldItemContext";

/**
 * Groups individual field items.
 */
export function FieldItem(props: FieldItem.Props) {
  const rootContext = useFieldRootContext(false);

  const disabled = createMemo(
    () => rootContext.disabled() || resolveBoolean(props.disabled, false),
  );

  const contextValue: FieldItemContextValue = {
    disabled,
  };

  const elementProps = createMemo(() => omit(props, ...ITEM_OMITTED_PROP_KEYS));

  return (
    <LabelableProvider>
      <FieldItemContext value={contextValue}>
        <div {...getFieldStateDataAttributes(rootContext.state())} {...elementProps()}>
          {props.children}
        </div>
      </FieldItemContext>
    </LabelableProvider>
  );
}

export interface FieldItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
  "data-testid"?: string | undefined;
  disabled?: boolean | undefined;
}

export type FieldItemState = FieldRoot.State;

export namespace FieldItem {
  export type State = FieldItemState;
  export type Props = FieldItemProps;
}

const ITEM_OMITTED_PROP_KEYS = ["children", "disabled"] as const satisfies ReadonlyArray<
  keyof FieldItemProps
>;
