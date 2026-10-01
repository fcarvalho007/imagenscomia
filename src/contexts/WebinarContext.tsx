import { createContext, useContext, useState, type ReactNode } from "react";
import type { WebinarContext as WebinarCtxType } from "@/config/webinarConfig";

interface WebinarContextValue {
  webinarContext: WebinarCtxType;
  setWebinarContext: (ctx: WebinarCtxType) => void;
}

const Ctx = createContext<WebinarContextValue | null>(null);

export function WebinarProvider({ children }: { children: ReactNode }) {
  const [webinarContext, setWebinarContext] = useState<WebinarCtxType>(() => { const key = new URLSearchParams(window.location.search).get("webinar"); return key === "imagens" || key === "consolidado" ? key : "video"; });
  return (
    <Ctx.Provider value={{ webinarContext, setWebinarContext }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWebinarContext() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWebinarContext must be used within WebinarProvider");
  return ctx;
}
