"use client";

import { SimulationResult } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Props {
  result: SimulationResult;
  showCharts: boolean;
}

const GROUP_COLORS = [
  "#7c3aed",
  "#f59e0b",
  "#22c55e",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
];

const DAMAGE_TYPE_COLORS: Record<string, string> = {
  Bludgeoning: "#a1a1aa",
  Piercing: "#71717a",
  Slashing: "#d4d4d8",
  Fire: "#f59e0b",
  Cold: "#38bdf8",
  Lightning: "#a78bfa",
  Thunder: "#818cf8",
  Acid: "#4ade80",
  Poison: "#22c55e",
  Psychic: "#e879f9",
  Force: "#c084fc",
  Radiant: "#fbbf24",
  Necrotic: "#a855f7",
};

const tooltipStyle = {
  background: "#1a1a24",
  border: "1px solid #2a2a3a",
  borderRadius: 8,
  color: "#e4e4e7",
};

export default function SimulationResults({ result, showCharts }: Props) {
  const damageByGroup = result.groups.map((g, i) => ({
    name: g.name,
    damage: Math.round(g.totalDamage * 100) / 100,
    fill: GROUP_COLORS[i % GROUP_COLORS.length],
  }));

  const damageByType = result.damageByType
    .filter((d) => d.amount > 0)
    .map((d) => ({
      name: d.type,
      value: Math.round(d.amount * 100) / 100,
    }));

  return (
    <div className="rounded-xl border border-card-border bg-card p-5">
      <h2 className="mb-4 text-lg font-semibold">Results</h2>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard
          label="Total Damage"
          value={result.totalDamage.toFixed(1)}
          accent
        />
        <StatCard
          label="Hits"
          value={`${result.totalHits}/${result.totalAttacks}`}
        />
        <StatCard
          label="Accuracy"
          value={`${result.overallAccuracy.toFixed(1)}%`}
        />
        <StatCard label="Crits" value={String(result.totalCrits)} />
        <StatCard
          label="Avg/Hit"
          value={
            result.totalHits > 0
              ? (result.totalDamage / result.totalHits).toFixed(1)
              : "0"
          }
        />
      </div>

      {/* Damage by type breakdown */}
      {result.damageByType.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {result.damageByType
            .filter((d) => d.amount > 0)
            .map((d) => (
              <div
                key={d.type}
                className="flex items-center gap-2 rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm"
              >
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: DAMAGE_TYPE_COLORS[d.type] || "#7c3aed",
                  }}
                />
                <span className="text-muted">{d.type}</span>
                <span className="font-medium">{d.amount.toFixed(1)}</span>
              </div>
            ))}
        </div>
      )}

      {/* Per-group breakdown */}
      <div className="mb-6 space-y-2">
        {result.groups.map((g, i) => (
          <div
            key={i}
            className="rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: GROUP_COLORS[i % GROUP_COLORS.length],
                  }}
                />
                <span className="font-medium">{g.name}</span>
                <span className="text-muted">x{g.count}</span>
              </div>
              <div className="flex items-center gap-4 text-muted">
                <span>
                  {g.hits}/{g.count} hits ({g.hitAccuracy.toFixed(0)}%)
                </span>
                <span>{g.crits} crits</span>
                <span className="font-medium text-foreground">
                  {g.totalDamage.toFixed(1)} dmg
                </span>
              </div>
            </div>
            {g.damageByType.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-2">
                {g.damageByType
                  .filter((d) => d.amount > 0)
                  .map((d) => (
                    <span
                      key={d.type}
                      className="text-xs text-muted"
                    >
                      <span
                        className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            DAMAGE_TYPE_COLORS[d.type] || "#7c3aed",
                        }}
                      />
                      {d.amount.toFixed(1)} {d.type}
                    </span>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      {showCharts && (
        <div className="grid gap-6 md:grid-cols-2">
          {damageByGroup.length > 1 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted">
                Damage by Group
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={damageByGroup}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#71717a", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#71717a", fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="damage" radius={[4, 4, 0, 0]}>
                    {damageByGroup.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {damageByType.length > 1 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted">
                Damage by Type
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={damageByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    strokeWidth={0}
                  >
                    {damageByType.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          DAMAGE_TYPE_COLORS[entry.name] ||
                          GROUP_COLORS[i % GROUP_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#71717a" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-card-border bg-background p-3 text-center">
      <div className="text-xs text-muted">{label}</div>
      <div
        className={`mt-1 text-xl font-bold ${accent ? "text-accent" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
