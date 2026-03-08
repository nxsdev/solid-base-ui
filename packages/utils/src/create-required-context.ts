import { createContext, useContext } from "solid-js";
import type { Context } from "solid-js";

export function createRequiredContext<TValue extends NonNullable<unknown>>(
  contextName: string,
): [Context<TValue | null>, () => TValue] {
  const Context = createContext<TValue | null>(null);

  const useRequiredContext = (): TValue => {
    const value = useContext(Context);
    if (value === null) {
      throw new Error(`${contextName} context is missing a Provider.`);
    }
    return value;
  };

  return [Context, useRequiredContext];
}
