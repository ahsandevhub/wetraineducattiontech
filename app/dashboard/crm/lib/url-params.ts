/**
 * Utility to safely update URL search parameters while preserving existing ones
 */
export function updateSearchParams(
  currentParams: Record<string, string | string[] | undefined>,
  updates: Record<string, string | number | null | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();

  // Keep existing params
  for (const [key, value] of Object.entries(currentParams)) {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  // Apply updates
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }

  return params;
}

/**
 * Convert Record to URLSearchParams while preserving arrays
 */
export function paramsToString(
  params: Record<string, string | string[] | undefined>,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v));
    } else if (value !== undefined) {
      searchParams.set(key, value);
    }
  }

  const str = searchParams.toString();
  return str ? `?${str}` : "";
}
