import { createMemo, createSignal, type JSX, type ValidComponent } from "solid-js";
import { MeterRootContext, type MeterRootContextValue } from "./MeterRootContext";

/**
 * Groups all parts of the meter and provides value semantics for assistive tech.
 */
export function MeterRoot(props: MeterRoot.Props) {
  const [labelId, setLabelId] = createSignal<string | undefined>(undefined);
  const min = createMemo<number>(() => props.min ?? 0);
  const max = createMemo<number>(() => props.max ?? 100);
  const value = createMemo<number>(() => props.value);
  const formattedValue = createMemo<string>(() =>
    formatNumberValue(value(), props.locale, props.format),
  );
  const ariaValueText = createMemo<string>(() => {
    if (props.getAriaValueText) {
      return props.getAriaValueText(formattedValue(), value());
    }
    if (props.format) {
      return formattedValue();
    }
    return `${value()}%`;
  });

  const contextValue: MeterRootContextValue = {
    formattedValue,
    value,
    min,
    max,
    setLabelId,
  };

  return (
    <MeterRootContext value={contextValue}>
      <div
        role={typeof props.role === "string" ? props.role : "meter"}
        aria-labelledby={props["aria-labelledby"] ?? labelId()}
        aria-valuemin={min()}
        aria-valuemax={max()}
        aria-valuenow={value()}
        aria-valuetext={props["aria-valuetext"] ?? ariaValueText()}
        class={props.class}
        style={props.style}
        data-testid={props["data-testid"]}
      >
        {props.children}
      </div>
    </MeterRootContext>
  );
}

export interface MeterRootState {}

export interface MeterRootProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "value"> {
  "data-testid"?: string | undefined;
  "aria-valuetext"?: JSX.AriaAttributes["aria-valuetext"] | undefined;
  value: number;
  min?: number | undefined;
  max?: number | undefined;
  format?: Intl.NumberFormatOptions | undefined;
  locale?: Intl.LocalesArgument | undefined;
  getAriaValueText?: ((formattedValue: string, value: number) => string) | undefined;
  render?: ValidComponent | undefined;
}

export namespace MeterRoot {
  export type State = MeterRootState;
  export type Props = MeterRootProps;
}

function formatNumberValue(
  value: number,
  locale: Intl.LocalesArgument | undefined,
  format: Intl.NumberFormatOptions | undefined,
): string {
  const options = format ?? { style: "percent" };

  if (options.style === "percent") {
    return new Intl.NumberFormat(locale, options).format(value / 100);
  }

  return new Intl.NumberFormat(locale, options).format(value);
}
