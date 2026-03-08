import { Show, createMemo, type JSX, type ValidComponent, omit } from "solid-js";
import { Dynamic } from "@solidjs/web";
import type { AvatarRootState } from "../root/AvatarRoot";
import { useAvatarRootContext } from "../root/AvatarRootContext";

/**
 * Rendered when the image fails to load or when no image is provided.
 */
export function AvatarFallback(props: AvatarFallback.Props) {
  const context = useAvatarRootContext();
  const visible = createMemo<boolean>(() => context.imageLoadingStatus() !== "loaded");
  const elementProps = createMemo(() => omit(props, ...FALLBACK_OMITTED_PROP_KEYS));

  return (
    <Show when={visible()}>
      <Dynamic component={props.render ?? "span"} {...elementProps()}>
        {props.children}
      </Dynamic>
    </Show>
  );
}

export interface AvatarFallbackState extends AvatarRootState {}

export interface AvatarFallbackProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export namespace AvatarFallback {
  export type State = AvatarFallbackState;
  export type Props = AvatarFallbackProps;
}

const FALLBACK_OMITTED_PROP_KEYS = ["children", "render"] as const satisfies ReadonlyArray<
  keyof AvatarFallbackProps
>;
