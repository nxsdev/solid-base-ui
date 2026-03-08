import { createUniqueId } from "solid-js";

/**
 * Creates a stable id with `base-ui-` prefix unless overridden.
 */
export function useBaseUiId(idOverride?: string): string {
  const generatedId = createUniqueId();
  return idOverride ?? `base-ui-${generatedId}`;
}
