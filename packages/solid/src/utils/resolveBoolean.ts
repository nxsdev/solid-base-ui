export function resolveBoolean(value: boolean | string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value === true || value === "";
}
