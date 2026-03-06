"use client";

import { useState } from "react";
import { HiddenAcPreset } from "@/types";

interface Props {
  presets: HiddenAcPreset[];
  onPresetsChange: (presets: HiddenAcPreset[]) => void;
  targetAc: number;
  onTargetAcChange: (ac: number) => void;
  acHidden: boolean;
  onAcHiddenChange: (hidden: boolean) => void;
}

export default function HiddenAcPanel({
  presets,
  onPresetsChange,
  targetAc,
  onTargetAcChange,
  acHidden,
  onAcHiddenChange,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAc, setNewAc] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  function addPreset() {
    if (!newLabel.trim() || !newAc) return;
    onPresetsChange([
      ...presets,
      { id: crypto.randomUUID(), label: newLabel.trim(), ac: Number(newAc) },
    ]);
    setNewLabel("");
    setNewAc("");
  }

  function removePreset(id: string) {
    onPresetsChange(presets.filter((p) => p.id !== id));
    if (selectedPresetId === id) {
      setSelectedPresetId(null);
      onAcHiddenChange(false);
    }
  }

  function selectPreset(preset: HiddenAcPreset) {
    if (selectedPresetId === preset.id) {
      // Deselect — go back to manual
      setSelectedPresetId(null);
      onAcHiddenChange(false);
    } else {
      setSelectedPresetId(preset.id);
      onTargetAcChange(preset.ac);
      onAcHiddenChange(true);
    }
  }

  function switchToManual() {
    setSelectedPresetId(null);
    onAcHiddenChange(false);
  }

  return (
    <div className="rounded-xl border border-card-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Target AC</h2>
        <button
          onClick={() => setRevealed(!revealed)}
          className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
            revealed
              ? "border-warning/30 bg-warning/10 text-warning"
              : "border-card-border text-muted hover:text-foreground"
          }`}
        >
          {revealed ? "Hide AC Values" : "Reveal AC Values (DM)"}
        </button>
      </div>

      <p className="mb-3 text-xs text-muted">
        DM sets up hidden AC presets. Players click a label to target it without
        seeing the value. Use &quot;Manual AC&quot; for a visible numeric input instead.
      </p>

      {/* Mode indicator */}
      {acHidden ? (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm">
            Targeting:{" "}
            <span className="font-medium text-accent">
              {presets.find((p) => p.id === selectedPresetId)?.label || "Hidden"}
            </span>
            {revealed && (
              <span className="ml-1 text-xs text-muted">(AC {targetAc})</span>
            )}
          </span>
          <button
            onClick={switchToManual}
            className="rounded border border-card-border px-2 py-1 text-xs text-muted transition-colors hover:text-foreground"
          >
            Switch to Manual
          </button>
        </div>
      ) : (
        <div className="mb-4 flex items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-sm text-muted">Manual AC</span>
            <input
              type="number"
              value={targetAc}
              onChange={(e) => onTargetAcChange(Number(e.target.value))}
              className="input-field w-20"
              min={1}
            />
          </label>
        </div>
      )}

      {/* AC presets */}
      {presets.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPreset(p)}
              className={`group relative rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                selectedPresetId === p.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-card-border bg-background hover:border-accent"
              }`}
            >
              <span>{p.label}</span>
              {revealed && (
                <span className="ml-1.5 font-mono text-xs text-muted">
                  AC {p.ac}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removePreset(p.id);
                }}
                className="ml-2 text-xs text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
              >
                x
              </button>
            </button>
          ))}
        </div>
      )}

      {/* Add new preset (DM only section) */}
      {revealed && (
        <div className="flex items-end gap-2 rounded-lg border border-dashed border-card-border p-3">
          <label className="block">
            <span className="mb-1 block text-xs text-muted">Label</span>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="input-field w-32"
              placeholder="e.g. Archer"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted">AC</span>
            <input
              type="number"
              value={newAc}
              onChange={(e) => setNewAc(e.target.value)}
              className="input-field w-16"
              placeholder="15"
              min={1}
            />
          </label>
          <button
            onClick={addPreset}
            className="rounded-lg border border-card-border px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
          >
            + Add
          </button>
        </div>
      )}
    </div>
  );
}
