export type DiscoveryResult = {
  discoveryQuestions: string[];
  businessRequirements: string[];
  userStories: string[];
  mvpScope: string[];
  scopeRisks: string[];
  whatNotToBuild: string[];
};

type DomainId =
  | "ai"
  | "mobile"
  | "analytics"
  | "commerce"
  | "enterprise"
  | "healthcare"
  | "education"
  | "marketplace"
  | "fintech"
  | "hr"
  | "logistics"
  | "general";

type ProductContext = {
  ideaRaw: string;
  goalRaw: string;
  productLabel: string;
  ideaClause: string;
  primaryPersona: string;
  secondaryPersonas: string[];
  domains: DomainId[];
  capabilities: string[];
  metrics: string[];
  timeHorizon: string | null;
  problemPhrases: string[];
  seed: number;
};

const DOMAIN_RULES: { id: DomainId; pattern: RegExp; persona: string; personas: string[] }[] = [
  {
    id: "ai",
    pattern: /\b(ai|ml|machine learning|gpt|agent|copilot|llm|generative|intelligent)\b/i,
    persona: "knowledge worker",
    personas: ["product manager", "operations lead", "support agent"],
  },
  {
    id: "healthcare",
    pattern: /\b(health|patient|clinical|medical|hospital|care|diagnos|pharma)\b/i,
    persona: "clinician",
    personas: ["care coordinator", "patient", "practice administrator"],
  },
  {
    id: "education",
    pattern: /\b(education|student|teacher|instructor|learning|course|school|university)\b/i,
    persona: "instructor",
    personas: ["student", "academic administrator", "teaching assistant"],
  },
  {
    id: "commerce",
    pattern: /\b(e-?commerce|shop|store|checkout|payment|cart|retail|merchant)\b/i,
    persona: "merchant",
    personas: ["shopper", "store associate", "category manager"],
  },
  {
    id: "fintech",
    pattern: /\b(fintech|bank|finance|payment|lending|insurance|invest|trading)\b/i,
    persona: "financial analyst",
    personas: ["compliance officer", "customer", "account manager"],
  },
  {
    id: "logistics",
    pattern: /\b(logistics|supply chain|warehouse|shipping|delivery|fleet|inventory)\b/i,
    persona: "operations manager",
    personas: ["warehouse supervisor", "dispatcher", "supplier partner"],
  },
  {
    id: "hr",
    pattern: /\b(hr|hiring|recruit|onboard|employee|workforce|talent)\b/i,
    persona: "HR business partner",
    personas: ["hiring manager", "candidate", "people operations specialist"],
  },
  {
    id: "marketplace",
    pattern: /\b(marketplace|vendor|supplier|platform|two-sided|gig)\b/i,
    persona: "platform operator",
    personas: ["seller", "buyer", "marketplace moderator"],
  },
  {
    id: "enterprise",
    pattern: /\b(b2b|enterprise|saas|workflow|crm|erp|procurement)\b/i,
    persona: "business administrator",
    personas: ["team lead", "end user", "IT administrator"],
  },
  {
    id: "analytics",
    pattern: /\b(dashboard|analytics|report|kpi|metric|insight|forecast|visualization)\b/i,
    persona: "business analyst",
    personas: ["executive sponsor", "data analyst", "department head"],
  },
  {
    id: "mobile",
    pattern: /\b(mobile|ios|android|app store|smartphone|tablet)\b/i,
    persona: "mobile user",
    personas: ["field worker", "on-the-go professional"],
  },
];

const CAPABILITY_PATTERNS: { pattern: RegExp; capability: string }[] = [
  { pattern: /\b(automate|automation)\b/i, capability: "automate repetitive workflows" },
  { pattern: /\b(forecast|predict)\b/i, capability: "generate forecasts from historical signals" },
  { pattern: /\b(track|monitor)\b/i, capability: "track status and exceptions in real time" },
  { pattern: /\b(recommend|suggest)\b/i, capability: "surface ranked recommendations" },
  { pattern: /\b(search|discover|find)\b/i, capability: "search and discover relevant information quickly" },
  { pattern: /\b(collaborate|share|coordinate)\b/i, capability: "coordinate work across stakeholders" },
  { pattern: /\b(notify|alert|remind)\b/i, capability: "send timely alerts when thresholds are breached" },
  { pattern: /\b(schedule|book|reserve)\b/i, capability: "schedule and manage bookings" },
  { pattern: /\b(onboard)\b/i, capability: "guide users through onboarding steps" },
  { pattern: /\b(approve|review|sign-off)\b/i, capability: "route items for human review and approval" },
  { pattern: /\b(integrate|sync|connect)\b/i, capability: "integrate with existing tools and data sources" },
  { pattern: /\b(personalize|customize)\b/i, capability: "personalize experiences per user context" },
  { pattern: /\b(visualize|chart|graph)\b/i, capability: "visualize trends and comparisons" },
  { pattern: /\b(validate|verify|compliance)\b/i, capability: "validate inputs against policy rules" },
  { pattern: /\b(chat|convers|assistant)\b/i, capability: "answer questions through a conversational interface" },
  { pattern: /\b(reduce|cut|lower|decrease)\b/i, capability: "reduce manual effort on high-volume tasks" },
  { pattern: /\b(improve|increase|boost|grow)\b/i, capability: "improve outcomes tied to the stated business goal" },
];

function hashStrings(...parts: string[]): number {
  let hash = 2166136261;
  const combined = parts.join("\0");
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max - 3).trimEnd() + "...";
}

function deriveProductLabel(idea: string): string {
  const sentence = idea.trim().split(/[.!?]/)[0]?.trim() ?? idea.trim();
  const withoutArticle = sentence.replace(/^(an?|the)\s+/i, "");

  const agentMatch = withoutArticle.match(
    /^(?:an?\s+)?(?:(?:ai|smart)\s+)?(?:agent|copilot|assistant|platform|app|tool|system|solution)\s+that\s+(.+)/i,
  );
  if (agentMatch) {
    return truncate(agentMatch[1], 72);
  }

  const helpsMatch = withoutArticle.match(/^(.+?)\s+that\s+(helps|enables|allows|lets)\s+/i);
  if (helpsMatch && helpsMatch[1].length < 60) {
    return truncate(helpsMatch[1], 72);
  }

  return truncate(withoutArticle, 72);
}

function extractCapabilities(idea: string, goal: string): string[] {
  const text = `${idea} ${goal}`;
  const found = CAPABILITY_PATTERNS
    .filter(({ pattern }) => pattern.test(text))
    .map(({ capability }) => capability);

  if (found.length === 0) {
    const verbMatch = idea.match(
      /\b(helps?|enables?|allows?|lets)\s+(.+?)(?:\s+by|\s+to|\.|,|$)/i,
    );
    if (verbMatch) {
      return [truncate(verbMatch[2], 80)];
    }
    return ["deliver the core value described in the product idea"];
  }

  return unique(found).slice(0, 5);
}

function extractMetrics(goal: string): string[] {
  if (!goal.trim()) return [];

  const metrics: string[] = [];
  const percentChunks = goal.match(/\d+(?:\.\d+)?%\s*(?:\w+\s*){0,4}/gi) ?? [];
  const numberChunks =
    goal.match(
      /\b(?:reduce|increase|cut|grow|save|achieve|reach|within)\s+.{0,30}?\d+[\d.,]*(?:%|x)?\s*(?:\w+\s*){0,3}/gi,
    ) ?? [];
  const timeframeChunks =
    goal.match(/\bwithin\s+\d+\s+(?:days?|weeks?|months?|quarters?|years?)/gi) ?? [];

  metrics.push(...percentChunks.map((m) => truncate(m.trim(), 90)));
  metrics.push(...numberChunks.map((m) => truncate(m.trim(), 90)));
  metrics.push(...timeframeChunks.map((m) => truncate(m.trim(), 90)));

  if (metrics.length === 0 && goal.trim()) {
    metrics.push(truncate(goal.trim(), 90));
  }

  return unique(metrics).slice(0, 4);
}

function extractTimeHorizon(goal: string): string | null {
  const match = goal.match(
    /\bwithin\s+(\d+\s+(?:days?|weeks?|months?|quarters?|years?))/i,
  );
  return match ? match[1] : null;
}

function detectDomains(idea: string, goal: string): DomainId[] {
  const text = `${idea} ${goal}`;
  const matched = DOMAIN_RULES.filter(({ pattern }) => pattern.test(text)).map(
    ({ id }) => id,
  );
  return matched.length > 0 ? matched : ["general"];
}

function buildPersonas(idea: string, goal: string, domains: DomainId[]): {
  primary: string;
  secondary: string[];
} {
  const personas: string[] = [];

  for (const rule of DOMAIN_RULES) {
    if (domains.includes(rule.id)) {
      personas.push(rule.persona, ...rule.personas);
    }
  }

  const forMatch = idea.match(/\bfor\s+([a-z][\w\s-]{2,40}?)(?:\s+to|\s+who|\s+that|,|\.|$)/i);
  if (forMatch) {
    personas.unshift(truncate(forMatch[1].trim(), 40));
  }

  const helpsMatch = idea.match(/\bhelps?\s+([a-z][\w\s-]{2,40}?)(?:\s+to|\s+who|\s+with|,|\.|$)/i);
  if (helpsMatch) {
    personas.unshift(truncate(helpsMatch[1].trim(), 40));
  }

  if (personas.length === 0) {
    personas.push("primary user", "team lead", "operations stakeholder");
  }

  const cleaned = unique(
    personas.map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean),
  );

  return {
    primary: cleaned[0],
    secondary: cleaned.slice(1, 4),
  };
}

function extractProblemPhrases(idea: string, goal: string): string[] {
  const phrases: string[] = [];
  const reduceMatch = goal.match(/\b(reduce|cut|lower|decrease)\s+(.+?)(?:\.|,|by\s+\d|$)/i);
  if (reduceMatch) phrases.push(truncate(reduceMatch[0], 80));

  const improveMatch = goal.match(/\b(improve|increase|boost|grow)\s+(.+?)(?:\.|,|by\s+\d|$)/i);
  if (improveMatch) phrases.push(truncate(improveMatch[0], 80));

  const withoutMatch = idea.match(/\bwithout\s+(.+?)(?:\.|,|$)/i);
  if (withoutMatch) phrases.push(`work without ${truncate(withoutMatch[1], 60)}`);

  if (phrases.length === 0 && goal.trim()) {
    phrases.push(truncate(goal.trim(), 80));
  }

  return unique(phrases).slice(0, 3);
}

function buildContext(productIdea: string, businessGoal: string): ProductContext {
  const ideaRaw = productIdea.trim();
  const goalRaw = businessGoal.trim();
  const domains = detectDomains(ideaRaw, goalRaw);
  const { primary, secondary } = buildPersonas(ideaRaw, goalRaw, domains);

  return {
    ideaRaw,
    goalRaw,
    productLabel: deriveProductLabel(ideaRaw),
    ideaClause: truncate(ideaRaw, 120),
    primaryPersona: primary,
    secondaryPersonas: secondary,
    domains,
    capabilities: extractCapabilities(ideaRaw, goalRaw),
    metrics: extractMetrics(goalRaw),
    timeHorizon: extractTimeHorizon(goalRaw),
    problemPhrases: extractProblemPhrases(ideaRaw, goalRaw),
    seed: hashStrings(ideaRaw.toLowerCase(), goalRaw.toLowerCase()),
  };
}

function hasDomain(ctx: ProductContext, id: DomainId): boolean {
  return ctx.domains.includes(id);
}

function goalAnchor(ctx: ProductContext): string {
  if (ctx.metrics.length > 0) return ctx.metrics[0];
  if (ctx.goalRaw) return truncate(ctx.goalRaw, 90);
  return "the stated business outcome";
}

function buildDiscoveryQuestions(ctx: ProductContext): string[] {
  const questions: string[] = [
    `Who exactly is the ${ctx.primaryPersona} using "${ctx.productLabel}", and what do they do today when this capability is missing?`,
    `Which single metric from the business goal (${goalAnchor(ctx)}) is the MVP success criterion versus a stretch target?`,
    `What manual steps in the current workflow would "${ctx.productLabel}" replace or shorten first?`,
    `What source data is required on day one to ${pick(ctx.capabilities, ctx.seed, 0)}?`,
    `Which ${ctx.secondaryPersonas[0] ?? "stakeholder"} must sign off before the ${ctx.primaryPersona} can rely on outputs in production?`,
    `What failure modes (wrong recommendation, stale data, missed alert) are unacceptable for ${ctx.primaryPersona}?`,
  ];

  if (ctx.timeHorizon) {
    questions.push(
      `What must ship ${ctx.timeHorizon} to prove progress toward ${goalAnchor(ctx)}?`,
    );
  }

  if (hasDomain(ctx, "ai")) {
    questions.push(
      `When the system ${pick(ctx.capabilities, ctx.seed, 1)}, how will ${ctx.primaryPersona} audit, correct, and override results before acting?`,
    );
  }

  if (hasDomain(ctx, "healthcare")) {
    questions.push(
      `Which clinical or privacy regulations constrain how patient-related data can be collected, displayed, and retained in v1?`,
    );
  }

  if (hasDomain(ctx, "commerce")) {
    questions.push(
      `Does MVP require a complete purchase path, or is cart abandonment recovery / lead capture enough to validate ${goalAnchor(ctx)}?`,
    );
  }

  if (hasDomain(ctx, "enterprise")) {
    questions.push(
      `Which roles beyond ${ctx.primaryPersona} need admin configuration, audit logs, or approval queues in the first release?`,
    );
  }

  if (hasDomain(ctx, "education")) {
    questions.push(
      `How will instructors verify that recommendations support learning outcomes rather than shortcutting assessment integrity?`,
    );
  }

  if (hasDomain(ctx, "fintech")) {
    questions.push(
      `What fraud, KYC, or audit requirements apply before any automated decision affects customer funds or accounts?`,
    );
  }

  if (hasDomain(ctx, "logistics")) {
    questions.push(
      `Which upstream signals (supplier delay, demand spike, stock level) must be modeled to support ${ctx.productLabel}?`,
    );
  }

  if (ctx.problemPhrases.length > 0) {
    questions.push(
      `What root cause drives "${ctx.problemPhrases[0]}" today, and how will we measure that this product fixes it?`,
    );
  }

  return unique(questions).slice(0, 8);
}

function buildBusinessRequirements(ctx: ProductContext): string[] {
  const metric = goalAnchor(ctx);
  const reqs: string[] = [
    `The system must implement "${ctx.productLabel}" as described: ${ctx.ideaClause}.`,
    `Every in-scope feature must trace to the business goal: ${ctx.goalRaw ? truncate(ctx.goalRaw, 100) : metric}.`,
    `Enable ${ctx.primaryPersona} to ${pick(ctx.capabilities, ctx.seed, 0)} without leaving their primary workflow.`,
    `Capture minimum input fields needed to produce useful output for ${ctx.secondaryPersonas[0] ?? ctx.primaryPersona} review.`,
    `Display results in structured sections that ${ctx.secondaryPersonas[1] ?? "engineering"} can convert into backlog items.`,
    `Support regenerate-after-edit so teams can iterate on the idea and goal without losing context.`,
  ];

  if (ctx.metrics.length > 1) {
    reqs.push(
      `Instrument events to measure progress on: ${ctx.metrics.slice(1, 3).join("; ")}.`,
    );
  }

  if (hasDomain(ctx, "analytics")) {
    reqs.push(
      `Provide at least one view where ${ctx.primaryPersona} can compare current performance against ${metric}.`,
    );
  }

  if (hasDomain(ctx, "mobile")) {
    reqs.push(
      `Core journeys for ${ctx.primaryPersona} must complete on mobile widths with no horizontal scrolling.`,
    );
  }

  if (hasDomain(ctx, "ai")) {
    reqs.push(
      `Show provenance or rationale snippets when the product ${pick(ctx.capabilities, ctx.seed, 2)} so users can validate before committing.`,
    );
  }

  if (hasDomain(ctx, "marketplace")) {
    reqs.push(
      `Balance seller and buyer needs: ${ctx.secondaryPersonas[0] ?? "seller"} onboarding must not block ${ctx.secondaryPersonas[1] ?? "buyer"} discovery.`,
    );
  }

  if (hasDomain(ctx, "hr")) {
    reqs.push(
      `Protect candidate and employee data; limit visible fields by role for ${ctx.primaryPersona} and ${ctx.secondaryPersonas[0] ?? "hiring manager"}.`,
    );
  }

  if (ctx.timeHorizon) {
    reqs.push(
      `Prioritize requirements that can be validated ${ctx.timeHorizon} against ${metric}.`,
    );
  }

  return unique(reqs).slice(0, 8);
}

function buildUserStories(ctx: ProductContext): string[] {
  const metric = goalAnchor(ctx);
  const cap0 = pick(ctx.capabilities, ctx.seed, 0);
  const cap1 = pick(ctx.capabilities, ctx.seed, 1);
  const cap2 = pick(ctx.capabilities, ctx.seed, 2);

  const stories: string[] = [
    `As a ${ctx.primaryPersona}, I want to describe "${ctx.productLabel}" and our goal (${truncate(ctx.goalRaw || metric, 60)}) so the team shares one definition of success.`,
    `As a ${ctx.primaryPersona}, I want to ${cap0} so I can move toward ${metric}.`,
    `As a ${ctx.secondaryPersonas[0] ?? "stakeholder"}, I want discovery questions tied to ${ctx.ideaClause} so we resolve ambiguity before sprint planning.`,
    `As a ${ctx.secondaryPersonas[1] ?? "engineer"}, I want explicit MVP boundaries for "${ctx.productLabel}" so estimates reflect real scope.`,
    `As a ${ctx.secondaryPersonas[2] ?? "designer"}, I want user stories mapped to ${ctx.primaryPersona} journeys so flows cover happy path and failure cases.`,
  ];

  if (hasDomain(ctx, "ai")) {
    stories.push(
      `As a ${ctx.primaryPersona}, I want to ${cap1} with visible reasoning so I can trust recommendations before acting.`,
    );
  }

  if (hasDomain(ctx, "commerce")) {
    stories.push(
      `As a ${ctx.secondaryPersonas[0] ?? "shopper"}, I want a frictionless path from intent to conversion so ${metric} improves without extra support tickets.`,
    );
  }

  if (hasDomain(ctx, "healthcare")) {
    stories.push(
      `As a ${ctx.primaryPersona}, I want clinical context preserved when I ${cap2} so care decisions stay safe and traceable.`,
    );
  }

  if (hasDomain(ctx, "education")) {
    stories.push(
      `As an ${ctx.primaryPersona}, I want assignments and feedback aligned to learning objectives when students use "${ctx.productLabel}".`,
    );
  }

  if (hasDomain(ctx, "enterprise")) {
    stories.push(
      `As an ${ctx.secondaryPersonas[0] ?? "IT administrator"}, I want role-based access so only authorized staff can change settings affecting ${ctx.primaryPersona}.`,
    );
  }

  if (hasDomain(ctx, "logistics")) {
    stories.push(
      `As a ${ctx.primaryPersona}, I want exception alerts when inventory or delivery signals drift so I can ${cap0} before costs spike.`,
    );
  }

  if (ctx.timeHorizon) {
    stories.push(
      `As a team lead, I want a ${ctx.timeHorizon} release plan for "${ctx.productLabel}" so we can demonstrate progress on ${metric}.`,
    );
  }

  return unique(stories).slice(0, 8);
}

function buildMvpScope(ctx: ProductContext): string[] {
  const metric = goalAnchor(ctx);
  const scope: string[] = [
    `Guided intake: capture product idea ("${ctx.productLabel}") and business goal for ${ctx.primaryPersona}.`,
    `Core capability: ${pick(ctx.capabilities, ctx.seed, 0)} — the minimum slice that proves value.`,
    `Secondary capability: ${pick(ctx.capabilities, ctx.seed, 1)} — only if it directly supports ${metric}.`,
    `Output pack: discovery questions, requirements, stories, scope, risks, and deferrals specific to this idea.`,
    `Review UI for ${ctx.secondaryPersonas[0] ?? "stakeholders"} to scan and approve artifacts before build.`,
    `Iteration loop: edit inputs and regenerate without losing the last approved snapshot (session-only).`,
  ];

  if (hasDomain(ctx, "analytics")) {
    scope.push(
      `One dashboard or summary card tracking ${metric} with mock or seed data for demo.`,
    );
  }

  if (hasDomain(ctx, "commerce")) {
    scope.push(
      `Single happy-path conversion flow (browse → intent → confirm) scoped to validate ${metric}.`,
    );
  }

  if (hasDomain(ctx, "mobile")) {
    scope.push(
      `Responsive layouts for ${ctx.primaryPersona} on phone and tablet for the primary journey.`,
    );
  }

  if (hasDomain(ctx, "ai")) {
    scope.push(
      `Conversational or assistant panel that ${pick(ctx.capabilities, ctx.seed, 2)} with editable drafts.`,
    );
  }

  if (hasDomain(ctx, "enterprise")) {
    scope.push(
      `Role toggle (admin vs. ${ctx.primaryPersona}) with mock permissions — no real SSO.`,
    );
  }

  if (hasDomain(ctx, "marketplace")) {
    scope.push(
      `Listings discovery plus basic ${ctx.secondaryPersonas[0] ?? "seller"} profile — no payments in MVP.`,
    );
  }

  if (hasDomain(ctx, "healthcare")) {
    scope.push(
      `Patient or case summary view with static sample records and clear demo disclaimers.`,
    );
  }

  if (hasDomain(ctx, "education")) {
    scope.push(
      `Assignment or module outline generator tied to one course context for pilot demo.`,
    );
  }

  if (hasDomain(ctx, "fintech")) {
    scope.push(
      `Read-only portfolio or transaction summary with flagged anomalies — no live money movement.`,
    );
  }

  if (hasDomain(ctx, "logistics")) {
    scope.push(
      `Inventory or shipment status board with manual CSV import for hackathon dataset.`,
    );
  }

  if (hasDomain(ctx, "hr")) {
    scope.push(
      `Candidate pipeline view with stage definitions aligned to ${metric}.`,
    );
  }

  if (ctx.timeHorizon) {
    scope.push(
      `Demo script and success checklist for stakeholder review ${ctx.timeHorizon}.`,
    );
  }

  return unique(scope).slice(0, 9);
}

function buildScopeRisks(ctx: ProductContext): string[] {
  const metric = goalAnchor(ctx);
  const risks: string[] = [
    `Goal ambiguity: "${truncate(ctx.goalRaw || metric, 70)}" may hide conflicting priorities between ${ctx.primaryPersona} and ${ctx.secondaryPersonas[0] ?? "leadership"}.`,
    `Scope creep on "${ctx.productLabel}" if every ${pick(ctx.capabilities, ctx.seed, 0)} edge case ships in v1.`,
    `Demo-quality output may be mistaken for production-ready logic for ${ctx.ideaClause}.`,
    `Underestimating integration work if ${ctx.primaryPersona} expects live data feeds on day one.`,
  ];

  if (ctx.metrics.length === 0) {
    risks.push(
      `No quantified target in the business goal — hard to prove MVP success for "${ctx.productLabel}".`,
    );
  }

  if (hasDomain(ctx, "ai")) {
    risks.push(
      `Over-automation: ${ctx.primaryPersona} may act on incorrect ${pick(ctx.capabilities, ctx.seed, 1)} without human review gates.`,
    );
  }

  if (hasDomain(ctx, "healthcare")) {
    risks.push(
      `Regulatory exposure if PHI or clinical workflows are modeled without legal review for "${ctx.productLabel}".`,
    );
  }

  if (hasDomain(ctx, "fintech")) {
    risks.push(
      `Compliance and fraud controls may block shipping core flows before ${metric} can be tested.`,
    );
  }

  if (hasDomain(ctx, "commerce")) {
    risks.push(
      `Payment, tax, and catalog complexity can consume the timeline meant for proving ${metric}.`,
    );
  }

  if (hasDomain(ctx, "enterprise")) {
    risks.push(
      `Enterprise buyers may require SSO, audit logs, and SLAs before piloting — beyond hackathon MVP.`,
    );
  }

  if (hasDomain(ctx, "mobile")) {
    risks.push(
      `Splitting web and native effort may delay the journey that proves ${metric} for ${ctx.primaryPersona}.`,
    );
  }

  if (hasDomain(ctx, "marketplace")) {
    risks.push(
      `Two-sided adoption risk: neither ${ctx.secondaryPersonas[0] ?? "sellers"} nor ${ctx.secondaryPersonas[1] ?? "buyers"} may engage without incentives.`,
    );
  }

  if (ctx.timeHorizon) {
    risks.push(
      `Timeline pressure (${ctx.timeHorizon}) vs. breadth of "${ctx.productLabel}" may force cutting the capability that actually moves ${metric}.`,
    );
  }

  if (ctx.problemPhrases.length > 0) {
    risks.push(
      `Fixing "${ctx.problemPhrases[0]}" may need upstream process change — not only software for ${ctx.primaryPersona}.`,
    );
  }

  return unique(risks).slice(0, 8);
}

function buildWhatNotToBuild(ctx: ProductContext): string[] {
  const metric = goalAnchor(ctx);
  const deferrals: string[] = [];

  const universalDeferrals = [
    "Multi-region deployment, auto-scaling hardening, and 99.9% SLA commitments.",
    "Full admin suite with billing, invoicing, and subscription lifecycle management.",
    "Real-time multiplayer collaboration with comment threads and version history.",
    "Custom mobile native apps (iOS/Android) unless mobile is the only channel for ${ctx.primaryPersona}.",
  ];

  deferrals.push(
    universalDeferrals[0],
    universalDeferrals[1],
    universalDeferrals[2],
    hasDomain(ctx, "mobile")
      ? `Desktop-only power features that ${ctx.primaryPersona} rarely needs in the field.`
      : universalDeferrals[3],
  );

  if (!hasDomain(ctx, "commerce")) {
    deferrals.push(
      `Full storefront, tax engine, and payment orchestration unrelated to "${ctx.productLabel}".`,
    );
  } else {
    deferrals.push(
      "Multi-currency checkout, loyalty programs, and complex promotions until baseline conversion proves " +
        metric +
        ".",
    );
  }

  if (!hasDomain(ctx, "analytics")) {
    deferrals.push(
      `Enterprise BI warehouse, ETL pipelines, and self-serve SQL for metrics beyond ${metric}.`,
    );
  } else {
    deferrals.push(
      "Predictive models on full historical data lakes — start with curated KPIs tied to the business goal.",
    );
  }

  if (!hasDomain(ctx, "ai")) {
    deferrals.push(
      `Autonomous agent chains that ${pick(ctx.capabilities, ctx.seed, 0)} without user confirmation.`,
    );
  } else {
    deferrals.push(
      "Fine-tuned foundation models, RAG over private corpora, and autonomous tool-use loops in v1.",
    );
  }

  if (!hasDomain(ctx, "enterprise")) {
    deferrals.push("SSO with SCIM provisioning and granular enterprise policy engine.");
  } else {
    deferrals.push(
      "Custom per-tenant workflow designer — use fixed roles for " +
        ctx.primaryPersona +
        " and " +
        (ctx.secondaryPersonas[0] ?? "admin") +
        " in MVP.",
    );
  }

  if (!hasDomain(ctx, "healthcare")) {
    deferrals.push("HL7/FHIR integrations and certified clinical decision support.");
  } else {
    deferrals.push(
      "Production PHI hosting and FDA/regulatory submissions — demo with synthetic records only.",
    );
  }

  if (!hasDomain(ctx, "education")) {
    deferrals.push("LMS grade sync, proctoring, and accreditation reporting suites.");
  }

  if (!hasDomain(ctx, "fintech")) {
    deferrals.push("Live payment rails, custody of funds, and trading execution.");
  }

  if (!hasDomain(ctx, "marketplace")) {
    deferrals.push("Escrow, dispute arbitration, and global seller onboarding.");
  }

  if (!hasDomain(ctx, "logistics")) {
    deferrals.push("Fleet telematics, route optimization at scale, and WMS replacement.");
  }

  if (!hasDomain(ctx, "hr")) {
    deferrals.push("Background checks, payroll, and benefits administration.");
  }

  deferrals.push(
    `Nice-to-have features that do not move ${metric} in the first release of "${ctx.productLabel}".`,
  );

  return unique(deferrals).slice(0, 8);
}

export function generateMockDiscovery(
  productIdea: string,
  businessGoal: string,
): DiscoveryResult {
  const ctx = buildContext(productIdea, businessGoal);

  return {
    discoveryQuestions: buildDiscoveryQuestions(ctx),
    businessRequirements: buildBusinessRequirements(ctx),
    userStories: buildUserStories(ctx),
    mvpScope: buildMvpScope(ctx),
    scopeRisks: buildScopeRisks(ctx),
    whatNotToBuild: buildWhatNotToBuild(ctx),
  };
}
