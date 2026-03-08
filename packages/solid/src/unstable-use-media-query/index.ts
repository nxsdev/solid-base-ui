import { createEffect, createSignal } from "solid-js";
import type { Accessor } from "solid-js";

export function useMediaQuery(
  query: string,
  options: useMediaQuery.Options = {},
): useMediaQuery.ReturnValue {
  const supportMatchMedia =
    typeof window !== "undefined" && typeof window.matchMedia !== "undefined";
  const normalizedQuery = query.replace(/^@media( ?)/m, "");
  const defaultMatches = options.defaultMatches ?? false;

  const matchMedia =
    options.matchMedia ??
    (supportMatchMedia ? (queryToMatch: string) => window.matchMedia(queryToMatch) : undefined);
  const ssrMatchMedia = options.ssrMatchMedia;
  const noSsr = options.noSsr ?? false;

  const initialMatches = (): boolean => {
    if (noSsr && matchMedia) {
      return matchMedia(normalizedQuery).matches;
    }

    if (ssrMatchMedia) {
      return ssrMatchMedia(normalizedQuery).matches;
    }

    return defaultMatches;
  };

  const [matches, setMatches] = createSignal(initialMatches());

  createEffect(
    () => (matchMedia ? matchMedia(normalizedQuery) : null),
    (mediaQueryList) => {
      if (!mediaQueryList) {
        setMatches(defaultMatches);
        return;
      }

      const update = () => setMatches(mediaQueryList.matches);

      update();
      mediaQueryList.addEventListener("change", update);
      return () => {
        mediaQueryList.removeEventListener("change", update);
      };
    },
  );

  return matches;
}

export interface UseMediaQueryOptions {
  /**
   * Fallback value used when `window.matchMedia` is unavailable.
   * @default false
   */
  defaultMatches?: boolean | undefined;
  /**
   * Custom matchMedia implementation.
   */
  matchMedia?: ((query: string) => MediaQueryList) | undefined;
  /**
   * When true, resolve from `matchMedia` during initial render on the client.
   * @default false
   */
  noSsr?: boolean | undefined;
  /**
   * Custom server-side matchMedia implementation.
   */
  ssrMatchMedia?: ((query: string) => { matches: boolean }) | undefined;
}

export type UseMediaQueryReturnValue = Accessor<boolean>;

export namespace useMediaQuery {
  export type Options = UseMediaQueryOptions;
  export type ReturnValue = UseMediaQueryReturnValue;
}
