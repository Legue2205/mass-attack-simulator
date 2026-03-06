"use client";

import { useState } from "react";
import { CreaturePreset, MinionInstance, Condition, CONDITIONS } from "@/types";

interface Props {
  presets: CreaturePreset[];
  minions: MinionInstance[];
  onMinionsChange: (minions: MinionInstance[]) => void;
}

export default function MinionDashboard({
  presets,
  minions,
  onMinionsChange,
}: Props) {
  const [hpDelta, setHpDelta] = useState<Record<string, string>>({});
  const [massHpDelta, setMassHpDelta] = useState("");
  const [showConditionPicker, setShowConditionPicker] = useState(false);

  function spawnMinions(preset: CreaturePreset, count: number) {
    const existing = minions.filter((m) => m.presetId === preset.id).length;
    const newMinions: MinionInstance[] = Array.from(
      { length: count },
      (_, i) => ({
        id: crypto.randomUUID(),
        presetId: preset.id,
        name: `${preset.name} ${existing + i + 1}`,
        currentHp: preset.maxHp,
        maxHp: preset.maxHp,
        ac: preset.ac,
        selected: false,
        conditions: [],
        savingThrows: { ...preset.savingThrows },
      })
    );
    onMinionsChange([...minions, ...newMinions]);
  }

  function updateHp(id: string, delta: number) {
    onMinionsChange(
      minions.map((m) =>
        m.id === id
          ? {
              ...m,
              currentHp: Math.max(0, Math.min(m.maxHp, m.currentHp + delta)),
            }
          : m
      )
    );
  }

  function applyHpDelta(id: string) {
    const val = parseInt(hpDelta[id] || "0");
    if (!isNaN(val) && val !== 0) {
      updateHp(id, val);
      setHpDelta({ ...hpDelta, [id]: "" });
    }
  }

  function applyMassHp() {
    const val = parseInt(massHpDelta || "0");
    if (isNaN(val) || val === 0) return;
    if (!minions.some((m) => m.selected)) return;
    onMinionsChange(
      minions.map((m) =>
        m.selected
          ? {
              ...m,
              currentHp: Math.max(0, Math.min(m.maxHp, m.currentHp + val)),
            }
          : m
      )
    );
    setMassHpDelta("");
  }

  function toggleSelect(id: string) {
    onMinionsChange(
      minions.map((m) => (m.id === id ? { ...m, selected: !m.selected } : m))
    );
  }

  function selectAll() {
    const allSelected =
      minions.length > 0 && minions.every((m) => m.selected);
    onMinionsChange(minions.map((m) => ({ ...m, selected: !allSelected })));
  }

  function removeMinion(id: string) {
    onMinionsChange(minions.filter((m) => m.id !== id));
  }

  function removeDead() {
    onMinionsChange(minions.filter((m) => m.currentHp > 0));
  }

  function toggleConditionOnMinion(id: string, condition: Condition) {
    onMinionsChange(
      minions.map((m) => {
        if (m.id !== id) return m;
        const has = m.conditions.includes(condition);
        return {
          ...m,
          conditions: has
            ? m.conditions.filter((c) => c !== condition)
            : [...m.conditions, condition],
        };
      })
    );
  }

  function addConditionToSelected(condition: Condition) {
    onMinionsChange(
      minions.map((m) => {
        if (!m.selected) return m;
        if (m.conditions.includes(condition)) return m;
        return { ...m, conditions: [...m.conditions, condition] };
      })
    );
  }

  function removeConditionFromSelected(condition: Condition) {
    onMinionsChange(
      minions.map((m) => {
        if (!m.selected) return m;
        return {
          ...m,
          conditions: m.conditions.filter((c) => c !== condition),
        };
      })
    );
  }

  function clearConditionsFromSelected() {
    onMinionsChange(
      minions.map((m) => (m.selected ? { ...m, conditions: [] } : m))
    );
  }

  function getHpColor(current: number, max: number): string {
    const pct = current / max;
    if (pct <= 0) return "bg-zinc-700";
    if (pct <= 0.25) return "bg-red-600";
    if (pct <= 0.5) return "bg-yellow-600";
    return "bg-green-600";
  }

  function getStatusLabel(current: number, max: number): string {
    if (current <= 0) return "Dead";
    if (current <= max * 0.25) return "Critical";
    if (current <= max * 0.5) return "Bloodied";
    return "Healthy";
  }

  const selectedCount = minions.filter((m) => m.selected).length;

  const grouped = presets
    .map((p) => ({
      preset: p,
      minions: minions.filter((m) => m.presetId === p.id),
    }))
    .filter((g) => g.minions.length > 0);

  return (
    <div className="rounded-xl border border-card-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Minion Dashboard
          {selectedCount > 0 && (
            <span className="ml-2 text-sm font-normal text-accent">
              ({selectedCount} selected)
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="rounded-lg border border-card-border px-3 py-1.5 text-sm transition-colors hover:bg-background"
          >
            {minions.length > 0 && minions.every((m) => m.selected)
              ? "Deselect All"
              : "Select All"}
          </button>
          <button
            onClick={removeDead}
            className="rounded-lg border border-danger/30 px-3 py-1.5 text-sm text-danger transition-colors hover:bg-danger/10"
          >
            Remove Dead
          </button>
        </div>
      </div>

      {/* Spawn buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {presets.map((p) => (
          <div key={p.id} className="flex items-center gap-1">
            <button
              onClick={() => spawnMinions(p, 1)}
              className="rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent"
            >
              + {p.name}
            </button>
            <button
              onClick={() => spawnMinions(p, 5)}
              className="rounded border border-card-border bg-background px-2 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
            >
              +5
            </button>
          </div>
        ))}
      </div>

      {/* Mass controls */}
      {selectedCount > 0 && (
        <div className="mb-4 space-y-2">
          {/* Mass HP */}
          <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5">
            <span className="text-sm font-medium">
              Mass HP ({selectedCount}):
            </span>
            <input
              type="number"
              value={massHpDelta}
              onChange={(e) => setMassHpDelta(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyMassHp();
              }}
              placeholder="+/- HP"
              className="input-field w-24"
            />
            <button
              onClick={applyMassHp}
              className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Apply
            </button>
          </div>

          {/* Mass Conditions */}
          <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">
                Mass Conditions ({selectedCount}):
              </span>
              <div className="flex gap-2">
                <button
                  onClick={clearConditionsFromSelected}
                  className="text-xs text-danger hover:text-red-300"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowConditionPicker(!showConditionPicker)}
                  className="text-xs text-accent hover:text-accent-hover"
                >
                  {showConditionPicker ? "Hide" : "Show"} Picker
                </button>
              </div>
            </div>
            {showConditionPicker && (
              <div className="flex flex-wrap gap-1">
                {CONDITIONS.map((c) => (
                  <div key={c} className="flex gap-0.5">
                    <button
                      onClick={() => addConditionToSelected(c)}
                      className="rounded-l bg-green-900/30 px-1.5 py-0.5 text-xs text-green-300 hover:bg-green-900/50"
                      title={`Add ${c}`}
                    >
                      +
                    </button>
                    <span className="bg-card-border px-1.5 py-0.5 text-xs text-muted">
                      {c}
                    </span>
                    <button
                      onClick={() => removeConditionFromSelected(c)}
                      className="rounded-r bg-red-900/30 px-1.5 py-0.5 text-xs text-red-300 hover:bg-red-900/50"
                      title={`Remove ${c}`}
                    >
                      -
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Minion groups */}
      {grouped.length === 0 && (
        <p className="py-8 text-center text-sm text-muted">
          No minions spawned yet. Use the buttons above to add some.
        </p>
      )}

      {grouped.map(({ preset, minions: groupMinions }) => (
        <div key={preset.id} className="mb-4">
          <h3 className="mb-2 text-sm font-medium text-muted">
            {preset.name}s ({groupMinions.length})
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {groupMinions.map((m) => (
              <div
                key={m.id}
                onClick={() => toggleSelect(m.id)}
                className={`cursor-pointer select-none rounded-lg border px-3 py-2.5 transition-colors ${
                  m.selected
                    ? "border-accent bg-accent/10"
                    : "border-card-border bg-background hover:border-muted"
                } ${m.currentHp <= 0 ? "opacity-50" : ""}`}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div
                      className={`h-3 w-3 rounded border ${
                        m.selected
                          ? "border-accent bg-accent"
                          : "border-muted"
                      }`}
                    />
                    {m.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>AC {m.ac}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 ${
                        m.currentHp <= 0
                          ? "bg-zinc-800 text-zinc-500"
                          : m.currentHp <= m.maxHp * 0.25
                          ? "bg-red-900/50 text-red-300"
                          : m.currentHp <= m.maxHp * 0.5
                          ? "bg-yellow-900/50 text-yellow-300"
                          : "bg-green-900/50 text-green-300"
                      }`}
                    >
                      {getStatusLabel(m.currentHp, m.maxHp)}
                    </span>
                  </div>
                </div>

                {/* HP bar */}
                <div className="mb-1.5 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all ${getHpColor(
                      m.currentHp,
                      m.maxHp
                    )}`}
                    style={{
                      width: `${Math.max(
                        0,
                        (m.currentHp / m.maxHp) * 100
                      )}%`,
                    }}
                  />
                </div>

                {/* Conditions */}
                {m.conditions.length > 0 && (
                  <div
                    className="mb-1.5 flex flex-wrap gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {m.conditions.map((c) => (
                      <button
                        key={c}
                        onClick={() => toggleConditionOnMinion(m.id, c)}
                        className="rounded bg-yellow-900/40 px-1.5 py-0.5 text-xs text-yellow-300 hover:bg-red-900/40 hover:text-red-300"
                        title={`Click to remove ${c}`}
                      >
                        {c} x
                      </button>
                    ))}
                  </div>
                )}

                {/* HP controls */}
                <div
                  className="flex items-center justify-between text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>
                    {m.currentHp}/{m.maxHp} HP
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateHp(m.id, -1)}
                      className="flex h-5 w-5 items-center justify-center rounded bg-card-border text-xs hover:bg-red-900/50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={hpDelta[m.id] || ""}
                      onChange={(e) =>
                        setHpDelta({ ...hpDelta, [m.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") applyHpDelta(m.id);
                      }}
                      placeholder="+/-"
                      className="w-12 rounded bg-card px-1.5 py-0.5 text-center text-xs"
                    />
                    <button
                      onClick={() => applyHpDelta(m.id)}
                      className="flex h-5 items-center justify-center rounded bg-card-border px-1.5 text-xs hover:bg-accent/30"
                    >
                      Go
                    </button>
                    <button
                      onClick={() => updateHp(m.id, 1)}
                      className="flex h-5 w-5 items-center justify-center rounded bg-card-border text-xs hover:bg-green-900/50"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeMinion(m.id)}
                      className="ml-1 flex h-5 w-5 items-center justify-center rounded text-xs text-muted hover:text-danger"
                    >
                      x
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
