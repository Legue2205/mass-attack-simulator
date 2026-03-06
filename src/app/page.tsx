"use client";

import { useState } from "react";
import {
  CreaturePreset,
  ArmyGroup,
  MinionInstance,
  SimulationResult,
  HiddenAcPreset,
  AppState,
} from "@/types";
import { DEFAULT_PRESETS } from "@/lib/presets";
import { runSimulation } from "@/lib/simulation";
import CreatureManager from "@/components/CreatureManager";
import ArmyBuilder from "@/components/ArmyBuilder";
import SimulationResults from "@/components/SimulationResults";
import MinionDashboard from "@/components/MinionDashboard";
import HiddenAcPanel from "@/components/HiddenAcPanel";
import SaveSimulator from "@/components/SaveSimulator";
import SaveLoadPanel from "@/components/SaveLoadPanel";

type Tab = "lab" | "dashboard" | "saveload";

export default function Home() {
  const [presets, setPresets] = useState<CreaturePreset[]>(DEFAULT_PRESETS);
  const [army, setArmy] = useState<ArmyGroup[]>([]);
  const [targetAc, setTargetAc] = useState(15);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [minions, setMinions] = useState<MinionInstance[]>([]);
  const [showCharts, setShowCharts] = useState(true);
  const [hiddenAcPresets, setHiddenAcPresets] = useState<HiddenAcPreset[]>([]);
  const [acHidden, setAcHidden] = useState(false);

  function handleSimulate() {
    if (army.length === 0) return;
    const simResult = runSimulation({
      groups: army.map((g) => ({
        presetId: g.preset.id,
        name: g.preset.name,
        atkBonus: g.preset.atkBonus,
        damageEntries: g.preset.damageEntries,
        extraDamageEntries: g.preset.extraDamage.enabled
          ? g.preset.extraDamage.entries
          : [],
        count: g.count,
        advantage: g.advantage,
        disadvantage: g.disadvantage,
      })),
      targetAc,
    });
    setResult(simResult);
  }

  function getAppState(): AppState {
    return { presets, minions, hiddenAcPresets };
  }

  function loadAppState(state: AppState) {
    setPresets(state.presets);
    setMinions(state.minions);
    setHiddenAcPresets(state.hiddenAcPresets || []);
    setArmy([]);
    setResult(null);
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-accent">Mass Attack</span> Simulator
        </h1>
        <p className="mt-2 text-muted">
          D&D mass combat simulator -- build your horde, roll the dice
        </p>
      </header>

      {/* Tab navigation */}
      <div className="mb-6 flex justify-center gap-1 rounded-lg border border-card-border bg-card p-1">
        <button
          onClick={() => setTab("lab")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors sm:px-6 ${
            tab === "lab"
              ? "bg-accent text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Monster Lab
        </button>
        <button
          onClick={() => setTab("dashboard")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors sm:px-6 ${
            tab === "dashboard"
              ? "bg-accent text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Battle Dashboard
        </button>
        <button
          onClick={() => setTab("saveload")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors sm:px-6 ${
            tab === "saveload"
              ? "bg-accent text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Save / Load
        </button>
      </div>

      {/* Monster Lab tab */}
      {tab === "lab" && (
        <div className="space-y-6">
          <CreatureManager presets={presets} onPresetsChange={setPresets} />
        </div>
      )}

      {/* Battle Dashboard tab */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          <HiddenAcPanel
            presets={hiddenAcPresets}
            onPresetsChange={setHiddenAcPresets}
            targetAc={targetAc}
            onTargetAcChange={setTargetAc}
            acHidden={acHidden}
            onAcHiddenChange={setAcHidden}
          />
          <ArmyBuilder
            presets={presets}
            army={army}
            onArmyChange={setArmy}
            targetAc={targetAc}
            onTargetAcChange={setTargetAc}
            onSimulate={handleSimulate}
            loading={false}
            showCharts={showCharts}
            onToggleCharts={() => setShowCharts(!showCharts)}
            acHidden={acHidden}
          />
          {result && (
            <SimulationResults result={result} showCharts={showCharts} />
          )}
          <MinionDashboard
            presets={presets}
            minions={minions}
            onMinionsChange={setMinions}
          />
          <SaveSimulator minions={minions} onMinionsChange={setMinions} />
        </div>
      )}

      {/* Save / Load tab */}
      {tab === "saveload" && (
        <SaveLoadPanel state={getAppState()} onLoad={loadAppState} />
      )}
    </div>
  );
}
