export const getValueByPath = <T>(
  payload: unknown,
  path?: string,
): T | undefined => {
  if (!path) {
    return payload as T;
  }

  const segments = path.split(".").filter(Boolean);
  let current: unknown = payload;

  for (const segment of segments) {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current as T | undefined;
};
