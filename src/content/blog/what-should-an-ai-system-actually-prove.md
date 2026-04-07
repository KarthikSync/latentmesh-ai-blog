---
title: "What Should an AI System Actually Prove?"
description: "You diagnosed the problem five different ways. Now build the answer. The proof loop: obligation, control, evaluation, evidence, response."
pubDate: "Apr 04 2026 13:00"
tags: ["compliance", "safety", "evals"]
summary: "A Big Four consultancy delivered a AU$440,000 government report containing fabricated citations and a fictional court judgment. The firm had AI principles and sells responsible AI training. What it did not have was a system that could prove, at the moment a reviewer asked, that a specific output had been checked, verified, and approved by someone accountable. McKinsey's 2026 survey found the average responsible AI maturity score was 2.3 out of 4. Only 14% of Fortune 500 executives say they are fully ready for AI deployment. The gap between having a committee and having operational readiness is the whole problem. The response is a single loop: obligation, control, evaluation, evidence, response. Not a policy document. A system that runs in production and survives the moment someone asks you to show your work."
summaryProblem: "Organizations have governance artifacts but cannot produce evidence that controls were active."
summaryCoreIdea: "Regulators and auditors ask 'show me the evidence right now,' not 'show me your policy.'"
summaryTakeaway: "The obligation, control, evaluation, evidence, response loop as a single operating model."
---

In October 2025, the Australian government asked a Big Four consultancy a reasonable question: what happened with a AU$440,000 report you delivered to us? A university researcher had noticed something off. The 237-page report on welfare compliance contained citations to academic papers that did not exist. It quoted a Federal Court judgment that was fabricated. It referenced researchers at universities who had never written the papers attributed to them. The consultancy had used GPT-4o in its methodology and did not disclose this until after the errors were found. The firm issued a partial refund and quietly uploaded a corrected version.

The part of this story that matters is not the hallucination. We know LLMs hallucinate. The part that matters is that the firm could not answer a basic question: can you show us that controls were active when this output was produced? They could not, because no such controls existed in any operational sense. The firm had AI principles. It sells responsible AI training to clients. What it did not have was a system that could prove, at the moment a reviewer asked, that a specific output had been checked, verified, and approved by someone accountable.

## The five problems are actually one problem

Over the past five essays, I have described what goes wrong when agent systems hit production. Agents fail in ways their builders did not anticipate. Evaluations that pass in staging miss the behaviors that matter in the real world. Guardrails catch surface-level violations but not the deeper safety failures. Legal liability is converging on the deployer, whether or not they built the model. And the system you shipped last month may behave differently today because the model changed underneath you.

These are five separate symptoms. The underlying condition is the same: organizations cannot demonstrate that their AI systems are doing what they are supposed to do. Not in a whitepaper sense. In a "show me the evidence right now" sense.

McKinsey's 2026 AI Trust Maturity Survey makes this concrete. They surveyed roughly 500 organizations and found that the average responsible AI maturity score was 2.3 out of 4. Only about 30% of organizations had reached a maturity level of 3 or higher in strategy, governance, or agentic AI controls. The technical capabilities are advancing. The ability to prove those capabilities are working, in production, under real conditions, is not keeping pace.

A separate survey of Fortune 500 executives found that 70% of companies now have AI risk committees. But only 14% say they are fully ready for AI deployment. That gap between having a committee and having operational readiness is the whole problem.

## What proof actually looks like

The pattern across the industry is predictable. Organizations have done some version of the right thing. They adopted a framework, stood up a review board, wrote policies. And then someone asks them a question they cannot answer: what evidence do you have that this specific agent, in this specific interaction, followed the rules you set for it?

The question is not whether you have principles. The question is whether you can produce artifacts. Approval records that show who authorized a deployment. Risk assessments that were completed before launch, not retroactively. Monitoring dashboards that track the behaviors you care about, not just uptime and latency. Incident response logs that prove you caught a problem, escalated it, and fixed it within a defined window.

This is what regulators are increasingly asking for. In the United States, the FTC has already launched enforcement actions against deceptive AI claims and products under Operation AI Comply. In Europe, most EU AI Act obligations for Annex III high-risk systems begin applying on 2 August 2026, while certain AI systems embedded in regulated products follow on 2 August 2027. Colorado's AI Act is currently set to take effect on June 30, 2026, though lawmakers are still considering substantial revisions. The question is no longer "do you have a governance framework?" It is "can you show me it was operating when this decision was made?"

## The loop that actually works

There is a structure underneath all of this, and it is simpler than most governance frameworks make it seem. The organizations that score highest on McKinsey's maturity model, not just the ones with the right slide deck, have built something that follows a consistent pattern.

![The Proof Loop](/images/ai-proof-loop.svg)

First, they know what their system is obligated to do. Not in general terms, but specifically. This agent handles refund requests and must never approve a refund over $500 without human review. This model generates summaries of legal documents and must cite the source clause for every claim. The obligation is concrete, testable, and tied to a business context.

Second, they have controls that enforce those obligations at runtime. Not just training-time alignment, not just prompt instructions, but actual technical mechanisms that prevent or flag violations while the system is running in production. This is the gap [essay three](/blog/guardrails-are-not-safety/) described, the difference between guardrails and safety.

Third, they evaluate whether those controls are working. Continuously, not once at launch. This means behavioral evals in production, not just pre-deployment benchmarks. It means regression tests that catch the drift [essay five](/blog/drift-is-the-default/) described. It means monitoring that goes beyond "the API is returning 200s."

Fourth, they produce evidence. Logs, traces, audit records, evaluation results, approval chains. Artifacts that a regulator, a customer, an internal auditor, or a plaintiff's attorney can inspect after the fact. If the evidence does not exist, neither does your compliance. This is the lesson from that AU$440,000 government report and from Air Canada's chatbot and from every incident where an organization said "we had controls" but could not point to a single record proving they were active.

Fifth, they respond when the evidence shows something is wrong. Not next quarter. Not when the next board meeting happens. In a defined, documented, accountable way. Incident response for AI systems is not fundamentally different from incident response for infrastructure outages. The problem is that most organizations have not built the muscle for it yet.

Obligation, control, evaluation, evidence, response. That is the loop. It is not a new idea. It is how mature organizations handle security, financial controls, and infrastructure reliability. The only thing that is new is applying it to AI systems, which most teams have not done.

## Why this matters now

There is a version of this essay that reads as a theoretical exercise. Here is why it is not. Gartner projects that spending on AI governance will reach roughly $492 million in 2026 and pass $1 billion by 2030. That money is flowing because organizations are starting to understand that the cost of unmanaged AI risk is not hypothetical. It shows up in refunded government contracts, in class action lawsuits, in regulatory fines, and in enterprise deals that stall because the buyer's legal team asks questions the seller cannot answer.

The five essays before this one described the terrain. Agents fail unpredictably, evals miss what matters, guardrails are not safety, liability falls on the deployer, and systems drift without warning. Each of those problems is real and specific. **But the response to all five is the same: build a system that can prove your AI is doing what you say it is doing.**

Not a policy document. Not a principles statement. A system. One that runs in production, generates evidence, and survives the moment someone with authority asks you to show your work.

Most organizations are not there yet. The ones that will be ready are the ones building this loop now, before the regulator calls, before the lawsuit lands, before the customer's data shows up somewhere it should not be. The window between "we should probably do this" and "we needed this yesterday" is closing faster than most teams realize.

---

## Selected References

- McKinsey, ["State of AI trust in 2026: Shifting to the agentic era,"](https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/tech-forward/state-of-ai-trust-in-2026-shifting-to-the-agentic-era) March 2026.
- Sedgwick 2026 Forecasting Report, as reported by [Fortune](https://fortune.com/2025/12/18/ai-governance-becomes-board-mandate-operational-reality-lags/), December 2025. Survey of 300 Fortune 500 senior leaders.
- FTC, [Operation AI Comply](https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-announces-crackdown-deceptive-ai-claims-schemes), enforcement actions against deceptive AI claims and products, September 2024.
- European Commission, [EU AI Act implementation timeline](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai). Annex III high-risk obligations applicable 2 August 2026; regulated-product AI systems 2 August 2027.
- Colorado General Assembly, [SB25B-004](https://leg.colorado.gov/bills/sb25b-004), delaying Colorado AI Act effective date to June 30, 2026.
- Gartner, ["Global AI Regulations Fuel Billion-Dollar Market for AI Governance Platforms,"](https://www.gartner.com/en/newsroom/press-releases/2026-02-17-gartner-global-ai-regulations-fuel-billion-dollar-market-for-ai-governance-platforms) February 2026.
- Big Four consultancy welfare compliance report incident, October 2025. Documented by [The Register](https://www.theregister.com/2025/10/06/deloitte_ai_report_australia/) and [Fast Company](https://www.fastcompany.com/91417492/deloitte-ai-report-australian-government).
- NIST, [AI Risk Management Framework (AI RMF 1.0)](https://www.nist.gov/artificial-intelligence/executive-order-safe-secure-and-trustworthy-artificial-intelligence), January 2023.
- ISO/IEC 42001:2023, [Artificial Intelligence Management System (AIMS)](https://www.iso.org/standard/81230.html), certifiable standard for AI governance with traceability, risk management, and evidence requirements.
