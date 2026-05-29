import { requireAccess } from "@/lib/auth";
import UsersPage from "@/components/users/userClientPage";

export default async function Page() {
  await requireAccess("user-management/users");
  return <UsersPage />;
}
