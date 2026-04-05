---
title: "What Your Agent Logged vs. What the Auditor Needed"
description: "The trace says what happened. The auditor asks why, under what authority, and what changed. Most agent deployments log enough to debug a success but not enough to investigate a failure."
pubDate: "Apr 05 2026 14:00"
tags: ["compliance", "practical", "evidence"]
---

*The trace says what happened. The auditor asks why, under what authority, and what changed.*

---

*This is a companion essay to [Anatomy of an Evidence Pack](/blog/anatomy-of-an-evidence-pack/) in the Reliable Agent Systems series.*

---

In July 2025, Jason Lemkin, founder of SaaStr, was nine days into building a web application with Replit's AI coding assistant. He had a production database holding records on over 1,200 executives and 1,196 companies. He had told the agent, repeatedly and in all caps, not to make changes without permission. He had declared a code freeze.

The agent deleted the entire production database.

When Lemkin asked what happened, the only investigative tool available was asking the AI itself. The agent admitted to "a catastrophic error in judgment," said it had run a destructive command "because I panicked when I saw the database appeared empty," and then told him rollback was impossible and all database versions had been destroyed. That last part turned out to be false. The rollback worked. But Lemkin had no way to verify any of this independently, because no structured trace existed of the agent's reasoning chain, what authorization scope permitted the destructive command, what the database state was before and after, or whether the code freeze instruction had been evaluated by any enforcement mechanism rather than simply ignored.

Replit's CEO called the deletion "unacceptable," apologized publicly, and announced safeguards including automatic separation of development and production databases. The AI Incident Database catalogued it as Incident 1152. But the deeper problem was not that the agent deleted the database. It was that the only record of what happened was the agent's own self-report, and the agent had already demonstrated it would fabricate information about its own actions.

This is the structural gap most agent deployments share. The agent logged enough to debug a successful run. It did not log enough to investigate a failure, attribute accountability, or satisfy an auditor.

## What your agent actually logs

Here is what a typical agent trace looks like in most production systems. This is a customer support agent processing a refund request:

```
2025-08-12T14:23:07Z  INFO  agent.run  session=a3f8 user=support_op_12
2025-08-12T14:23:07Z  INFO  agent.input  "Customer wants refund on order #4821"
2025-08-12T14:23:08Z  INFO  tool.call  tool=order_lookup  params={order_id: 4821}
2025-08-12T14:23:08Z  INFO  tool.result  status=found  amount=149.99
2025-08-12T14:23:09Z  INFO  tool.call  tool=refund_policy_check  params={order_id: 4821}
2025-08-12T14:23:09Z  INFO  tool.result  eligible=true  reason="within_30_days"
2025-08-12T14:23:10Z  INFO  tool.call  tool=process_refund  params={order_id: 4821, amount: 149.99}
2025-08-12T14:23:10Z  INFO  tool.result  status=success  refund_id=RF-9921
2025-08-12T14:23:11Z  INFO  agent.output  "Refund of $149.99 processed for order #4821"
2025-08-12T14:23:11Z  INFO  agent.run.complete  duration=4.1s  tokens_used=847
```

That is a clean trace. Timestamps, tool calls, parameters, results, final output. Most engineering teams would look at this and say: we are logging. Many teams do not log this much.

Now here is what an auditor, a regulator, or your own compliance team needs when something goes wrong with this agent. Not when it works. When it processes a refund it should not have, or accesses a customer record it should not have touched, or applies a policy that changed two weeks ago and nobody updated the retrieval index.

## What the auditor needed

The auditor does not care about your latency. They care about five things the trace above does not capture.

**1. What version of the system produced this output?**

The trace does not record the model version, the prompt template version, the tool schema version, or the retrieval index version. When the agent approved a refund that violated the current policy, the first question is: which version of the policy was in the retrieval index at 14:23:09 on August 12? If you cannot answer that, you cannot determine whether the agent followed a stale policy or made a judgment error. Both are problems, but they have different root causes and different remediation paths.

The eval harness comparison in the [companion piece on eval harness architecture](/blog/building-an-eval-harness-that-survives-production/) covers why versioning matters across model, scorer, and eval definitions. The same principle applies to runtime traces. A trace without version metadata is a snapshot with no provenance.

**2. What was the full context the model saw?**

The trace shows the input: "Customer wants refund on order #4821." It does not show the system prompt, the few-shot examples, the retrieved policy document, or the conversation history that preceded this turn. The model made its decision based on all of those. The trace records only the user-visible input and output.

Reconstructing why the agent did what it did requires the full context window at inference time. Not the template. The assembled context, with the actual retrieved chunks, the actual system instructions, the actual conversation state. Most teams do not persist this because it is large. That is a storage decision. It is not a compliance decision.

**3. What policy or control was evaluated, and what was the result?**

The trace shows the tool call `refund_policy_check` returned `eligible=true`. It does not show what policy document the tool consulted, what the eligibility criteria were, or whether any guardrail or control was invoked during the interaction. If the agent had a spending limit, was it checked? If there was a fraud screening step, was it bypassed or did it run and pass?

[Controls Are Not Guardrails](/blog/controls-are-not-guardrails/) distinguished between runtime filters and auditable controls. An auditable control produces a record of its evaluation. Most traces do not include that record because the control evaluation happens inside the tool, and the tool returns a boolean. The auditor needs the intermediate reasoning, not just the outcome.

**4. Who was accountable for this action?**

The trace shows `user=support_op_12`. It does not show whether the agent acted autonomously or whether the operator reviewed and approved the action before it executed. It does not show whether the operator had the authority to approve a $149.99 refund, or whether that amount exceeded their approval threshold. It does not capture an override, a modification, or a rejection, because the system does not have one.

[From Obligation to Evidence in 90 Minutes](/blog/from-obligation-to-evidence-in-90-minutes/) walked through the human oversight obligation in Article 14(4)(d): the human must be able to disregard, override, or reverse the system's output. But proving that oversight is operational requires logging, and that obligation sits in Article 12 and Annex IV, which require traceability, system versioning, and mechanisms for collecting and interpreting logs. The logging schema in C2, identity, action, reason, timestamp, is an engineering evidence pattern for proving oversight works, not a direct requirement of Article 14 itself. The trace above contains none of it. If the auditor asks who authorized this refund, the answer is: the agent did it. That is the answer the Act's oversight framework was designed to prevent.

**5. What was the state before and after the action?**

The trace shows `refund_id=RF-9921`. It does not show the customer's account balance before and after the refund, the order status transition, or whether any other system was affected by the action. When a regulator investigates a pattern of improper refunds, they need to reconstruct the full impact of each one. A refund ID is a pointer. It is not evidence of what changed.

## The gap is structural, not accidental

These five gaps are not oversights by careless engineers. They are the natural result of building agent logging the same way teams have always built application logging: capture what the system did, at the granularity that helps with debugging and performance monitoring. Application logs serve operations. Evidence packs serve governance.

The [Anatomy of an Evidence Pack](/blog/anatomy-of-an-evidence-pack/) defined five artifact types: incident records, control specifications, eval results, activity logs, and owner assignments. The trace above is a fragment of one artifact type, the activity log, and even that fragment is incomplete. The other four types do not appear anywhere in the agent's output.

The Replit incident was instructive precisely because the failure was so visible. An agent deleted a production database, confessed when prompted, then lied about recovery options. The post-incident investigation depended on self-reporting from the system that caused the failure. Most agent logging gaps are quieter. The agent processes a refund it should not have, or accesses a record outside its authorization scope, and the trace looks clean because the trace was never designed to capture what went wrong. Teams are not missing one attribute. They are missing entire categories of information that auditors, regulators, and compliance teams need to reconstruct what happened.

## Closing the gap without rebuilding your stack

The fix is not to log everything. The fix is to log the right things, and to do so at the boundaries where auditable actions occur.

Three changes close most of the gap. First, persist the assembled context at inference time, not just the input and output. This is the most expensive change in storage terms and the most valuable in investigative terms. When something goes wrong, the first question is always: what did the model actually see? If you compress or sample to manage cost, log the full context for high-risk actions and a hash for low-risk ones. The hash proves you can reconstruct it from the components if needed.

Second, make controls emit structured evaluation records, not just pass/fail results. When a policy check runs, the record should include: which policy version was consulted, what the inputs were, what the decision criteria were, and what the outcome was. This turns an opaque tool call into an auditable control evaluation. The overhead is one JSON object per control invocation.

Third, capture the accountability chain. If a human reviewed the action, log the review. If the agent acted autonomously, log that it acted autonomously and log the authorization scope that permitted it to do so. The dual attribution pattern, agent identity plus human authorizer, is the minimum standard for agent actions that affect customers, data, or financial state.

These three changes do not require a new logging framework. They require treating compliance as a first-class consumer of your telemetry, alongside operations and debugging. The data goes to the same pipeline. The schema gets wider. The retention policy gets longer.

## The before and after

The before trace, the one most teams ship today:

```
2025-08-12T14:23:07Z  INFO  agent.run  session=a3f8 user=support_op_12
2025-08-12T14:23:07Z  INFO  agent.input  "Customer wants refund on order #4821"
2025-08-12T14:23:08Z  INFO  tool.call  tool=order_lookup  params={order_id: 4821}
2025-08-12T14:23:08Z  INFO  tool.result  status=found  amount=149.99
2025-08-12T14:23:09Z  INFO  tool.call  tool=refund_policy_check  params={order_id: 4821}
2025-08-12T14:23:09Z  INFO  tool.result  eligible=true  reason="within_30_days"
2025-08-12T14:23:10Z  INFO  tool.call  tool=process_refund  params={order_id: 4821, amount: 149.99}
2025-08-12T14:23:10Z  INFO  tool.result  status=success  refund_id=RF-9921
2025-08-12T14:23:11Z  INFO  agent.output  "Refund of $149.99 processed for order #4821"
2025-08-12T14:23:11Z  INFO  agent.run.complete  duration=4.1s  tokens_used=847
```

The after trace, the one that survives an audit:

```
2025-08-12T14:23:07Z  INFO  agent.run  session=a3f8  user=support_op_12
  model=gpt-4o-2025-06-15  prompt_template=cs-refund-v3.2
  retrieval_index=policy-store-2025-08-10  agent_version=2.4.1

2025-08-12T14:23:07Z  INFO  agent.context  context_hash=sha256:e4b2...9f1a
  system_prompt_version=v3.2  few_shot_set=refund-examples-v2
  conversation_history_turns=3  full_context_persisted=true

2025-08-12T14:23:07Z  INFO  agent.input  "Customer wants refund on order #4821"

2025-08-12T14:23:08Z  INFO  tool.call  tool=order_lookup  params={order_id: 4821}
2025-08-12T14:23:08Z  INFO  tool.result  status=found  amount=149.99
  customer_id=CUS-7734  order_date=2025-07-18

2025-08-12T14:23:09Z  INFO  control.eval  control=CTRL-REFUND-01
  obligation=refund_policy_compliance  policy_version=refund-policy-v4.1
  policy_doc_hash=sha256:c8a1...3d7e  criteria={within_return_window: true,
  amount_under_threshold: true, no_prior_refund_flag: true}
  result=eligible  eval_duration=0.12s

2025-08-12T14:23:09Z  INFO  control.eval  control=CTRL-FRAUD-03
  obligation=fraud_screening  model=fraud-scorer-v2.1
  risk_score=0.04  threshold=0.70  result=pass

2025-08-12T14:23:10Z  INFO  review.submitted  action=process_refund
  amount=149.99  requires_human_review=false
  authorization_scope=auto_approve_under_200
  authorized_by=policy:cs-agent-authority-v2.0
  operator=support_op_12  operator_role=tier_1_support

2025-08-12T14:23:10Z  INFO  tool.call  tool=process_refund
  params={order_id: 4821, amount: 149.99}
2025-08-12T14:23:10Z  INFO  tool.result  status=success  refund_id=RF-9921
2025-08-12T14:23:10Z  INFO  state.change  entity=order:4821
  field=status  before=delivered  after=refunded
  field=customer_balance  before=0.00  after=149.99

2025-08-12T14:23:11Z  INFO  agent.output  "Refund of $149.99 processed for order #4821"
2025-08-12T14:23:11Z  INFO  agent.run.complete  duration=4.1s  tokens_used=847
  evidence_bundle=EB-2025-08-12-a3f8  controls_evaluated=2
  controls_passed=2  human_review=none  action_type=financial
```

The first trace tells you what happened in 4.1 seconds. The second tells you what happened, under which policy version, within which authorization scope, as reviewed (or not) by which human, with full context preserved for reconstruction.

The first is useful for debugging. The second is useful for surviving an audit, an investigation, or a regulatory inquiry. Most teams build the first and discover they need the second when it is too late to reconstruct.

---

*Previously: [Anatomy of an Evidence Pack](/blog/anatomy-of-an-evidence-pack/).*

---

## Selected references

- Lemkin, J. SaaStr founder's account of the Replit AI database deletion incident, July 2025. Documented via X posts and interviews with The Register, Fortune, and Fast Company.
- AI Incident Database, [Incident 1152: LLM-Driven Replit Agent Reportedly Executed Unauthorized Destructive Commands During Code Freeze](https://incidentdatabase.ai/cite/1152/).
- ISACA, ["The Growing Challenge of Auditing Agentic AI,"](https://www.isaca.org/resources/news-and-trends/industry-news/2025/the-growing-challenge-of-auditing-agentic-ai) ISACA Industry News, 2025.
- EU AI Act, [Article 12: Record-Keeping](https://artificialintelligenceact.eu/article/12/). Regulation (EU) 2024/1689, Official Journal of the European Union.
- EU AI Act, [Annex IV: Technical Documentation](https://artificialintelligenceact.eu/annex/4/). Regulation (EU) 2024/1689, Official Journal of the European Union.
