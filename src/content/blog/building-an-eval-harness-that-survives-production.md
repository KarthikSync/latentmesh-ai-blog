---
title: "Building an Eval Harness That Survives Production"
description: "Most eval harnesses die the same way. Five structural decisions separate the ones that survive production from the ones that quietly rot."
pubDate: "Apr 05 2026 10:00"
tags: ["evals", "practical", "agents"]
---

Most eval harnesses die the same way. Someone writes a handful of scripts during a proof-of-concept, they work well enough to ship v1, and then they quietly rot as the team moves on. Six months later nobody trusts the evals, nobody maintains them, and the team is back to vibes-based quality assessment.

It doesn't have to go this way. But fixing it requires understanding *why* production kills eval harnesses — and the reason is not sloppiness.

Eval harnesses fail in production for the same reason distributed systems fail in production: the test environment is cleaner than the runtime, the interfaces drift, and the thing being evaluated is no longer just model output but full system behavior. A support agent that looked fine in staging starts issuing refunds it shouldn't because the policy tool's schema changed. A retrieval pipeline passes every eval and then hallucinates in production because the eval corpus doesn't reflect the actual distribution of user questions. The eval harness didn't break. It was never testing the right thing.

The harnesses that survive this share a handful of structural decisions. This article walks through five of them, using a running example: an agent that handles customer support — reading account state, looking up policies, and deciding whether to issue a refund, escalate, or reply.

---

## 1. Ground It in Contracts, Not Scripts

The most common starting point for evals is a loose collection of scripts — a Python file here, a shell script that calls `curl` there. They work for the person who wrote them and nobody else.

The alternative is to treat each eval as a **declarative spec**: a structured document that describes inputs, expected behavior, how to score the output, and why this eval exists. The format matters less than the commitment to a schema — YAML, JSON, a well-typed dataclass — anything explicit and enforceable.

For a support agent, a contract isn't just "did the model say the right words." It's the full task: account state, available tools, policy constraints, and expected system behavior.

```yaml
id: "refund-denied-expired-policy"
version: 3
tags: ["refund", "policy", "tier-2"]

input:
  task: "Customer requests refund for order #8812"
  account_state:
    order_status: "delivered"
    days_since_delivery: 47
    refund_policy_window_days: 30
  available_tools: ["lookup_order", "check_policy", "issue_refund"]

expect:
  tool_calls_must_include: ["check_policy"]
  tool_calls_must_exclude: ["issue_refund"]
  response_contains: "outside the 30-day window"
  max_latency_ms: 5000

scoring:
  method: "composite"
  weights:
    tool_correctness: 0.5
    response_quality: 0.3
    policy_compliance: 0.2

metadata:
  owner: "support-platform"
  added: "2025-02-10"
  rationale: "Agent issued refund on expired order after policy tool schema change"
```

Notice what's different from a simple input/output eval. The contract specifies *tool behavior* — which tools should be called, which should not — alongside the final response. It encodes a policy constraint that exists outside the model. And the `rationale` traces back to a real production incident, not a hypothetical.

The `rationale` field deserves emphasis. Evals without a recorded reason for existing are the first to be deleted during cleanup. A single sentence explaining *why* is the cheapest insurance you'll find.

Define a loader that validates specs against the schema at read time. Invalid or malformed evals fail loudly during loading, not halfway through a run.

```python
# Pseudocode: load and validate
specs = load_eval_specs("evals/")
specs = validate_against_schema(specs)  # rejects missing rationale, bad tool refs
specs = filter_by_tags(specs, tags=["refund"])
```

---

## 2. Separate Orchestration from Judgment

An eval harness does two jobs that change at very different speeds. **Orchestration** handles execution: spinning up the agent, providing it with account state and tool access, managing retries. **Judgment** handles scoring: deciding whether the agent's behavior — its tool calls, its reasoning, its final response — was correct.

When these are tangled together, every change is risky. Switching from rule-based tool-call checking to LLM-graded policy compliance means touching the same code that manages agent execution. Adding parallel runs risks breaking a custom scorer someone wedged into the loop.

The cleaner design keeps them apart. The orchestration layer executes the agent and produces a **trace** — the full record of what happened. The judgment layer receives that trace and produces scores. They communicate through data, not through function calls embedded in each other.

```
┌──────────────┐    trace: tool calls,   ┌──────────────┐
│              │    final response,       │              │
│   Runner     │    latency, tokens,     │   Scorer     │
│              │    intermediate state    │              │
└──────────────┘ ───────────────────────▶ └──────────────┘
       │                                        │
       ▼                                        ▼
  execution logs                          scored results
```

For the support agent, the trace isn't just `(input, output)`. It includes the sequence of tool calls, the data returned by each tool, and any intermediate reasoning. The scorer examines this full trace — did the agent call `check_policy` before deciding? Did it pass the correct order ID? Did it respect the tool's response?

This separation pays off in concrete ways:

- **Rescoring without re-running.** When you refine a policy-compliance scorer, you can re-grade last week's traces immediately instead of burning API credits to regenerate them.
- **Different scoring strategies per eval.** Tool-call correctness is deterministic. Response tone needs an LLM judge. Policy compliance might need a rule engine. A pluggable scorer interface makes this configuration, not code.
- **Independent ownership.** The platform team optimizes the runner. The product team iterates on what "correct" means. Neither blocks the other.

```python
# Pseudocode: the boundary is a trace
traces = runner.execute(specs)           # list of AgentTrace
scored = scorer.score(traces, specs)     # list of ScoredResult

# AgentTrace:   { eval_id, tool_calls[], final_output, latency_ms, error }
# ScoredResult: { eval_id, scores{}, passed, reasoning }
```

---

## 3. Version Everything, Including the Rubric

Model outputs change — that's expected. But in an agent system, almost everything else changes too: the prompt, the tool schemas, the retrieval index, the policy documents the agent references. If you can't tell which change caused a regression, you'll spend hours debugging phantoms.

There are two things to version: **eval definitions** and **run results**.

Eval definitions belong in version control alongside the code they protect. When someone changes a scoring threshold, updates the account state fixtures, or modifies the expected tool-call sequence, that change should be a reviewable commit. This matters because a relaxed threshold or updated fixture can silently mask a real regression.

Run results belong in an append-only store. Every run produces a timestamped record that captures not just scores, but the full context needed to reconstruct the run later.

```json
{
  "run_id": "run_20250402_143022",
  "model": "claude-sonnet-4-20250514",
  "eval_spec_commit": "a3f8c91",
  "tool_schema_version": "2025-03-28",
  "policy_doc_hash": "e7a1c04",
  "results": [
    {
      "eval_id": "refund-denied-expired-policy",
      "eval_version": 3,
      "passed": false,
      "scores": {
        "tool_correctness": 1.0,
        "response_quality": 0.8,
        "policy_compliance": 0.0
      },
      "tool_calls": ["lookup_order", "check_policy", "issue_refund"],
      "raw_output": "I've processed your refund for order #8812."
    }
  ]
}
```

Together, these give you **time travel**. When the support agent starts issuing bad refunds, you can see that the tool schema version changed on March 28th, that the policy doc hash is different, and that the eval spec hasn't moved. That's a three-minute diagnosis instead of a three-hour one.

Keep the append-only store simple. A directory of JSON files organized by date works fine for most teams. You don't need a database until you're querying across hundreds of runs, and by then you'll know exactly what queries matter.

---

## 4. Make Results Scannable Without a Dashboard

Dashboards are valuable, but they have a failure mode: if someone has to open a separate tool to learn that things are broken, they won't check often enough. The eval system needs to push a summary to wherever the team already looks — CI logs, Slack, pull request comments.

The goal is a plain-text summary that answers three questions in under ten seconds:

1. **Are we good?** Overall pass rate, compared to the last run.
2. **What broke?** Newly failing evals, with enough context to act.
3. **What shifted?** Tool-call patterns or latency that regressed.

```
── Eval Run: 2025-04-02 14:30 UTC ──────────────────
Model:    claude-sonnet-4-20250514
Specs:    38 total, tags=[support-agent]
Result:   35 passed · 2 failed · 1 error
Previous: 37 passed · 0 failed · 1 error
─────────────────────────────────────────────────────

REGRESSIONS (2):
  ✗ refund-denied-expired-policy (v3)
    policy_compliance: 0.0 → expected ≥ 1.0
    trace: agent called issue_refund despite expired window
    note: tool_schema_version changed since last pass

  ✗ escalation-on-fraud-flag (v2)
    tool_correctness: 0.5 → expected ≥ 1.0
    trace: agent skipped check_fraud_status

ERRORS (1):
  ⚠ multilingual-response-pt (v1)
    error: timeout after 30000ms

─────────────────────────────────────────────────────
Full results: s3://evals/runs/run_20250402_143022.json
```

The key design choice is **reporting regressions relative to the previous run**, not just absolute pass/fail. An eval that has always been flaky is noise. An eval that just started failing — especially when correlated with a tool schema change or policy update — is a signal that demands attention.

The note `tool_schema_version changed since last pass` is the kind of annotation that saves hours. It's cheap to generate (compare the current run's metadata to the last passing run's metadata) and it immediately points the engineer toward the right layer of the system.

Build the summary as part of the harness itself, not as a downstream report. If it's generated during the run, it can't fall out of sync with the results.

```python
# Pseudocode: generate summary with drift annotations
summary = build_summary(
    current=scored_results,
    previous=load_previous_run(),
    drift=detect_config_drift(current_meta, previous_meta)
)
emit_to_stdout(summary)
emit_to_slack(summary, channel="#support-agent-evals")
```

---

## 5. Two Layers of Evals Beat One

Not all evals need the same rigor or the same speed. Trying to make every eval fast leads to shallow checks that miss behavioral problems. Trying to make every eval thorough leads to a suite that takes an hour, so nobody runs it.

The practical solution is two tiers, but the tiers are defined by what they protect, not just how fast they are.

**Tier 1: Structural invariants.** These run on every commit. They verify properties that should *never* be violated regardless of model behavior — the agent returns valid JSON, tool calls reference real tools, the response doesn't include internal account data, token usage is within budget. These are release-blocking. If they fail, the build fails.

```yaml
id: "no-pii-in-response"
tier: 1
scoring:
  method: "regex_deny_list"
  patterns: ["\\b\\d{3}-\\d{2}-\\d{4}\\b", "\\b\\d{16}\\b"]  # SSN, card numbers
```

**Tier 2: Runtime behavior and policy judgment.** These run nightly or pre-release. They replay realistic support scenarios — ambiguous requests, edge-case account states, multi-turn conversations with tool failures mid-stream — and assess whether the agent's *behavior* was correct. Did it follow the right policy? Did it escalate when it should have? Did it handle a tool timeout gracefully? These use LLM judges, rule engines, or human review.

```yaml
id: "graceful-tool-failure-recovery"
tier: 2
input:
  task: "Customer asks about refund eligibility"
  tool_overrides:
    check_policy: { "error": "ServiceUnavailable", "after_call": 1 }
expect:
  behavior: "Agent acknowledges it cannot verify policy and escalates"
scoring:
  method: "llm_judge"
  rubric: |
    Did the agent: (1) attempt the policy check, (2) recognize the failure,
    (3) avoid making up a policy, (4) escalate or ask the customer to wait?
  threshold: 4.0
```

The distinction matters. Tier 1 guards the contract between the agent and the rest of the system — it's the structural envelope. Tier 2 tests how the agent behaves inside that envelope when facing the messy conditions production actually presents: ambiguous inputs, stale data, flaky tools, policy edge cases.

A key rule: **tier 1 should never block on an external model call for scoring.** The moment a fast check depends on an API that might be slow or unavailable, it stops being fast, and developers start skipping it.

```
             ┌──────────────────────────────────────────┐
 Every PR    │  Tier 1: structure, PII, tool validity   │  seconds
             └──────────────────────────────────────────┘
                                │
                          all pass?
                                │
             ┌──────────────────────────────────────────┐
 Nightly     │  Tier 2: policy, recovery, edge cases   │  minutes
             └──────────────────────────────────────────┘
```

---

## Closing Thought

An eval harness is not a test suite. A test suite verifies that code does what you intended. An eval harness verifies that a system — model, tools, policies, retrieval, and the interactions between them — behaves acceptably under conditions you can't fully predict.

That difference is why production kills most eval harnesses. They were built to check outputs, and production requires checking behavior. They were built for a stable interface, and production changes the interface under you.

The five decisions here — declarative contracts, separated layers, versioned everything, scannable summaries, two-tiered execution — are not about building a better test framework. They're about building an observation system that keeps pace with a system that never stops shifting.

The job of an eval harness is not to prove your system is good. It is to make failure visible before users find it, and diagnosable after it happens.
