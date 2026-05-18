import { summarize, ClaudeError } from "@/lib/claude";
import { getScenario } from "@/lib/scenarios";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const scenarioId =
    typeof body === "object" && body !== null && "scenarioId" in body
      ? String((body as { scenarioId: unknown }).scenarioId)
      : null;
  if (!scenarioId) {
    return Response.json({ error: "scenarioId required" }, { status: 400 });
  }

  const scenario = getScenario(scenarioId);
  if (!scenario) {
    return Response.json({ error: "scenario not found" }, { status: 404 });
  }

  try {
    const aiSummary = await summarize({
      prompt: scenario.prompt,
      findings: scenario.cachedResult.findings,
    });
    return Response.json({ aiSummary });
  } catch (err) {
    if (err instanceof ClaudeError) {
      return Response.json(
        { error: "claude_unavailable", message: err.message },
        { status: 503 },
      );
    }
    return Response.json({ error: "unknown" }, { status: 500 });
  }
}
