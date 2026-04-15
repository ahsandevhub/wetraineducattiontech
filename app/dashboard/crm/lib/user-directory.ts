import "server-only";

import { createClient } from "@/app/utils/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CrmUserDirectoryEntry {
  id: string;
  full_name: string | null;
  email: string | null;
}

async function getAuthUserEmailMap(userIds: string[]) {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  const remainingIds = new Set(uniqueIds);
  const authUserMap = new Map<string, string | null>();

  if (uniqueIds.length === 0) {
    return authUserMap;
  }

  const supabaseAdmin = createAdminClient();
  let page = 1;

  while (remainingIds.size > 0) {
    const {
      data: { users },
      error,
    } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) throw error;
    if (!users || users.length === 0) break;

    for (const user of users) {
      if (!remainingIds.has(user.id)) continue;

      authUserMap.set(user.id, user.email ?? null);
      remainingIds.delete(user.id);
    }

    if (users.length < 1000) break;
    page += 1;
  }

  return authUserMap;
}

export async function getCrmUserDirectoryMap(userIds: string[]) {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  const directoryMap = new Map<string, CrmUserDirectoryEntry>();

  if (uniqueIds.length === 0) {
    return directoryMap;
  }

  const supabase = await createClient();
  const [authUserMap, profilesResult] = await Promise.all([
    getAuthUserEmailMap(uniqueIds),
    supabase.from("profiles").select("id, full_name").in("id", uniqueIds),
  ]);

  if (profilesResult.error) throw profilesResult.error;

  const profileMap = new Map(
    (profilesResult.data || []).map((profile) => [
      profile.id,
      profile.full_name ?? null,
    ]),
  );

  for (const id of uniqueIds) {
    directoryMap.set(id, {
      id,
      full_name: profileMap.get(id) ?? null,
      email: authUserMap.get(id) ?? null,
    });
  }

  return directoryMap;
}
