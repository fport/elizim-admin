import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TourId =
  | "admin"
  | "urunler"
  | "desenler"
  | "kategoriler"
  | "gorsel";

export const TOUR_SEQUENCE: TourId[] = [
  "admin",
  "urunler",
  "desenler",
  "kategoriler",
  "gorsel",
];

interface TourState {
  completedTours: TourId[];
  activeTour: TourId | null;
  welcomeSeen: boolean;
  chainMode: boolean;
  _hasHydrated: boolean;
  markCompleted: (tourId: TourId) => void;
  startTour: (tourId: TourId) => void;
  stopTour: () => void;
  resetTour: (tourId: TourId) => void;
  resetAllTours: () => void;
  isTourCompleted: (tourId: TourId) => boolean;
  markWelcomeSeen: () => void;
  startFullOnboarding: () => void;
  getNextTourInChain: () => TourId | null;
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      completedTours: [],
      activeTour: null,
      welcomeSeen: false,
      chainMode: false,
      _hasHydrated: false,

      markCompleted: (tourId) =>
        set((state) => ({
          completedTours: state.completedTours.includes(tourId)
            ? state.completedTours
            : [...state.completedTours, tourId],
          activeTour: null,
        })),

      startTour: (tourId) => set({ activeTour: tourId }),
      stopTour: () => set({ activeTour: null, chainMode: false }),

      resetTour: (tourId) =>
        set((state) => ({
          completedTours: state.completedTours.filter((id) => id !== tourId),
        })),

      resetAllTours: () =>
        set({ completedTours: [], activeTour: null, welcomeSeen: false, chainMode: false }),

      isTourCompleted: (tourId) => get().completedTours.includes(tourId),
      markWelcomeSeen: () => set({ welcomeSeen: true }),

      startFullOnboarding: () =>
        set({ chainMode: true, welcomeSeen: true, activeTour: TOUR_SEQUENCE[0] }),

      getNextTourInChain: () => {
        const { completedTours } = get();
        return TOUR_SEQUENCE.find((id) => !completedTours.includes(id)) ?? null;
      },
    }),
    {
      name: "elizim-admin-tours",
      partialize: (state) => ({
        completedTours: state.completedTours,
        welcomeSeen: state.welcomeSeen,
        chainMode: state.chainMode,
      }),
      onRehydrateStorage: () => {
        return () => {
          useTourStore.setState({ _hasHydrated: true });
        };
      },
    }
  )
);
