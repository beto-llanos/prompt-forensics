"use client";

import { useMemo, useState } from "react";
import type { Finding, Severity, Span } from "@/lib/types";

const SEV_RANK: Record<Severity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

const CLASS_FOR: Record<Severity, string> = {
  critical: "hl-critical",
  high: "hl-high",
  medium: "hl-medium",
  low: "hl-low",
  info: "hl-info",
};

interface Segment {
  start: number;
  end: number;
  findings: Finding[];
  worst: Severity | null;
}

function buildSegments(text: string, findings: Finding[]): Segment[] {
  const points = new Set<number>([0, text.length]);
  const owners: { span: Span; finding: Finding }[] = [];
  for (const f of findings) {
    for (const span of f.spans) {
      points.add(span.start);
      points.add(span.end);
      owners.push({ span, finding: f });
    }
  }
  const sortedPoints = Array.from(points).sort((a, b) => a - b);
  const segments: Segment[] = [];
  for (let i = 0; i < sortedPoints.length - 1; i++) {
    const start = sortedPoints[i];
    const end = sortedPoints[i + 1];
    if (start === end) continue;
    const inside = owners
      .filter(({ span }) => span.start <= start && span.end >= end)
      .map(({ finding }) => finding);
    const worst = inside.reduce<Severity | null>((acc, f) => {
      if (!acc) return f.severity;
      return SEV_RANK[f.severity] > SEV_RANK[acc] ? f.severity : acc;
    }, null);
    segments.push({ start, end, findings: inside, worst });
  }
  return segments;
}

export function HighlightedPrompt({
  prompt,
  findings,
  activeFindingId,
  onHover,
}: {
  prompt: string;
  findings: Finding[];
  activeFindingId?: string | null;
  onHover?: (findingId: string | null) => void;
}) {
  const segments = useMemo(() => buildSegments(prompt, findings), [prompt, findings]);
  const [hoverSegment, setHoverSegment] = useState<number | null>(null);

  return (
    <pre className="code-scroll relative overflow-x-auto font-mono text-[12.5px] leading-[1.65] text-bone/85">
      <code>
        {segments.map((seg, idx) => {
          const text = prompt.slice(seg.start, seg.end);
          if (!seg.worst) {
            return (
              <span key={idx} className="text-bone/75">
                {text}
              </span>
            );
          }
          const isActive =
            activeFindingId !== undefined &&
            activeFindingId !== null &&
            seg.findings.some((f) => f.id === activeFindingId);
          return (
            <span
              key={idx}
              className={`relative cursor-pointer px-[2px] transition ${CLASS_FOR[seg.worst]} ${
                isActive ? "ring-1 ring-signal/70" : ""
              }`}
              onMouseEnter={() => {
                setHoverSegment(idx);
                onHover?.(seg.findings[0]?.id ?? null);
              }}
              onMouseLeave={() => {
                setHoverSegment(null);
                onHover?.(null);
              }}
            >
              {text}
              {hoverSegment === idx && seg.findings.length > 0 && (
                <span className="pointer-events-none absolute left-0 top-full z-30 mt-2 w-72 border border-hairline-bright bg-carbon p-3 font-sans text-[11px] leading-relaxed text-bone shadow-2xl">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-signal">
                    {seg.findings[0].severity} · {seg.findings[0].title}
                  </span>
                  <span className="mt-2 block text-bone/75">
                    {seg.findings[0].rationale}
                  </span>
                </span>
              )}
            </span>
          );
        })}
      </code>
    </pre>
  );
}
