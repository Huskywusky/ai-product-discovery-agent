# AI Product Discovery Agent

AI-powered product discovery and requirements agent built for Microsoft's Agents League Hackathon.

Turn rough product ideas into actionable requirements, user stories, MVP scope, risks, and deferrals — with a Microsoft Fluent-style UI and client-side mock generation (no API keys required for demo).

## Features

- Product idea and business goal intake
- Dynamic discovery output: questions, requirements, user stories, MVP scope, risks, and out-of-scope items
- Export to Markdown (`product-discovery-output.md`)
- Next.js 16 · TypeScript · Tailwind CSS · App Router · Turbopack

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On Windows, if `npm` is not on PATH:

```powershell
& "C:\Program Files\nodejs\npm.cmd" install
& "C:\Program Files\nodejs\npm.cmd" run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

## License

MIT — see [LICENSE](LICENSE).
