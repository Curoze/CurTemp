import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { MenuProvider } from "@/components/contexts/MenuContext";

export default function ModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MenuProvider>
      <LayoutWrapper>{children}</LayoutWrapper>
    </MenuProvider>
  );
}
