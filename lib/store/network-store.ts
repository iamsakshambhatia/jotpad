import NetInfo from "@react-native-community/netinfo";
import { create } from "zustand";

interface NetworkStore {
  isOnline: boolean;
  _unsubscribe: (() => void) | null;
  initNetworkListener: (onReconnect: () => void) => void;
  stopNetworkListener: () => void;
}

export const useNetworkStore = create<NetworkStore>()((set, get) => ({
  isOnline: true,
  _unsubscribe: null,

  initNetworkListener: (onReconnect: () => void) => {
    const existing = get()._unsubscribe;
    if (existing) return;

    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasOnline = get().isOnline;
      const isNowOnline = !!(state.isConnected && state.isInternetReachable !== false);

      set({ isOnline: isNowOnline });

      if (!wasOnline && isNowOnline) {
        onReconnect();
      }
    });

    set({ _unsubscribe: unsubscribe });
  },

  stopNetworkListener: () => {
    const unsub = get()._unsubscribe;
    if (unsub) {
      unsub();
      set({ _unsubscribe: null });
    }
  },
}));
