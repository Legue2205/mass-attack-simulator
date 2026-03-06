"use client";

import { useState } from "react";
import { CreaturePreset, DamageEntry, DAMAGE_TYPES, DamageType, ABILITY_SCORES, AbilityScore } from "@/types";

interface Props {
  presets: CreaturePreset[];
  onPresetsChange: (presets: CreaturePreset[]) => void;
}

const emptyEntry: DamageEntry = { formula: "1d6", type: "Slashing" };

const defaultSaves: Record<AbilityScore, number> = {
  STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0,
};

const emptyPreset: Omit<CreaturePreset, "id"> = {
  name: "",
  atkBonus: 4,
  damageEntries: [{ ...emptyEntry }],
  extraDamage: { name: "", entries: [], enabled: false },
  maxHp: 13,
  ac: 13,
  savingThrows: { ...defaultSaves },
};

export default function CreatureManager({ presets, onPresetsChange }: Props) {
  const [editing, setEditing] = useState<CreaturePreset | null>(null);
  const [isNew, setIsNew] = useState(false);

  function startCreate() {
    setEditing({
      ...emptyPreset,
      id: crypto.randomUUID(),
      damageEntries: [{ ...emptyEntry }],
      extraDamage: { name: "", entries: [], enabled: false },
      savingThrows: { ...defaultSaves },
    });
    setIsNew(true);
  }

  function startEdit(preset: CreaturePreset) {
    setEditing(JSON.parse(JSON.stringify(preset)));
    setIsNew(false);
  }

  function save() {
    if (!editing || !editing.name.trim()) return;
    if (isNew) {
      onPresetsChange([...presets, editing]);
    } else {
      onPresetsChange(presets.map((p) => (p.id === editing.id ? editing : p)));
    }
    setEditing(null);
  }

  function remove(id: string) {
    onPresetsChange(presets.filter((p) => p.id !== id));
  }

  // Damage entry helpers
  function updateDamageEntry(index: number, field: keyof DamageEntry, value: string) {
    if (!editing) return;
    const entries = [...editing.damageEntries];
    entries[index] = { ...entries[index], [field]: value };
    setEditing({ ...editing, damageEntries: entries });
  }

  function addDamageEntry() {
    if (!editing) return;
    setEditing({
      ...editing,
      damageEntries: [...editing.damageEntries, { ...emptyEntry }],
    });
  }

  function removeDamageEntry(index: number) {
    if (!editing) return;
    setEditing({
      ...editing,
      damageEntries: editing.damageEntries.filter((_, i) => i !== index),
    });
  }

  // Extra damage helpers
  function updateExtraEntry(index: number, field: keyof DamageEntry, value: string) {
    if (!editing) return;
    const entries = [...editing.extraDamage.entries];
    entries[index] = { ...entries[index], [field]: value };
    setEditing({
      ...editing,
      extraDamage: { ...editing.extraDamage, entries },
    });
  }

  function addExtraEntry() {
    if (!editing) return;
    setEditing({
      ...editing,
      extraDamage: {
        ...editing.extraDamage,
        entries: [...editing.extraDamage.entries, { ...emptyEntry }],
      },
    });
  }

  function removeExtraEntry(index: number) {
    if (!editing) return;
    setEditing({
      ...editing,
      extraDamage: {
        ...editing.extraDamage,
        entries: editing.extraDamage.entries.filter((_, i) => i !== index),
      },
    });
  }

  function formatDamageEntries(entries: DamageEntry[]): string {
    return entries.map((e) => `${e.formula} ${e.type}`).join(" + ");
  }

  return (
    <div className="rounded-xl border border-card-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Creature Presets</h2>
        <button
          onClick={startCreate}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          + New Creature
        </button>
      </div>

      {/* Preset list */}
      <div className="space-y-2">
        {presets.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-lg border border-card-border bg-background px-4 py-2.5"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium">{p.name}</span>
              <span className="text-sm text-muted">
                +{p.atkBonus} atk | {formatDamageEntries(p.damageEntries)} | AC{" "}
                {p.ac} | HP {p.maxHp}
              </span>
              {p.extraDamage.entries.length > 0 && (
                <span className="rounded bg-blue-900/50 px-1.5 py-0.5 text-xs text-blue-300">
                  {p.extraDamage.name || "Extra"}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(p)}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Edit
              </button>
              <button
                onClick={() => remove(p.id)}
                className="text-sm text-danger transition-colors hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-card-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">
              {isNew ? "New Creature" : `Edit ${editing.name}`}
            </h3>
            <div className="space-y-4">
              {/* Basic stats */}
              <Field label="Name">
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g. Skeleton"
                />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Attack Bonus">
                  <input
                    type="number"
                    value={editing.atkBonus}
                    onChange={(e) =>
                      setEditing({ ...editing, atkBonus: Number(e.target.value) })
                    }
                    className="input-field"
                  />
                </Field>
                <Field label="Armor Class">
                  <input
                    type="number"
                    value={editing.ac}
                    onChange={(e) =>
                      setEditing({ ...editing, ac: Number(e.target.value) })
                    }
                    className="input-field"
                  />
                </Field>
                <Field label="Max HP">
                  <input
                    type="number"
                    value={editing.maxHp}
                    onChange={(e) =>
                      setEditing({ ...editing, maxHp: Number(e.target.value) })
                    }
                    className="input-field"
                  />
                </Field>
              </div>

              {/* Damage entries */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted">
                    Damage Components
                  </span>
                  <button
                    onClick={addDamageEntry}
                    className="text-xs text-accent hover:text-accent-hover"
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-2">
                  {editing.damageEntries.map((entry, i) => (
                    <DamageEntryRow
                      key={i}
                      entry={entry}
                      onFormulaChange={(v) => updateDamageEntry(i, "formula", v)}
                      onTypeChange={(v) => updateDamageEntry(i, "type", v)}
                      onRemove={
                        editing.damageEntries.length > 1
                          ? () => removeDamageEntry(i)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Saving Throws */}
              <div>
                <span className="mb-2 block text-sm font-medium text-muted">
                  Saving Throw Bonuses
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {ABILITY_SCORES.map((ability) => (
                    <label key={ability} className="block text-center">
                      <span className="mb-1 block text-xs text-muted">
                        {ability}
                      </span>
                      <input
                        type="text"
                        inputMode="text"
                        value={editing.savingThrows[ability]}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "" || v === "-" || /^-?\d*$/.test(v)) {
                            setEditing({
                              ...editing,
                              savingThrows: {
                                ...editing.savingThrows,
                                [ability]: v === "" || v === "-" ? v as unknown as number : Number(v),
                              },
                            });
                          }
                        }}
                        className="input-field text-center"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Extra damage */}
              <div className="rounded-lg border border-card-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted">
                    Extra Damage (toggleable)
                  </span>
                  <button
                    onClick={addExtraEntry}
                    className="text-xs text-accent hover:text-accent-hover"
                  >
                    + Add
                  </button>
                </div>
                <Field label="Label">
                  <input
                    type="text"
                    value={editing.extraDamage.name}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        extraDamage: {
                          ...editing.extraDamage,
                          name: e.target.value,
                        },
                      })
                    }
                    className="input-field"
                    placeholder="e.g. Fire Arrows"
                  />
                </Field>
                {editing.extraDamage.entries.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {editing.extraDamage.entries.map((entry, i) => (
                      <DamageEntryRow
                        key={i}
                        entry={entry}
                        onFormulaChange={(v) => updateExtraEntry(i, "formula", v)}
                        onTypeChange={(v) => updateExtraEntry(i, "type", v)}
                        onRemove={() => removeExtraEntry(i)}
                      />
                    ))}
                  </div>
                )}
                {editing.extraDamage.entries.length === 0 && (
                  <p className="mt-2 text-xs text-muted">
                    No extra damage components. Click + Add above.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border border-card-border px-4 py-2 text-sm transition-colors hover:bg-background"
              >
                Cancel
              </button>
              <button
                onClick={save}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}

function DamageEntryRow({
  entry,
  onFormulaChange,
  onTypeChange,
  onRemove,
}: {
  entry: DamageEntry;
  onFormulaChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={entry.formula}
        onChange={(e) => onFormulaChange(e.target.value)}
        className="input-field w-28"
        placeholder="2d6+3"
      />
      <select
        value={entry.type}
        onChange={(e) => onTypeChange(e.target.value)}
        className="input-field flex-1"
      >
        {DAMAGE_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-muted hover:text-danger"
        >
          x
        </button>
      )}
    </div>
  );
}
