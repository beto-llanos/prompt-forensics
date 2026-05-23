import type { Finding } from "./types";

export class ClaudeError extends Error {}

// Talks to Claude through OpenRouter (OpenAI-compatible gateway).
const MODEL = process.env.OPENROUTER_MODEL ?? "anthropic/claude-sonnet-4.6";
const BASE_URL = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

const SYSTEM_PROMPT = `You are a prompt-security analyst writing a one-paragraph forensic note for a system owner.

You will receive: (a) a system prompt under review, and (b) a list of automatically-detected findings with rationale. Your job is to write a single tight paragraph (3–5 sentences) that:

- names the top one or two compounding risks (not a list of every finding)
- explains the attack chain: how does one finding amplify another?
- ends with the highest-value remediation, phrased as something the team should do this week

Tone: senior security engineer briefing a peer. No fluff, no bullet points, no "in conclusion". Plain prose. Never reveal the input prompt back to the user — describe the vulnerabilities at a conceptual level.`;

interface SummarizeArgs {
  prompt: string;
  findings: Finding[];
}

export async function summarize({ prompt, findings }: SummarizeArgs): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new ClaudeError("OPENROUTER_API_KEY not set");
  }
  const findingsBlock = findings
    .map(
      (f, i) =>
        `${i + 1}. [${f.severity.toUpperCase()}] ${f.title} — ${f.rationale}`,
    )
    .join("\n");

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "prompt-forensics",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 600,
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `PROMPT UNDER REVIEW (do not echo back):\n<<<\n${prompt}\n>>>\n\nDETECTED FINDINGS:\n${findingsBlock}\n\nWrite the forensic note.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new ClaudeError(`OpenRouter ${response.status}: ${detail.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  const text =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content.map((p: any) => p?.text ?? "").join("")
        : "";
  if (!text.trim()) {
    throw new ClaudeError("No text response from OpenRouter");
  }
  return text.trim();
}
