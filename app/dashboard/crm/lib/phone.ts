const STRICT_CRM_PHONE_REGEX = /^8801[3-9][0-9]{8}$/;

export function isStrictCrmPhone(phone: string): boolean {
  return STRICT_CRM_PHONE_REGEX.test(phone);
}

export function normalizeCrmPhone(phone: string): string | null {
  if (!phone) return null;

  const digits = phone.trim().replace(/\D/g, "");

  if (STRICT_CRM_PHONE_REGEX.test(digits)) {
    return digits;
  }

  if (/^88001[3-9][0-9]{8}$/.test(digits)) {
    const normalized = `880${digits.slice(4)}`;
    return STRICT_CRM_PHONE_REGEX.test(normalized) ? normalized : null;
  }

  if (/^01[3-9][0-9]{8}$/.test(digits)) {
    return `880${digits.slice(1)}`;
  }

  if (/^1[3-9][0-9]{8}$/.test(digits)) {
    return `880${digits}`;
  }

  return null;
}

export function buildCrmLeadSearchOr(search: string): string {
  const sanitized = search.trim();
  const clauses = [
    `name.ilike.%${sanitized}%`,
    `phone.ilike.%${sanitized}%`,
    `email.ilike.%${sanitized}%`,
    `company.ilike.%${sanitized}%`,
  ];

  const normalizedPhone = normalizeCrmPhone(sanitized);
  if (normalizedPhone) {
    clauses.push(`phone.eq.${normalizedPhone}`);
  }

  return clauses.join(",");
}

export const CRM_PHONE_FORMAT_HINT = "Phone must be in BD mobile format (8801XXXXXXXXX)";
