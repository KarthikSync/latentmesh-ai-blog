---
title: "Evidence Is What Someone Can Verify Later"
description: "An eval result becomes evidence only when the party that needs to verify a claim can retrieve it, interpret it, and verify it. Production alone is not enough. Retention alone is not enough."
pubDate: "May 04 2026 14:00"
tags: ["evals", "agents", "reliability"]
summary: "The eval pack defines what evaluation produces, but produced artifacts are not evidence on their own. The team in the opener retained everything: logs, traces, eval scores. The auditor still could not find the path from claim to artifact. That gap is what this essay treats. An eval result becomes evidence only when the party that needs to verify a claim can retrieve it, interpret it, and verify it. Production alone is not enough. Retention alone is not enough. The unit of evidence is the claim plus the artifacts required to verify it. Three tests stand between an artifact and its use as evidence: retrieve (can the right artifact be found by claim, not by path?), interpret (can someone understand the version, scorer, threshold, and obligation it came from?), and verify (can someone re-examine it without trusting the dashboard?). Logging makes evidence possible. It does not make evidence usable. EU AI Act Articles 12 and 19 set a logging and retention floor; addressability and interpretability sit above it. NIST AI RMF Govern is the institutional discipline that makes evidence access something other than ad hoc. This is the closing essay of Evaluating Agent Fleets."
summaryProblem: "The team retained everything but still could not show the auditor the path from claim to artifact."
summaryCoreIdea: "An eval result becomes evidence only when the party that needs to verify a claim can retrieve it, interpret it, and verify it."
summaryTakeaway: "The unit of evidence is the claim plus the artifacts required to verify it. Production and retention alone are not enough."
---

The team retained everything. The logs were there. The traces were there. The eval scores were there. Then the auditor asked for the evidence behind one control claim, and nobody could find the path from claim to artifact.

That story is not about a storage failure. The team had storage. It is not about a logging failure. The team had logs. It is about the gap between keeping things and being able to use what was kept to prove something specific.

[*The Eval Pack Belongs to the Class*](/blog/the-eval-pack-belongs-to-the-class/) closed by asking what happens after the pack runs. A pack defines what evaluation produces. The artifacts are produced. What turns them into evidence is a separate question, and it is the one this post takes.

> An eval result becomes evidence only when the party that needs to verify a claim can retrieve it, interpret it, and verify it. Production alone is not enough. Retention alone is not enough.

## Production is not evidence

A pack run produces artifacts. Scores, traces, scorer outputs, the trace of the prompt actually used, the tool surface actually exposed at runtime, and the timestamps of all of it. That set of artifacts is what the pack was specified to produce.

Production is the easy part. The artifacts come out of the harness, get written to wherever the team writes things, and are technically retained. From the dashboard's point of view, the run completed and its outputs exist. From an evidence point of view, the run is not over. Nothing has yet asked the question that would test whether what was produced will hold up later.

That question is what someone will need from this run later. The someone is not in the room when the pack completes. It might be an engineer investigating a regression next quarter or an auditor checking a control claim next year. The artifacts produced have to support both uses without relying on the original operator being present.

## Retention is not enough

The team in the opener got the next part right. Everything was retained. Nothing was discarded.

That is still not evidence.

An artifact in storage is not addressable until someone can locate it by something the auditor cares about. The auditor does not ask for "all logs from May." The auditor asks for "the artifact that supports the claim that this class met this obligation in the version evaluated before this attestation was filed."

To answer that question, the artifact has to be addressable by claim, by class, by pack version, by run, by scorer, by timestamp. Each of those is an axis of addressability. Storage that retains everything but indexes none of those axes is hoarding, not evidence.

## The evidence unit is the claim

What makes evidence work is not the artifact. It is the relationship between an artifact and the specific claim that artifact is supposed to support.

> The unit is a claim plus the artifacts required to verify it.

This is the operational consequence of the obligation/control mapping introduced in Post 7. The mapping says, for each scenario, scorer, and expected-evidence artifact, what claim it produces. The mapping is what makes a pack run different from a test suite run.

A claim might be "this control held": a specific control in a control framework was active and effective during the period the pack covers. A claim might be "this obligation was covered": a regulatory obligation has at least one mapped artifact that demonstrates its coverage. In both cases, the claim is what gives the artifact addressability and the artifact is what gives the claim verifiability.

Without the claim, the artifact is data; without the artifact, the claim is assertion. The unit is the pair.

## The three tests: retrieve, interpret, verify

Three questions stand between an artifact and being usable as evidence.

The first is **retrieve**. Can the right artifact be found later when the claim needs to be checked? Retrieval is harder than it sounds. The party doing the retrieval is not the party that produced the artifact. The retriever is acting on a claim, not on a path. They do not know where the file is, what bucket it lives in, or which run produced it. They know the claim. Retrieval is whether the claim, in the form an outside party would naturally state it, can be turned into the right artifact set without insider knowledge.

The second is **interpret**. Once the artifact is retrieved, can someone understand what it actually shows? An eval score of 0.94 means nothing without the scorer that produced it, the threshold that defines pass, the scenario the score applies to, the class the scenario was scoped to, the pack version the scenario came from, the change record that triggered the run, and the obligation the scorer maps to. Interpretation is whether all of that context survived together with the artifact, in a form a non-author can read. An artifact that can be retrieved but not interpreted is a number with no meaning.

The third is **verify**. Can someone check that the artifact actually supports the claim, without having to trust the dashboard or the engineer who ran it? Verification is whether the artifact can be re-examined, re-scored, or cross-checked. It is whether a reviewer can disagree with the original judgment based on the same artifact. An artifact that can be retrieved and interpreted but not verified is a fact on someone's authority, useful for some purposes but not enough for evidence-grade claims.

To pass all three tests, the evidence unit must preserve more than the run's output. It must preserve enough context that the run can be understood, located, and re-examined later by parties with no insider knowledge.

In practice, that means each pack run retains the pack version that ran, the class version it ran against, the scenario id, the scorer version, the threshold in effect, the output, the trace of the run, the tool surface exposed at runtime, the timestamp, the change record reference that triggered the run, and the obligation/control mapping that names the claim the artifact supports. None of those individually is unusual. What is unusual is treating the bundle of them as a single addressable evidence unit, indexed by claim, rather than treating each one as a separate thing to log.

## Why logging law is necessary but insufficient

The EU AI Act handles part of this. Article 12 requires high-risk AI systems to be designed and developed with logging capabilities that record events relevant to identifying risks throughout the system's lifetime. Article 19 requires providers to keep those automatically generated logs under their control for at least six months, unless other law applies. Both are real requirements. Both are being implemented by serious providers right now.

Neither is the same as evidence.

Logging makes evidence possible. It does not make evidence usable.

A system can satisfy the logging and retention floor in Articles 12 and 19 (events logged, logs retained, logs under provider control) and still fail the three tests. Logs are usually addressable by time, by event type, and by system. They are not always addressable by claim, by pack version, by class, or by obligation. A retained log that cannot be turned into the answer to "show me the evidence that this control held in Q2" is a compliant log and an unusable evidence input.

This is not a critique of the law. The law specifies a floor. The floor is necessary infrastructure for evidence. What sits above it, the addressability and the interpretability and the verifiability, is the work that makes the floor useful.

## Evidence access

Different parties need different views of the same evidence unit. An engineer's view, debugging a regression, needs the full trace and scorer internals. A regulator's view, checking a lifecycle obligation, needs only what the law requires. Between those poles sit reviewers and auditors, who need claim-level access plus enough context to disagree with the original judgment if warranted.

The evidence unit accommodates all of these by being addressable at the claim level rather than at the storage level. The same retained artifact set can be projected through different views: a thin auditor view that exposes the claim, the scorer summary, and the version chain; a deeper engineer view that exposes the full trace; a focused regulator view that exposes only what the relevant article requires. Access narrows to the role; the underlying unit does not change.

This is where NIST AI RMF Govern lands. Earlier posts in this series invoked Manage and Measure. Govern is the cross-cutting function: the institutional discipline that decides who can see what, how the access is authorized, and how the evidence holds across organizational changes. The framework reads function by function, not as a single block. Govern is the function that makes evidence access something other than ad hoc.

## The series ends here

[*Why Per-Agent Evaluation Breaks at Fleet Scale*](/blog/why-per-agent-evaluation-breaks-at-fleet-scale/) opened the series with a single claim: per-agent evaluation does not scale.

Eight posts later, the mechanism is defined. The agent class is the unit, class baselines inherit, change records route the work, evidence-at-risk ranks the routed work, drift detection makes invisible movement visible, and eval packs are the reusable content the class runs. The artifacts those packs produce become evidence when the claim they support can be retrieved, interpreted, and verified later.

That is the fleet-scale evaluation mechanism. It does not solve every problem with evaluating agents in production, but it does close the gap that opened the series.

*This series builds on [Reliable Agent Systems](/series/reliable-agent-systems/), a 10-essay sequence on production AI agent operations.*

## Selected references

European Union, *Regulation (EU) 2024/1689 (EU AI Act)*, Article 12: Record-keeping. High-risk AI systems must be designed and developed with logging capabilities recording events relevant to identifying risks throughout the system's lifetime. [eur-lex.europa.eu/eli/reg/2024/1689/oj](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)

European Union, *Regulation (EU) 2024/1689 (EU AI Act)*, Article 19: Automatically generated logs. Providers of high-risk AI systems keep automatically generated logs under their control for at least six months, unless other law requires longer. [eur-lex.europa.eu/eli/reg/2024/1689/oj](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)

NIST, *Artificial Intelligence Risk Management Framework (AI RMF 1.0)*, NIST AI 100-1, January 2023. Govern function: cross-cutting institutional discipline across the AI risk-management lifecycle, addressing policies, accountability, and oversight that enable Map, Measure, and Manage. [nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf)
