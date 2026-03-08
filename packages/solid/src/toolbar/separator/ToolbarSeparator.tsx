import type { JSX } from "solid-js";
import { createMemo } from "solid-js";
import { Separator } from "../../separator";
import { useToolbarRootContext } from "../root/ToolbarRootContext";

/**
 * A separator inside Toolbar.
 */
export function ToolbarSeparator(props: ToolbarSeparator.Props) {
  const rootContext = useToolbarRootContext();

  const orientation = createMemo(() =>
    rootContext.orientation() === "horizontal" ? "vertical" : "horizontal",
  );

  return (
    <Separator
      orientation={orientation()}
      data-orientation={orientation()}
      {...props}
      data-testid={props["data-testid"]}
    />
  );
}

export interface ToolbarSeparatorProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange" | "orientation"
> {
  "data-testid"?: string | undefined;
}

export namespace ToolbarSeparator {
  export type Props = ToolbarSeparatorProps;
}
