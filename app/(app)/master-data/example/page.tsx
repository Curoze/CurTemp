import { requireAccess } from "@/lib/auth";
import MasterExamplePage from "@/components/masterExample/clientPage";

export default async function Page() {
  await requireAccess("master-data/example");
  return <MasterExamplePage />;
}
