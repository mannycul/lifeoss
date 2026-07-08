"use client";

import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function SpendingChart({ data, dailyTarget }: { data: { label: string; amount: number }[]; dailyTarget: number }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
          <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
            labelStyle={{ color: "var(--foreground)" }}
            formatter={(value) => [`£${Number(value).toFixed(2)}`, "Spent"]}
          />
          <ReferenceLine y={dailyTarget} stroke="var(--warning)" strokeDasharray="4 4" />
          <Bar dataKey="amount" fill="var(--accent)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
