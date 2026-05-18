import type { Severity } from "@/lib/types";
import { SEVERITY_LABEL } from "@/lib/detectors";

const TONES: Record<Severity, string> = {
  critical: "bg-crimson/15 text-crimson border-crimson/40",
  high: "bg-ember/15 text-ember border-ember/40",
  medium: "bg-amber/15 text-amber border-amber/40",
  low: "bg-lime/15 text-lime border-lime/40",
  info: "bg-signal/15 text-signal border-signal/40",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center border px-2 py-[2px] font-mono text-[10px] uppercase tracking-[0.18em] ${TONES[severity]}`}
    >
      {SEVERITY_LABEL[severity]}
    </span>
  );
}
