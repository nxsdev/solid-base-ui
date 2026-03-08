import { children, type JSX } from "solid-js";

export interface ResolvedChildrenProps {
  children?: JSX.Element | undefined;
}

/**
 * Normalizes structural children through Solid's `children()` helper so
 * parent updates do not recreate child trees unnecessarily.
 */
export function ResolvedChildren(props: ResolvedChildrenProps) {
  const resolved = children(() => props.children);
  return <>{resolved()}</>;
}
