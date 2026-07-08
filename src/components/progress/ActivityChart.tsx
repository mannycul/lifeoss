"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function ActivityChart({
  title,
  data,
  suffix,
  color = "var(--accent)",
}: {
  title: string;
  data: { label: string; value: number }[];
  suffix: string;
  color?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip
                contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
                formatter={(value) => [`${value} ${suffix}`, ""]}
              />
              <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
