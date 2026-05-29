import { requireAccess } from "@/lib/auth";
import MenusPage from "@/components/menus/menuClientPage";

export default async function Page() {
  await requireAccess("menu");
  return <MenusPage />;
}
