type MessageContent = { type: "text"; text: string };

function extractTextFromMessagePayload(data: {
  content?: MessageContent[];
}): string {
  const block = data.content?.find((c) => c.type === "text");
  return block?.text?.trim() ?? "";
}

export function parseJsonFromAssistant<T>(text: string): T | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? trimmed).trim();
  try {
    return JSON.parse(candidate) as T;
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function completeClaude(params: {
  system?: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const model =
    process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514";

  const body: Record<string, unknown> = {
    model,
    max_tokens: params.maxTokens ?? 1024,
    messages: [{ role: "user", content: params.user }],
  };

  if (params.system) {
    body.system = params.system;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errBody.slice(0, 500)}`);
  }

  const data = (await response.json()) as { content?: MessageContent[] };
  return extractTextFromMessagePayload(data);
}
