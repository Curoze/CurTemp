export interface SubmenuItem {
  title: string;
  path: string;
  icon?: number;
}

export interface MenuItem {
  id?: string | number;
  title: string;
  path?: string;
  icon?: number;
  submenu?: boolean;
  submenuItems?: SubmenuItem[];
}

export interface NavbarProps {
  className?: string;
  title?: string;
}

export interface SidebarProps {
  className?: string;
}

export interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}
