---
title: "The Eval Pack Belongs to the Class"
description: "An eval pack is the reusable unit of evaluation for an agent class. It contains scenarios, scorers, thresholds, expected evidence, and obligation mappings — the content that turns a test suite into traceable evidence."
pubDate: "May 04 2026 12:00"
tags: ["evals", "agents", "reliability"]
summary: "The series has built routing, prioritization, and drift detection — all of which assume an evaluation exists for the class the agent belongs to. The eval pack is that thing. An eval pack is the reusable evaluation bundle attached to an agent class, containing scenarios, scorers, thresholds, expected evidence, and obligation/control mappings. Packs do not belong to instances (per-agent evaluation does not scale) or to the fleet (fleet-wide packs are too flat to prove class-specific claims). The obligation mapping is the part that turns a pack from a test suite into evidence: it connects each scenario, scorer, and artifact to the obligation or control it serves. Without the mapping, a pack's output is a score. With the mapping, a pack's output is a piece of evidence that can be referenced by a control attestation, an audit, or a regulator. Packs version with the class they belong to, extending when the class boundary or obligation set changes."
summaryProblem: "Routing, prioritization, and drift detection all assume an evaluation exists for the class — but none of them define what actually runs."
summaryCoreIdea: "An eval pack is the reusable evaluation bundle for an agent class: scenarios, scorers, thresholds, expected evidence, and obligation mappings."
summaryTakeaway: "Obligation mappings turn test results into traceable evidence. Without them, every score is a number with no addressee."
---

The team had tests. Hundreds of them. The eval dashboard was green. Then the auditor asked which control each test supported, and the room went quiet.

The team did not lack evaluation. They lacked a map from evaluation to obligation. Coverage existed. The map between coverage and claims did not.

[*Drift Is When the Queue Does Not Know*](/blog/drift-is-when-the-queue-does-not-know/) closed by asking what reusable eval pack belongs to a class baseline. That is the gap this post takes.

> An eval pack is the reusable unit of evaluation for an agent class. Not for an instance. Not for the whole fleet.

The series has been moving toward this. [*The Agent Is Not The Unit. The Agent Class Is.*](/blog/the-agent-is-not-the-unit-the-agent-class-is/) named the agent class as the reviewable unit. [*Baseline Inheritance Is How Agent Evaluation Scales*](/blog/baseline-inheritance-is-how-agent-evaluation-scales/) named class baselines as how evaluation reuses itself across instances. Posts 4 through 6 built routing, prioritization, and drift detection on top of those baselines. None of them said what the routed evaluation actually consists of. The eval pack is that thing.

## The pack belongs to the class

A class fixes what makes evaluation reusable: purpose, action surface, data and state surface, autonomy, operating context. Two instances of the same class share those fixings, so an evaluation that proves a claim against one is informative about the other. Two instances of different classes do not share them, so the same evaluation is not informative across the boundary.

That is why packs do not belong to instances. [Post 1](/blog/why-per-agent-evaluation-breaks-at-fleet-scale/) showed that per-agent evaluation does not scale; the class is what turns evaluation from a thousand-shaped activity into a fleet-shaped one. It is also why packs do not belong to the fleet. The fleet contains classes whose purposes differ. An evaluation that holds across the whole fleet either tests something every class shares, which makes it shallow, or tests something most classes do not need, which makes it noise.

Define the unit:

> Eval pack: the reusable evaluation bundle attached to an agent class, containing scenarios, scorers, expected evidence, thresholds, and obligation/control mappings.

And mark the boundary:

> The harness is the machine that runs evaluations. The eval pack is the reusable content that tells the harness what this class must prove.

This post is about the content. How the harness loads, runs, and scores it sits in a separate piece of writing.

## What a pack contains

Five parts.

**Scenarios.** The situations the class is expected to handle. For a tool-using support agent, a billing dispute that requires reading two systems and writing to a third. For a retrieval agent, a query whose answer depends on documents from two restricted corpora. Scenarios should reflect the class's actual operating context, not generic benchmark prompts.

**Scorers.** How the run is judged. Scorers can grade outputs, intermediate decisions, or trace properties. The scorer choice is constrained by the scenario; a scenario that exercises tool use needs a scorer that can read tool calls, not only final outputs.

**Thresholds.** What counts as pass, warning, or fail. Thresholds are class-specific. A scenario that passes at 92% accuracy in one class may be a fail in another, because the class's operating context determines what acceptable looks like.

**Expected evidence.** What artifacts the run must produce. A scenario can pass or fail; expected evidence describes what the run must leave behind regardless of outcome. Trace data, scorer outputs, intermediate state, the prompt actually used, the tool surface actually exposed. Expected evidence is what makes the run later-defensible. A pass with no evidence retained proves nothing six months later.

**Obligation and control mappings.** This is the part that turns a pack from a test suite into evidence.

A mapping connects each scenario, scorer, and expected-evidence artifact to the obligation or control it serves. An accuracy scorer at a particular threshold maps to the relevant accuracy obligation. A trace artifact maps to an oversight obligation. A refusal scorer maps to a content policy control. The mapping says, for each piece of the pack, what evidence claim it is producing.

The mapping is not what makes the pack "compliant." It is what makes the pack's results traceable to the claims a control framework expects to see proven. Compliance is downstream of that traceability. Without the mapping, a pack's output is a score. With the mapping, a pack's output is a piece of evidence that can be referenced by a control attestation, an audit, or a regulator.

NIST AI RMF describes the Measure function as the use of quantitative, qualitative, or mixed methods to analyze, assess, benchmark, and monitor AI risk and related impacts. Earlier posts in this series invoked Manage. Post 7 invokes Measure. The framework reads function by function, not as a single block. An eval pack with all five parts in place is the unit of work the Measure function describes: repeatable, named, and scoped to something the framework treats as analyzable.

## Why tests alone are not enough

A test produces a score. A score is information about how the system performed on the test. It is not, by itself, evidence about the obligations the system is supposed to meet.

The team in the opener had tests. The dashboard reflected those tests. What the dashboard could not do was answer "which test proves which claim." Without the mapping, every test is an island. Every score is a number with no addressee.

This is the failure mode any team accumulates by default. Tests get added because they are useful, a gap appears, or a model changes. What is missing is the second column: what claim does this test serve? An eval pack makes that column non-optional.

## Why fleet-wide packs are too flat

The opposite failure mode is one universal pack run against every agent.

That fails for a different reason. The fleet contains classes whose purposes differ. A retrieval agent's obligations are not the same as an autonomous workflow agent's. A pack that holds across the whole fleet must either test something every class shares, like basic safety floor checks, or test something most classes do not need.

The first option produces a pack that is real but shallow. It proves the agent does not do egregiously wrong things. It does not prove the agent does the right things for its actual purpose. The second option produces a pack with high false-failure and false-success rates against any specific class, because the pack's scenarios were never scoped to that class's operating context.

Class-scoped packs avoid both. They are deep on the things the class actually does, and quiet on the things the class does not do.

## How packs connect to routing

The series before Post 7 built three pieces of machinery, all of which assumed packs existed without saying so.

[*Evaluation Should Follow Change*](/blog/evaluation-should-follow-change/) said routing decides whether an eval is needed. [*The Next Eval Is the One with the Most Evidence at Risk*](/blog/the-next-eval-is-the-one-with-the-most-evidence-at-risk/) said prioritization decides when it runs. [*Drift Is When the Queue Does Not Know*](/blog/drift-is-when-the-queue-does-not-know/) said observed drift can enter the same queue.

None of those mechanisms defines what actually runs.

The eval pack is the answer to "what runs." A change record arrives, declared or observed. The class field on the record points to a class. The pack attached to that class is the evaluation that runs. Routing finds the work and prioritization orders it; drift detection extends the queue so the work is visible at all. The pack is the content that all three mechanisms have been waiting on.

This is where the regulatory analogy helps. The EU AI Act's Article 15 requires high-risk AI systems to achieve appropriate accuracy, robustness, and cybersecurity, and to perform consistently in those respects throughout their lifecycle. "Consistently throughout the lifecycle" is hard to demonstrate without a reusable evaluation unit. An ad hoc test today and a different ad hoc test next quarter cannot show consistency. A class pack run repeatedly across the lifecycle, versioned when the class boundary or the obligation set changes, can.

## Pack maintenance

Packs are not artifacts that get written once. They version with the class they belong to.

When the class boundary changes, the pack changes. A new tool added to the class's action surface, or a new data domain added to its state surface, means scenarios that exercised the old surface are still useful but no longer sufficient. New scenarios are needed. The scoring side may have to adjust against the new operating context.

When an obligation changes, the mapping changes. A new obligation may attach to existing scenarios, in which case only the mapping table changes. If new scenarios are required, the pack itself extends. If an obligation retires, the scenarios may be retained but their claim narrows.

The discipline is mundane. Every pack version is dated and tied to either a class boundary change or an obligation change. Prior versions are retained alongside current ones. That discipline is what keeps the pack reusable across the lifecycle rather than fossilized at a point in time.

## What the pack still leaves open

Posts 4 through 7 give the queue a complete shape. Routed change earns evaluation, routed evaluations are ranked, and drift becomes routable. Each routed evaluation has a pack to run.

What is still open is what happens after the run.

A pack defines what evaluation produces. The artifacts the pack produces (the scores, the traces, the expected evidence) are not evidence by being created. They are evidence by being retained and accessible to the parties who later need to consult them. An eval result produced and kept is an actual one.

That is the next question, and the next post.

*This series builds on [Reliable Agent Systems](/series/reliable-agent-systems/), a 10-essay sequence on production AI agent operations.*

## Selected references

NIST, *Artificial Intelligence Risk Management Framework (AI RMF 1.0)*, NIST AI 100-1, January 2023. Measure function: quantitative, qualitative, and mixed-method analysis, assessment, benchmarking, and monitoring of AI risk and related impacts. [nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf)

European Union, *Regulation (EU) 2024/1689 (EU AI Act)*, Article 15: Accuracy, robustness, and cybersecurity. High-risk AI systems must achieve appropriate accuracy, robustness, and cybersecurity, and perform consistently in those respects throughout their lifecycle. [eur-lex.europa.eu/eli/reg/2024/1689/oj](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)
