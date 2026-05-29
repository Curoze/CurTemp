import { requireAccess } from "@/lib/auth";
import RolesPage from "@/components/roles/rolesClientPage";

export default async function Page() {
  await requireAccess("user-management/roles");
  return <RolesPage />;
}
