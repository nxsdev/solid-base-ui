import { createMemo, type JSX, omit } from "solid-js";
import { useAccordionItemContext } from "../item/AccordionItemContext";
import { getAccordionStateDataAttributes } from "../item/stateAttributesMapping";

/**
 * A heading that labels the corresponding panel.
 */
export function AccordionHeader(props: AccordionHeader.Props) {
  const itemContext = useAccordionItemContext();
  const elementProps = createMemo(() => omit(props, ...HEADER_OMITTED_PROP_KEYS));

  return (
    <h3
      ref={(node) => {
        if (typeof props.ref === "function") {
          props.ref(node);
        }
      }}
      {...getAccordionStateDataAttributes({
        ...itemContext.state(),
        transitionStatus: "idle",
      })}
      {...elementProps()}
    >
      {props.children}
    </h3>
  );
}

export interface AccordionHeaderProps extends JSX.HTMLAttributes<HTMLHeadingElement> {
  "data-testid"?: string | undefined;
}

export namespace AccordionHeader {
  export type Props = AccordionHeaderProps;
}

const HEADER_OMITTED_PROP_KEYS = ["children", "ref"] as const satisfies ReadonlyArray<
  keyof AccordionHeaderProps
>;
