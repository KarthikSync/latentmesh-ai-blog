---
title: "Baseline Inheritance Is How Agent Evaluation Scales"
description: "An instance inherits its class baseline only while it stays inside the boundary the baseline was proven against. The hard part of fleet evaluation is detecting the moment that boundary has been crossed."
pubDate: "May 04 2026 09:00"
tags: ["evals", "agents", "reliability"]
summary: "At fleet scale, evaluating every instance from scratch is unaffordable, but blind reuse of eval results is worse than not evaluating at all. The middle path is class baseline inheritance, the same mechanism FedRAMP and SOC 2 use for control inheritance in cloud authorization. An instance inherits its class baseline by default, but the inheritance is one side of a contract. The test families, controls, evidence templates, and pass thresholds transfer. The per-instance configuration, tool permissions, data access, audience, deployment context, autonomy level, and active overrides have to be earned. Inheritance is not exemption. The mechanism only scales if there is a way to detect when inheritance has stopped being trustworthy. That property is admissibility, and the moment an instance crosses a boundary the class baseline did not assume is admissibility loss. Detection begins structurally by comparing instance facts against class boundary conditions, with behavioral evaluation as a fallback when the structural check is no longer enough. The output is a verdict and a reason. The hard part of fleet evaluation is not building the baseline. It is detecting the moment an instance has crossed the boundary that made the baseline trustworthy."
summaryProblem: "Per-instance evaluation does not scale, but blind reuse of eval results is worse than not evaluating at all."
summaryCoreIdea: "An instance inherits its class baseline only while it stays inside the boundary the baseline was proven against."
summaryTakeaway: "An admissibility test that says when inheritance still holds, with structural detection of boundary crossings."
---

[*Why Per-Agent Evaluation Breaks at Fleet Scale*](/blog/why-per-agent-evaluation-breaks-at-fleet-scale/) argued that fleet evaluation is a capacity allocation problem. [*The Agent Is Not The Unit. The Agent Class Is.*](/blog/the-agent-is-not-the-unit-the-agent-class-is/) argued that the reviewable unit is the agent class, with individual agents inheriting from it under conditional terms. This post answers what those conditional terms are.

> An instance inherits its class baseline only while it stays inside the boundary the baseline was proven against. Inheritance answers whether evidence can be reused. Admissibility answers whether reuse is still acceptable. The hard part of fleet evaluation is not building the baseline. It is detecting the moment an instance has crossed the boundary that made the baseline trustworthy.

The hard part is not inheritance. The hard part is proving when inheritance is still admissible.

## The scaling problem

Per-instance evaluation is unaffordable at fleet scale, but blind reuse of evaluation results is worse than not evaluating at all.

The naive reaction to capacity pressure is to copy eval results from one instance to another. This is fast. It produces evidence-shaped artifacts. The artifacts are not load-bearing. They prove that some agent passed some eval, not that this agent has been validated for this deployment, with this audience, against this data, with these tools.

A principled middle path runs between full per-instance revalidation and undisciplined copy-paste.

The middle path already exists in another regulated domain. Compliance frameworks have been doing it for years.

## Control inheritance: the operational analogy

A cloud-hosted system inherits security controls from its platform. The system owner does not re-prove what the platform has already proven. The inheritance is conditional on the system staying within declared scope. Those conditions are not paperwork. They are why the inherited evidence is load-bearing in the first place.

FedRAMP works this way. A cloud service offering can inherit the implementation, assessment, and testing of underlying services from another FedRAMP-authorized offering, without re-testing them as part of the new package. What it cannot inherit blindly is the boundary. When the offering uses the platform in a way the platform's authorization did not contemplate, the inherited evidence no longer answers the whole question. The new configuration, data flow, or behavior has to be documented and assessed on its own terms.

Shared responsibility tells you which assumptions belong to the platform versus the instance. Some controls are wholly inherited, some are wholly owned, some are split. The split controls are where audits fail. SOC 2 reports expose the same pattern through complementary user entity controls: controls the service provider assumes the customer will operate for the control story to hold. If the customer does not operate them, the provider's report cannot do the customer's work for them. Agent classes have the same shape. Some safety properties are class-level. Some are per-instance. The boundary between them is where admissibility lives.

Carve-outs show what happens when an instance steps outside the inherited scope. When an inherited control does not apply because of how the instance is deployed, the instance owner names the carve-out explicitly and supplies replacement evidence. This is the model for instance-specific overrides.

> Inherited evidence is useful only while the system remains inside the boundary assumptions that made the evidence valid. The same is true of class baselines.

## The class baseline: what gets proven once

A class baseline is the set of evidence that does not need to be regenerated per instance because it follows from class-level facts.

What does the class baseline prove that an instance does not need to re-prove? The class definition itself, along the five axes the previous post locked in: purpose, action surface, data and state surface, autonomy, and audience and operating context. The set of failure modes intrinsic to the class regardless of how individual instances are configured. Representative work the class is expected to perform, with expected outcomes. The control expectations every instance is required to inherit, the ones it may carve out, and the ones it shares with other layers. The eval scenarios and scorers that produce class-level evidence in the first place. The minimum scores that allow an instance to claim inheritance.

What the baseline does not prove is anything specific to a deployment. That is the other half of the contract.

## The inheritance contract: what transfers, what must be earned

An instance inherits the class baseline by default, but inheritance is one side of a contract. The other side is the set of facts the instance has to establish on its own. The two halves are not separable. You cannot inherit cleanly without acknowledging where the inheritance does not reach, and you cannot evaluate a per-instance surface without a baseline to evaluate it against.

What transfers is the inheritable surface: the test families the class has already passed, the controls every instance must keep in force, the evidence templates the instance will use to produce its own evidence pack, the failure modes the class hazard analysis has already covered, and the minimum pass thresholds the instance does not get to lower.

What has to be earned is the per-instance surface. That includes the instance's specific configuration, meaning prompt overrides, runtime parameters, persona and tone. The tool permissions actually granted to this instance, which may be a subset of what the class permits. The data access scope: which corpora, which tenants, which sensitivity tiers. The user population: audience size, type, internal versus external. The deployment context: region, regulatory jurisdiction, channel, environment maturity. The autonomy level, which has to be one of human-in-loop, human-on-loop, fully autonomous within bounded actions, or autonomous across unbounded actions. And the active overrides and integrations: anything the instance does that the class baseline did not cover.

Inheritance is not exemption. An instance still has to demonstrate that it inherits cleanly, and that demonstration is far cheaper than re-proving the baseline, but it is not zero. Per-instance facts are also the reason instances differ from each other in the first place. They are the surface where admissibility is decided.

## The admissibility test

Every time an instance is evaluated against an inherited baseline, the system asks one question:

> Is this instance still inside the assumptions under which the class baseline was proven?

The test does not ask whether the instance is good. It asks whether the inherited baseline is still load-bearing for the instance.

Failing the test does not mean the instance is unsafe. It means the inherited baseline no longer applies to this instance, and fresh evaluation is required to re-establish a baseline of the instance's own (or a variant baseline that other instances may then inherit from). The condition has a name. Call it admissibility loss: the moment the boundary has been crossed and the inherited evidence stops being load-bearing.

Admissibility is a per-instance, per-evaluation-cycle property. It is not a one-time decision at deployment. A class does not lose admissibility in the abstract. An instance loses admissibility against a specific baseline. The same instance can hold admissibility against one class baseline and lose it against another. The same admissibility verdict can flip in either direction as the instance's facts change.

## Admissibility loss: boundary crossings and detection

Admissibility is lost when the instance acquires a fact, capability, or scope the class baseline did not assume. The most common patterns are familiar. An instance picks up a tool the baseline did not include, gets pointed at a broader audience or a more sensitive data tier, starts producing external side effects where the baseline assumed read-only behavior. A prompt policy is revised across a behavioral boundary. A guardrail the baseline relied on is weakened or removed. An unreviewed retrieval corpus gets wired in. The autonomy level is nudged past what the baseline was rated for.

These are not the only ways an instance loses admissibility. They are the most common boundary crossings, and the class definition is supposed to police them. If the class definition does not name where its assumptions stop, the boundary cannot be crossed, only blurred.

Detection begins structurally. Compare the instance's facts against the class boundary conditions, and if a boundary condition fails, the inherited baseline becomes inadmissible. The structural check is the fast path. It compares configuration data, permission scopes, declared audience, declared data access, declared autonomy, and declared tool surface. Most of those are facts the platform already has.

Behavioral evaluation comes after that, when the structural check says inherited evidence is no longer enough. Some admissibility losses only show up in behavior. An instance can use a tool in a way the declared permission surface did not reveal, or interact with data in a way the declared scope did not anticipate. The structural check decides whether to spend the budget for the behavioral eval. The behavioral eval decides whether the instance is fit for inheritance once the boundary is in question.

Detection has to be continuous, not one-shot. Instance state can move outside baseline assumptions between evaluation cycles even when no human has changed anything intentionally. This is where Post 6 picks up the later distinction between ordinary change and drift.

The output of detection is a verdict plus a reason. The verdict says admissible or not. The reason names the specific boundary condition that failed. That reason is what routes the work in Post 4.

A detection mechanism this targeted only works if most instances pass it most of the time.

## Why this scales

Inheritance scales because most instances inherit most of the baseline most of the time. Only boundary-crossing deltas trigger fresh evaluation. The capacity benefit comes from an asymmetry between two costs. An admissibility check is cheap because it compares structural facts and can be automated. A full instance evaluation is expensive because it is behavioral and usually requires a human reviewer.

Fleet evaluation budgets get spent where the boundary has been crossed, not where every instance happens to be due for review.

The model degrades gracefully. If the class definition is too loose, more instances pass admissibility than should, and the baseline carries more weight than it can bear. If the class definition is too tight, almost no instances inherit cleanly, and the model collapses back into per-instance evaluation. Tuning the class boundary is the operational discipline.

## Close

The hard part is not inheritance. The hard part is proving when inheritance is still admissible. Post 3 has put a contract, a test, and a detection mechanism around that proof. Post 4 takes up which changes are worth routing evaluation work against in the first place.

*This series builds on [Reliable Agent Systems](/series/reliable-agent-systems/), but shifts the question from how an agent should be evaluated to which agents, classes, and changes should be evaluated now.*

## Selected references

FedRAMP Boundary Policy (RFC-0004). The authoritative anchor for control inheritance and authorization boundaries in cloud authorization. Establishes that a system can inherit the implementation, assessment, and testing of underlying services from another FedRAMP-authorized offering, conditional on staying within the authorization boundary. [fedramp.gov/rfcs/0004/](https://www.fedramp.gov/rfcs/0004/)

AICPA Trust Services Criteria, 2017 (with revised points of focus, 2022). The control criteria behind SOC 2 examinations, including the carve-out and inclusive subservice methods and the role of complementary user entity controls. [aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022](https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022)

NIST AI Risk Management Framework (AI RMF 1.0). AI risk framing, profiles, and lifecycle-oriented governance. [nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf)

OpenTelemetry GenAI semantic conventions, agent and framework spans. The telemetry surface that makes structural admissibility detection feasible across stacks. [opentelemetry.io/docs/specs/semconv/gen-ai/](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
