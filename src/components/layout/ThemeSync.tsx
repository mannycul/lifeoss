"use client";

import { useEffect } from "react";
import type { Theme } from "@/lib/database.types";

/** Applies the user's saved theme preference to the document on load. */
export function ThemeSync({ theme }: { theme: Theme }) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("lifeos-theme", theme);
  }, [theme]);

  return null;
}
