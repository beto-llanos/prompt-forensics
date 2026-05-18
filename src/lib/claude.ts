import Anthropic from "@anthropic-ai/sdk";
import type { Finding } from "./types";

export class ClaudeError extends Error {}

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
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ClaudeError("ANTHROPIC_API_KEY not set");
  }
  const client = new Anthropic();
  const findingsBlock = findings
    .map(
      (f, i) =>
        `${i + 1}. [${f.severity.toUpperCase()}] ${f.title} — ${f.rationale}`,
    )
    .join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    thinking: { type: "disabled" },
    messages: [
      {
        role: "user",
        content: `PROMPT UNDER REVIEW (do not echo back):\n<<<\n${prompt}\n>>>\n\nDETECTED FINDINGS:\n${findingsBlock}\n\nWrite the forensic note.`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") {
    throw new ClaudeError("No text response from Claude");
  }
  return text.text.trim();
}
