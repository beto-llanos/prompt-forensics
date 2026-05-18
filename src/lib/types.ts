export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type Category =
  | "instruction_override"
  | "role_hijack"
  | "delimiter_injection"
  | "secret_exposure"
  | "unsafe_tool"
  | "pii_handling"
  | "prompt_leak"
  | "indirect_injection";

export interface Span {
  start: number;
  end: number;
}

export interface Finding {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  evidence: string;
  spans: Span[];
  rationale: string;
  remediation: string;
}

export interface RiskScore {
  total: number;
  band: "safe" | "watch" | "elevated" | "critical";
  countsBySeverity: Record<Severity, number>;
}

export interface ScanResult {
  scenarioId: string;
  prompt: string;
  findings: Finding[];
  score: RiskScore;
  generatedAt: string;
  aiSummary?: string;
}

export interface Scenario {
  id: string;
  name: string;
  domain: string;
  tagline: string;
  description: string;
  prompt: string;
  cachedResult: ScanResult;
}
