"use client";

import { motion } from "framer-motion";
import type { Finding } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/detectors";
import { SeverityBadge } from "./severity-badge";

export function FindingCard({
  finding,
  index,
  active,
  onEnter,
  onLeave,
}: {
  finding: Finding;
  index: number;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.04 * index, ease: "easeOut" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`border bg-slab/60 p-5 transition ${
        active
          ? "border-signal/60 shadow-[0_0_0_1px_rgba(91,233,211,0.25)]"
          : "border-hairline hover:border-hairline-bright"
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ash">
          {String(index + 1).padStart(2, "0")} · {CATEGORY_LABELS[finding.category]}
        </span>
        <SeverityBadge severity={finding.severity} />
      </div>

      <h3 className="mt-3 font-display text-xl text-bone">{finding.title}</h3>

      <div className="mt-4 grid gap-4 text-sm leading-relaxed text-bone/75 md:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
            why this matters
          </p>
          <p className="mt-2">{finding.rationale}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
            remediation
          </p>
          <p className="mt-2">{finding.remediation}</p>
        </div>
      </div>

      {finding.evidence && (
        <div className="mt-4 border-l-2 border-hairline-bright bg-void/40 px-3 py-2 font-mono text-[11px] text-bone/60">
          <span className="text-ash">match · </span>
          <span className="break-all">{truncate(finding.evidence, 200)}</span>
        </div>
      )}
    </motion.div>
  );
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max) + "…";
}
