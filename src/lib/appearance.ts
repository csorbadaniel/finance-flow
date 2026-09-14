import { useSyncExternalStore } from "react";

export type Appearance = "dark" | "light";

const STORAGE_KEY = "financeflow-appearance";
const listeners = new Set<() => void>();

function readAppearance(): Appearance {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
}

function applyAppearance(appearance: Appearance): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", appearance === "dark");
  document.documentElement.style.colorScheme = appearance;
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

export const appearanceStore = {
  getSnapshot: readAppearance,
  getServerSnapshot: (): Appearance => "dark",
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  set(appearance: Appearance) {
    window.localStorage.setItem(STORAGE_KEY, appearance);
    applyAppearance(appearance);
    emit();
  },
  reset() {
    window.localStorage.removeItem(STORAGE_KEY);
    applyAppearance("dark");
    emit();
  },
  apply: applyAppearance,
};

export function useAppearance(): Appearance {
  return useSyncExternalStore(
    appearanceStore.subscribe,
    appearanceStore.getSnapshot,
    appearanceStore.getServerSnapshot,
  );
}