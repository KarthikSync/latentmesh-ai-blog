---
title: "The Next Eval Is the One with the Most Evidence at Risk"
description: "The next eval should be the one where delay puts the most load-bearing evidence at risk."
pubDate: "May 04 2026 09:00"
tags: ["evals", "agents", "reliability"]
summary: "Change-routed evaluation creates an eval queue from observed changes to agents. But routing alone does not decide which routed eval should run first. Capacity is finite, multiple routed changes can land on the same day, and without a priority model the queue gets sorted by arrival order, escalation pressure, or whoever can mobilize the loudest stakeholder. Sorting by severity is the natural first move, especially for teams that come from incident response. It is also incomplete. A severe class with fresh evidence may be less urgent than a medium-risk class whose evidence is the basis of a regulatory attestation due next week. Severity tells you the consequence of being wrong about an eval; it does not tell you which eval is the next one that needs running. The right unit is evidence defensibility under delay. Each routed eval represents some evidence at risk by definition; the queue question is which one decays fastest under wait. Three groups of inputs feed the decision: what changed, what is at stake, and what delay makes less defensible. Four outputs come back: immediate, next batch, defer with reason, or escalate. The change record, introduced in the previous essay as a routing artifact, earns a second job here: ranking the queue."
summaryProblem: "Change-routed evaluation creates a queue, but it does not decide which routed eval should run first."
summaryCoreIdea: "The next eval should be the one where delay puts the most load-bearing evidence at risk."
summaryTakeaway: "Prioritize routed evals by evidence at risk: what changed, what is at stake, and what delay makes less defensible."
---

Three routed evals landed on the same morning. One touched a high-risk class. One blocked a regulatory evidence pack. One came from the loudest executive sponsor. The team did the third one first.

That story is not really about queue order. It is about what happens when there is no queue model at all. Change routing produced three pieces of work, the team had finite capacity, and with no ranking principle in place, the loudest stakeholder won.

[*Evaluation Should Follow Change*](/blog/evaluation-should-follow-change/) established change-routed evaluation as the mechanism for deciding what goes back through the eval harness. Routing decides whether a given change earns a re-eval. It does not say which routed eval to run first. That is the gap this post takes.

The thesis is short.

> The next eval should be the one where delay puts the most load-bearing evidence at risk.

Everything that follows is in service of that sentence.

## Routing without ranking

When change routing is working, you have a queue. Maybe it is a tracker, maybe it is a dashboard, maybe it is just a Slack channel. Either way, multiple changes can land in it on the same day, and you cannot run them all at once.

Two failure modes show up here.

The first is silent FIFO. The team works the queue in arrival order because no one has thought past "work the queue." This sounds neutral but is not. Arrival order is a property of upstream change velocity, not of risk or evidence state. A flag flip from one team and a major model swap from another can land in the same hour, and silent FIFO will run them in the order they were filed.

The second is the loudest-stakeholder pattern from the opener. Instead of arrival order, the queue gets re-sorted in real time by escalation pressure. Whoever can mobilize a director or threaten an incident channel moves to the front. That is not prioritization. That is politics dressed up as prioritization.

Both failures share a root cause. The team has not answered the question this post is about: when delay is the variable, what gets worse fastest?

## Severity alone is not a queue model

The first instinct, especially for teams coming from incident response, is to sort by severity. High-risk class first. Mission-critical agents first. Anything touching customer money first.

That instinct is right but incomplete. Severity tells you something about the consequence of being wrong about an eval. It tells you very little about whether the eval is the next one that needs running.

Take two routed evals.

The first is a content moderation classifier in a high-risk customer-facing path. It was re-evaluated four days ago against a fresh test set, the obligation evidence is recent, and the routed change is a small prompt template tweak.

The second is a medium-risk internal triage agent. Its last eval was six months ago. The reference evidence package it produced is now the basis of a control attestation that will be cited in a regulatory filing next week, and the routed change touches the system prompt in a way that would invalidate that attestation if not re-checked.

Severity-only prioritization runs the first one first. It is in the high-risk class. It wins.

But the first eval is not the one where delay damages anything. The evidence backing that classifier is fresh; another four days will not erode it meaningfully. The second eval is the one where delay actively destroys load-bearing evidence. Each day that passes is a day the regulatory filing rests on a control attestation that no longer reflects the system as it runs.

Severity is the consequence of being wrong. Evidence at risk is the cost of waiting. A queue model that uses only the first will routinely sort the wrong work to the front.

## Evidence at risk

The thesis phrasing earns its words.

*Load-bearing* means the evidence is actually being used. Some agents have folders of old eval outputs that no obligation, no control, no attestation, and no review depends on. That evidence is not load-bearing. Refreshing it is not urgent. Other agents have eval outputs pinned to a specific control claim, an open audit, or a contractual SLA. That evidence is load-bearing. Its freshness has consequences.

*At risk* means defensibility is decaying because of the routed change. A major model swap can invalidate every prior eval against that agent in one move. A small flag flip might invalidate one narrow set. The same nominal "change" produces very different evidence-at-risk profiles depending on what it touches.

*Delay* makes the question comparative across the queue. Every routed eval represents some evidence at risk by definition; routing only happened because something changed. The queue question is which one decays fastest under wait.

This is not a generic risk-priority model. The unit is specifically the defensibility of evidence under the cost of waiting. That distinction is the whole reason the post exists.

## The shape of the priority decision

A working priority model has two parts: what feeds the decision, and what comes out of it.

The inputs fall into three groups.

**What changed.** This is the change record itself, plus the blast radius it implies. The change record describes what was modified, by whom, when, and against which agent. The blast radius bands carried from earlier in the series (instance, variant, class, fleet) translate that record into scope. A class-level change has more evidence in flight than a variant-level change.

**What is at stake.** This is the obligation side. Which obligations does this agent serve? How critical are they? How old is the evidence currently supporting them? How exposed are users to this agent's outputs? How much autonomy or action surface does it have? An agent that drafts emails for a human to send carries less stake per unit of routed change than an agent that takes actions directly against a CRM.

**Cost of delay.** This is what makes the priority comparative. Some evidence has a hard external deadline: an audit window closes, a regulator's reporting cycle hits, a contract renewal references current attestations. Other evidence has internal escalation triggers: a leader has flagged the area, an incident is unresolved nearby, a known reviewer is leaving the team next week and their context will be lost. Delay cost is not abstract urgency. It is the date and the consequence attached to the date.

The output of the model is a small, named set of decisions per routed eval.

*Immediate.* This one runs now, ahead of everything else in the queue.

*Next batch.* This one runs in the next normal cycle, whether that is daily, weekly, or whatever cadence the team operates on.

*Defer with reason.* This one waits, and the reason is captured. Deferral is not silence. It creates its own evidence trail, which the reviewer or auditor may need later.

*Escalate.* The priority is contested or the decision is above the queue owner's authority. The case goes up.

That last outcome is where the reviewer enters. The reviewer is not in every queue decision. Most routed evals can be sorted by the model without adjudication. The reviewer adjudicates contested priority, not every queue item. When two routed evals make plausible claims to immediate, when a deferral with reason is challenged, when an escalation rises out of the queue, the reviewer is the function that makes the call and writes down why.

That role definition matters because it stops the reviewer from becoming a queue manager. A reviewer who touches every item is a bottleneck and a point of bias. A reviewer who only touches contested priority is a governance function with a clear job description.

This operating pattern is older than AI agents. Google SRE's incident-management guidance starts with preparation and prioritization under constrained response capacity. NIST AI RMF Manage gives the governance mirror: allocate risk resources to mapped and measured risks, monitor deployed systems, and keep change-management mechanisms in place.

Post 4 introduced the change record as the artifact that routes work into the eval queue. Post 5 promotes it to durable series vocabulary because it now has a second job: ranking the queue. Routing asks whether evidence may have stopped being defensible. Prioritization asks how soon that answer matters. From here on, "change record" means the captured description of a change to an agent: what changed, where, by whom, against which class, with what scope, and what evidence it may invalidate.

## What this model assumes

Every priority model assumes the change is visible.

Each of the three input groups depends on having a change record in the first place. Without one, nothing enters the queue, and nothing in the queue can be ranked.

That is the model's hard limit. Evidence-at-risk prioritization sorts the routed queue. It does not detect changes that never produced a routed signal.

In practice, agents move in ways that no one filed a change record for. A retrieval index is rebuilt on a Saturday. A dependency upgrade quietly changes a tokenizer's behavior. A model provider re-trains the underlying weights without a version bump. A configuration file is touched in a way no one thought of as "a change to the agent." The system has moved. The queue does not know.

That is drift, and it is the next post.

The priority model in this post assumes a queue that reflects reality. The drift problem is what to do when it does not.

*This series builds on [Reliable Agent Systems](/series/reliable-agent-systems/), a 10-essay sequence on production AI agent operations.*

## Selected references

Google, *Site Reliability Engineering*, Chapter 14: "Managing Incidents." Principled incident strategy prepared in advance; prioritization, stabilization, and evidence preservation as the operational triad. [sre.google/sre-book/managing-incidents/](https://sre.google/sre-book/managing-incidents/)

NIST, *Artificial Intelligence Risk Management Framework (AI RMF 1.0)*, NIST AI 100-1, January 2023. Manage function: allocating risk resources to mapped and measured risks on a regular cadence, as defined by Govern. [nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf)
