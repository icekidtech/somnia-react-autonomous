import { useState, useCallback, useEffect } from "react";

export interface HandlerStats {
  totalCompounds: number;
  grossYield: number;
  feesPaid: number;
  netYield: number;
  lastCompound: number | null;
}

export interface Handler {
  address: string;
  name: string;
  vaultAddress: string;
  compoundToken: string;
  rewardToken: string;
  threshold: number;
  network: string;
  status: "active" | "paused" | "error";
  deployedAt: number;
  stats: HandlerStats;
}

const STORAGE_KEY = "compoundmax_handlers";

function loadHandlers(): Handler[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHandlers(handlers: Handler[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(handlers));
}

export function useHandlers() {
  const [handlers, setHandlers] = useState<Handler[]>(loadHandlers);

  useEffect(() => {
    saveHandlers(handlers);
  }, [handlers]);

  const addHandler = useCallback((handler: Handler) => {
    setHandlers((prev) => [...prev, handler]);
  }, []);

  const updateHandler = useCallback((address: string, updates: Partial<Handler>) => {
    setHandlers((prev) =>
      prev.map((h) => (h.address === address ? { ...h, ...updates } : h))
    );
  }, []);

  const removeHandler = useCallback((address: string) => {
    setHandlers((prev) => prev.filter((h) => h.address !== address));
  }, []);

  return { handlers, addHandler, updateHandler, removeHandler };
}
