---
title: "Drift Is When the Queue Does Not Know"
description: "Change routing works only for visible change. Drift is the movement that invalidates evidence without producing a change record."
pubDate: "May 04 2026 11:00"
tags: ["evals", "agents", "reliability"]
summary: "Change routing assumes a visible change record. The eval queue is built on declared change, and prioritization across the queue ranks by evidence at risk. Neither mechanism can see the system move when no record is filed. That gap is what this essay treats as drift: movement of an agent or its operating environment that invalidates prior evidence without generating a change record. The change is real, the record is missing. Drift is not a performance signal. It is an evidence-defensibility signal. An agent can be up, fast, accurate, and improving on every dashboard while the evidence backing its obligations is no longer defensible. Standard service-health monitoring misses this. The four golden signals of latency, traffic, errors, and saturation describe how the agent is running, not whether it is still inside the assumptions its evidence was generated against. Drift surfaces in three places: upstream sources, runtime assembly, and operating environment. Detection requires a contract between assumed state and live state across configuration, behavior, and context, with the OpenTelemetry GenAI semantic conventions providing the instrumentation surface. Once detected, drift becomes a change record with observed provenance and enters the same routing and prioritization machinery declared change uses. The reviewer adjudicates whether observed movement is noise, expected variation, or evidence-invalidating drift."
summaryProblem: "Change routing and prioritization assume a visible change record, but drift moves the system without entering the queue."
summaryCoreIdea: "Drift is not a performance signal. It is an evidence-defensibility signal."
summaryTakeaway: "Treat detected drift as an observed change record so it can enter the same routing and prioritization machinery as declared change."
---

No one changed the agent. The retrieval index refreshed. The tokenizer changed under a dependency upgrade. The tool API returned the same fields with different meanings. The eval queue stayed empty.

Each of those changes broke an assumption some prior evaluation had been built on, but none produced a change record. The system moved without telling the queue.

[*The Next Eval Is the One with the Most Evidence at Risk*](/blog/the-next-eval-is-the-one-with-the-most-evidence-at-risk/) closed on the priority model's hard limit: without a change record, nothing enters the queue and nothing can be ranked. The unentered part of the queue is the next problem.

> Change routing works only for visible change. Drift is the movement that invalidates evidence without producing a change record.

LatentMesh has covered drift before, in [*Drift Is the Default*](/blog/drift-is-the-default/) and [*Drift Detection Patterns for Production Agents*](/blog/drift-detection-patterns-for-production-agents/). This post is narrower. Its subject is the specific drift that breaks change-routed evaluation: movement the queue cannot see.

## Drift is not a performance signal

The first instinct, when teams hear "drift," is to think about quality going down. Accuracy drops, refusal rates climb, or latency rises. That instinct is misleading enough to redirect the whole conversation.

Drift is not a performance signal. It is an evidence-defensibility signal.

The system can be up, fast, accurate, and improving on every dashboard while the evidence backing its obligations is no longer defensible. A retrieval corpus refresh that quietly shifts source mix can leave aggregate quality flat or improving while pulling the agent out of the assumptions its prior evaluation was scoped against. A tool API that returns the same fields with different semantics can preserve every observable behavior signal while breaking the action-surface assumption an attestation depended on. A model provider's silent re-train can score better on internal evals than the version that was certified.

For this series, use a narrower definition:

> Drift, in this series: movement of an agent or its operating environment that invalidates prior evidence without generating a change record. The change is real. The record is missing.

The constitutive feature is the missing record. Movement that produces a change record is just routed change; the queue handles it. Movement that produces no record is what the queue cannot see, cannot rank, and cannot evaluate. That is the gap to close.

## Where drift appears in agent fleets

Drift surfaces in three places.

**Upstream sources.** The model provider re-trains, or swaps an inference-time policy. The retrieval corpus is rebuilt against new documents. A dependency upgrade changes the behavior of a tokenizer, an embedding model, or a downstream scoring component. None of these movements typically reach the agent's own change log, but all of them change what the agent does.

**Runtime assembly.** The prompt or context assembled at request time picks up new system message templates, new few-shot examples from a shared store, or new tool descriptions. The tool surface itself shifts: an API permission scope is widened, a tool returns the same shape with different semantics, a downstream service swaps its rate-limit policy. The instance config is unchanged. The instance's runtime behavior is not.

**Operating environment.** The user population changes. A new go-to-market channel routes a different cohort to the agent. Downstream workflows change what the agent's output gets used for. A new policy or obligation lands on the same agent without a corresponding control review.

Each family is a different intake path for movement that produces no change record. The taxonomy is not exhaustive. It is the minimum that lets a fleet operator know where to look.

## Why normal monitoring misses it

The standard service-health frame is older than agent fleets. SRE practice names four golden signals: latency, traffic, errors, and saturation. Those four answer one question well: is the service healthy? They were never designed to answer a different question: is the evidence backing this service still defensible?

A drifted agent can pass all four. Latency, traffic, and saturation are infrastructure signals; they describe the box the agent runs in, not the agent's relationship to its evidence. Errors capture failure modes the agent already knows how to flag. Drift, in the sense this post means, is movement outside assumptions, and assumptions are not surfaced as errors. The dashboard stays green.

Most agent observability today is still focused on developer-facing telemetry: trace counts, per-tool latencies, per-prompt token usage, per-model error rates. All useful. All blind to evidence-defensibility. You can know everything about how the agent is running and nothing about whether the run still matches the run that was evaluated.

## The drift detection contract

Drift detection is a contract between two states: the assumptions baked into the class baseline and the change records routed through the queue, and the live configuration, behavior, and context the agent is actually running in.

Three comparisons follow from that contract.

The first is between live configuration and the configuration declared in the last routed evaluation. Same model, same prompt, same tools, same retrieval index, same dependencies, same policies. "Same" here is semantic match, not hash match: the same provider's model that was tested, not the same model name; the retrieval corpus that produces the same source mix, not the same index ID.

The second is between live behavior and class-boundary expectations. Input distribution, action surface, autonomy band. An agent that suddenly handles a new query type has crossed a class boundary even if no one routed a change.

The third is between live context and the assumptions the prior evidence was generated under. User population, downstream workflow, applicable obligations. Each can shift while the agent itself stays still, and each can make the same evidence less defensible.

Three comparisons, each measurable. The contract is what makes drift detection more than monitoring.

## Signals to watch

Detection requires signals. The OpenTelemetry GenAI semantic conventions give a credible instrumentation surface for agent operations: model spans, agent spans, framework spans, plus events and metrics. That layer is the substrate the signals below sit on. The signals themselves group into three families.

**Usage signals.** Input distribution: are queries shaped like the queries the agent was evaluated on? User cohort: is the population sending traffic the population the evidence was generated against? Traffic mix: which workflows are exercising the agent, in what proportion?

**Behavior signals.** Retrieval source mix: which corpus segments are showing up in retrieved context, and at what rate? Tool-call pattern: which tools are getting called, in what sequences, with what arguments? Refusal and escalation rate: how often is the agent declining or escalating, and is the rate moving?

**Evidence signals.** Evaluator score movement: are the scores from the last routed eval still representative of current performance on the same eval set? Outcome lag: when the agent makes a recommendation or takes an action, do the downstream outcomes still match what the eval predicted? Obligation and control mismatch: do the controls that were attested still apply unmodified to the live system?

The three families are not parallel in cost. Usage and behavior signals are observable from telemetry. Evidence signals require running something against a live eval target. Both are required. Skipping the evidence signals leaves you with monitoring instead of detection.

## Routing drift back into evaluation

Detected drift only matters if it gets back to the queue.

> Post 5 made the change record durable vocabulary. Post 6 widens it: a change record can be declared or observed. Drift detection is how observed records enter the queue.

A declared change record carries the fields it carried in [*Evaluation Should Follow Change*](/blog/evaluation-should-follow-change/): what was modified, where, by whom, against which class, with what scope, and what evidence it may invalidate. An observed change record carries the same fields, derived from drift detection rather than from a deployment or release event: what moved, where the movement was detected, by which signal or comparison, against which class, at what scope, and what evidence the movement implicates.

Provenance is the new field on the record. Every change record now declares whether it was filed by an actor or raised by detection. That field carries through to ranking. Post 5's priority inputs (what changed, what is at stake, cost of delay) work identically against an observed record as against a declared one.

The reviewer's role from Post 5 extends here. Priority adjudication still happens. Observed records add a prior question: is this noise, expected variation, or evidence-invalidating drift? That judgment cannot be automated reliably. Not every drift signal becomes a change record. The ones that do are the ones the reviewer determines moved the system out of the assumptions its evidence was built against.

## What the queue still needs

Posts 4 through 6 built a routing model. Routed change earns a re-eval. Routed evals are ranked by evidence at risk. Drift now joins that machinery as observed change records, so the queue can see movement that no one filed.

What the queue still needs is something to run.

Every routed eval assumes there is an evaluation defined for the class the agent belongs to: a set of tests, scorers, and expectations that constitute the class baseline. The series has assumed that set exists and stays current. It is the next thing to define.

Each agent class needs a reusable eval pack, scoped to the class's purpose, risk profile, action surface, and obligation set. That is the next post.

*This series builds on [Reliable Agent Systems](/series/reliable-agent-systems/), a 10-essay sequence on production AI agent operations.*

## Selected references

Google, *Site Reliability Engineering*, Chapter 6: "Monitoring Distributed Systems." The four golden signals: latency, traffic, errors, and saturation. Used here as the service-health frame this essay contrasts with evidence-defensibility monitoring. [sre.google/sre-book/monitoring-distributed-systems/](https://sre.google/sre-book/monitoring-distributed-systems/)

OpenTelemetry, *Generative AI Semantic Conventions*. Spans, events, and metrics for model, agent, and framework operations. [opentelemetry.io/docs/specs/semconv/gen-ai/](https://opentelemetry.io/docs/specs/semconv/gen-ai/)

NIST, *Artificial Intelligence Risk Management Framework (AI RMF 1.0)*, NIST AI 100-1, January 2023. Lifecycle AI risk management across Govern, Map, Measure, Manage. [nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf)
