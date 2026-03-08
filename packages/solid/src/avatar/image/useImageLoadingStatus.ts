import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import type { ImageLoadingStatus } from "../root/AvatarRoot";

export interface UseImageLoadingStatusOptions {
  referrerPolicy: () => ReferrerPolicy | undefined;
  crossOrigin: () => string | undefined;
}

export function useImageLoadingStatus(
  src: () => string | undefined,
  { referrerPolicy, crossOrigin }: UseImageLoadingStatusOptions,
): () => ImageLoadingStatus {
  const [loadingStatus, setLoadingStatus] = createSignal<ImageLoadingStatus>("idle");

  const source = createMemo(() => ({
    src: src(),
    referrerPolicy: referrerPolicy(),
    crossOrigin: crossOrigin(),
  }));

  createEffect(
    source,
    ({
      src: currentSrc,
      referrerPolicy: currentReferrerPolicy,
      crossOrigin: currentCrossOrigin,
    }) => {
      if (!currentSrc) {
        setLoadingStatus("error");
        return;
      }

      let isMounted = true;
      const image = new Image();

      const updateStatus = (status: ImageLoadingStatus) => {
        return () => {
          if (!isMounted) {
            return;
          }

          setLoadingStatus(status);
        };
      };

      const handleLoad = updateStatus("loaded");
      const handleError = updateStatus("error");

      setLoadingStatus("loading");
      image.addEventListener("load", handleLoad);
      image.addEventListener("error", handleError);

      if (currentReferrerPolicy) {
        image.referrerPolicy = currentReferrerPolicy;
      }

      image.crossOrigin = currentCrossOrigin ?? null;
      image.src = currentSrc;

      onCleanup(() => {
        isMounted = false;
        image.removeEventListener("load", handleLoad);
        image.removeEventListener("error", handleError);
      });
    },
  );

  return loadingStatus;
}
