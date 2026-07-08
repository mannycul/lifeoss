import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-[10px] bg-[var(--accent)]">
          <Sparkles className="size-4 text-[#08090b]" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight">LifeOS</span>
      </Link>
      <div className="w-full max-w-sm animate-fade-in-up rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-7">
        {children}
      </div>
    </div>
  );
}
