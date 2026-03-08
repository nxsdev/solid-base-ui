import { Dynamic as SolidDynamic, type DynamicProps } from "@solidjs/web";
import type { ValidComponent } from "solid-js";

/**
 * Thin local alias so the project can switch Dynamic usage consistently.
 */
function SafeDynamic<TComponent extends ValidComponent = ValidComponent>(
  props: DynamicProps<TComponent>,
) {
  return SolidDynamic(props);
}

export { SafeDynamic as Dynamic };
