import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearDatabase } from "../db/database";
import { syncEngine } from "../sync/sync-engine";

interface AuthStore {
  token: string | null;
  refreshToken: string | null;
  email: string | null;
  logout: () => void;
}

const STORAGE_KEY = "@jotpad-auth";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      email: null,
      logout: () => {
        syncEngine.stop();
        clearDatabase().catch(console.warn);
        set({
          token: null,
          refreshToken: null,
          email: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
