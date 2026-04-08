"use client";

import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  useCallback,
  type ReactNode,
} from "react";
import { createElement } from "react";

interface DemoModeContextValue {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextValue>({
  isDemoMode: false,
  toggleDemoMode: () => {},
});

export function useDemoMode() {
  return useContext(DemoModeContext);
}

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useLayoutEffect(() => {
    const html = document.documentElement;
    if (isDemoMode) {
      html.classList.add("demo-mode");
    } else {
      html.classList.remove("demo-mode");
    }
    return () => {
      html.classList.remove("demo-mode");
    };
  }, [isDemoMode]);

  const toggleDemoMode = useCallback(() => {
    setIsDemoMode((prev) => !prev);
  }, []);

  return createElement(
    DemoModeContext.Provider,
    { value: { isDemoMode, toggleDemoMode } },
    children,
  );
}
