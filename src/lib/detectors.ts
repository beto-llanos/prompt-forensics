import type { Category, Finding, RiskScore, Severity, Span } from "./types";

interface Rule {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  patterns: RegExp[];
  rationale: string;
  remediation: string;
}

const RULES: Rule[] = [
  {
    id: "io.override",
    category: "instruction_override",
    severity: "critical",
    title: "Instruction override phrase",
    patterns: [
      /\bignore\s+(?:all|the|any|your)?\s*(?:previous|prior|earlier|above)\s+(?:instructions?|prompts?|rules?)/gi,
      /\bdisregard\s+(?:everything|all|the\s+(?:previous|prior|above))/gi,
      /\bforget\s+(?:everything|all|your)\s+(?:instructions?|prompts?|training)/gi,
      /\bnew\s+(?:instructions?|prompts?|rules?)\s*:/gi,
    ],
    rationale:
      "User-controlled text contains a direct attempt to override the system instructions. When this string flows into a prompt without sanitization, the model is statistically biased toward complying.",
    remediation:
      "Wrap user input in a clearly demarcated section (e.g. XML tags) and instruct the model to treat its contents as data, never as instructions. Reject or flag inputs matching these phrases at the edge.",
  },
  {
    id: "io.role.takeover",
    category: "role_hijack",
    severity: "high",
    title: "Role-takeover request",
    patterns: [
      /\b(?:you\s+are\s+now|from\s+now\s+on,?\s+you\s+are|actually\s+you\s+are)\b/gi,
      /\bpretend\s+(?:to\s+be|you\s+are)\b/gi,
      /\bact\s+as\s+(?:if|though|a)\b/gi,
      /\broleplay\s+as\b/gi,
      /\b(?:developer|debug|jailbreak|admin)\s+mode\b/gi,
      /\bDAN\s+mode\b/g,
    ],
    rationale:
      "The prompt attempts to reassign the model's persona or unlock a privileged behavior. Even when the model refuses the first attempt, repeated reassignment significantly raises compliance rates in published red-team benchmarks.",
    remediation:
      "Reinforce the role in the system prompt with explicit refusal patterns. Use Anthropic's `system` role with a `cache_control: ephemeral` block to keep the canonical persona stable, and reject role-rewrite attempts as a guardrail step.",
  },
  {
    id: "io.delimiter",
    category: "delimiter_injection",
    severity: "high",
    title: "Unsafe delimiter / template interpolation",
    patterns: [
      /\{\{\s*[a-zA-Z_][\w.]*\s*\}\}/g,
      /\$\{\s*[a-zA-Z_][\w.]*\s*\}/g,
      /<%[\s\S]*?%>/g,
      /```[\s\S]*?```/g,
    ],
    rationale:
      "User-supplied data is interpolated directly into the prompt template with no escaping. An attacker who controls the variable can close the delimiter and inject arbitrary instructions, then continue with their payload.",
    remediation:
      "Move untrusted input out of templated string concatenation and into a separate `messages` block with a clear `<user_input>...</user_input>` envelope. Escape closing delimiters before substitution.",
  },
  {
    id: "io.secret.openai",
    category: "secret_exposure",
    severity: "critical",
    title: "OpenAI / Anthropic API key in prompt",
    patterns: [/sk-(?:ant-)?[A-Za-z0-9_-]{20,}/g],
    rationale:
      "An API key is embedded directly in the prompt body. Any tool call, log, or model echo can leak it. LLM providers explicitly warn that prompts may be retained for abuse monitoring.",
    remediation:
      "Move keys to environment variables, never include them in prompt text. Pre-flight every prompt with a secret-scanning step and rotate any key that has reached an LLM.",
  },
  {
    id: "io.secret.aws",
    category: "secret_exposure",
    severity: "critical",
    title: "AWS access key in prompt",
    patterns: [/AKIA[0-9A-Z]{16}/g],
    rationale:
      "An AWS access key has been pasted into the prompt. AWS IAM tokens are highly valuable to attackers and frequently scraped from logs.",
    remediation:
      "Rotate the key immediately. Use short-lived STS credentials passed via tool arguments rather than embedded in the prompt body.",
  },
  {
    id: "io.secret.github",
    category: "secret_exposure",
    severity: "critical",
    title: "GitHub personal access token",
    patterns: [/gh[pousr]_[A-Za-z0-9]{30,}/g],
    rationale:
      "A GitHub PAT is present in the prompt. PATs grant repo, workflow, and package scopes; leakage often translates directly to supply-chain compromise.",
    remediation:
      "Rotate the token. Switch to GitHub Apps / fine-grained tokens with least-privilege scopes and inject them at tool-call time, not into prompt text.",
  },
  {
    id: "io.secret.stripe",
    category: "secret_exposure",
    severity: "critical",
    title: "Stripe secret key",
    patterns: [/sk_(?:live|test)_[A-Za-z0-9]{20,}/g, /rk_(?:live|test)_[A-Za-z0-9]{20,}/g],
    rationale:
      "A Stripe secret key is in the prompt. Live keys allow charges, refunds, and customer data access.",
    remediation:
      "Rotate. Keep payment credentials server-side; expose Stripe functionality to the model via tool calls with explicit amount/destination validation.",
  },
  {
    id: "io.secret.jwt",
    category: "secret_exposure",
    severity: "high",
    title: "JWT in prompt body",
    patterns: [/eyJ[A-Za-z0-9_=-]+\.[A-Za-z0-9._=-]+\.[A-Za-z0-9._-]+/g],
    rationale:
      "A JSON Web Token is embedded in the prompt. JWTs typically carry user identity and authorization scopes; if logged, they can be replayed for the token's full TTL.",
    remediation:
      "Pass tokens via authenticated tool calls, not via prompt text. Add `Authorization` headers at the transport layer; revoke any token that has been written into a prompt.",
  },
  {
    id: "io.tool.shell",
    category: "unsafe_tool",
    severity: "critical",
    title: "Shell / eval tool exposed",
    patterns: [
      /\b(?:run_shell|execute_shell|shell_exec|eval_code|run_command|os_system|spawn_process)\b/gi,
    ],
    rationale:
      "A tool definition allows arbitrary command execution. Even with a strong system prompt, indirect prompt injection (e.g. via a retrieved document) can route an attacker's payload into this tool.",
    remediation:
      "Replace generic shell access with narrow, allow-listed actions. If sandboxed execution is required, route through a hardened runner (gVisor / Firecracker) with no network and no host filesystem access.",
  },
  {
    id: "io.tool.send",
    category: "unsafe_tool",
    severity: "high",
    title: "Autonomous send / transfer action",
    patterns: [
      /\b(?:send_email|send_message|transfer_funds|process_refund|wire_transfer|delete_user|drop_table)\b/gi,
    ],
    rationale:
      "A tool with externally-observable side effects is callable without an explicit human-in-the-loop gate. A successful injection escalates from prompt manipulation to real-world action.",
    remediation:
      "Wrap side-effect tools in a confirm-step (`preview_action` → `confirm_action`) that requires explicit user approval before execution. Log every confirmation event.",
  },
  {
    id: "io.pii.ssn",
    category: "pii_handling",
    severity: "high",
    title: "Social Security Number in prompt",
    patterns: [/\b\d{3}-\d{2}-\d{4}\b/g],
    rationale:
      "An SSN is present in the prompt body. SSNs are regulated PII under multiple US frameworks (HIPAA, GLBA, state privacy laws) and should never be logged.",
    remediation:
      "Redact or tokenize SSNs before they reach the model. If the workflow requires identity verification, perform the check server-side and pass only an opaque token to the model.",
  },
  {
    id: "io.pii.card",
    category: "pii_handling",
    severity: "high",
    title: "Payment card number in prompt",
    patterns: [/\b(?:\d[ -]?){13,19}\b/g],
    rationale:
      "Sequence resembles a payment card number (PAN). Even raw exposure to an LLM provider may put the workflow out of PCI-DSS scope.",
    remediation:
      "Tokenize PANs via the payment provider's vault. Never let raw card data reach a generative-model prompt.",
  },
  {
    id: "io.leak.reveal",
    category: "prompt_leak",
    severity: "medium",
    title: "System-prompt extraction attempt",
    patterns: [
      /\b(?:reveal|show|print|repeat|output)\s+(?:the\s+)?(?:system\s+prompt|instructions\s+above|your\s+instructions)/gi,
      /\bwhat\s+(?:were|are)\s+you\s+told\b/gi,
      /\brepeat\s+everything\s+above\b/gi,
    ],
    rationale:
      "Direct attempt to exfiltrate the system prompt. Leaked prompts often reveal internal product strategy, retrieval source names, and the structure of downstream tools.",
    remediation:
      "Add a refusal example to the system prompt that explicitly handles prompt-extraction phrasing. Treat the system prompt as confidential and review it for sensitive identifiers before shipping.",
  },
  {
    id: "io.indirect.fetch",
    category: "indirect_injection",
    severity: "high",
    title: "Untrusted content fed into prompt",
    patterns: [
      /\b(?:fetch|retrieve|read|load)\s+(?:url|webpage|email|document|attachment)\b/gi,
      /\binsert\s+(?:document|email|webpage)\s+content\b/gi,
    ],
    rationale:
      "External content (URLs, emails, documents) is concatenated into the model context with no isolation. The fetched content can carry adversarial instructions — the canonical 'indirect prompt injection' attack vector.",
    remediation:
      "Render external content inside a distinct `<untrusted>` envelope and instruct the model to treat its contents as data, never as commands. Strip or escape suspicious instruction-style tokens before injection.",
  },
];

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
  info: 1,
};

function mergeSpans(spans: Span[]): Span[] {
  if (spans.length <= 1) return spans;
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  const merged: Span[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const cur = sorted[i];
    if (cur.start <= last.end) {
      last.end = Math.max(last.end, cur.end);
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

function extractSpans(prompt: string, patterns: RegExp[]): Span[] {
  const spans: Span[] = [];
  for (const pattern of patterns) {
    const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
    let match: RegExpExecArray | null;
    while ((match = re.exec(prompt)) !== null) {
      if (match[0].length === 0) {
        re.lastIndex++;
        continue;
      }
      spans.push({ start: match.index, end: match.index + match[0].length });
    }
  }
  return mergeSpans(spans);
}

export function runDetectors(prompt: string): Finding[] {
  const findings: Finding[] = [];
  for (const rule of RULES) {
    const spans = extractSpans(prompt, rule.patterns);
    if (spans.length === 0) continue;
    const evidence = spans
      .slice(0, 3)
      .map((s) => prompt.slice(s.start, s.end))
      .join(" / ");
    findings.push({
      id: rule.id,
      category: rule.category,
      severity: rule.severity,
      title: rule.title,
      evidence,
      spans,
      rationale: rule.rationale,
      remediation: rule.remediation,
    });
  }
  return findings;
}

export function scoreFindings(findings: Finding[]): RiskScore {
  const counts: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };
  let raw = 0;
  for (const f of findings) {
    counts[f.severity] += 1;
    raw += SEVERITY_WEIGHTS[f.severity];
  }
  const total = Math.min(100, raw);
  let band: RiskScore["band"] = "safe";
  if (total >= 70) band = "critical";
  else if (total >= 40) band = "elevated";
  else if (total >= 15) band = "watch";
  return { total, band, countsBySeverity: counts };
}

export const CATEGORY_LABELS: Record<Category, string> = {
  instruction_override: "Instruction Override",
  role_hijack: "Role Hijack",
  delimiter_injection: "Delimiter Injection",
  secret_exposure: "Secret Exposure",
  unsafe_tool: "Unsafe Tool",
  pii_handling: "PII Handling",
  prompt_leak: "Prompt Leak",
  indirect_injection: "Indirect Injection",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
  info: "INFO",
};
