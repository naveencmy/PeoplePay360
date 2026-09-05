import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  activeModal: null,
  modalData: null,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  openModal: (name, data = null) => set({ activeModal: name, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null })
}));

export default useUiStore;
