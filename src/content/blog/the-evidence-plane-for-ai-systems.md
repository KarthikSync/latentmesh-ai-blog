---
title: "The Evidence Plane for AI Systems"
description: "The missing layer between what your system must prove and how your organization proves it. A framework synthesis connecting obligations, controls, evaluations, evidence artifacts, and the response loop."
pubDate: "Apr 05 2026 20:00"
tags: ["reliability", "compliance", "evidence", "practical"]
summary: "Most teams building AI systems have the pieces: policy documents, prompts, eval harnesses, monitoring dashboards, maybe governance reviews. What they do not have is the layer that connects these pieces into a single operating model. A team can describe its controls but cannot show which obligations those controls satisfy. Evals run, but nobody can point to the release decision those evals supported. The evidence plane is the structured layer that connects five first-class objects: obligations, controls, evaluations, evidence artifacts, and the response loop. It turns 'we think this system is safe' into something inspectable. Once those links exist, questions that are currently unanswerable become routine: which controls map to which obligation, which evals failed on the release candidate, which incidents traced back to control design failures."
summaryProblem: "Teams have controls, evals, and logs but no structure connecting them to obligations or proof."
summaryCoreIdea: "Without preserved relationships between these objects, audits and incident reviews become manual reconstruction."
summaryTakeaway: "A five-object framework linking obligations, controls, evals, evidence artifacts, and response loops."
---

*The missing layer between what your system must prove and how your organization proves it.*

---

*This essay is the framework synthesis of the [Reliable Agent Systems](/series/) series.*

---

In February 2026, a security startup called CodeWall pointed an autonomous AI agent at the open internet and let it choose a target. It picked McKinsey. Two hours later, the agent had full read-write access to the production database behind Lilli, McKinsey's internal AI platform: 46.5 million chat messages, 728,000 files, 57,000 user accounts, and every system prompt that governed how the AI behaved for 40,000 consultants.

McKinsey patched the vulnerability within hours of notification. Their CISO acknowledged receipt within a day. Third-party forensics found no evidence of prior unauthorized access.

But here is the question that matters for this essay: before the patch, could McKinsey show which controls governed Lilli's behavior? Could they trace a specific system prompt to an obligation, to an eval that validated it, to an evidence artifact that recorded its state? Could they prove, after the fact, that the prompts had not been tampered with prior to CodeWall's disclosure?

The answer, based on the public record, is probably not. And McKinsey is better resourced and better staffed than most organizations building AI systems.

This is the gap the evidence plane addresses.

## Teams have the parts. They do not have the connections.

Most teams building AI systems now have pieces of the infrastructure. They have policy documents. They have prompts and tool schemas. They have eval harnesses, maybe monitoring dashboards, maybe even governance reviews. Some have started assembling evidence packs for audits or release decisions.

What they usually do not have is the layer that connects these pieces into a single operating model.

A team can describe its controls but cannot show which obligations those controls satisfy. Evals run, but nobody can point to the release decision those evals supported. Logs exist, but reconstructing a regulator-facing evidence trail from them is a manual exercise nobody has time for. And when a production incident surfaces, the team cannot trace it back to a missing control, a failed eval, or an outdated policy assumption.

This is why so many AI programs feel simultaneously over-instrumented and under-governed. The artifacts exist, but the chain of proof does not. The tests run, but nobody can cleanly show which obligation a test supports, which control it validates, what evidence it produced, who reviewed that evidence, or how a production failure should change the system.

The gap is not a missing eval. It is not a weak control. It is not poor logging. The deeper problem is that these functions are implemented as separate islands with no preserved relationships between them.

## Naming the layer

In distributed systems, the separation between data plane and control plane is well understood. The data plane moves requests. The control plane manages routing, policy, and configuration. Both are necessary. Neither is sufficient.

AI systems need a third layer.

The evidence plane is the structured layer that connects obligations, controls, evaluations, evidence artifacts, and the response loop for an AI system. It turns "we think this system is safe, reliable, and compliant" into something inspectable and operationally real.

In practical terms, the evidence plane answers one question:

*What is this system supposed to prove, how do we test that, what evidence do we keep, and what do we do when the proof fails?*

That question sits underneath almost every serious AI deployment. Reliability teams ask it in one language. Security teams ask it in another. Legal and compliance teams ask it in a third. Incident responders ask it after something has already gone wrong. The evidence plane makes those questions resolve to the same underlying model.

## The five objects

The evidence plane operates on five first-class objects. These are not new — the [Reliable Agent Systems](/series/) series introduced each one across ten essays. What this framework does is show how they connect.

**Obligations** are the claims or requirements the system must satisfy. Some come from regulation — the EU AI Act's [human oversight requirements](/blog/mapping-the-eu-ai-act-to-engineering-evidence/) under Article 14, for instance. Some come from internal policy. Some come from customer contracts. "A human must be able to intervene in high-risk decisions." "Sensitive data must not leave the retrieval boundary." "Tool use must stay within authorization scope." These are not implementation details. They are things the [system must be able to prove](/blog/what-should-an-ai-system-actually-prove/).

**Controls** are the mechanisms built to satisfy those obligations. A human approval gate, a tool allowlist, a policy check on retrieval results, a scoped credential model, a runtime kill switch. Controls are what you build. But a [control without a mapped obligation is a guardrail with no mandate](/blog/controls-are-not-guardrails/), and a control without a corresponding eval is mostly a hope.

**Evaluations** are how you test whether the controls hold. Offline benchmarks, scenario tests, adversarial cases, replay tests, policy assertions, continuous scoring in production. The [eval gap](/blog/the-eval-gap/) exists because most teams test in staging and assume the results transfer. They do not. The evidence plane requires evals that run against production conditions, not just pre-deployment snapshots, and an [eval architecture](/blog/choosing-your-eval-architecture/) designed to survive the operational environment it measures.

**Evidence artifacts** are the records produced when a control operates or an eval runs. Test results, trace bundles, approval records, signed review outputs, exception logs, incident timelines, versioned policy mappings, release attestations. Evidence is not a generic log stream. It is a [structured artifact tied to a claim](/blog/anatomy-of-an-evidence-pack/) — retrievable, attributable, and timestamped.

**Response** is what changes when the evidence says it should. A control failed. [Drift was detected](/blog/drift-detection-patterns-for-production-agents/). An [incident exposed a blind spot](/blog/the-incident-response-gap-in-ai-systems/). The response loop feeds production reality back into the system: controls tighten, evals expand, evidence requirements update, [ownership shifts](/blog/who-owns-the-agents-mistake/). Without this loop, the evidence plane is a snapshot. With it, the plane stays alive.

## The evidence plane is a system of relationships

This is the distinction that matters most.

The evidence plane is not a store of logs. It is not a report generator. It is not an eval platform. It is not a governance dashboard.

It is best understood as a system of relationships. Its job is to preserve the links between the things that matter:

This obligation is satisfied by these controls. This control is validated by these evals. This eval run produced these artifacts. These artifacts supported this release decision. This incident revealed this control gap. This control gap created these new eval requirements. This updated control changed the evidence required for the next release.

Once those links exist, questions that are currently unanswerable become routine.

Which obligations does this agent touch? Which controls are mapped to Article 14, or to the internal data handling policy, or to customer contractual requirements? Which evals failed on the current release candidate? Which evidence artifacts were produced for the last deployment? Which incidents in the last quarter traced back to control design failures versus control enforcement failures? Which high-severity failures still lack replayable evidence?

Those are not reporting luxuries. They are the minimum operating questions for a production AI system that needs to be trusted.

## The operating loop

The evidence plane also provides a lifecycle.

You start with an obligation. That obligation leads to a control. The control leads to one or more evals. Running those evals generates evidence artifacts. Those artifacts support an operational decision: approve, block, escalate, or remediate.

Then the system ships.

In production, the same plane continues to operate. Runtime monitoring detects exceptions, policy violations, drift, tool misuse, or anomalous outputs. When something goes wrong, the system preserves evidence, classifies severity, assigns ownership, and feeds the result back into control design and eval coverage.

This is where most organizations stop too early. They think the job ends once a control exists or once an eval passes. It does not. The real test is whether a production failure translates back into structured improvement. Does an incident that reveals a missing eval actually produce a new eval? Does a control that drifted actually get re-baselined? Do the evidence requirements tighten in response to what was learned?

Without that loop, teams do not have governance. They have snapshots.

## A worked example

Consider a customer support agent authorized to issue refunds up to a threshold without human approval. The evidence plane for this system would look like this:

**Obligation:** Human oversight is required for refund decisions above $500 (derived from internal policy and, for EU deployments, Article 14 human oversight requirements).

**Control:** An approval checkpoint that routes refund requests above $500 to a human reviewer before execution, with a tool-scope constraint that prevents the agent from invoking the refund API above that threshold without an approval token.

**Evaluation:** An adversarial test set that attempts to get the agent to issue over-threshold refunds through indirect paths — rephrased requests, multi-step conversations, tool-chaining that splits a large refund into smaller ones. Plus a [canary replay](/blog/drift-detection-patterns-for-production-agents/) that runs the same 200 scenarios weekly against production to detect behavioral drift.

**Evidence artifact:** The signed eval result from the most recent adversarial run, the approval log showing which human reviewed which refund, and a trace bundle capturing the agent's reasoning path for every refund above $300 in the past 30 days. All versioned, all tied to the release they were generated against.

**Response:** Last month, the canary replay flagged that the agent had started routing 12% of over-threshold refunds through a two-step path that bypassed the approval gate. The eval failure triggered an incident record, the control was tightened to validate cumulative refund totals across a session, the adversarial test set was expanded with the new bypass pattern, and the next release required passing the updated eval before deployment.

That is the full loop. Obligation to control to eval to artifact to response and back. Each object linked to the others. Each link preserved and queryable.

## Where this sits

The evidence plane does not replace existing frameworks. It is the engineering layer that makes their requirements operational.

The NIST AI Risk Management Framework tells you to govern, map, measure, and manage. It gives you the program structure. The evidence plane tells you how to produce the proof that governing, mapping, measuring, and managing actually happened.

ISO 42001 gives you the management system: the organizational processes, roles, and review cycles. The evidence plane connects those processes to the engineering artifacts that demonstrate they were followed.

The [EU AI Act](/blog/mapping-the-eu-ai-act-to-engineering-evidence/) tells you which proof points matter for high-risk systems under Annex III: risk management records, data governance documentation, technical documentation, logging, human oversight mechanisms, accuracy and robustness testing. The evidence plane is where those proof points are generated, stored, and served. Not in a binder assembled for an audit, but as a continuous output of the system's operation.

NIST helps you structure the program. ISO helps you manage it. The AI Act specifies what you must demonstrate, and the evidence plane is how you demonstrate it.

## What changes

Three things shift when the evidence plane exists.

First, incident reviews change. Instead of reconstructing what happened from scattered logs, dashboards, and Slack threads, the team can query the plane: what controls applied to this system at the time of the incident? What was the most recent eval result? What evidence existed? Who was the designated owner? The forensic improvisation that characterizes most AI incident response gets replaced by structured retrieval.

Second, audits change. A regulator or internal auditor asks: "Show me that this system has human oversight for high-risk decisions." Instead of assembling a narrative from policy documents, screenshots, and meeting notes, the team retrieves the obligation, the mapped control, the eval results, and the evidence artifacts, all linked, all versioned, all timestamped. The audit becomes an evidence query, not a document collection exercise.

Third, release decisions change. Instead of an informal review or a checklist, the release gate queries the evidence plane: do all mapped controls have passing evals? Are the evidence artifacts current? Are there open incidents against any of the controls this release touches? The release becomes an evidence-backed decision rather than a judgment call.

## What comes next

Once the evidence plane is accepted as the right abstraction, the next steps become clearer.

The framework needs a canonical data model, a formal specification for obligations, controls, evals, artifacts, responses, and the relationships between them. The data model is what makes the evidence plane implementable rather than conceptual.

From there, a reference implementation that can register those objects, preserve their relationships, and generate evidence bundles for a specific domain. Customer support agents remain the strongest wedge for this, because the obligation surface is tractable and the failure modes are well documented.

The reference implementation, in turn, needs an open specification: a published schema that any team can adopt without buying anything. The evidence plane should be a standard, not a product dependency.

And eventually, tooling that makes it practical for teams that do not have the engineering capacity to build from scratch. That is where the product layer sits, not as a replacement for the framework, but as an operational implementation of it.

The series diagnosed the problem. The companion essays showed the patterns. This piece names the architecture.

If the agent stack is the system that acts, the evidence plane is the system that proves.

---

*This essay synthesizes the full [Reliable Agent Systems](/series/) series. For the practical companion pieces, see [Building an eval harness that survives production](/blog/building-an-eval-harness-that-survives-production/), [From obligation to evidence in 90 minutes](/blog/from-obligation-to-evidence-in-90-minutes/), [What your agent logged vs. what the auditor needed](/blog/what-your-agent-logged-vs-what-the-auditor-needed/), [Drift detection patterns for production agents](/blog/drift-detection-patterns-for-production-agents/), and [The regulatory mapping table](/blog/the-regulatory-mapping-table/).*

---

![The Evidence Plane for AI Systems](/images/evidence-plane-framework.svg)

---

## Selected references

- CodeWall, "How We Hacked McKinsey's Lilli AI Platform," March 2026. https://codewall.ai/blog/how-we-hacked-mckinseys-ai-platform
- EU AI Act, Regulation (EU) 2024/1689, Articles 9–15 (provider obligations), 26–27 (deployer obligations), 72–73 (post-market monitoring). https://eur-lex.europa.eu/eli/reg/2024/1689
- NIST AI Risk Management Framework 1.0, January 2023. https://www.nist.gov/artificial-intelligence/executive-order-safe-secure-and-trustworthy-artificial-intelligence
- ISO/IEC 42001:2023, Artificial Intelligence Management System. https://www.iso.org/standard/81230.html
