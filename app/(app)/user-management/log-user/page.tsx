import { requireAccess } from "@/lib/auth";
import UserLogPage from "@/components/userLogs/userLogClientPage";

export default async function Page() {
  await requireAccess("user-management/log-user");
  return <UserLogPage />;
}
