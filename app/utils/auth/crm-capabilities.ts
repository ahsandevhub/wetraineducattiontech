import type { CrmRole } from "./roles";

const CRM_DUAL_CAPABILITY_ADMIN_IDS = new Set<string>([
  "b8d016a4-6b06-4bd3-8d99-2637f3f1418e",
]);

export interface CrmCapabilities {
  canAccessCrmAdmin: boolean;
  canActAsCrmMarketer: boolean;
  isDualCapabilityCrmUser: boolean;
}

type CrmCapabilityInput = {
  userId: string;
  crmRole: CrmRole | null;
};

export function getCrmCapabilities({
  userId,
  crmRole,
}: CrmCapabilityInput): CrmCapabilities {
  const isDualCapabilityCrmUser =
    crmRole === "ADMIN" && CRM_DUAL_CAPABILITY_ADMIN_IDS.has(userId);

  return {
    canAccessCrmAdmin: crmRole === "ADMIN",
    canActAsCrmMarketer:
      crmRole === "MARKETER" || isDualCapabilityCrmUser,
    isDualCapabilityCrmUser,
  };
}

export function isAssignableCrmMarketer(input: CrmCapabilityInput): boolean {
  return getCrmCapabilities(input).canActAsCrmMarketer;
}
