import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllScenarios, getScenario } from "@/lib/scenarios";
import { ScanReport } from "@/components/scan-report";

export async function generateStaticParams() {
  return getAllScenarios().map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const scenario = getScenario(id);
  if (!scenario) {
    return { title: "Scan not found · PROMPT FORENSICS" };
  }
  return {
    title: `${scenario.name} · ${scenario.cachedResult.score.total}/100 · PROMPT FORENSICS`,
    description: scenario.tagline,
  };
}

export default async function ScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scenario = getScenario(id);
  if (!scenario) notFound();

  const all = getAllScenarios();
  const currentIdx = all.findIndex((s) => s.id === scenario.id);
  const next = all[(currentIdx + 1) % all.length];

  return (
    <main className="relative flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-hairline px-8 py-5 sm:px-14">
        <Link href="/" className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-signal blink" />
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-bone">
            prompt forensics
          </span>
        </Link>
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-ash transition hover:text-bone"
        >
          ← back to scenarios
        </Link>
      </header>

      <section className="border-b border-hairline px-8 py-10 sm:px-14">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em]">
            <span className="text-signal">scan · {scenario.id}</span>
            <span className="text-hairline-bright">·</span>
            <span className="text-ash">{scenario.domain}</span>
            <span className="text-hairline-bright">·</span>
            <span className="text-ash">
              completed{" "}
              {new Date(scenario.cachedResult.generatedAt)
                .toISOString()
                .slice(0, 16)
                .replace("T", " ")}
              z
            </span>
          </div>

          <h1 className="mt-6 font-display text-4xl font-medium leading-tight text-bone sm:text-6xl">
            {scenario.name}
          </h1>

          <p className="mt-4 max-w-2xl text-bone/65">{scenario.description}</p>
        </div>
      </section>

      <section className="px-8 py-12 sm:px-14">
        <div className="mx-auto w-full max-w-6xl">
          <ScanReport scenario={scenario} />
        </div>
      </section>

      <section className="border-t border-hairline px-8 py-12 sm:px-14">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ash">
              next target
            </p>
            <p className="mt-2 font-display text-2xl text-bone">{next.name}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="border border-hairline px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-bone transition hover:border-hairline-bright"
            >
              ← all scenarios
            </Link>
            <Link
              href={`/scan/${next.id}`}
              className="border border-signal/60 bg-signal/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-signal transition hover:bg-signal/20"
            >
              scan {next.name.toLowerCase()} →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-hairline px-8 py-8 sm:px-14">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-ash sm:flex-row sm:items-center sm:justify-between">
          <span>UOE summer of code 2026 / cybersecurity × ai/ml</span>
          <span>
            built by{" "}
            <Link
              href="https://github.com/beto-llanos"
              className="text-signal hover:underline"
            >
              beto-llanos
            </Link>
          </span>
        </div>
      </footer>
    </main>
  );
}
