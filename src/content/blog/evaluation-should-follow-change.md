---
title: "Evaluation Should Follow Change"
description: "Calendar-driven eval cadence wastes capacity on stable systems and misses risk on changing ones. Change-routed evaluation matches eval work to what actually changed."
pubDate: "May 04 2026 09:00"
tags: ["evals", "agents", "governance"]
summary: "Calendar-driven eval cadence produces two failure modes at once: ritual evaluation on stable systems and missed risk on changing ones. Change-routed evaluation is the alternative — evaluation as a response to change, not a response to a schedule. Not every change deserves the same response. The routing decision is shaped by scope (instance, variant, class, fleet) and consequence for evidence (none, some, all invalidated). Four responses follow: no eval, targeted eval, baseline refresh, or reviewer escalation. A change record names what changed, who changed it, when, why, and what evidence it invalidates. Deterministic triggers handle low-judgment routing automatically; reviewers handle classification, baseline approval, and cross-class escalation. The result is eval capacity matched to where evidence is actually at risk."
summaryProblem: "Calendar-driven eval cadence over-tests stable systems and under-tests changing ones at the same time."
summaryCoreIdea: "Change-routed evaluation matches eval work to what actually changed, using change records and blast-radius routing."
summaryTakeaway: "Route eval work by change scope and evidence consequence, not by calendar. Automate deterministic triggers; reserve reviewers for ambiguity."
---

*Calendar-driven eval cadence is the wrong operating model for AI systems that change between cycles.*

---

The eval ran on Friday. The change shipped on Monday. By Tuesday, the evidence was already stale.

This sequence is common enough to be unremarkable in most teams running agents in production. Eval cadence is set by the calendar: nightly for some teams, weekly or monthly for others, quarterly for those operating at the regulatory edge. The cadence is decoupled from what is actually changing in the system, which means it produces two failure modes at the same time. One is ritual evaluation: evals pass on systems that have not changed since the last pass, consuming capacity without producing new evidence. The other is missed risk: changes ship between scheduled evals, and the evidence the team is relying on is already stale by the time the next eval runs.

[The series has argued](/blog/why-per-agent-evaluation-breaks-at-fleet-scale/) that eval capacity is the scarce resource at fleet scale, not eval coverage. Spending capacity on systems that have not changed means under-evaluating systems that have. The calendar is the wrong allocation function.

## Change is the routing signal

There is a different operating model. Evaluation is a response to change, not a response to a schedule. Call this **change-routed evaluation**: the post's durable mechanism, and the model the rest of this essay defends.

Two reference frames are useful. Google's release engineering treats a change as the unit of release: repeatable processes, intentional changes, testing tied to release events. The mental model transfers; changes are what you evaluate against, not the calendar. NIST's AI RMF treats risk management as continuous, and its Manage function covers prioritization, monitoring, and change management explicitly. A change alters the risk surface and should trigger response.

[Post 3](/blog/baseline-inheritance-is-how-agent-evaluation-scales/) defined admissibility loss: the moment inherited evidence stops being load-bearing. Post 4 starts one step earlier. Before you can detect loss, you need to know which changes are worth routing into evaluation in the first place.

To make the principle concrete, take a model swap. The team upgrades the underlying model behind a customer support class from one version to another. Calendar cadence will catch this on the next scheduled eval, which might be days or weeks away. Change-routed evaluation routes the work the moment the swap lands, against the agent class that depends on the model. The difference is not philosophical. It is the difference between evidence that reflects the system as it runs today and evidence that reflects the system as it ran two weeks ago.

## Not every change deserves the same response

Once change becomes the routing signal, the next decision is what to do with each change. The decision in front of an eval team is not binary. It is a routing decision shaped by two implicit axes. The first is scope: what does the change touch? One instance, one variant, the class, multiple classes? The second is consequence for evidence: what does the change invalidate? None of the prior baseline, some of it, all of it?

Four functional responses fall out: no eval (the change is irrelevant to current evidence), targeted eval (narrow surface), baseline refresh (class baseline invalidated), or reviewer escalation (ambiguous, novel, or cross-boundary changes).

These are not ranked. Some teams will assume baseline refresh is the responsible default. It is not. Routing is about matching response to consequence. Treating every change as a class-level event burns capacity. Treating every change as instance-only misses risk.

A worked case helps. Imagine a class that was approved for one tenant and is now being pointed at a second tenant. The change is real. What it routes to depends on what evidence the prior approval covered. If the second tenant matches the first in data sensitivity, audience, and operational scope, the change may route to a targeted eval against the new tenant's data shape. If the second tenant introduces a new compliance regime, the change may route to a baseline refresh against the broader surface. If the team cannot determine the answer from the change record alone, it routes to a reviewer.

## The four routing levels

Routing decisions land at one of four levels. The series has used the same vocabulary for [blast radius bands](/blog/the-agent-is-not-the-unit-the-agent-class-is/) across the arc, and it applies unchanged here: instance, variant, class, fleet. The cleanest way to walk these is through one example, traced end to end. Take **tool permission expansion**.

At the **instance level**, a single deployment of one variant gets a new tool permission. One support-agent instance is granted read access to a new internal data source. The class baseline and the variant baseline are untouched. Targeted eval runs against the changed instance, and the evidence at higher levels stays intact.

At the **variant level**, a configuration variant of the class gets the new permission. The premium-tier variant of the support-agent class gains write access to the ticketing system. The standard-tier variant does not. Eval routes against the variant. The class baseline is intact, and standard-tier instances inherit it unchanged.

At the **class level**, the permission is adopted into the class baseline. Write access to the ticketing system becomes part of what every support-agent instance does. Baseline refresh is required. All variants and instances inherit a refreshed baseline once new evidence is produced.

At the **fleet level**, the shared tool's behavior changes across many classes. The ticketing system itself changes its API contract, affecting every class that uses it. Multiple classes need re-evaluation against the new tool behavior. This is the most expensive routing outcome, and it is rare. It is also the outcome teams most often miss, because no class owner has changed anything; the change came from outside.

The most common operational mistake is misrouting. Treating a class-level change as instance-only is how a team ends up with one strong instance and a fleet of stale baselines. Treating an instance-only change as fleet-level is how a team burns through quarterly eval capacity in a week.

## The change record

Routing presupposes that the team can see the change in a form actionable enough to route. That artifact is the **change record**.

A change record is the minimum evidence needed to decide whether evaluation should route to the instance, variant, class, or fleet level. It carries five fields. What changed: the artifact, parameter, or scope that moved. Who changed it: the actor, human or system. When: the timestamp. Why: the intent. And the load-bearing one, what evidence it invalidates: the pointer to baselines, eval results, or attestations now at risk.

The last field is what connects change to routing. A change that does not name what evidence it puts at risk cannot be routed; the team is left to reconstruct the link from context. That work happens under pressure, after something visible has gone wrong, which is exactly when teams misroute.

A change record is not a deployment ticket. A ticket records intent: someone wanted to do something, and got approval to do it. A change record records consequence: something happened, and these prior assertions are now in question. The two artifacts can share infrastructure, but they answer different questions.

Carrying the worked example forward, the change record for the variant-level case reads:

> This support-agent variant gained write access to the ticketing system on Monday; the intent was to reduce handoffs; the affected evidence is the prior read-only baseline; route to variant-level targeted eval.

That is enough to route. It is not enough to evaluate. The evaluation work follows the routing decision and uses the change record as input.

## Evaluation triggers: what gets routed automatically

Some changes can be routed by mechanism, not by judgment. The mapping from change to routing level is deterministic, and the deterministic cases are exactly the ones that should not consume reviewer time.

A model or runtime version pin breaks: route to class-level baseline refresh, because every instance depends on the model. An autonomy band escalates from read to write: route to class-level evaluation, because the action surface has expanded. An audience scope crosses a compliance boundary: route to class or fleet evaluation, because the class's obligations have changed.

Where the mapping is deterministic, automation is appropriate. Where the change is ambiguous, novel, or crosses boundaries the rules did not anticipate, a reviewer enters the loop. The next section takes that case.

Automation is the floor. The point is to remove low-judgment routing decisions from the human queue, not to replace the reviewer function. Teams that skip this floor end up routing every change through a reviewer, which is the same failure mode as the calendar: capacity spent on work that does not need human judgment.

## Reviewer routing: when humans enter the loop

The reviewer function in change-routed evaluation is the role that handles routing decisions automation cannot make. Three responsibilities define the role.

The first is classification. When a change does not match a deterministic trigger, the reviewer assigns the routing level. New tool integrations, novel data sources, and guardrail config changes all tend to land here.

The second is baseline approval. When a class-level routing decision produces a new baseline, the reviewer signs off on replacement. Every variant and instance inherits the new baseline, so the approval gate matters; baselines that ship without explicit approval are one of the ways stale evidence propagates across a fleet.

The third is cross-class escalation. When a change touches more than one class, the reviewer decides whether to route fleet-level or as parallel class-level routings. That choice has real capacity consequences, and the rules engine cannot make it alone.

The reviewer is not evaluating. The reviewer is resolving routing ambiguity. Evaluation work follows the routing decision; it does not happen in the reviewer's head. Teams that conflate routing and evaluation burn reviewer time on work that should never have reached them.

## Why this avoids both over-testing and under-testing

Calendar cadence produces both failures at once. The same schedule that over-tests a stable class under-tests a class that changed mid-week. Change-routed evaluation matches eval capacity to where evidence is actually at risk.

The cost story is also the credibility story. A team that can show "we evaluated this class because it changed in this way on this date, and here is the change record that triggered the eval" produces stronger evidence than one that can only show "we run quarterly evals." The first is responsive; the second is procedural. In an audit context, that is the difference between answering questions and showing your calendar.

The series' [first claim](/blog/why-per-agent-evaluation-breaks-at-fleet-scale/) was that eval capacity is scarce. Change-routed evaluation is how you spend it well.

## What change routing does not solve

Change routing answers which work should enter the eval queue. It does not answer which queued work runs first. Multiple changes will route at the same time. Capacity is finite. Some routed work is more time-sensitive than other routed work.

That is the next problem.

*This series builds on [Reliable Agent Systems](/series/reliable-agent-systems/), but shifts the question from how an agent should be evaluated to which agents, classes, and changes should be evaluated now.*

## Selected references

Google SRE Book, Release Engineering chapter. Reliable services require repeatable release processes, intentional changes, testing, canarying, rollback, and change reports that record what changed. [sre.google/sre-book/release-engineering/](https://sre.google/sre-book/release-engineering/)

NIST AI Risk Management Framework, Core. The four functions Govern, Map, Measure, and Manage; Manage covers prioritization, monitoring, incident response, and change management. [airc.nist.gov/airmf-resources/airmf/5-sec-core/](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/)

NIST AI Risk Management Framework Playbook. Suggested actions aligned to the four AI RMF functions, not a checklist. [airc.nist.gov/airmf-resources/playbook/](https://airc.nist.gov/airmf-resources/playbook/)
