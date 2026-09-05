import { create } from 'zustand';

export const usePayrunStore = create((set) => ({
  wizardStep: 1,
  selectedEmployees: [],
  draftScope: {
    periodStart: null,
    periodEnd: null,
    structureId: null
  },
  
  setWizardStep: (step) => set({ wizardStep: step }),
  
  toggleEmployee: (employeeId) => set((state) => {
    const isSelected = state.selectedEmployees.includes(employeeId);
    return {
      selectedEmployees: isSelected 
        ? state.selectedEmployees.filter(id => id !== employeeId)
        : [...state.selectedEmployees, employeeId]
    };
  }),
  
  setDraftScope: (scope) => set((state) => ({
    draftScope: { ...state.draftScope, ...scope }
  })),
  
  resetWizard: () => set({
    wizardStep: 1,
    selectedEmployees: [],
    draftScope: { periodStart: null, periodEnd: null, structureId: null }
  })
}));

export default usePayrunStore;
