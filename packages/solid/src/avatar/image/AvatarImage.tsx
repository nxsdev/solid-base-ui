import { Show, createEffect, createMemo, type JSX, type ValidComponent, omit } from "solid-js";
import type { AvatarRootState, ImageLoadingStatus } from "../root/AvatarRoot";
import { useAvatarRootContext } from "../root/AvatarRootContext";
import { useImageLoadingStatus } from "./useImageLoadingStatus";

/**
 * The image to be displayed in the avatar.
 */
export function AvatarImage(props: AvatarImage.Props) {
  const context = useAvatarRootContext();
  const imageLoadingStatus = useImageLoadingStatus(
    () => (typeof props.src === "string" ? props.src : undefined),
    {
      referrerPolicy: () => props.referrerPolicy,
      crossOrigin: () => (typeof props.crossOrigin === "string" ? props.crossOrigin : undefined),
    },
  );

  createEffect(imageLoadingStatus, (status) => {
    if (status === "idle") {
      return;
    }

    props.onLoadingStatusChange?.(status);
    context.setImageLoadingStatus(status);
  });

  const elementProps = createMemo(() => omit(props, ...IMAGE_OMITTED_PROP_KEYS));
  const isVisible = createMemo<boolean>(() => imageLoadingStatus() === "loaded");

  return <Show when={isVisible()}>{<img {...elementProps()} />}</Show>;
}

export interface AvatarImageState extends AvatarRootState {
  transitionStatus: "starting" | "ending" | "running" | "ended";
}

export interface AvatarImageProps extends JSX.ImgHTMLAttributes<HTMLImageElement> {
  "data-testid"?: string | undefined;
  crossOrigin?: string | undefined;
  referrerPolicy?: ReferrerPolicy | undefined;
  onLoadingStatusChange?: ((status: ImageLoadingStatus) => void) | undefined;
  render?: ValidComponent | undefined;
}

export namespace AvatarImage {
  export type State = AvatarImageState;
  export type Props = AvatarImageProps;
}

const IMAGE_OMITTED_PROP_KEYS = [
  "onLoadingStatusChange",
  "render",
] as const satisfies ReadonlyArray<keyof AvatarImageProps>;
