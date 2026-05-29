"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface MenuContextType {
  refreshMenus: () => void;
  menuRefreshKey: number;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuRefreshKey, setMenuRefreshKey] = useState(0);

  const refreshMenus = useCallback(() => {
    setMenuRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <MenuContext.Provider value={{ refreshMenus, menuRefreshKey }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenuContext() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenuContext must be used within MenuProvider");
  }
  return context;
}
