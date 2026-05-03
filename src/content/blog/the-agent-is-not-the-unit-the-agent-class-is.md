---
title: "The Agent Is Not The Unit. The Agent Class Is."
description: "Per-agent evaluation fails at fleet scale because the unit of review is wrong. The reviewable unit is the agent class: a shared pattern of purpose, tools, data access, autonomy, and risk surface."
pubDate: "May 03 2026 09:00"
tags: ["evals", "agents", "reliability"]
summary: "Per-agent evaluation is how everyone starts, and it fails at fleet scale. The deeper problem is not volume but the unit of review. The reviewable unit is the agent class: a group of agents with shared risk-relevant structure defined by five axes — purpose, action surface, data and state surface, autonomy, and audience. Individual agents inherit baseline evidence from their class. Changes determine whether that evidence still applies, needs a focused rerun, or requires reclassification. Blast radius — instance, variant, class, or cross-class — separates affected scope from required work. The pattern is governed reuse, not repetitive review. The defensibility question shifts from 'did you test every agent' to 'did you define classes correctly, did changes route to the right baselines, and is the boundary still intact.'"
summaryProblem: "Per-agent evaluation treats every instance as a fresh governance project, which does not scale."
summaryCoreIdea: "The agent class — defined by purpose, tools, data access, autonomy, and audience — is the reviewable unit."
summaryTakeaway: "Class-scoped evaluation enables governed reuse: baseline inheritance, focused reruns on change, and reclassification only when boundaries are crossed."
---

Per-agent evaluation is how everyone starts. One agent, one set of evals, one owner who knows the system end to end. The instinct is correct at small scale. It fails at fleet scale, but volume is only the visible symptom. The deeper problem is the unit of review.

> At fleet scale, the reviewable unit is not each individual agent. It is the agent class: a shared pattern of purpose, tools, data access, autonomy, and risk surface. Individual agents inherit the baseline evidence for their class. Changes then determine whether that evidence still applies, needs a focused rerun, or requires a new review boundary.

That reframe changes the operating question. Fleet evaluation starts when you stop asking "has this agent been evaluated?" and start asking "what class does this agent belong to, and is it still inside the class boundary?"

## The instinct that breaks

Per-agent evaluation maps to how engineering teams already think. Every system has its own tests and its owner. Each one gets reviewed before shipping and again after meaningful changes. The pattern survives the move to AI because the early units of work were small. A handful of agents, a handful of teams, individual review.

The first post in this series, [*Why Per-Agent Evaluation Breaks at Fleet Scale*](/blog/why-per-agent-evaluation-breaks-at-fleet-scale/), named the constraint that breaks the pattern. Eval capacity is scarce at fleet scale. Reviewers, evaluation infrastructure, and the bandwidth required to reason about a complex agent are all finite resources. When the fleet runs to thousands of agents, the per-agent regime stops scaling. Each agent cannot be a bespoke governance project. Reviewers cannot keep up. Old passing results turn into stale confidence the moment the underlying agent shifts.

This is not a tooling problem. It is a unit-of-work problem. Faster tooling running per-agent review just runs the treadmill faster.

## The wrong unit

If the unit is wrong, every instance gets reviewed as if it were unique. Most instances are not. Two agents with the same purpose, the same tools, the same data access, and the same governance regime do not require independent governance projects. The risk profile is shared. The evidence that supports one credibly supports the other.

Software engineering already worked this out. Releases get reviewed at the level of the release class, not at every individual deploy. Configuration changes work the same way: the unit is the config surface, not every cluster the change lands in. Risk reviews are scoped to blast radius, not to every instance the change technically touches.

Blast radius is a useful word here because it captures both halves of the problem at once. What is being changed (code, config, data, infrastructure) and where the change lands (which environments, which users, which downstream systems). Risk-aware review attaches to that radius. It does not invent a per-instance regime, because per-instance review at fleet scale eventually becomes review in name only. Even traditional IT system categorization frameworks group systems for review rather than treating each one as an independent governance project.

If software systems already review at the level of class plus blast radius, agent governance has no reason to invent a per-instance regime that does not scale.

## What an agent class is

An agent class is a group of agents with shared risk-relevant structure. The class is the unit, not the individual agent. Five axes define it.

1. **Purpose.** What the agent does.
2. **Action surface.** Tools, APIs, side effects, external systems the agent can invoke.
3. **Data and state surface.** Data read and write access, memory, retained context, retrieval sources.
4. **Autonomy.** Whether the agent proposes, acts, escalates, or self-routes.
5. **Audience and operating context.** Users, environment, governance regime, exposure level.

Each axis is independently load-bearing for risk. A change to any one of them changes what the agent can do and what failure looks like. Two agents that match on all five can credibly inherit the same governance baseline. Two agents that differ on any of them cannot. The difference is the boundary.

Class here is not OOP class. The borrowing is from how operators already group similar systems for review, not from inheritance hierarchies in code. Classes are also not static categories. A boundary that held last quarter may not hold this quarter if a new tool is added to one variant or the underlying model is upgraded.

The boundary is the working object. It defines membership. It decides whether an instance can inherit baseline evidence. A change either stays inside it or crosses it. Most of the operating model lives in how the boundary gets drawn and how it gets defended.

> A class is not a label assigned for convenience. It is a claim that the agents inside the boundary share the same risk-relevant structure. If the boundary is too broad, inheritance becomes unsafe. If it is too narrow, the fleet collapses back into per-agent review.

## Inheritance and blast radius

An instance inherits baseline evidence from its class only while it stays inside the class boundary. Inheritance is a default that holds until a change moves the instance out of the class. It is not a free pass. Inheritance is the mechanism that makes fleet-scale evaluation tractable, and it is the mechanism that produces governance failures when the boundary is wrong or unmaintained.

Blast radius describes how much of the fleet is affected by a change. Four bands cover the cases worth distinguishing.

1. **Instance.** A single agent.
2. **Variant.** A coherent group of agents inside a class that share an additional attribute, such as one tool, one customer segment, or one prompt revision.
3. **Class.** All agents inside the class boundary.
4. **Cross-class or fleet.** The change touches multiple classes, or crosses a class boundary in a way that puts an agent's class membership in question.

The point is not to memorize the bands. The point is to avoid confusing affected scope with required work.

| Change | Typical affected scope | Likely routing outcome |
|---|---|---|
| Prompt edit within scope | Instance | Inheritance holds or focused rerun |
| Tool added to one variant of the class | Variant | Focused rerun; possible reclassification if side effects change |
| New data source for the whole class | Class | Focused rerun across implicated evals |
| Autonomy expanded for one agent or variant | Instance or variant | Boundary likely crossed; reclassify or create new class |
| New audience, such as internal to customer-facing | Instance, variant, or class | Boundary likely crossed; reclassify or create new class |
| Underlying model upgrade across classes | Cross-class / fleet | Focused rerun across affected classes; reclassify only if behavior or risk surface changes materially |

The two columns separate affected scope from routing outcome because the same change type can land in different scopes and produce different outcomes depending on where in the fleet it happens. Autonomy expansion for one agent has instance-scoped blast radius but a cross-boundary outcome. A model upgrade has fleet-scoped blast radius but typically only a focused rerun. The columns are not derivable from each other.

The routing logic that follows from the table has three paths. Inside the class boundary with no load-bearing axis touched, inheritance holds and no rerun is needed. Inside the class boundary with a load-bearing axis touched, the routing outcome is a focused rerun on the evals implicated by the affected axis, with the scope of the rerun matching the affected scope. When the boundary is crossed, the routing outcome is reclassification of the affected agents into an existing class or creation of a new class with its own baseline. New class creation is a routing outcome, not a blast-radius band.

The four bands describe what is affected. The routing outcome describes what work is required. Conflating the two is how operating models drift toward "every change reruns everything" or "every change requires a new class." Both collapse the model.

Post 4 in this series develops the routing logic in full, including how change events flow from CI, deployment, and runtime telemetry into the eval scheduler.

## Governed reuse, not repetitive review

Per-agent evaluation treats every instance as a fresh governance project. Class-scoped evaluation treats the class as the project. Instances are inheritors. Changes are events that may or may not require new work. Evaluation effort is spent once on the class baseline, again on the focused rerun when a change implicates it, and only rarely on a full reclassification. The pattern is governed reuse, not repetitive review.

That changes what an eval system has to know. It has to know which class each agent belongs to. It also needs the evidence the class carries: what is there, when it was generated, what it covers. And it needs to track what kind of change just happened and what scope the change touches. With those in place, the eval scheduler can do real allocation. Rerun the focused subset. Leave the rest alone. Escalate when the boundary is crossed.

The class-as-unit move is what makes scarce eval capacity allocatable.

The defensibility question shifts too. It moves from "did you test every agent" to "did you define classes correctly, did changes route to the right baselines, and is the boundary still intact." That is closer to how change management is already defended in regulated software environments, and it sits closer to the kind of system-level risk framing used in the [NIST AI Risk Management Framework](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf). The class is the unit of risk reasoning.

## The next question

The unit move is what makes the rest of the series tractable. If individual agents stay the unit, baselines, change routing, and eval packs all collapse back into per-instance work. With classes as the unit, each of those mechanisms has somewhere to attach.

The next post in this series asks what an instance actually inherits from its class. Inheritance has been named here and treated as conditional, but the contents have not been specified. What parts of the class baseline does an instance pick up by default? What has to be earned per instance? Under what conditions does inheritance break, and how do you detect that the boundary has shifted around an agent that has not visibly changed?

After that, the series moves through change routing, statistical sampling, the inventory-observability-evaluation distinction in full, class-scoped eval packs, and the bridge from eval results to durable governance evidence.

*This series builds on [Reliable Agent Systems](/series/reliable-agent-systems/), but shifts the question from how an agent should be evaluated to which agents, classes, and changes should be evaluated now.*

## Selected references

NIST AI Risk Management Framework (AI RMF 1.0). AI risk framing, profiles, and lifecycle-oriented governance. [nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf)

NIST SP 800-37 Rev. 2, Risk Management Framework for Information Systems and Organizations. Long-standing IT precedent for grouping systems as the unit of governance review. [nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-37r2.pdf](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-37r2.pdf)

Google SRE Book, Release Engineering chapter. Change management at the level of the release class rather than the individual deploy. [sre.google/sre-book/release-engineering/](https://sre.google/sre-book/release-engineering/)

OpenTelemetry GenAI semantic conventions, agent and framework spans. The canonical surface where class identity attaches to runtime traces. [opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/)
