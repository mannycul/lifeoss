"use client";

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function WeightChart({ data, unitLabel }: { data: { date: string; weight: number }[]; unitLabel: string }) {
  if (data.length < 2) {
    return <p className="py-8 text-center text-sm text-[var(--muted)]">Log your weight a few times to see a trend.</p>;
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
            tickFormatter={(v) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          />
          <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
            labelFormatter={(v) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            formatter={(value) => [`${value} ${unitLabel}`, "Weight"]}
          />
          <Line type="monotone" dataKey="weight" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3, fill: "var(--accent)" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
