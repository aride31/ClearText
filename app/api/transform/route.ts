import OpenAI from "openai";
import { NextResponse } from "next/server";

type Mode = "clearit" | "waitwhat" | "sayless";
type Tone = "Friendly" | "Professional" | "Direct";

type TransformRequest = {
  input?: unknown;
  mode?: unknown;
  tone?: unknown;
};

const modePrompts: Record<Mode, string> = {
  clearit:
    "Organize the user's messy or unstructured text into clean, easy-to-read bullet points. Do not add information that is not present.",
  waitwhat:
    "Explain the user's text in simple, plain English. Make it easy to understand. Do not over-explain.",
  sayless:
    "Rewrite the user's text to sound better in the selected tone. Keep the meaning the same. Make it clear and natural.",
};

const modes = new Set<Mode>(["clearit", "waitwhat", "sayless"]);
const tones = new Set<Tone>(["Friendly", "Professional", "Direct"]);

function textResponse(message: string, status = 200) {
  return new NextResponse(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export async function POST(request: Request) {
  let body: TransformRequest;

  try {
    body = (await request.json()) as TransformRequest;
  } catch {
    return textResponse("Send input text, mode, and optional tone as JSON.", 400);
  }

  const input = typeof body.input === "string" ? body.input.trim() : "";
  const mode = typeof body.mode === "string" && modes.has(body.mode as Mode) ? (body.mode as Mode) : null;
  const tone = typeof body.tone === "string" && tones.has(body.tone as Tone) ? (body.tone as Tone) : "Friendly";

  if (!input) {
    return textResponse("Paste some text first.", 400);
  }

  if (!mode) {
    return textResponse("Choose ClearIt, WaitWhat, or SayLess.", 400);
  }

  if (!process.env.OPENAI_API_KEY) {
    return textResponse("OpenAI API key is not configured.", 500);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const systemPrompt = mode === "sayless" ? `${modePrompts[mode]} Use a ${tone.toLowerCase()} tone.` : modePrompts[mode];

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `${systemPrompt} Return only the transformed result with no preamble or labels.`,
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    const output = completion.choices[0]?.message?.content?.trim();

    if (!output) {
      return textResponse("No result was generated. Please try again.", 502);
    }

    return textResponse(output);
  } catch (error) {
    console.error("ClearText transform failed", error);
    return textResponse("Something went wrong while generating. Please try again.", 500);
  }
}
