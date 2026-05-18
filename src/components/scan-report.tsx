"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ScanResult, Scenario } from "@/lib/types";
import { HighlightedPrompt } from "./highlighted-prompt";
import { RiskMeter } from "./risk-meter";
import { FindingCard } from "./finding-card";

export function ScanReport({ scenario }: { scenario: Scenario }) {
  const initial: ScanResult = scenario.cachedResult;
  const [activeFinding, setActiveFinding] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string>(initial.aiSummary ?? "");
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  async function regenerate() {
    setRegenerating(true);
    setRegenError(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenarioId: scenario.id }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        setRegenError(data.message || data.error || "request failed");
        return;
      }
      const data = (await res.json()) as { aiSummary?: string };
      if (data.aiSummary) setAiSummary(data.aiSummary);
    } catch (err) {
      setRegenError(err instanceof Error ? err.message : "network error");
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="min-w-0 space-y-6">
        <div className="overflow-hidden border border-hairline bg-slab/40">
          <div className="flex items-center justify-between border-b border-hairline px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-ash">
            <span>prompt under review</span>
            <span className="text-signal">
              {initial.prompt.length} chars
            </span>
          </div>
          <div className="code-scroll max-h-[640px] overflow-auto p-5">
            <HighlightedPrompt
              prompt={initial.prompt}
              findings={initial.findings}
              activeFindingId={activeFinding}
              onHover={setActiveFinding}
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="border border-hairline bg-slab/40 p-6"
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-signal">
              forensic note · ai
            </p>
            <button
              onClick={regenerate}
              disabled={regenerating}
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash transition hover:text-bone disabled:opacity-50"
            >
              {regenerating ? "running ·" : "regenerate ↻"}
            </button>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-bone/85">
            {aiSummary}
          </p>
          {regenError && (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ember">
              regen failed · {regenError} · showing cached
            </p>
          )}
        </motion.div>
      </div>

      <div className="min-w-0 space-y-6">
        <RiskMeter score={initial.score} />
        <div className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-hairline pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ash">
              findings · sorted by severity
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-signal">
              {initial.findings.length} detected
            </p>
          </div>
          {initial.findings.map((finding, i) => (
            <FindingCard
              key={finding.id + i}
              finding={finding}
              index={i}
              active={activeFinding === finding.id}
              onEnter={() => setActiveFinding(finding.id)}
              onLeave={() => setActiveFinding(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
