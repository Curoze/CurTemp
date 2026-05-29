import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarToggleStore = {
  isOpen: boolean;
  setIsOpen: () => void;
};

export const useSidebarToggle = create<SidebarToggleStore>()(
  persist(
    (set, get) => ({
      isOpen: true,
      setIsOpen: () => {
        set({ isOpen: !get().isOpen });
      },
    }),
    {
      name: "sidebar-toggle",
    }
  )
);
