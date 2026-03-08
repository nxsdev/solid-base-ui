import { createEffect, type Accessor } from "solid-js";
import { useFormContext } from "../form/FormContext";
import { useFieldRootContext } from "./root/FieldRootContext";
import { getCombinedFieldValidityData } from "./utils/getCombinedFieldValidityData";

export function useField(params: UseFieldParameters) {
  const formContext = useFormContext();
  const rootContext = useFieldRootContext(false);

  const isEnabled = () => (params.enabled === undefined ? true : params.enabled());

  createEffect(
    () => [isEnabled(), rootContext.validityData().initialValue, params.value()] as const,
    ([enabled, initialValue, explicitValue]) => {
      if (!enabled) {
        return;
      }

      if (initialValue !== null) {
        return;
      }

      const value = explicitValue ?? params.getValue();

      if (value === null || value === undefined) {
        return;
      }

      rootContext.setValidityData((previous) => ({
        ...previous,
        initialValue: value,
      }));
    },
  );

  createEffect(
    () => ({
      enabled: isEnabled(),
      id: params.id(),
    }),
    ({ enabled, id }) => {
      if (!enabled || id === undefined) {
        return;
      }

      formContext.registerField(id, {
        name: params.name(),
        validate(flushSync = true) {
          const value = params.value() ?? params.getValue();

          rootContext.markDirty();

          if (!flushSync) {
            void params.commit(value);
            return;
          }

          void params.commit(value);
        },
        validityData: () =>
          getCombinedFieldValidityData(rootContext.validityData(), rootContext.invalid()),
        controlRef: params.controlRef,
        getValue: () => params.getValue() ?? params.value(),
      });

      return () => {
        formContext.unregisterField(id);
      };
    },
  );
}

export interface UseFieldParameters {
  enabled?: Accessor<boolean> | undefined;
  value: Accessor<unknown>;
  getValue: () => unknown;
  id: Accessor<string | undefined>;
  name: Accessor<string | undefined>;
  commit: (value: unknown) => Promise<void>;
  controlRef: () => HTMLElement | null;
}
