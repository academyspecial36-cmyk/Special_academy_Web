"use client";
import { createContext, useContext } from "react";
import type { AppContextValue } from "./provider";

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}

export { AppContext };
