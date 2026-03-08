import { createRequiredContext } from "@solid-base-ui/utils";
import type { ImageLoadingStatus } from "./AvatarRoot";

export interface AvatarRootContextValue {
  imageLoadingStatus: () => ImageLoadingStatus;
  setImageLoadingStatus: (status: ImageLoadingStatus) => void;
}

export const [AvatarRootContext, useAvatarRootContext] =
  createRequiredContext<AvatarRootContextValue>("AvatarRoot");
