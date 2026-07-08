"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, UtensilsCrossed, Shirt, ShoppingCart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/shopping", label: "Shopping", icon: ShoppingCart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-[var(--border)] bg-[var(--surface)]/95 py-2 backdrop-blur sm:hidden">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1 text-[10px]",
              active ? "text-[var(--accent)]" : "text-[var(--muted)]"
            )}
          >
            <item.icon className="size-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
