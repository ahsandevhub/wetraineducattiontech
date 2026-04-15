type CrmDisplayUser = {
  full_name?: string | null;
  email?: string | null;
};

export function getCrmUserDisplayName(
  user: CrmDisplayUser | null | undefined,
  fallback = "-",
) {
  const fullName = user?.full_name?.trim();
  if (fullName) return fullName;

  const email = user?.email?.trim();
  if (email) return email;

  return fallback;
}

export function compareCrmUsersByDisplayName(
  a: CrmDisplayUser | null | undefined,
  b: CrmDisplayUser | null | undefined,
) {
  return getCrmUserDisplayName(a, "").localeCompare(
    getCrmUserDisplayName(b, ""),
    undefined,
    { sensitivity: "base" },
  );
}
