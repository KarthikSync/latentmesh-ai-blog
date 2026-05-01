---
title: "Why Per-Agent Evaluation Breaks at Fleet Scale"
description: "Most evaluation systems assume a single agent. At fleet scale, the question shifts from whether one agent passed to where limited evaluation capacity should be spent now."
pubDate: "May 01 2026 09:00"
tags: ["evals", "agents", "reliability"]
summary: "Most AI evaluation writing assumes a single agent. That assumption stops working as soon as an enterprise has many agents in production at the same time. At fleet scale, evaluation becomes a scheduling and allocation problem: where should limited evaluation capacity be spent now? Five failure modes appear when per-agent evaluation meets fleet reality: priority queue collapse, reviewer capacity bottleneck, eval cost compounding, signal dilution, and stale confidence. The essay draws a clear line between inventory, observability, and evaluation — three layers that enterprise governance programs often conflate. Inventory tells you what exists. Observability tells you what happened. Evaluation decides whether what happened is acceptable. The fleet-scale reframe is that the right question is not 'did this agent pass the eval' but 'where should limited evaluation capacity be spent given this fleet's risk surface and rate of change.'"
summaryProblem: "Per-agent evaluation stops working when the fleet is larger than the team's eval capacity."
summaryCoreIdea: "Evaluation at fleet scale is an allocation problem, not a testing problem."
summaryTakeaway: "An operating model that schedules, samples, and allocates eval capacity across the fleet."
---

Most AI evaluation writing assumes a single agent. The harness is built around one model, one workflow, one set of tests. A small group of reviewers decides pass or fail.

That assumption was reasonable when AI deployments meant one assistant or one production model. It is still reasonable for the agent on your laptop. It stops working as soon as an enterprise has many agents in production at the same time.

At fleet scale, evaluation is no longer just a question of whether one agent passed a test. It becomes a scheduling and allocation problem: where should limited evaluation capacity be spent now?

The scarce resource is not inventory. It is eval capacity.

## The reader problem

Most enterprises moving from AI pilots to production are not deploying one agent. They are deploying many: variants of the same assistant for different teams, copilots embedded in internal tools, workflow agents triggered by tickets and events, agents inside SaaS products the company already buys, and agents wrapped around legacy systems to make old workflows easier to use.

The default mental model for evaluating any of them is per-agent. Write tests for the agent. Run them on a schedule or on change. Score the runs. Route failures to a reviewer. The whole loop is built around the agent as the unit of work.

This is not an inventory problem. Knowing that an agent exists is different from knowing whether its behavior is acceptable. Building a discovery system that lists every agent in the organization solves a real problem. It does not solve the evaluation problem.

The failure appears long before science-fiction scale. A fleet of thousands or tens of thousands is enough to break the per-agent operating model.

The first response is usually to ask for more eval throughput, more reviewers, or a bigger eval platform. That response misses the point. Once a fleet is large enough, the question stops being how to evaluate each agent and starts being how to allocate evaluation across the fleet.

## What specifically breaks

Per-agent evaluation does not break gracefully. Five failure modes appear, and they usually compound.

### Priority queue collapse

When prompt changes, model upgrades, audit deadlines, traffic spikes, and policy updates all generate eval requests at once, every request looks high priority. The team marks them all urgent because each of them is, individually.

"Immediate" only works as a category if some things are not immediate. Once the urgent bucket exceeds review capacity, the category collapses on itself. Routing becomes arbitrary. The signal is gone.

### Reviewer capacity bottleneck

Human review time is finite. If a thousand agents need attention this week and the review team can clear two hundred items, the gap cannot be closed by adding more eval runs. Compute can scale faster than human attention. This bottleneck is not solved by execution throughput alone.

More runs can produce more findings without producing more reviewer time. Throughput goes up. The gap widens.

### Eval cost compounding

If every agent gets the full eval suite on every meaningful change, cost grows roughly with fleet size, change rate, and suite size multiplied together. Five agents with weekly changes is fine. Five thousand agents with daily changes is a different cost regime.

The cost problem is not just dollars. The same equation applies to human review minutes, model API calls, eval data preparation, and triage time. Every component that scales linearly with eval runs breaks at the same place.

### Signal dilution

If every agent gets the same eval pass regardless of risk profile, real failures get buried under routine green checks. A high-risk agent that touches customer data and a low-risk agent that summarizes meeting notes return their results into the same dashboard. Reviewers stop reading the dashboard.

The eval results are still there. The system that was supposed to filter them stopped filtering.

### Stale confidence

A passing eval result decays as the system around it changes. Prompts get updated. The underlying model gets swapped. New tools get attached. Data sources change. Traffic patterns shift.

At fleet scale, yesterday's green check can become today's stale confidence. The eval result is technically valid. The system it described is no longer the system in production.

## Inventory, observability, and evaluation are different layers

Many enterprise AI governance programs conflate three different things.

Inventory tells you what exists. It is the list of agents, their owners, their declared purpose, and their declared scope. Discovery and classification systems produce inventory.

Observability tells you what happened at runtime. It is the trace of calls, tool invocations, retrievals, model versions, and outputs. OpenTelemetry's [GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/) give a substrate for this layer, including span definitions for [GenAI agents and frameworks](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/).

Evaluation decides whether what happened is acceptable. It is the judgment, based on tests, scenarios, sampled traces, and reviewer attention, that the agent is behaving within its intended scope.

These layers are often confused in practice. "We have an inventory" gets read as "we are governed." "We have telemetry" gets read as "we know if our agents are behaving." Both readings produce false comfort and bad allocation decisions.

A team that has rolled out a discovery tool, tagged every agent, and stood up a dashboard often believes governance is handled. The dashboard tells them what is deployed. It does not tell them whether any of it is behaving correctly. The first time a risk, audit, or governance team asks for evidence of monitoring, the gap shows up.

The series uses one piece of vocabulary throughout. An *agent class* is a group of agents with similar purpose, tools, data access, runtime, and behavior. The term is borrowed from how operators already group similar systems for review, not from object-oriented programming. Throughout this series, "class" means this.

The full inventory-observability-evaluation distinction gets a dedicated post later in the series. The point here is that the eval-capacity argument depends on it: capacity is wasted whenever inventory or telemetry is mistaken for evaluation.

## The fleet-scale reframe

The right question is not "did this agent pass the eval." It is "where should limited evaluation capacity be spent given this fleet's risk surface and rate of change."

A harness runs tests. An operating model schedules them, allocates them, samples across them, and decides where the next eval run is most likely to surface a real problem.

An operating model is the set of policies, schedules, and decision rules that turn a finite resource into useful coverage of a much larger surface. Hospitals have one for patient triage. Audit teams have one for sampling transactions. Fleet evaluation needs one too. The output is not just test results. It is a defensible record of where attention was spent and why.

The operating model has parts. What is the reviewable unit of work. What baseline applies to a class of similar agents and when does inheritance break. What changes should trigger evaluation. What sampling strategy holds across the fleet. What test bundles apply to which classes. What evidence comes out of all of this.

The [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) does not tell teams how to schedule fleet-scale evals. But its lifecycle posture matters: AI risk work is not a one-time gate. It is governed, mapped, measured, and managed over time. The framework — formalized in [AI 100-1](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf) — provides compatible framing for treating evaluation as continuous operating practice. The fleet-scale operating model this series builds is consistent with that posture, not derived from it.

## Implications

For engineering teams, the implication is that the eval system needs scheduling, capacity tracking, and sampling logic alongside the test execution it already does. Most current eval practice is still organized around individual systems, runs, datasets, and score reports. Fleet-scale evaluation needs an allocation layer above the runner. The right unit of automation is the operating model, not the test case.

For governance teams, the implication is that "evaluate everything continuously" is neither feasible nor required. Sampling-based assurance is not a new idea. [PCAOB AS 2315](https://pcaobus.org/oversight/standards/auditing-standards/details/AS2315), the U.S. financial audit standard, defines audit sampling as applying a procedure to less than the full population to evaluate a characteristic of that population. The analogy is useful: mature control systems do not inspect every item all the time. They define a population, sample deliberately, and make the allocation policy explicit. Fleet-scale AI evaluation needs the same discipline. The defensibility question shifts from "did you test the agent" to "is your allocation policy reasonable given fleet risk."

This essay names the problem and reframes it. The rest of the series builds the operating model. The next post asks what the reviewable unit actually is. From there, the series moves through baseline inheritance, change-routed evaluation, sampling, the inventory/observability/evaluation distinction in full, eval packs, and the bridge from eval results to durable governance evidence.

*This series builds on [Reliable Agent Systems](/series/reliable-agent-systems/), but shifts the question from how an agent should be evaluated to which agents, classes, and changes should be evaluated now.*

## Selected references

NIST AI Risk Management Framework 1.0. Landing page: [nist.gov/itl/ai-risk-management-framework](https://www.nist.gov/itl/ai-risk-management-framework). The AI 100-1 publication, which formalizes the Govern, Map, Measure, Manage lifecycle, is at [nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf).

OpenTelemetry GenAI semantic conventions. Specification entry point: [opentelemetry.io/docs/specs/semconv/gen-ai/](https://opentelemetry.io/docs/specs/semconv/gen-ai/). The conventions cover attributes, metrics, span and event names, and span kind for GenAI operations. Agent and framework spans, which the post names directly, are defined at [opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/).

PCAOB AS 2315: Audit Sampling. [pcaobus.org/oversight/standards/auditing-standards/details/AS2315](https://pcaobus.org/oversight/standards/auditing-standards/details/AS2315). Formal definition of audit sampling: applying an audit procedure to less than the full population to draw conclusions about the population.

Reliable Agent Systems (LatentMesh). [The companion series](/series/reliable-agent-systems/), focused on how to design, test, and operate individual agent systems reliably.
