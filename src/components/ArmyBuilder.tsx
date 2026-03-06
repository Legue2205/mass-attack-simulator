"use client";

import { CreaturePreset, ArmyGroup } from "@/types";

interface Props {
  presets: CreaturePreset[];
  army: ArmyGroup[];
  onArmyChange: (army: ArmyGroup[]) => void;
  targetAc: number;
  onTargetAcChange: (ac: number) => void;
  onSimulate: () => void;
  loading: boolean;
  showCharts: boolean;
  onToggleCharts: () => void;
  acHidden: boolean;
}

export default function ArmyBuilder({
  presets,
  army,
  onArmyChange,
  targetAc,
  onTargetAcChange,
  onSimulate,
  loading,
  showCharts,
  onToggleCharts,
  acHidden,
}: Props) {
  function addGroup(preset: CreaturePreset) {
    const existing = army.find((g) => g.preset.id === preset.id);
    if (existing) {
      onArmyChange(
        army.map((g) =>
          g.preset.id === preset.id ? { ...g, count: g.count + 1 } : g
        )
      );
    } else {
      onArmyChange([
        ...army,
        { preset, count: 1, advantage: false, disadvantage: false },
      ]);
    }
  }

  function updateCount(presetId: string, count: number) {
    if (count <= 0) {
      onArmyChange(army.filter((g) => g.preset.id !== presetId));
    } else {
      onArmyChange(
        army.map((g) => (g.preset.id === presetId ? { ...g, count } : g))
      );
    }
  }

  function toggleAdv(presetId: string) {
    onArmyChange(
      army.map((g) =>
        g.preset.id === presetId
          ? { ...g, advantage: !g.advantage, disadvantage: false }
          : g
      )
    );
  }

  function toggleDis(presetId: string) {
    onArmyChange(
      army.map((g) =>
        g.preset.id === presetId
          ? { ...g, disadvantage: !g.disadvantage, advantage: false }
          : g
      )
    );
  }

  function toggleExtra(presetId: string) {
    onArmyChange(
      army.map((g) =>
        g.preset.id === presetId
          ? {
              ...g,
              preset: {
                ...g.preset,
                extraDamage: {
                  ...g.preset.extraDamage,
                  enabled: !g.preset.extraDamage.enabled,
                },
              },
            }
          : g
      )
    );
  }

  function removeGroup(presetId: string) {
    onArmyChange(army.filter((g) => g.preset.id !== presetId));
  }

  const totalAttacks = army.reduce((s, g) => s + g.count, 0);

  return (
    <div className="rounded-xl border border-card-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Attack Simulator</h2>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={showCharts}
            onChange={onToggleCharts}
            className="accent-accent"
          />
          Show Charts
        </label>
      </div>

      {/* Add creatures */}
      <div className="mb-4 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => addGroup(p)}
            className="rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent"
          >
            + {p.name}
          </button>
        ))}
      </div>

      {/* Army groups */}
      {army.length > 0 && (
        <div className="mb-4 space-y-2">
          {army.map((g) => (
            <div
              key={g.preset.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-card-border bg-background px-4 py-2.5"
            >
              <span className="min-w-[100px] font-medium">
                {g.preset.name}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateCount(g.preset.id, g.count - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded bg-card-border text-sm transition-colors hover:bg-muted"
                >
                  -
                </button>
                <input
                  type="number"
                  value={g.count}
                  onChange={(e) =>
                    updateCount(g.preset.id, Number(e.target.value))
                  }
                  className="w-12 rounded bg-card px-2 py-1 text-center text-sm"
                  min={1}
                />
                <button
                  onClick={() => updateCount(g.preset.id, g.count + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded bg-card-border text-sm transition-colors hover:bg-muted"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => toggleAdv(g.preset.id)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  g.advantage
                    ? "bg-green-900/50 text-green-300"
                    : "bg-card-border text-muted hover:text-foreground"
                }`}
              >
                ADV
              </button>
              <button
                onClick={() => toggleDis(g.preset.id)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  g.disadvantage
                    ? "bg-red-900/50 text-red-300"
                    : "bg-card-border text-muted hover:text-foreground"
                }`}
              >
                DIS
              </button>
              {g.preset.extraDamage.entries.length > 0 && (
                <button
                  onClick={() => toggleExtra(g.preset.id)}
                  className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                    g.preset.extraDamage.enabled
                      ? "bg-blue-900/50 text-blue-300"
                      : "bg-card-border text-muted hover:text-foreground"
                  }`}
                >
                  {g.preset.extraDamage.name || "Extra"}
                </button>
              )}
              <button
                onClick={() => removeGroup(g.preset.id)}
                className="ml-auto text-sm text-muted transition-colors hover:text-danger"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Simulate */}
      <div className="flex items-center gap-4">
        {!acHidden && (
          <span className="text-sm text-muted">
            Target AC: <span className="font-medium text-foreground">{targetAc}</span>
          </span>
        )}
        <button
          onClick={onSimulate}
          disabled={army.length === 0 || loading}
          className="rounded-lg bg-accent px-6 py-2 font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Simulating..." : `Simulate (${totalAttacks} attacks)`}
        </button>
      </div>
    </div>
  );
}
