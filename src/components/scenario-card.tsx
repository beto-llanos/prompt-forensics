import Link from "next/link";
import type { Scenario } from "@/lib/types";

export function ScenarioCard({ scenario, index }: { scenario: Scenario; index: number }) {
  const { score } = scenario.cachedResult;
  const bandColor = {
    safe: "text-lime",
    watch: "text-amber",
    elevated: "text-ember",
    critical: "text-crimson",
  }[score.band];

  return (
    <Link
      href={`/scan/${scenario.id}`}
      className="group relative flex h-full flex-col justify-between border border-hairline bg-slab/40 p-6 transition hover:border-signal/40 hover:bg-slab"
    >
      <div>
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em]">
          <span className="text-ash">
            scenario / {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-signal">{scenario.domain}</span>
        </div>

        <h3 className="mt-5 font-display text-2xl leading-tight text-bone">
          {scenario.name}
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-bone/65">
          {scenario.tagline}
        </p>
      </div>

      <div className="mt-8 flex items-end justify-between border-t border-hairline pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
            risk
          </p>
          <p className={`mt-1 font-mono text-xl ${bandColor}`}>
            {score.total}
            <span className="text-ash">/100</span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
            findings
          </p>
          <p className="mt-1 font-mono text-xl text-bone">
            {scenario.cachedResult.findings.length}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash transition group-hover:text-signal">
            scan →
          </p>
        </div>
      </div>
    </Link>
  );
}
