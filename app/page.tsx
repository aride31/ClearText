"use client";

import { useMemo, useState } from "react";

type Mode = "clearit" | "waitwhat" | "sayless";
type Tone = "Friendly" | "Professional" | "Direct";

const actions: Array<{ mode: Mode; label: string; helper: string }> = [
  {
    mode: "clearit",
    label: "ClearIt",
    helper: "Organize messy notes into clean bullet points.",
  },
  {
    mode: "waitwhat",
    label: "WaitWhat",
    helper: "Explain confusing text in plain English.",
  },
  {
    mode: "sayless",
    label: "SayLess",
    helper: "Rewrite it so it sounds better.",
  },
];

const tones: Tone[] = ["Friendly", "Professional", "Direct"];

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [selectedMode, setSelectedMode] = useState<Mode>("clearit");
  const [tone, setTone] = useState<Tone>("Friendly");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const activeAction = useMemo(
    () => actions.find((action) => action.mode === selectedMode) ?? actions[0],
    [selectedMode],
  );

  async function transformText(mode: Mode) {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      setError("Paste some text first.");
      setResult("");
      setCopyStatus("");
      return;
    }

    setSelectedMode(mode);
    setIsLoading(true);
    setError("");
    setCopyStatus("");

    try {
      const response = await fetch("/api/transform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: trimmedInput, mode, tone: mode === "sayless" ? tone : undefined }),
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || "Something went wrong. Please try again.");
      }

      setResult(text.trim());
    } catch (caughtError) {
      setResult("");
      setError(caughtError instanceof Error ? caughtError.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyResult() {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result);
      setCopyStatus("Copied!");
      window.setTimeout(() => setCopyStatus(""), 1800);
    } catch {
      setCopyStatus("Copy failed. Select the result and copy manually.");
    }
  }

  function resetAll() {
    setInput("");
    setResult("");
    setError("");
    setCopyStatus("");
    setSelectedMode("clearit");
    setTone("Friendly");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0,#f8fafc_35%,#f8fafc_100%)] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="text-center sm:py-4">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">ClearText</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Paste. Pick. Copy.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Quickly turn pasted text into clearer bullets, simpler explanations, or sharper rewrites.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <section className="rounded-[2rem] border border-white/80 bg-white/90 p-4 shadow-soft backdrop-blur sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="source-text" className="text-lg font-bold">
                Your text
              </label>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                {input.length.toLocaleString()} characters
              </span>
            </div>

            <textarea
              id="source-text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Paste messy notes, confusing instructions, long emails, or anything you want to clean up..."
              className="mt-4 min-h-64 w-full resize-y rounded-3xl border border-slate-200 bg-slate-50 p-4 text-base leading-7 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {actions.map((action) => (
                <button
                  key={action.mode}
                  type="button"
                  onClick={() => transformText(action.mode)}
                  disabled={isLoading}
                  className={`rounded-2xl border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    selectedMode === action.mode
                      ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <span className="block text-base font-extrabold">{action.label}</span>
                  <span className={`mt-1 block text-xs ${selectedMode === action.mode ? "text-blue-50" : "text-slate-500"}`}>
                    {action.helper}
                  </span>
                </button>
              ))}
            </div>

            {selectedMode === "sayless" ? (
              <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <label htmlFor="tone" className="text-sm font-bold text-slate-700">
                  SayLess tone
                </label>
                <select
                  id="tone"
                  value={tone}
                  onChange={(event) => setTone(event.target.value as Tone)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                >
                  {tones.map((toneOption) => (
                    <option key={toneOption} value={toneOption}>
                      {toneOption}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </section>

          <section className="rounded-[2rem] border border-slate-900/5 bg-slate-950 p-4 text-white shadow-soft sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Result</p>
                <h2 className="mt-1 text-2xl font-black">{activeAction.label}</h2>
              </div>
              {isLoading ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-2 text-sm font-bold text-blue-100">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-300" />
                  Generating
                </span>
              ) : null}
            </div>

            <div className="mt-5 min-h-64 whitespace-pre-wrap rounded-3xl border border-white/10 bg-white/10 p-4 text-base leading-7 text-slate-100">
              {isLoading ? "Working on it..." : result || "Your cleaned-up text will appear here."}
            </div>

            {error ? <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm font-semibold text-red-100">{error}</p> : null}
            {copyStatus ? <p className="mt-4 text-sm font-semibold text-blue-100">{copyStatus}</p> : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={copyResult}
                disabled={!result || isLoading}
                className="flex-1 rounded-2xl bg-white px-5 py-3 font-extrabold text-slate-950 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Copy result
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="flex-1 rounded-2xl border border-white/15 px-5 py-3 font-extrabold text-white transition hover:bg-white/10"
              >
                Clear / reset
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
