/**
 * CRM Lead Types
 * Shared type definitions for CRM lead management
 */

// Import from constants to ensure single source of truth
import type { LeadStatus as LeadStatusType } from "../_constants/lead-status";
export type LeadStatus = LeadStatusType;

export type LeadSource =
  | "ADMIN"
  | "WEBSITE"
  | "REFERRAL"
  | "SOCIAL_MEDIA"
  | "REASSIGNED"
  | "OTHER";

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  status: LeadStatus;
  source: LeadSource;
  owner_id: string | null;
  notes: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadWithOwner extends Lead {
  owner: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface CreateLeadData {
  name: string;
  email?: string;
  phone: string;
  company?: string;
  status?: LeadStatus;
  source: LeadSource;
  owner_id?: string | null;
  notes?: string;
}

export interface UpdateLeadData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: LeadStatus;
  source?: LeadSource;
  owner_id?: string;
  notes?: string;
}

/**
 * CRM User Types
 */

export type CrmRole = "ADMIN" | "MARKETER";

export interface CrmUser {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string | null;
  crm_role: CrmRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCrmUserData {
  email: string;
  password: string;
  full_name: string;
  crm_role: CrmRole;
}

export interface UpdateCrmUserData {
  full_name?: string;
  crm_role?: CrmRole;
  is_active?: boolean;
}

/**
 * Contact Log Types
 */

export type ContactType =
  | "CALL"
  | "EMAIL"
  | "MEETING"
  | "WHATSAPP"
  | "NOTE"
  | "OTHER";

export interface ContactLog {
  id: string;
  lead_id: string;
  user_id: string;
  contact_type: ContactType;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateContactLogData {
  lead_id: string;
  contact_type: ContactType;
  notes?: string;
}
/**
 * Lead Request Types (Marketer → Admin Workflow)
 */

export type LeadRequestStatus = "PENDING" | "APPROVED" | "DECLINED";

export interface LeadRequest {
  id: string;
  requester_id: string;
  lead_id: string | null;
  lead_payload: Partial<Lead>;
  status: LeadRequestStatus;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadRequestWithRequester extends LeadRequest {
  requester: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface CreateLeadRequestData {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  source: LeadSource;
  notes?: string;
}
