import Link from "next/link";
import { getAllScenarios } from "@/lib/scenarios";
import { ScenarioCard } from "@/components/scenario-card";

const VULN_CATEGORIES = [
  "Instruction Override",
  "Role Hijack",
  "Delimiter Injection",
  "Secret Exposure",
  "Unsafe Tool",
  "PII Handling",
  "Prompt Leak",
  "Indirect Injection",
];

export default function Home() {
  const scenarios = getAllScenarios();
  const totalFindings = scenarios.reduce(
    (acc, s) => acc + s.cachedResult.findings.length,
    0,
  );

  return (
    <main className="relative flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-hairline px-8 py-5 sm:px-14">
        <div className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-signal blink" />
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-bone">
            prompt forensics
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-ash sm:inline">
            / v0.1.0 · build 240517
          </span>
        </div>
        <nav className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.25em] text-ash">
          <a
            href="https://github.com/beto-llanos/prompt-forensics"
            className="transition hover:text-bone"
          >
            github
          </a>
          <a href="#how" className="transition hover:text-bone">
            how it works
          </a>
          <a href="#categories" className="transition hover:text-bone">
            categories
          </a>
        </nav>
      </header>

      <section className="relative grid-bg px-8 pb-24 pt-20 sm:px-14 sm:pt-28">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-signal">
            <span className="size-1.5 bg-signal" />
            <span>static analysis · forensic console for LLM prompts</span>
          </div>

          <h1 className="mt-8 max-w-5xl font-display text-[clamp(2.6rem,8vw,6.5rem)] font-medium leading-[0.95] tracking-tight text-bone">
            find injection holes
            <br />
            <span className="text-signal">before attackers</span> do.
          </h1>

          <p className="mt-10 max-w-2xl font-sans text-base leading-relaxed text-bone/70 sm:text-lg">
            Production LLM prompts get a code review from no one. PROMPT FORENSICS
            scans them across eight categories of vulnerability — instruction
            override, role hijack, delimiter injection, secret exposure, unsafe
            tool surface, PII handling, prompt leakage, indirect injection — and
            returns a severity-scored forensic note in seconds.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-6 font-mono text-[10px] uppercase tracking-[0.25em] text-ash">
            <span>
              <span className="text-signal">{scenarios.length}</span> live
              scenarios
            </span>
            <span className="text-hairline-bright">·</span>
            <span>
              <span className="text-signal">{totalFindings}</span> pre-computed
              findings
            </span>
            <span className="text-hairline-bright">·</span>
            <span>
              <span className="text-signal">8</span> vulnerability categories
            </span>
            <span className="text-hairline-bright">·</span>
            <span>
              powered by{" "}
              <span className="text-signal">claude sonnet 4.6</span>
            </span>
          </div>
        </div>
      </section>

      <section id="scenarios" className="border-t border-hairline px-8 py-20 sm:px-14">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ash">
                pick a target / click any card to scan
              </p>
              <h2 className="mt-3 font-display text-4xl text-bone sm:text-5xl">
                six prompts in the wild.
              </h2>
            </div>
            <p className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-ash sm:block">
              all are real-world archetypes / pre-scanned
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((s, i) => (
              <ScenarioCard key={s.id} scenario={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="categories"
        className="border-t border-hairline bg-slab/40 px-8 py-20 sm:px-14"
      >
        <div className="mx-auto w-full max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ash">
            detection surface
          </p>
          <h2 className="mt-3 font-display text-4xl text-bone sm:text-5xl">
            eight categories. one engine.
          </h2>
          <p className="mt-6 max-w-2xl text-bone/65">
            Each category combines deterministic pattern detection with an AI
            forensic note that explains how the findings chain together. No
            black-box scoring — the rationale is in the source.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-px bg-hairline sm:grid-cols-4">
            {VULN_CATEGORIES.map((cat, idx) => (
              <div
                key={cat}
                className="flex flex-col gap-2 bg-void p-6 transition hover:bg-slab"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-lg leading-tight text-bone">
                  {cat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-hairline px-8 py-20 sm:px-14">
        <div className="mx-auto w-full max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ash">
            how it works
          </p>
          <h2 className="mt-3 font-display text-4xl text-bone sm:text-5xl">
            two layers, one report.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <HowStep
              n="01"
              title="Deterministic detection"
              body="14 hand-tuned rules across 8 categories run against the prompt as a pure function. Every finding has a span, severity weight, and concrete remediation. No model required, no API call needed — replayable, auditable, fast."
            />
            <HowStep
              n="02"
              title="AI forensic note"
              body="Claude Sonnet 4.6 reads the prompt and the findings list, then writes a senior-engineer briefing: which two findings chain, what the attack would look like end-to-end, and the single remediation the team should ship this week."
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-hairline px-8 py-8 sm:px-14">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-ash sm:flex-row sm:items-center sm:justify-between">
          <span>UOE summer of code 2026 / cybersecurity × ai/ml</span>
          <span>
            built by{" "}
            <Link href="https://github.com/beto-llanos" className="text-signal hover:underline">
              beto-llanos
            </Link>
          </span>
        </div>
      </footer>
    </main>
  );
}

function HowStep({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="border border-hairline bg-slab/40 p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-signal">
        step {n}
      </p>
      <h3 className="mt-4 font-display text-2xl text-bone">{title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-bone/70">{body}</p>
    </div>
  );
}
