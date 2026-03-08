import { createMemo, createSignal, type JSX, type ValidComponent } from "solid-js";
import { ProgressRootContext, type ProgressRootContextValue } from "./ProgressRootContext";
import { getProgressStatusDataAttributes } from "./stateAttributesMapping";

const VISUALLY_HIDDEN_SPAN_STYLE: JSX.CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  margin: "-1px",
  padding: "0",
  border: "0",
  clip: "rect(0 0 0 0)",
  overflow: "hidden",
  "white-space": "nowrap",
};

function getDefaultAriaValueText(formattedValue: string, value: number | null): string {
  if (value === null) {
    return "indeterminate progress";
  }

  return formattedValue || `${value}%`;
}

/**
 * Groups all parts of the progress bar and provides the task completion status.
 */
export function ProgressRoot(props: ProgressRoot.Props) {
  const [labelId, setLabelId] = createSignal<string | undefined>(undefined);
  const min = createMemo<number>(() => props.min ?? 0);
  const max = createMemo<number>(() => props.max ?? 100);

  const value = createMemo<number | null>(() => {
    const propValue = props.value;
    if (propValue === null || !Number.isFinite(propValue)) {
      return null;
    }
    return propValue;
  });

  const status = createMemo<ProgressStatus>(() => {
    const resolvedValue = value();
    if (resolvedValue === null) {
      return "indeterminate";
    }

    return resolvedValue === max() ? "complete" : "progressing";
  });

  const formattedValue = createMemo<string>(() =>
    formatNumberValue(value(), props.locale, props.format),
  );
  const getAriaValueText = createMemo(() => props.getAriaValueText ?? getDefaultAriaValueText);

  const contextValue: ProgressRootContextValue = {
    formattedValue,
    max,
    min,
    status,
    value,
    setLabelId,
  };

  return (
    <ProgressRootContext value={contextValue}>
      <div
        role={typeof props.role === "string" ? props.role : "progressbar"}
        aria-labelledby={props["aria-labelledby"] ?? labelId()}
        aria-valuemax={max()}
        aria-valuemin={min()}
        aria-valuenow={value() ?? undefined}
        aria-valuetext={props["aria-valuetext"] ?? getAriaValueText()(formattedValue(), value())}
        class={props.class}
        style={props.style}
        data-testid={props["data-testid"]}
        {...getProgressStatusDataAttributes(status())}
      >
        {props.children}
        <span role="presentation" style={VISUALLY_HIDDEN_SPAN_STYLE}>
          x
        </span>
      </div>
    </ProgressRootContext>
  );
}

export type ProgressStatus = "indeterminate" | "progressing" | "complete";

export interface ProgressRootState {
  status: ProgressStatus;
}

export interface ProgressRootProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "value"> {
  "data-testid"?: string | undefined;
  "aria-valuetext"?: JSX.AriaAttributes["aria-valuetext"] | undefined;
  format?: Intl.NumberFormatOptions | undefined;
  getAriaValueText?: ((formattedValue: string, value: number | null) => string) | undefined;
  locale?: Intl.LocalesArgument | undefined;
  max?: number | undefined;
  min?: number | undefined;
  value: number | null;
  render?: ValidComponent | undefined;
}

export namespace ProgressRoot {
  export type State = ProgressRootState;
  export type Props = ProgressRootProps;
}

function formatNumberValue(
  value: number | null,
  locale: Intl.LocalesArgument | undefined,
  format: Intl.NumberFormatOptions | undefined,
): string {
  if (value === null) {
    return "";
  }

  const options = format ?? { style: "percent" };

  if (options.style === "percent") {
    return new Intl.NumberFormat(locale, options).format(value / 100);
  }

  return new Intl.NumberFormat(locale, options).format(value);
}
