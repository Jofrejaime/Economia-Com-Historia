import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { setNetworkStatusHandler } from "../services/http/client";

interface NetworkContextValue {
  isOnline: boolean;
}

const NetworkContext = createContext<NetworkContextValue>({ isOnline: true });

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setNetworkStatusHandler((online) => setIsOnline(online));
    return () => setNetworkStatusHandler(null);
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
