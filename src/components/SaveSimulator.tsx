"use client";

import { useState } from "react";
import {
  MinionInstance,
  AbilityScore,
  ABILITY_SCORES,
  DamageType,
  DAMAGE_TYPES,
  Condition,
  CONDITIONS,
  SaveResult,
} from "@/types";

interface Props {
  minions: MinionInstance[];
  onMinionsChange: (minions: MinionInstance[]) => void;
}

export default function SaveSimulator({ minions, onMinionsChange }: Props) {
  const selected = minions.filter((m) => m.selected && m.currentHp > 0);

  const [dc, setDc] = useState(15);
  const [ability, setAbility] = useState<AbilityScore>("DEX");
  const [failDamage, setFailDamage] = useState("8d6");
  const [failDamageType, setFailDamageType] = useState<DamageType>("Fire");
  const [failConditions, setFailConditions] = useState<Condition[]>([]);
  const [passDamage, setPassDamage] = useState("");
  const [passDamageType, setPassDamageType] = useState<DamageType>("Fire");
  const [passConditions, setPassConditions] = useState<Condition[]>([]);
  const [halfOnPass, setHalfOnPass] = useState(true);
  const [noEffectOnPass, setNoEffectOnPass] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSimulate() {
    if (selected.length === 0) return;
    setLoading(true);

    const savingThrows: Record<string, number> = {};
    for (const m of selected) {
      savingThrows[m.id] = m.savingThrows[ability];
    }

    try {
      const res = await fetch("/api/save-throw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minionIds: selected.map((m) => m.id),
          savingThrows,
          dc,
          ability,
          failDamage,
          failDamageType,
          failConditions,
          passDamage: halfOnPass ? "" : passDamage,
          passDamageType,
          passConditions: noEffectOnPass ? [] : passConditions,
        }),
      });
      const data: SaveResult = await res.json();

      // If halfOnPass, compute half of each fail damage for those who passed
      if (halfOnPass) {
        for (const r of data.results) {
          if (r.passed) {
            const failResult = data.results.find(
              (fr) => !fr.passed && fr.damage > 0
            );
            if (failResult) {
              r.damage = Math.floor(failResult.damage / 2);
            } else {
              // No failures to reference, roll fail damage and halve
              // The API already rolled 0 for pass, so we need to re-derive
              // Actually we want half of the FAIL formula for each passer
            }
          }
        }
      }

      setResult(data);

      // Apply damage and conditions to minions
      onMinionsChange(
        minions.map((m) => {
          const r = data.results.find((r) => r.minionId === m.id);
          if (!r) return m;

          let newHp = m.currentHp;
          let damage = r.damage;

          // Half on pass override: compute from the fail formula
          if (halfOnPass && r.passed && failDamage.trim()) {
            // damage was already set to 0 by API since passDamage was empty
            // We need to use the fail damage formula / 2 per minion
            // Instead, let's use a different approach: re-roll for pass = half of fail
          }

          newHp = Math.max(0, newHp - damage);

          const newConditions = [...m.conditions];
          for (const c of r.conditions) {
            if (!newConditions.includes(c)) {
              newConditions.push(c);
            }
          }

          return { ...m, currentHp: newHp, conditions: newConditions };
        })
      );
    } finally {
      setLoading(false);
    }
  }

  // Better approach: handle half damage on pass server-side
  async function handleSimulateV2() {
    if (selected.length === 0) return;
    setLoading(true);

    const savingThrows: Record<string, number> = {};
    for (const m of selected) {
      savingThrows[m.id] = m.savingThrows[ability];
    }

    const effectivePassDamage =
      halfOnPass && failDamage.trim() ? failDamage : passDamage;

    try {
      const res = await fetch("/api/save-throw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minionIds: selected.map((m) => m.id),
          savingThrows,
          dc,
          ability,
          failDamage,
          failDamageType,
          failConditions,
          passDamage: effectivePassDamage,
          passDamageType,
          passConditions: noEffectOnPass ? [] : passConditions,
        }),
      });
      const data: SaveResult = await res.json();

      // If halfOnPass, halve the pass damage
      if (halfOnPass) {
        for (const r of data.results) {
          if (r.passed) {
            r.damage = Math.floor(r.damage / 2);
          }
        }
        // Recalculate total
        data.totalDamage = data.results.reduce((s, r) => s + r.damage, 0);
      }

      // Remove conditions from pass results if noEffectOnPass
      if (noEffectOnPass) {
        for (const r of data.results) {
          if (r.passed) {
            r.conditions = [];
          }
        }
      }

      setResult(data);

      // Apply damage and conditions to minions
      onMinionsChange(
        minions.map((m) => {
          const r = data.results.find((res) => res.minionId === m.id);
          if (!r) return m;

          const newHp = Math.max(0, m.currentHp - r.damage);
          const newConditions = [...m.conditions];
          for (const c of r.conditions) {
            if (!newConditions.includes(c)) {
              newConditions.push(c);
            }
          }

          return { ...m, currentHp: newHp, conditions: newConditions };
        })
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleCondition(
    list: Condition[],
    setter: (c: Condition[]) => void,
    condition: Condition
  ) {
    if (list.includes(condition)) {
      setter(list.filter((c) => c !== condition));
    } else {
      setter([...list, condition]);
    }
  }

  return (
    <div className="rounded-xl border border-card-border bg-card p-5">
      <h2 className="mb-4 text-lg font-semibold">
        Saving Throw Simulator
        {selected.length > 0 && (
          <span className="ml-2 text-sm font-normal text-accent">
            ({selected.length} minions selected)
          </span>
        )}
      </h2>

      {selected.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">
          Select minions from the dashboard above to subject them to a saving
          throw.
        </p>
      ) : (
        <div className="space-y-4">
          {/* DC and Ability */}
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 block text-sm text-muted">DC</span>
              <input
                type="number"
                value={dc}
                onChange={(e) => setDc(Number(e.target.value))}
                className="input-field w-20"
                min={1}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-muted">
                Ability Save
              </span>
              <select
                value={ability}
                onChange={(e) => setAbility(e.target.value as AbilityScore)}
                className="input-field w-24"
              >
                {ABILITY_SCORES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* On Fail */}
          <div className="rounded-lg border border-red-900/30 bg-red-900/5 p-3">
            <h3 className="mb-2 text-sm font-medium text-red-400">On Fail</h3>
            <div className="flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="mb-1 block text-xs text-muted">Damage</span>
                <input
                  type="text"
                  value={failDamage}
                  onChange={(e) => setFailDamage(e.target.value)}
                  className="input-field w-28"
                  placeholder="8d6"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-muted">Type</span>
                <select
                  value={failDamageType}
                  onChange={(e) =>
                    setFailDamageType(e.target.value as DamageType)
                  }
                  className="input-field w-32"
                >
                  {DAMAGE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-2">
              <span className="mb-1 block text-xs text-muted">Conditions</span>
              <div className="flex flex-wrap gap-1">
                {CONDITIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      toggleCondition(failConditions, setFailConditions, c)
                    }
                    className={`rounded px-2 py-0.5 text-xs transition-colors ${
                      failConditions.includes(c)
                        ? "bg-red-900/50 text-red-300"
                        : "bg-card-border text-muted hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* On Pass */}
          <div className="rounded-lg border border-green-900/30 bg-green-900/5 p-3">
            <h3 className="mb-2 text-sm font-medium text-green-400">
              On Pass
            </h3>
            {/* Quick options */}
            <div className="mb-3 flex gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={halfOnPass}
                  onChange={(e) => {
                    setHalfOnPass(e.target.checked);
                    if (e.target.checked) setPassDamage("");
                  }}
                  className="accent-green-500"
                />
                Half damage
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={noEffectOnPass}
                  onChange={(e) => {
                    setNoEffectOnPass(e.target.checked);
                    if (e.target.checked) setPassConditions([]);
                  }}
                  className="accent-green-500"
                />
                No conditions
              </label>
            </div>
            {!halfOnPass && (
              <div className="flex flex-wrap items-end gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs text-muted">Damage</span>
                  <input
                    type="text"
                    value={passDamage}
                    onChange={(e) => setPassDamage(e.target.value)}
                    className="input-field w-28"
                    placeholder="0 or formula"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-muted">Type</span>
                  <select
                    value={passDamageType}
                    onChange={(e) =>
                      setPassDamageType(e.target.value as DamageType)
                    }
                    className="input-field w-32"
                  >
                    {DAMAGE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            {!noEffectOnPass && (
              <div className="mt-2">
                <span className="mb-1 block text-xs text-muted">
                  Conditions
                </span>
                <div className="flex flex-wrap gap-1">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        toggleCondition(
                          passConditions,
                          setPassConditions,
                          c
                        )
                      }
                      className={`rounded px-2 py-0.5 text-xs transition-colors ${
                        passConditions.includes(c)
                          ? "bg-green-900/50 text-green-300"
                          : "bg-card-border text-muted hover:text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Simulate button */}
          <button
            onClick={handleSimulateV2}
            disabled={loading}
            className="rounded-lg bg-accent px-6 py-2 font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Rolling..."
              : `Roll ${ability} Save (${selected.length} minions)`}
          </button>

          {/* Results */}
          {result && (
            <div className="rounded-lg border border-card-border bg-background p-4">
              <div className="mb-3 flex gap-4 text-sm">
                <span>
                  <span className="text-green-400 font-medium">
                    {result.totalPassed}
                  </span>{" "}
                  passed
                </span>
                <span>
                  <span className="text-red-400 font-medium">
                    {result.totalFailed}
                  </span>{" "}
                  failed
                </span>
                <span>
                  <span className="text-accent font-medium">
                    {result.totalDamage}
                  </span>{" "}
                  total damage
                </span>
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {result.results.map((r) => {
                  const minion = minions.find((m) => m.id === r.minionId);
                  return (
                    <div
                      key={r.minionId}
                      className={`flex items-center justify-between rounded px-3 py-1.5 text-sm ${
                        r.passed ? "bg-green-900/10" : "bg-red-900/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            r.passed ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span>{minion?.name || r.minionId}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted">
                        <span>
                          Roll: {r.roll} (total {r.total})
                        </span>
                        {r.damage > 0 && <span>{r.damage} dmg</span>}
                        {r.conditions.length > 0 && (
                          <span className="text-xs">
                            {r.conditions.join(", ")}
                          </span>
                        )}
                        <span
                          className={`font-medium ${
                            r.passed ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {r.passed ? "PASS" : "FAIL"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
