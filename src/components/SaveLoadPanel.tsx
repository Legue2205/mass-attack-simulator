"use client";

import { useState } from "react";
import { AppState } from "@/types";

interface Props {
  state: AppState;
  onLoad: (state: AppState) => void;
}

export default function SaveLoadPanel({ state, onLoad }: Props) {
  const [importText, setImportText] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const exportJson = JSON.stringify(state, null, 2);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the textarea
    }
  }

  function handleLoad() {
    setError("");
    try {
      const parsed = JSON.parse(importText);
      if (!parsed.presets || !parsed.minions) {
        setError("Invalid format: missing presets or minions.");
        return;
      }
      onLoad(parsed as AppState);
      setImportText("");
    } catch {
      setError("Invalid JSON. Please check the format and try again.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Save / Export */}
      <div className="rounded-xl border border-card-border bg-card p-5">
        <h2 className="mb-3 text-lg font-semibold">Save State</h2>
        <p className="mb-3 text-sm text-muted">
          Copy this JSON to save your current state (creature presets, minion
          HP, conditions, AC presets). Paste it later to restore.
        </p>
        <textarea
          readOnly
          value={exportJson}
          className="input-field mb-3 h-48 w-full resize-y font-mono text-xs"
        />
        <button
          onClick={handleCopy}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
      </div>

      {/* Load / Import */}
      <div className="rounded-xl border border-card-border bg-card p-5">
        <h2 className="mb-3 text-lg font-semibold">Load State</h2>
        <p className="mb-3 text-sm text-muted">
          Paste a previously saved JSON to restore your state.
        </p>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste your saved JSON here..."
          className="input-field mb-3 h-48 w-full resize-y font-mono text-xs"
        />
        {error && <p className="mb-3 text-sm text-danger">{error}</p>}
        <button
          onClick={handleLoad}
          disabled={!importText.trim()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Load State
        </button>
      </div>
    </div>
  );
}
