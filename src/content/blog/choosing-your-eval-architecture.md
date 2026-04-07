---
title: "Choosing Your Eval Architecture"
description: "The question is not which eval tool. The question is what kind of eval infrastructure your system actually needs. Three architectures, three failure modes, and how they compose into an evidence pipeline."
pubDate: "Apr 05 2026 18:00"
tags: ["evals", "practical", "agents"]
summary: "Most teams ask which eval tool to use. The prior question is architectural: what shape of eval system does your agent need? The eval market collapses into three categories. Benchmark harnesses measure capability against fixed datasets but produce false confidence about production fitness. Flexible eval frameworks like Inspect AI let you write custom evaluators for your specific contracts but stop at CI. Production-native infrastructure scores live traces continuously but costs more than most teams budget for. Princeton researchers found that over eighteen months of model releases, accuracy improved steadily while reliability barely moved. The three architectures are not alternatives. They are layers. Start with offline contracts for your five highest-risk behaviors. Extend them to production scoring. The eval architecture is not just a quality system. It is your evidence pipeline."
summaryProblem: "Teams pick one eval tool when the real question is which layers of eval infrastructure the system needs."
summaryCoreIdea: "Benchmark harnesses, flexible frameworks, and production-native scoring answer different questions and break differently."
summaryTakeaway: "A composable eval stack where offline contracts extend into production scoring and generate evidence artifacts."
---

*The question is not which eval tool. The question is what kind of eval infrastructure your system actually needs.*

---

*This essay extends ideas from [The Eval Gap](/blog/the-eval-gap/) and [Building an Eval Harness That Survives Production](/blog/building-an-eval-harness-that-survives-production/) in the Reliable Agent Systems series.*

---

A customer support agent passes every benchmark in staging. Two weeks after deployment, it starts issuing refunds for complaints it should be escalating. No alert fires. The CSAT score does not move for another ten days, because the customers getting unearned refunds are not complaining. By the time someone notices, the agent has quietly cost the organization six figures in refund exposure it never had authority to approve.

The agent had been evaluated. It had not been evaluated for the right things, in the right places, at the right cadence.

In February 2026, a team at Princeton published a study that made this pattern legible at scale. They evaluated fourteen agentic models across two benchmarks and measured not just accuracy but reliability: consistency across runs, robustness under input variation, predictability of confidence, and bounded failure severity. The headline finding was that over eighteen months of model releases, accuracy improved steadily. Reliability barely moved.

For teams shipping agents, that gap becomes an eval architecture problem. Not because model quality is irrelevant, but because the mismatch between what teams evaluate and what actually fails in production is structural. Teams benchmark capability. They ship without evaluating operational behavior. The missing piece is not better benchmarks. It is a different kind of evaluation infrastructure, one that can tell you whether the agent behaves the same way twice, whether it degrades gracefully when a tool call fails, and whether a control you wired in last month is still holding.

Most teams I talk to ask the wrong question first. They ask: should we use LangSmith or Braintrust or Inspect AI? That is a tooling question. The prior question is architectural: what shape of eval system does your agent need, and how does each layer connect to the evidence you will eventually have to produce?

## Three architectures, three failure modes

The eval market is crowded, but the underlying architectures collapse into three categories. Each answers a different question, and each breaks in a different way.

A caveat before the taxonomy: these categories describe operating models, not product boundaries. Many tools span more than one. Inspect AI is a flexible framework that can be pushed toward production use. LangSmith covers both offline eval workflows and production trace scoring. The point is not that the tools are mutually exclusive. The point is that the operating model, the question being asked, the cadence, the owner, changes between layers.

**Benchmark harnesses** run a model or agent against a fixed dataset and produce a score. EleutherAI's lm-evaluation-harness is the canonical example in the open-source world. HELM, MMLU, and the hundreds of benchmarks available through Inspect Evals serve the same function. You define a task, provide inputs and expected outputs, run the evaluation, and get a number.

Benchmark harnesses are excellent at answering one question: does this model have a specific capability? They are terrible at answering a different question: does this agent behave reliably in my production environment? The failure mode is false confidence. A model that scores 92% on a curated dataset can still hallucinate tool calls, skip authorization checks, and drift silently under real traffic. Benchmarks measure capability. They do not measure operational fitness.

**Flexible eval frameworks** let you define custom evaluation logic and wire it into your development workflow. Inspect AI is the strongest example in this category. It provides a composable architecture: you define tasks, solvers (the agent logic), and scorers (the evaluation criteria) as separate components. LangSmith's evaluation features, Braintrust, and Promptfoo operate in similar territory. You write evaluators that express what "correct" means for your specific use case, then run them against versioned test sets during development.

These frameworks solve the customization problem that benchmark harnesses cannot. You can test whether your agent follows your escalation policy, not whether it can answer MMLU questions. The failure mode is scope. Flexible eval frameworks are overwhelmingly used for offline evaluation: you run them in CI, you run them during development, and you stop. LangChain's 2026 State of AI Agents report found that 52% of organizations run offline evaluations, but only 37% run online evaluations against production traffic. The gap is not laziness. It is architectural. Most flexible frameworks were not built to score live traces at production scale. They were built to catch regressions before deployment.

**Production-native eval infrastructure** scores live agent behavior continuously. This includes trace-level evaluators that run against every production request, canary replay systems that test a frozen input set on a schedule, and distribution monitors that watch for shifts in tool-call patterns, latency, or outcome metrics. Arize, Langfuse, and custom harnesses built on OpenTelemetry operate in this space.

Production-native eval infrastructure answers the question that the other two cannot: is the agent still behaving the way it was behaving when we last approved it? The failure mode is cost. Scoring every trace is expensive. Running LLM-as-judge evaluators on production traffic requires compute budget, latency tolerance, and a team that can interpret the results. Teams that build production eval infrastructure without thinking about sampling, tiering, and alerting thresholds end up with a system that generates data no one reads.

![Eval Architecture Stack](/images/eval-architecture-stack.svg)

## Choosing where to invest: a decision table

The following table summarizes when each layer earns its cost and what goes wrong when teams skip it or misuse it.

| | **Benchmark Harnesses** | **Flexible Eval Frameworks** | **Production-Native Infrastructure** |
|---|---|---|---|
| **Core question** | Does this model have the capability? | Does this agent meet our behavioral contracts? | Are controls still holding under real traffic? |
| **When to adopt** | Model selection, provider change, base model upgrade | First agent in development, every CI pipeline | First agent in production, any agent with control obligations |
| **Owner** | ML / research team | Engineering team that owns the agent | Platform / SRE / reliability team |
| **Cadence** | Model selection events (infrequent) | Every deployment (CI gate) | Continuous (sampling + alerting) |
| **Cost profile** | Low (batch runs, no infra) | Medium (test sets, CI compute) | High (production compute, LLM-as-judge, alert routing) |
| **Common mistake** | Treating benchmark pass as production-ready | Stopping at CI, never extending to production | Scoring everything, alerting on nothing useful |
| **Evidence artifact** | Capability screening record | Behavioral test results tied to declared requirements | Continuous monitoring evidence with timestamped control verification |

## The decision is not which one. It is how they compose.

The three architectures are not alternatives. They are layers. The mistake teams make is treating the choice as singular: pick a tool, deploy it, move on. The better mental model is a stack, where each layer catches a different class of failure and feeds into the next.

Benchmark harnesses validate capabilities. When you upgrade a model, swap a provider, or evaluate a new base model for a use case, benchmarks tell you whether the raw capability is present. Does the model handle multi-turn tool calling? Can it reason over long contexts? Does it follow structured output formats? Run benchmarks to answer these questions. Stop running benchmarks when the question shifts from "can it?" to "does it?"

Flexible eval frameworks validate behavior against your contracts. Once a model passes capability screening, you need to test whether the agent, the full system, not just the model, meets your specific requirements. Does it follow your escalation policy? Does it respect authorization scopes? Does it ground responses in retrieved context? Write these as custom evaluators with declarative specs, version them alongside your agent code, and run them in CI. The separation matters here: the loader pulls test cases from a versioned dataset, the runner executes the agent, the scorer applies your evaluation criteria. They change at different rates, and keeping them separated is what makes the system maintainable.

Production-native infrastructure validates that controls still hold under real conditions. The evaluators you wrote for CI can often be reused as production scorers, but the operating model changes. In CI, you run everything and block on failure. In production, you sample, score asynchronously, and alert on threshold violations. The canary replay pattern, running a frozen set of high-value inputs against the live system on a schedule, bridges the two: it gives you the controlled-input rigor of offline evals with the environmental fidelity of production.

## Sequencing matters more than selection

Most teams start with the wrong layer. They begin with production observability, tracing, logging, dashboards, because it feels like the most urgent problem. They can see that their agent is doing things. They cannot see whether it is doing them correctly. Observability without evaluation is surveillance without judgment.

The better sequence: start with offline eval contracts. Define what "correct" means for your five highest-risk agent behaviors. Write evaluators for them. Run them in CI. This takes a week, not a quarter. Once those contracts exist, extend them into production scoring. Sample 5–10% of live traces and run the same evaluators. The contracts are already written. The engineering work is sampling infrastructure and alert routing. For most teams operating production agents, benchmarks are usually not the first priority. Not because they are unimportant, but because they answer a question most teams do not face daily. You change base models rarely. You change agent behavior constantly.

This sequence also matters for evidence. When a regulator, auditor, or internal review asks you to demonstrate that your agent meets a specific obligation, the artifacts that matter are evaluation results tied to declared requirements, not benchmark scores. Your offline eval contracts become the specification. Your CI run history becomes the testing record. Your production scoring results become the monitoring evidence. The eval architecture is not just a quality system. It is your evidence pipeline.

## What the current market gets wrong

The eval tooling market has grown fast. LangChain's 2026 survey counts 89% of organizations with some form of observability and 52% with offline evals. Tools like LangSmith, Arize, Langfuse, and Inspect AI are mature, well-documented, and actively maintained. There is no shortage of good software.

What the market gets wrong is framing. Every vendor comparison asks "which platform is best?" as though evaluation is a single activity. It is not. Evaluation is at least three activities, capability screening, behavioral contract testing, and production control verification, and they require different architectures, different cadences, and different ownership models.

The second thing the market gets wrong is the relationship between evals and everything else. An eval that runs in isolation, disconnected from the obligation it validates, the control it tests, and the evidence artifact it produces, is a test without a purpose. It might catch a regression. It will not help you when someone asks why your agent made a particular decision, whether the control you implemented is still effective, or what changed between the last audit and now. Evals become load-bearing only when they are wired into the obligation → control → evaluation → evidence loop.

## A practical starting point

If your team has no eval infrastructure today, here is where to start.

Pick one agent behavior that would cause real damage if it failed. Not "response quality" in the abstract. A specific behavior. "The agent must not issue a refund above $500 without human approval." "The agent must not surface documents from the restricted corpus." "The agent must escalate to a human when confidence is below threshold."

Write an evaluator for that behavior. Make it deterministic if you can: check whether the authorization scope was present, whether the retrieval source was in the allowed list, whether the escalation flag was set. If the behavior requires judgment, use an LLM-as-judge evaluator with a rubric you can version and inspect.

Run it offline first. Build a test set of 20–50 cases that exercise the behavior, including adversarial inputs that should trigger the control. Wire the evaluator into your CI pipeline. Block deployments that fail.

Then extend it to production. Sample live traces, run the same evaluator, and set an alert threshold. You now have a single eval contract that runs in CI, scores production traffic, and produces timestamped evidence that a specific control was tested and held.

That is one behavior. Repeat for the next four. Within a month, you have a behavioral test suite that covers your highest-risk surface and generates the evidence artifacts that make audit, compliance, and incident review possible.

The eval architecture choice was never about picking the right tool. It was about understanding which questions each layer answers, sequencing them correctly, and connecting the results to the obligations your system is supposed to meet.

---

*This is part of the [Reliable Agent Systems](/series/) series on building AI systems that can prove they work.*

## Selected references

- Zhu R, Tamirisa R, Kapoor S, Narayanan A, et al. "Towards a Science of AI Agent Reliability." Princeton University. arXiv:2602.16666, February 2026. https://arxiv.org/abs/2602.16666
- LangChain. "State of AI Agent Engineering 2026." https://www.langchain.com/state-of-agent-engineering
- UK AI Security Institute. "Inspect AI: A Framework for Large Language Model Evaluations." https://inspect.aisi.org.uk/
- UK AI Security Institute. "Inspect Evals: Community Contributed LLM Evaluations." https://github.com/UKGovernmentBEIS/inspect_evals
- Galileo. "State of AI Evaluation Engineering Report." February 2026. https://galileo.ai/blog/state-of-ai-evaluation
