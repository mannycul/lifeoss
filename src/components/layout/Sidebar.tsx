"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  UtensilsCrossed,
  Shirt,
  ShoppingCart,
  Wallet,
  LineChart,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/(auth)/actions";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/shopping", label: "Shopping", icon: ShoppingCart },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-5 sm:flex">
      <Link href="/dashboard" className="mb-6 flex items-center gap-2 px-2">
        <div className="flex size-7 items-center justify-center rounded-[8px] bg-[var(--accent)]">
          <Sparkles className="size-3.5 text-[#08090b]" />
        </div>
        <span className="text-sm font-semibold tracking-tight">LifeOS</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm transition-colors",
                active ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-2 border-t border-[var(--border)] pt-4">
        <div className="flex size-8 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs font-medium">
          {name.slice(0, 1).toUpperCase() || "?"}
        </div>
        <div className="flex-1 truncate text-xs text-[var(--muted)]">{name}</div>
        <form action={logoutAction}>
          <button type="submit" className="text-[var(--muted)] hover:text-[var(--foreground)]" title="Log out">
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
