import { createMemo, createSignal, type JSX, type ValidComponent, omit } from "solid-js";
import { Dynamic } from "@solidjs/web";
import { AvatarRootContext, type AvatarRootContextValue } from "./AvatarRootContext";

/**
 * Displays a user's profile picture, initials, or fallback icon.
 */
export function AvatarRoot(props: AvatarRoot.Props) {
  const [imageLoadingStatus, setImageLoadingStatus] = createSignal<ImageLoadingStatus>("idle");

  const contextValue: AvatarRootContextValue = {
    imageLoadingStatus,
    setImageLoadingStatus,
  };

  const elementProps = createMemo(() => omit(props, ...ROOT_OMITTED_PROP_KEYS));

  return (
    <AvatarRootContext value={contextValue}>
      <Dynamic component={props.render ?? "span"} {...elementProps()}>
        {props.children}
      </Dynamic>
    </AvatarRootContext>
  );
}

export type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

export interface AvatarRootState {
  imageLoadingStatus: ImageLoadingStatus;
}

export interface AvatarRootProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export namespace AvatarRoot {
  export type State = AvatarRootState;
  export type Props = AvatarRootProps;
}

const ROOT_OMITTED_PROP_KEYS = ["children", "render"] as const satisfies ReadonlyArray<
  keyof AvatarRootProps
>;
