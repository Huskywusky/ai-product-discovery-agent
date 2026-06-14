"use client";

import { useState } from "react";
import {
  generateMockDiscovery,
  type DiscoveryResult,
} from "@/lib/mockDiscovery";
import { downloadDiscoveryMarkdown } from "@/lib/exportMarkdown";

type ResultCardProps = {
  title: string;
  icon: string;
  accent: string;
  items: string[];
  index: number;
};

function ResultCard({ title, icon, accent, items, index }: ResultCardProps) {
  return (
    <article
      className="rounded-lg border border-[#e1dfdd] bg-white shadow-sm transition-shadow hover:shadow-md"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-3 border-b border-[#edebe9] px-5 py-4">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold text-white"
          style={{ backgroundColor: accent }}
        >
          {icon}
        </span>
        <h3 className="text-base font-semibold text-[#242424]">{title}</h3>
        <span className="ml-auto rounded-full bg-[#f3f2f1] px-2.5 py-0.5 text-xs font-medium text-[#605e5c]">
          {items.length}
        </span>
      </div>
      <ul className="divide-y divide-[#edebe9]">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-3 px-5 py-3.5 text-sm leading-relaxed text-[#424242]"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0078d4]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

const RESULT_SECTIONS: {
  key: keyof DiscoveryResult;
  title: string;
  icon: string;
  accent: string;
}[] = [
  {
    key: "discoveryQuestions",
    title: "Discovery Questions",
    icon: "?",
    accent: "#0078d4",
  },
  {
    key: "businessRequirements",
    title: "Business Requirements",
    icon: "BR",
    accent: "#107c10",
  },
  {
    key: "userStories",
    title: "User Stories",
    icon: "US",
    accent: "#5c2d91",
  },
  {
    key: "mvpScope",
    title: "MVP Scope",
    icon: "MV",
    accent: "#008575",
  },
  {
    key: "scopeRisks",
    title: "Scope Risks",
    icon: "!",
    accent: "#d13438",
  },
  {
    key: "whatNotToBuild",
    title: "What Not To Build Yet",
    icon: "—",
    accent: "#ca5010",
  },
];

export default function DiscoveryAgent() {
  const [productIdea, setProductIdea] = useState(
    "An AI agent that helps product teams turn rough ideas into structured discovery artifacts before development starts.",
  );
  const [businessGoal, setBusinessGoal] = useState(
    "Reduce discovery cycle time by 40% and improve alignment between product, design, and engineering in the first sprint.",
  );
  const [results, setResults] = useState<DiscoveryResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!productIdea.trim()) {
      setError("Please enter a product idea before generating discovery.");
      setResults(null);
      return;
    }

    setError(null);
    setIsGenerating(true);
    setResults(null);

    await new Promise((resolve) => setTimeout(resolve, 900));

    setResults(generateMockDiscovery(productIdea, businessGoal));
    setIsGenerating(false);
  }

  function handleExportMarkdown() {
    if (!results) return;
    downloadDiscoveryMarkdown(productIdea, businessGoal, results);
  }

  return (
    <div className="min-h-full bg-[#f3f2f1]">
      {/* Top bar */}
      <header className="border-b border-[#e1dfdd] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#0078d4] text-xs font-bold text-white">
              AI
            </div>
            <span className="text-sm font-semibold text-[#242424]">
              Microsoft Agents League
            </span>
            <span className="hidden rounded bg-[#f3f2f1] px-2 py-0.5 text-xs text-[#605e5c] sm:inline">
              Hackathon MVP
            </span>
          </div>
          <span className="text-xs text-[#605e5c]">Demo · No backend</span>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-[#e1dfdd] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#0078d4]">
              Product Discovery Agent
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#242424] sm:text-4xl sm:leading-tight">
              AI Product Discovery Agent
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[#605e5c]">
              Turn rough product ideas into actionable requirements and MVP
              recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Input */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-lg border border-[#e1dfdd] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-[#242424]">
            Describe your product
          </h2>
          <p className="mt-1 text-sm text-[#605e5c]">
            Enter your idea and goal. Each section is built from your text —
            personas, metrics, domain rules, and capabilities are parsed
            client-side with no API calls.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <label
                htmlFor="product-idea"
                className="block text-sm font-semibold text-[#242424]"
              >
                Product Idea
              </label>
              <textarea
                id="product-idea"
                rows={5}
                value={productIdea}
                onChange={(e) => setProductIdea(e.target.value)}
                placeholder="e.g. A copilot that helps retail managers forecast inventory using sales trends and supplier lead times..."
                className="mt-2 w-full rounded-md border border-[#8a8886] bg-white px-3 py-2.5 text-sm text-[#242424] shadow-sm outline-none transition-colors placeholder:text-[#a19f9d] focus:border-[#0078d4] focus:ring-2 focus:ring-[#0078d4]/20"
              />
            </div>
            <div>
              <label
                htmlFor="business-goal"
                className="block text-sm font-semibold text-[#242424]"
              >
                Business Goal
              </label>
              <textarea
                id="business-goal"
                rows={5}
                value={businessGoal}
                onChange={(e) => setBusinessGoal(e.target.value)}
                placeholder="e.g. Cut stockouts by 15% in pilot stores within 90 days while keeping manual planning time under 30 minutes per week..."
                className="mt-2 w-full rounded-md border border-[#8a8886] bg-white px-3 py-2.5 text-sm text-[#242424] shadow-sm outline-none transition-colors placeholder:text-[#a19f9d] focus:border-[#0078d4] focus:ring-2 focus:ring-[#0078d4]/20"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-md border border-[#f1bbbc] bg-[#fde7e9] px-4 py-3 text-sm text-[#a4262c]">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-md bg-[#0078d4] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#106ebe] focus:outline-none focus:ring-2 focus:ring-[#0078d4] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden
                  />
                  Generating Discovery...
                </>
              ) : (
                "Generate Discovery"
              )}
            </button>
            <span className="text-xs text-[#605e5c]">
              Local mock generation · No API calls
            </span>
          </div>
        </div>
      </section>

      {/* Results */}
      {(isGenerating || results) && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#242424]">
                Discovery Output
              </h2>
              <p className="mt-1 text-sm text-[#605e5c]">
                Structured artifacts ready for backlog grooming and sprint
                planning.
              </p>
            </div>
            {results && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportMarkdown}
                  className="inline-flex items-center gap-2 rounded-md border border-[#8a8886] bg-white px-4 py-2 text-sm font-semibold text-[#242424] shadow-sm transition-colors hover:bg-[#f3f2f1] focus:outline-none focus:ring-2 focus:ring-[#0078d4] focus:ring-offset-2"
                >
                  Export to Markdown
                </button>
                <span className="rounded-full bg-[#dff6dd] px-3 py-1 text-xs font-semibold text-[#107c10]">
                  Generated
                </span>
              </div>
            )}
          </div>

          {isGenerating && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {RESULT_SECTIONS.map((section) => (
                <div
                  key={section.key}
                  className="rounded-lg border border-[#e1dfdd] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 animate-pulse rounded-md bg-[#edebe9]" />
                    <div className="h-4 w-32 animate-pulse rounded bg-[#edebe9]" />
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="h-3 w-full animate-pulse rounded bg-[#f3f2f1]" />
                    <div className="h-3 w-11/12 animate-pulse rounded bg-[#f3f2f1]" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-[#f3f2f1]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {results && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {RESULT_SECTIONS.map((section, index) => (
                <ResultCard
                  key={section.key}
                  title={section.title}
                  icon={section.icon}
                  accent={section.accent}
                  items={results[section.key]}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <footer className="border-t border-[#e1dfdd] bg-white py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-[#605e5c] sm:px-6">
          AI Product Discovery Agent · Microsoft Agents League Hackathon MVP ·
          Tailwind · Next.js · Demo only
        </div>
      </footer>
    </div>
  );
}
