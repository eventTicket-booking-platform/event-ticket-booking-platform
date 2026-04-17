"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type SnackbarVariant = "success" | "error" | "warning" | "info";

type SnackbarItem = {
  id: number;
  message: string;
  variant: SnackbarVariant;
  durationMs: number;
};

type ShowSnackbarInput = {
  message: string;
  variant?: SnackbarVariant;
  durationMs?: number;
};

type SnackbarContextValue = {
  showSnackbar: (input: ShowSnackbarInput) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
};

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

const variantStyles: Record<SnackbarVariant, string> = {
  success: "border-emerald-400/35 bg-emerald-500/15 text-emerald-100",
  error: "border-rose-400/35 bg-rose-500/15 text-rose-100",
  warning: "border-amber-400/35 bg-amber-500/15 text-amber-100",
  info: "border-sky-400/35 bg-sky-500/15 text-sky-100",
};

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<SnackbarItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const showSnackbar = useCallback(
    ({ message, variant = "info", durationMs = 3600 }: ShowSnackbarInput) => {
      if (!message.trim()) {
        return;
      }

      const id = Date.now() + Math.floor(Math.random() * 1000);
      setItems((current) => [...current, { id, message, variant, durationMs }]);

      window.setTimeout(() => {
        dismiss(id);
      }, durationMs);
    },
    [dismiss],
  );

  const value = useMemo<SnackbarContextValue>(
    () => ({
      showSnackbar,
      success: (message) => showSnackbar({ message, variant: "success" }),
      error: (message) => showSnackbar({ message, variant: "error" }),
      warning: (message) => showSnackbar({ message, variant: "warning" }),
      info: (message) => showSnackbar({ message, variant: "info" }),
    }),
    [showSnackbar],
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              "pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-[0_18px_44px_rgba(0,0,0,0.35)] backdrop-blur",
              variantStyles[item.variant],
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="leading-6">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="text-xs font-semibold uppercase tracking-[0.12em] text-current/80 transition hover:text-current"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within SnackbarProvider");
  }
  return context;
}
