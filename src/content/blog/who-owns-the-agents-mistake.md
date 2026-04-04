---
title: "Who Owns the Agent's Mistake?"
description: "The legal answer is converging fast. Courts are rejecting the 'AI did it' defense. The question is whether your organization has the infrastructure to assign accountability when an agent fails."
pubDate: "Apr 04 2026"
tags: ["compliance", "agents", "safety"]
---

*The legal answer is converging fast. You just haven't built the infrastructure to act on it.*

---

In November 2022, Jake Moffatt needed to book a last-minute flight to Toronto after a death in his family. He went to Air Canada's website and asked the chatbot about bereavement fares. The chatbot told him he could buy a full-price ticket now and apply for the bereavement discount within 90 days. He did. The airline refused the refund. A different page on the same website had the correct policy: bereavement fares don't apply after travel is completed.

Air Canada's defense was remarkable. The airline argued that its chatbot was, in effect, a separate legal entity responsible for its own actions. The British Columbia Civil Resolution Tribunal didn't buy it. The chatbot is part of Air Canada's website. Air Canada is responsible for all the information on its website. The airline owed Moffatt a duty of care and breached it by failing to ensure its chatbot gave accurate information. Damages: C$650.88 plus interest and fees.

The amount was trivial. The signal was not. This was a tribunal decision, not an appellate ruling, but the tribunal rejected Air Canada's attempt to distance itself from the chatbot, found negligent misrepresentation, and held the airline responsible. A company cannot outsource accountability to its own software.

## The question everyone is avoiding

When I talk to engineering leaders building agent systems, the conversation almost always follows the same arc. They are excited about what the agent can do. They are thoughtful about reliability and failure modes. But when I ask "when this agent makes a bad decision, who in your organization is accountable?", the room gets quiet.

It is not that they don't care. It is that the question cuts across too many boundaries. The model provider trained the base model. The platform team wrote the system prompt. The data team owns the retrieval pipeline. The product team defined the use case and the tool permissions. The compliance team reviewed the risk assessment, if there was one. When the agent hallucinates a refund policy, or recommends the wrong medication dosage, or rejects a qualified job applicant, who owns the postmortem?

In traditional distributed systems, we solved a version of this problem years ago. Service ownership. Every service has an on-call team. Every alert has a runbook. Every incident has a postmortem with named owners. Agent systems have inherited none of this discipline. Most organizations deploying agents today could not answer, under legal discovery, who approved the agent's access to a particular tool, who last reviewed the system prompt, or what version of the retrieval index was live when the failure occurred.

## The "AI did it" defense is dead

Courts are not waiting for the industry to figure this out. The legal trajectory is already clear, and it points in one direction: the deploying organization is responsible.

Moffatt v. Air Canada was the opening signal. In July 2024, Judge Rita Lin in the Northern District of California allowed Mobley v. Workday to proceed on the theory that an AI vendor could be held directly liable as an "agent" of the employer, while rejecting the separate argument that Workday qualified as an "employment agency." The plaintiff applied for over 100 jobs through Workday's platform and was rejected every time. Workday argued its software simply implemented the criteria employers set. The court disagreed, finding that Workday's AI was not merely applying rote criteria but actively participating in the decision about which candidates to advance. By May 2025, the court granted preliminary collective certification of the ADEA claim for notice-stage purposes, a procedural milestone, not a merits finding that the system was discriminatory. But the scale told the story: in its own filings, Workday stated that 1.1 billion applications had been rejected using its tools. The potential class could include hundreds of millions of people.

Then California removed one of the cleanest autonomy-based defenses. AB 316, effective January 1, 2026, bars a defendant who developed, modified, or used an AI system from asserting that the AI autonomously caused the harm. It does not create strict liability, and it does not eliminate defenses around causation, foreseeability, or comparative fault. But the argument that "the AI did it, not us" is no longer available in California courts.

The EU is moving in the same direction. The revised Product Liability Directive explicitly treats software, including AI systems, as products subject to no-fault defective-product liability. Member states must bring it into national law by December 9, 2026, and the directive applies to products placed on the market or put into service after that date.

The legal direction is increasingly clear, even if the doctrine is still developing. The operational question is nowhere close.

## The traceability problem

Here is what makes agent accountability harder than traditional software accountability: the decision path is opaque by design.

In a conventional application, a bad outcome can be traced to a code path. You can read the logic, reproduce the inputs, and identify the bug. In an agent system, the "logic" is a probabilistic model interpreting a natural-language prompt, retrieving context from an embedding index, reasoning over that context, and selecting a tool to call, sometimes chaining several tools in sequence. Each step introduces ambiguity. The model might have weighted a stale document too heavily. The retrieval might have surfaced a policy from 2019 instead of 2024. The tool might have returned a result the model misinterpreted.

OWASP's Top 10 for Agentic Applications, published in December 2025 with input from over 100 experts, names Cascading Failures as a top risk. Their description of the problem maps directly to the accountability gap: when failures propagate across agent steps, each step amplifies the previous error while obscuring its origin.

If you cannot reconstruct the decision chain, you cannot assign accountability. And most organizations deploying agents today cannot reconstruct the decision chain. They don't log the full prompt at inference time. They don't version the retrieval index. They don't record which tools were called, with what parameters, and what they returned. When something goes wrong, the forensic trail is either incomplete or nonexistent.

## What ownership actually looks like

In distributed systems, we don't ask "who is responsible for this outage?" in the abstract. We decompose the system into components with clear owners and trace the failure through the dependency graph.

Agent systems need the same decomposition. When I say ownership, I mean something concrete: a named person or team who can be paged at 2 a.m., who has the authority and context to investigate, and who is accountable for the component's behavior over time.

At minimum, you need ownership for the model layer (who approved this model version, who validated its behavior against your use case), the prompt and orchestration layer (who wrote and last reviewed the system prompt, who defined the reasoning chain), the data and retrieval layer (who owns the index, what is the freshness SLA, who is responsible when the retrieval surfaces stale or contradictory information), and the tool access layer (who granted the agent access to this API, what are the blast radius constraints, who reviews permission changes).

Most organizations I talk to have none of this formalized. The model provider is a vendor contract. The prompt lives in a config file nobody owns. The retrieval index updates on a cron job. The tool permissions were set during a sprint six months ago and haven't been audited since.

## Incident response for agents

When a traditional service causes an incident, the process is well understood. Detect, triage, mitigate, postmortem. Each phase has owners and SLAs. The postmortem produces action items with deadlines.

Agent incidents need the same rigor, but the triage is harder. You are not looking for a stack trace. You are reconstructing a reasoning chain. That means you need structured logging at every decision point: the full prompt sent to the model (including system prompt and retrieved context), the model's response, the tool calls made and the responses received, and the final output delivered to the user or downstream system. All of this needs to be versioned and queryable after the fact.

The organizations doing this well treat agent traces the way financial services treat trade records. Immutable, timestamped, and retained long enough to satisfy regulatory inquiry. The organizations doing it poorly have a Slack thread and a vague memory of what the prompt used to say.

## The governance gap

OWASP's agentic framework names two design principles that map directly to the accountability problem: Least-Agency and Strong Observability. An agent should operate with the minimum autonomy and access required for its task. And everything it does should be visible, traceable, and attributable.

Singapore's IMDA Model AI Governance Framework for Agentic AI, launched in January 2026, adds a related concept: Meaningful Human Control. Not rubber-stamp approval. Not a human glancing at outputs. The framework emphasizes meaningful human oversight, significant approval checkpoints, chains of accountability, the capacity to intervene, and logging and tracing for debugging and audit.

These are not abstract aspirations. They are engineering requirements. You either build the infrastructure to support them or you accept that when something goes wrong, your incident response will consist of shrugging and hoping nobody sues.

---

*Previously: [Guardrails are not safety](/blog/guardrails-are-not-safety/). Next: why your agent system drifts from day one, and what to do about it.*

---

## Selected References

**Moffatt v. Air Canada**, 2024 BCCRT 149 ([decision](https://www.canlii.org/en/bc/bccrt/doc/2024/2024bccrt149/2024bccrt149.html))
Air Canada chatbot bereavement fare case. For an accessible summary, see the [CanLII Blog discussion](https://www.canlii.org/en/commentary/doc/2025CanLIIDocs1963).

**Mobley v. Workday, Inc.** — [July 12, 2024 order](https://casetext.com/case/mobley-v-workday-inc-1)
The order allowing the case to proceed on an agency theory while rejecting the employment-agency theory.

**Mobley v. Workday, Inc.** — [May 16, 2025 order granting preliminary collective certification](https://law.justia.com/cases/federal/district-courts/california/candce/3:2023cv00770/413498/175/)
The order granting preliminary collective certification under the ADEA.

**California AB 316**, [Artificial intelligence: defenses](https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240AB316)
California statute barring defendants from arguing that AI autonomously caused the harm, while preserving other defenses such as causation or foreseeability.

**Directive (EU) 2024/2853**, [Product Liability Directive](https://eur-lex.europa.eu/eli/dir/2024/2853/oj)
Official EU text covering defective products, including software in scope, with transposition by December 9, 2026 and application to products placed on the market or put into service after that date.

**OWASP Top 10 for Agentic Applications for 2026** ([framework](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/))
OWASP's agentic risk framework, published December 9, 2025, developed with input from more than 100 experts.

**Singapore Model AI Governance Framework for Agentic AI** ([framework](https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2026/singapore-launches-model-ai-governance-framework-for-agentic-ai)) · [IMDA launch announcement](https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2026/singapore-launches-model-ai-governance-framework-for-agentic-ai)
Official Singapore framework and launch note emphasizing responsible deployment and human accountability.
