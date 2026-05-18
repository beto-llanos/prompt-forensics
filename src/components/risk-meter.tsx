"use client";

import { motion } from "framer-motion";
import type { RiskScore } from "@/lib/types";

const BAND_STYLES: Record<RiskScore["band"], { label: string; color: string; fill: string }> = {
  safe: { label: "SAFE", color: "text-lime", fill: "bg-lime" },
  watch: { label: "WATCH", color: "text-amber", fill: "bg-amber" },
  elevated: { label: "ELEVATED", color: "text-ember", fill: "bg-ember" },
  critical: { label: "CRITICAL", color: "text-crimson", fill: "bg-crimson" },
};

export function RiskMeter({ score }: { score: RiskScore }) {
  const band = BAND_STYLES[score.band];
  return (
    <div className="border border-hairline bg-slab/60 p-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ash">
            risk score
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <motion.span
              className="font-display text-6xl font-medium text-bone"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {score.total}
            </motion.span>
            <span className="font-mono text-sm text-ash">/ 100</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ash">
            band
          </p>
          <p className={`mt-2 font-mono text-xl tracking-[0.12em] ${band.color}`}>
            {band.label}
          </p>
        </div>
      </div>

      <div className="mt-6 h-1.5 w-full overflow-hidden bg-hairline">
        <motion.div
          className={`h-full ${band.fill}`}
          initial={{ width: 0 }}
          animate={{ width: `${score.total}%` }}
          transition={{ duration: 1.0, ease: [0.22, 0.61, 0.36, 1] }}
        />
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2 font-mono text-[10px] uppercase tracking-[0.15em]">
        <SevTick label="critical" count={score.countsBySeverity.critical} color="text-crimson" />
        <SevTick label="high" count={score.countsBySeverity.high} color="text-ember" />
        <SevTick label="medium" count={score.countsBySeverity.medium} color="text-amber" />
        <SevTick label="low" count={score.countsBySeverity.low} color="text-lime" />
        <SevTick label="info" count={score.countsBySeverity.info} color="text-signal" />
      </div>
    </div>
  );
}

function SevTick({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-ash">{label}</span>
      <span className={`font-mono text-lg ${count > 0 ? color : "text-bone/40"}`}>
        {count}
      </span>
    </div>
  );
}
