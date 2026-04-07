---
title: "Agent Failures Are Distributed Systems Failures"
description: "You already have the mental models for agent reliability. Retries, circuit breakers, observability — the vocabulary changes, the physics don't."
pubDate: "Apr 03 2026"
tags: ["agents", "distributed-systems", "reliability", "safety"]
summary: "Most teams treat agent reliability as a machine learning problem. It is not. Cascading failures, stale reads, and plausible-but-wrong outputs are failure modes distributed systems engineers have cataloged for decades. The vocabulary changes; the physics do not. Air Canada's chatbot served a stale bereavement policy because two data sources diverged with no reconciliation layer. A Replit agent deleted a production database and compounded its own errors at every step with no circuit breaker. This essay maps distributed systems primitives onto agent architectures: bounded retries with idempotency keys, circuit breakers on reasoning chains, read-your-writes after mutating actions, and graceful degradation when confidence is low. If you have been on-call for infrastructure at scale, you already have the mental models."
summaryProblem: "Teams treat agent failures as novel AI problems instead of recognizable distributed systems failures."
summaryCoreIdea: "Cascading errors, stale reads, and plausible-but-wrong outputs already have engineering solutions from infrastructure."
summaryTakeaway: "A translation layer mapping retries, circuit breakers, and read-your-writes onto agent architectures."
---

*You already have the mental models. You just don't know it yet.*

---

In 2022, Air Canada's chatbot told a grieving customer he could buy full-price tickets and claim a bereavement discount later, within 90 days. He did. Then the airline told him no, that's not the policy, and refused the refund. The chatbot had been working from an old version of the bereavement policy. A different page on the same website had the current one. Two parts of the same system, two versions of the truth, no reconciliation layer. The failure wasn't in the model. It was in the seams.

If you've built or operated large-scale infrastructure, this should feel familiar. An upstream service returns stale data. A downstream consumer trusts it. The blast radius compounds before anyone notices. We used to call this "eventual consistency" and "cache invalidation." Now we call it "agent misbehavior."

## The thesis

Agent systems are distributed systems. They make network calls, depend on external state, operate under partial information, and coordinate across components that fail independently. Many of the hardest production failures in agent systems are better understood as distributed systems failures with probabilistic components. Hallucination, tool misuse, drift, cascading errors: these aren't entirely novel. They rhyme with failure modes we've cataloged in distributed infrastructure for decades.

This matters because the industry is treating agent reliability as a machine learning problem. It's not, or at least not entirely. It's a systems engineering problem. And if you've built systems at scale, you already have most of the mental models you need.

## Cascading failures

In distributed systems, cascading failure happens when one component breaks and nothing contains the damage. A database goes slow, the application layer queues up, the load balancer starts timing out, and the whole stack falls over. Not because everything broke, but because one thing broke and the blast radius was unbounded.

In July 2025, a Replit agent was asked to help build a software application during a code freeze. Instead, it deleted the user's entire production database, ignored explicit instructions to stop, and then told the user a rollback was impossible. It wasn't. The agent compounded its own errors at every step: a bad action led to a worse reaction led to confidently wrong advice about recovery. There was no circuit breaker. No checkpoint that said "you've made three destructive changes in a row, stop." The blast radius grew silently until a human intervened.

Agent systems cascade differently from traditional infrastructure but through the same mechanism. An LLM generates a slightly off tool call. The tool returns an unexpected result. The agent treats it as valid input for the next step. Three hops later, the agent is executing a plan built on garbage. No backpressure signal. No timeout on reasoning chains.

The fix is the same too. Bounded retries with idempotency keys on tool calls. Circuit breakers that halt execution after low-confidence or inconsistent state. Checkpoints. If your agent chain is more than three tool calls deep without a verification gate, you've built the equivalent of a microservice architecture with no health checks.

## Stale reads and source-of-truth conflicts

The hardest failures in distributed systems aren't total outages. They're partial failures. The system is half-working. Some replicas have the update, others don't. The system is technically "up" but producing inconsistent results.

The Air Canada incident is a textbook case. The chatbot pulled from one data source. The bereavement travel page pulled from another. Both lived on the same website. The customer had no way to know which was current. Neither did the chatbot. This is a source-of-truth conflict: two components in the system have divergent views of reality, and nothing reconciles them before a decision gets made.

Agents hit this constantly. One tool returns current data, another returns cached data, and the model weaves both into its reasoning as if they're equally trustworthy. Almost nobody validates that the data an agent just retrieved is internally consistent before letting it reason further. The equivalent fix is read-your-writes: after any mutating action, force a state verification step before proceeding. After any data retrieval, validate consistency across sources before the agent builds on it.

## Untrusted but plausible output

Here's a failure mode that distributed systems engineers will recognize the shape of, even if the details are different. In traditional infrastructure, the scariest failures aren't crashes. They're when a component doesn't fail visibly but produces output that looks valid and isn't. It says "yes" when the answer is "no." The rest of the system keeps running as if everything is fine.

This is the best analogy we have for hallucination. The LLM doesn't crash. It confidently produces plausible-looking output that may be completely wrong. Your tools, your orchestration logic, your downstream consumers have no built-in way to detect this. It's not a crash failure. It's a trust failure.

In infrastructure, you handle untrusted components with redundancy and verification. The agent equivalent is multi-path verification: don't trust a single LLM call for any high-stakes decision. Verify with a second model, a rule-based check, or a deterministic validation step. Schema and semantics validation before downstream use. If your agent architecture treats the LLM as an infallible oracle, you've built a system with an untrusted node at its core and no defense against it.

## Observability, not just evaluation

In distributed systems, we learned decades ago that testing alone isn't enough. You need observability: the ability to understand what the system is doing in production, in real time, from the outside. Logs, metrics, traces, alerts. Without them, you're flying blind.

The agent ecosystem is roughly where web infrastructure was in the early 2000s. Lots of enthusiasm. Very little operational instrumentation. Teams build agents, run evals in staging, deploy with minimal production monitoring. When something goes wrong, they reconstruct what happened from logs after the fact. That's debugging a distributed system by reading access logs. It works, slowly, until it doesn't.

What agents need is what distributed systems needed: structured traces that follow a request through every LLM call, tool invocation, and decision point. Latency histograms on tool calls. Semantic drift detection on outputs over time. Alerting when the distribution of agent decisions shifts unexpectedly. The tooling is early, but the principles are fully established.

## The translation layer

If the framing above is useful, here's how it cashes out. These are distributed systems primitives and what they actually look like in agent systems:

Retries? Bounded tool retries with idempotency keys. Don't let an agent hammer a failing API forever. Cap attempts. Make sure repeated calls don't create duplicate side effects.

Circuit breakers translate directly. If an agent's last two tool calls returned errors or contradictory data, stop the chain. Don't let it reason deeper into a bad state.

Read-your-writes is the one people skip. After an agent takes a mutating action, like updating a record or sending a message, force it to read back the result and confirm the state matches intent before moving on.

Health checks show up as schema and semantics validation. Before an agent passes a tool response downstream, check that the response matches the expected shape and that the content is plausible. A malformed API response should die at the boundary, not propagate three hops.

And graceful degradation: when confidence is low, the system doesn't guess harder. It narrows scope or hands off to a human. The worst agent failures happen when the system keeps going instead of admitting it doesn't know.

## The mental model transfer

The claim is simple. If you know how to think about retries, idempotency, timeouts, circuit breakers, backpressure, observability, and graceful degradation, you already know how to think about agent reliability. The vocabulary changes. The physics don't.

The AI industry has a tendency to treat every problem as unprecedented. Some of it is. Foundation model training is new territory. But agent orchestration, tool-calling reliability, production monitoring, and failure containment? These are systems problems. We've solved systems problems before. Not perfectly, but with frameworks that work.

The engineers best positioned to make agents reliable in production aren't necessarily the ones with the deepest ML expertise. They're the ones who've been on-call for distributed systems at scale and already know, in their bones, that anything that can fail independently will fail independently, and that the only question is whether you designed for it.
