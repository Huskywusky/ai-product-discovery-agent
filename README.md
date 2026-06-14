# AI Product Discovery Agent

**Microsoft Agents League Hackathon · Product discovery agent**

Turn rough product ideas into structured discovery artifacts—requirements, user stories, MVP scope, risks, and deferrals—in minutes instead of days.

---

## Problem Statement

Product teams often start build work before discovery is complete. Rough ideas live in slides, chats, and meetings, while engineers and designers need clear requirements, scoped MVP boundaries, and shared success criteria.

Without a structured discovery pass, teams face:

- Late scope changes and rework after sprint planning
- Misaligned understanding of business goals across product, design, and engineering
- Generic backlogs that do not reflect domain context or measurable outcomes
- Risky over-scoping before validating what belongs in v1

## Solution

**AI Product Discovery Agent** is a web application that guides stakeholders from a product idea and business goal to a complete discovery pack. Users describe what they want to build and why; the agent produces six structured sections ready for review, backlog grooming, and sprint zero planning.

The experience is designed for hackathon demos and stakeholder walkthroughs: fast input, scannable output, and export to Markdown for sharing.

## Key Features

- **Guided intake** — Product Idea and Business Goal text areas with validation
- **Structured discovery output** — Six artifact cards generated from your inputs:
  - Discovery Questions
  - Business Requirements
  - User Stories
  - MVP Scope
  - Scope Risks
  - What Not To Build Yet
- **Context-aware generation** — Output adapts to themes in your text (e.g. AI, healthcare, commerce, enterprise, analytics)
- **Microsoft Fluent-inspired UI** — Clean layout, responsive grid, accessible forms
- **Export to Markdown** — Download `product-discovery-output.md` for docs, Notion, or GitHub
- **No backend required for demo** — Runs entirely in the browser for local and live presentations

## How It Works

1. **Input** — Enter a product idea (what you are building) and a business goal (measurable outcome or constraint).
2. **Parse** — The client analyzes personas, capabilities, metrics, time horizons, and domain signals from your text.
3. **Generate** — A discovery engine assembles section-specific content tied to your inputs.
4. **Review** — Results appear as color-coded cards for quick scanning in workshops or judging.
5. **Export** — Export the full pack as Markdown for downstream planning tools.

```
Product Idea + Business Goal
        ↓
   Context parsing (client-side)
        ↓
   Six discovery sections
        ↓
   Review in UI · Export to Markdown
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| Dev server | Turbopack |
| Quality | ESLint, `eslint-config-next` |
| Deployment-ready | Static-friendly Next.js build |

## How to Run Locally

**Prerequisites:** Node.js 20+ and npm

```bash
git clone https://github.com/Huskywusky/ai-product-discovery-agent.git
cd ai-product-discovery-agent
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Other commands**

| Command | Description |
|---------|-------------|
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

## Demo Flow

Use this 2–3 minute script for hackathon judging or stakeholder demos:

1. **Set context** — Explain that discovery often happens informally; this agent structures it in one screen.
2. **Enter inputs** — Paste or type a product idea (e.g. inventory forecasting copilot for retail managers) and a business goal with a metric (e.g. reduce stockouts 15% within 90 days).
3. **Generate Discovery** — Click the button; six sections populate with content tied to the inputs.
4. **Walk the cards** — Highlight Discovery Questions (ambiguity), MVP Scope (v1 boundaries), and What Not To Build Yet (scope discipline).
5. **Change inputs** — Edit the idea or goal and regenerate to show adaptation to a different domain.
6. **Export** — Click **Export to Markdown** and show `product-discovery-output.md` ready for the team.

## Future Roadmap

- **Live AI integration** — Connect to Azure OpenAI or Microsoft Agent Framework for richer, model-backed generation
- **Persistence** — Save and version discovery sessions per product initiative
- **Collaboration** — Comments, approvals, and share links for product/design/engineering review
- **Templates** — Industry packs (healthcare, fintech, education) with compliance prompts
- **Integrations** — Export to Azure DevOps, GitHub Issues, Linear, or Microsoft Loop
- **Evidence mode** — Link requirements to user research notes and interview transcripts
- **Metrics dashboard** — Track discovery cycle time and scope stability over releases

## Hackathon Context

This project was built for the **Microsoft Agents League Hackathon** as a demonstration of agent-style product workflows: natural-language input, structured agent output, and human-in-the-loop review before execution.

The MVP prioritizes a polished demo path—clear UX, fast generation, and export—so judges and teammates can experience the discovery agent workflow without cloud setup or API keys. It showcases how agent experiences can accelerate product planning while keeping humans accountable for scope and priorities.

---

## License

MIT — see [LICENSE](LICENSE).

## Repository

[https://github.com/Huskywusky/ai-product-discovery-agent](https://github.com/Huskywusky/ai-product-discovery-agent)
