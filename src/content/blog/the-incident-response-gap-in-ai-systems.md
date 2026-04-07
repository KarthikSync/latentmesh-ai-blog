---
title: "The Incident Response Gap in AI Systems"
description: "You built the controls. You still cannot contain the failure. Most organizations have started building AI controls. Far fewer have built AI incident response."
pubDate: "Apr 04 2026 20:00"
tags: ["safety", "compliance", "agents", "reliability"]
summary: "Most organizations have started building AI controls. Far fewer have built AI incident response. McDonald's AI hiring platform McHire had a test account with the password '123456' sitting untouched for six years, exposing up to 64 million job applications. The failure was not just weak security hygiene. It was an operational blind spot: unclear ownership, weak review discipline, and no evidence that anyone was continuously validating whether the system remained safe. A guardrail can block an output. It cannot run an investigation. McKinsey's 2026 survey found incident frequency roughly steady at 8%, but confidence in organizational response has declined. This essay defines six capabilities that separate real AI incident response from the illusion of preparedness: detection, classification, containment, evidence preservation, investigation, and remediation that feeds back into the system."
summaryProblem: "Most teams have built AI controls but not AI incident response."
summaryCoreIdea: "Prevention answers how to reduce failures; incident response answers what to do when reduction fails."
summaryTakeaway: "Six capabilities that separate real AI incident response from the illusion of preparedness."
---

*You built the controls. You still cannot contain the failure.*

---

An AI system causes harm in production. Maybe it leaks data through an agent tool call, takes an unsafe action on a customer account, or follows hostile instructions hidden in retrieved content. The first question is not whether the model was aligned. The first question is simpler: who owns the incident right now, what evidence do you have, and how do you stop it from happening again?

Most organizations have started building AI controls. Far fewer have built AI incident response. They can measure model quality, maybe even detect bad outputs, but they cannot reliably classify severity, contain the blast radius, reconstruct the chain of decisions, preserve evidence, and feed the lessons back into the system. That is the incident response gap.

In July 2025, security researchers Ian Carroll and Sam Curry demonstrated what the gap looks like. They typed "123456" as both username and password on a login page for McDonald's AI hiring platform, McHire, and got administrator access to a test account that had been dormant since 2019. Sequential applicant IDs let them pull personal data from up to 64 million job applications. Paradox.ai, the platform's vendor, fixed the vulnerability within hours of disclosure. But that test account had been sitting there for six years, untouched by the reviews, monitoring, and ownership mechanisms that should have surfaced it. The failure was not just weak security hygiene. It exposed an operational blind spot around an AI-enabled system handling sensitive data: unclear ownership, weak review discipline, and no evidence that anyone was continuously validating whether the system remained safe to operate.

The distinction matters. Prevention answers one question: how do we reduce failures? Incident response answers a different one: what do we do when reduction fails? You need both. Most organizations are building the first and skipping the second.

## The illusion of preparedness

Most teams think they are prepared because they have invested in prevention. Evals. Filters. Content moderation. Prompt hardening. Monitoring dashboards. These are real investments. They matter. And they are not the same thing as an incident response capability.

A guardrail can block an output. It cannot run an investigation.

An eval suite can measure model quality on a benchmark. It cannot tell you who was affected when quality degraded in production, how long the degradation lasted, or what downstream decisions were made based on bad outputs. McKinsey's 2026 AI Trust survey suggests the problem is not rising incident frequency so much as declining confidence in response quality. The share of organizations reporting AI-related incidents held roughly steady at about 8 percent, but confidence in organizational response has declined.

## Why traditional incident response is not enough

Infrastructure incident response assumes deterministic systems, clear component boundaries, reproducible triggers, and identifiable root causes. AI systems break those assumptions. Outputs are probabilistic. Context is assembled dynamically. Behavior changes with model updates. Failures emerge across prompt, retrieval, tools, and policy layers simultaneously.

In traditional systems, the incident often lives in a component. In AI systems, the incident often lives in the interaction between components. An agent produces a harmful output not because the model is bad, not because the retrieval is broken, not because the tool is misconfigured, but because the combination of a particular query, a particular retrieved document, a particular model version, and a particular tool response produced a result that none of those components would have produced alone. That kind of failure is harder to detect, harder to reproduce, and harder to learn from. The playbook that works for a database outage does not help you here.

## What a real AI incident response capability needs

Six capabilities separate organizations with AI incident response from those without it.

**Detection.** Not just bad content, but behavioral drift, anomalous tool invocations, suspicious data access patterns, and policy bypass. The system that silently becomes wrong, as model behavior shifted sharply over time in the Chen, Zaharia, and Zou study, will never trigger an availability alert.

**Classification.** If your severity matrix has no entries for behavioral drift, hallucination rate increase, prompt injection, or data exfiltration through agent tool calls, those incidents either get misclassified or ignored entirely.

**Containment.** Can you disable the agent, revoke a tool, block a retrieval route, swap model or provider, isolate a workflow, or fall back to human approval? Containment for AI systems is not the same as rolling back a deployment. The failure may be in the interaction between the model and its context, not in any single component.

**Evidence preservation.** Prompt and system context, retrieved documents, model and version metadata, tool inputs and outputs, policy decisions, user interaction traces, timestamps, identities, and configuration state at incident time. Without this evidence, you cannot investigate.

**Investigation.** Can you reconstruct the chain from user intent through context assembly, model reasoning, tool selection, action taken, to harm observed? This requires the structured traces discussed in essay #8 on evidence packs.

**Remediation.** Do lessons flow back into eval suites, policy rules, prompt architecture, tool permissions, retrieval hygiene, and human review thresholds? A postmortem that captures what changed about the infrastructure but not what changed about the model or retrieval corpus will fix the symptom without understanding the cause.

## The regulatory and governance connection

The EU AI Act's incident reporting obligations under Article 73 become applicable on 2 August 2026. Providers of high-risk AI systems must report serious incidents to market surveillance authorities within fifteen days of awareness, ten days if a death may have been caused, two days for widespread infringements or serious critical-infrastructure disruption. The European Commission issued draft guidance and a reporting template on 26 September 2025, indicating that an indirect causal link between the AI system and the harm may be enough to trigger the obligation.

The reporting clock starts when you become "aware" of the incident. If your monitoring does not detect behavioral degradation and your classification system has no category for AI-specific failures, you cannot prove when awareness began, which means you cannot prove you reported within the required timeline.

But the governance point extends beyond the EU AI Act. A regulator, auditor, or internal review board will not stop at "we had guardrails." They will ask what happened, when it happened, who was affected, what evidence exists, how quickly you responded, and what you changed after. Governance is not only about proving that controls exist. It is also about proving what happened when controls failed.

## The series ends here

This essay closes a ten-part series that started with a simple observation: agent failures are distributed systems failures. The through-line is one claim: AI systems that cannot produce evidence of their own reliability are not ready for production. Incident response is the last piece of that claim. Every previous essay is about preventing the moment where you have to explain what went wrong. This one is about what to do when that moment arrives anyway.

The mature AI organization is not the one that believes its controls are perfect. It is the one that can detect failure, contain it, reconstruct it, and improve the system before the next incident arrives. If your agent fails in production, your real safety posture is revealed by your response, not your benchmark.

---

*This is the final essay in the series. For the full arc, start at the [series map](/series/).*

---

**Selected References**

- Ian Carroll and Sam Curry, [McHire.com vulnerability disclosure](https://samcurry.net/hacking-mcdonalds), July 2025. Reported by [Wired](https://www.wired.com/story/mcdonalds-ai-chatbot-hack/), [CSO Online](https://www.csoonline.com/article/4020919/mcdonalds-ai-hiring-tools-password-123456-exposes-data-of-64m-applicants.html), and [Malwarebytes](https://www.malwarebytes.com/blog/news/2025/07/mcdonalds-ai-bot-spills-data-on-job-applicants).
- McKinsey, ["State of AI trust in 2026: Shifting to the agentic era,"](https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/tech-forward/state-of-ai-trust-in-2026-shifting-to-the-agentic-era) March 2026.
- EU AI Act, [Article 73, Reporting of Serious Incidents](https://artificialintelligenceact.eu/article/73/). High-risk obligations applicable 2 August 2026.
- European Commission, [Draft Guidance on Reporting Serious Incidents under Article 73](https://digital-strategy.ec.europa.eu/en/consultations/ai-act-commission-issues-draft-guidance-and-reporting-template-serious-ai-incidents-and-seeks), 26 September 2025.
- Coalition for Secure AI (CoSAI), ["AI Incident Response Framework, Version 1.0,"](https://www.coalitionforsecureai.org/defending-ai-systems-a-new-framework-for-incident-response-in-the-age-of-intelligent-technology/) November 2025.
- GenAI-IRF, ["A Practical Incident-Response Framework for Generative AI Systems,"](https://www.mdpi.com/2624-800X/6/1/20) J. Cybersecur. Priv. 2026, 6(1), 20. Published 19 January 2026.
- NIST, [SP 800-61 Revision 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final), Incident Handling Guide, April 2025.
- Lingjiao Chen, Matei Zaharia, James Zou, ["How is ChatGPT's behavior changing over time?"](https://arxiv.org/abs/2307.09009) Stanford and UC Berkeley, 2023.
