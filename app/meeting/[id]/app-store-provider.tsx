"use client";

import GuggleWeedClient from "@/lib/meeting/guggle-weed-client";
import buildAppStore, { AppStore } from "@/lib/meeting/store";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { StoreApi, useStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional"
import { shallow } from "zustand/shallow";

export const AppStoreContext = createContext<StoreApi<AppStore> | undefined>(undefined);

type AppStoreProviderProps = {
  username: string,
  meetingId: string,
  children?: ReactNode
}

export default function AppStoreProvider({ username, meetingId, children }: AppStoreProviderProps) {
  const [appStore, setAppStore] = useState<StoreApi<AppStore> | undefined>(undefined);

  useEffect(() => {
    const client = new GuggleWeedClient(username, meetingId);
    const store = buildAppStore(client);

    setAppStore(store);

    return () => {
      client.dispose();
    }
  }, [username, meetingId]);

  if (appStore) {
    return (
      <AppStoreContext.Provider value={appStore}>
        {children}
      </AppStoreContext.Provider>
    );
  }

  return (<></>);
}

export function useAppStore<T>(selector: (store: AppStore) => T): T {
  const appStore = useContext(AppStoreContext);

  if (appStore) {
    return useStoreWithEqualityFn(appStore, selector, shallow);
  } else {
    throw new Error("useAppStore must be use within AppStoreProvider");
  }
}