---
title: "Mapping the EU AI Act to Engineering Evidence"
description: "The regulation tells you what to prove. It does not tell you how to build the proof. This essay maps every major obligation from the EU AI Act to a specific control, eval, and evidence artifact."
pubDate: "Apr 04 2026 18:00"
tags: ["compliance", "safety", "evidence", "agents"]
summary: "Most teams read the EU AI Act like a policy document. For engineering organizations, it is closer to a lifecycle proof obligation. Every meaningful requirement under Articles 9 through 73 maps to four things: an obligation the law requires, a control your system performs repeatedly, an eval that tests whether the control works, and an artifact you retain as proof. If you cannot point to all four, you do not have an operational compliance program. You have intent. This essay walks through provider obligations (risk management, data governance, technical documentation, logging, transparency, human oversight, accuracy and robustness), deployer obligations, and post-market monitoring. It includes a quick-reference mapping table, five evidence infrastructure rails, and a crosswalk with NIST AI RMF and ISO 42001."
summaryProblem: "The regulation specifies what to prove but not how to build the proof."
summaryCoreIdea: "Each obligation under Articles 9 through 73 needs a control, an eval, and a retained artifact to be operational."
summaryTakeaway: "A mapping table from every major EU AI Act obligation to a practical control, eval, and evidence artifact."
---

*The regulation tells you what to prove. It does not tell you how to build the proof.*

---

In July 2025, researchers at Noma Security submitted a customer inquiry through Salesforce's standard Web-to-Lead form. The form has a description field that accepts up to 42,000 characters. They used that space to hide a set of instructions for Agentforce, Salesforce's autonomous AI agent platform. The instructions told the agent to gather CRM data and send it to an external server. When an employee later asked Agentforce to review the submission, the agent did exactly what the hidden instructions said. It pulled customer emails, lead details, and internal records, then transmitted them to an attacker-controlled domain. The domain had cost five dollars to register. Salesforce's own Content Security Policy had whitelisted it years earlier and never removed it after the registration lapsed.

Noma reported the vulnerability on July 28, 2025, scoring it at 9.4 out of 10. Salesforce implemented Trusted URL enforcement for Agentforce and Einstein AI on September 8. Noma disclosed publicly on September 25.

The vulnerability is real and the response was fast. But consider what would happen if a failure of this shape occurred in a high-risk AI system covered by the EU AI Act. Patching the platform would not end the legal story. The provider would owe a serious-incident report to market surveillance authorities. The deployer would owe notice to the provider and, where applicable, to affected persons. Both would need to produce evidence that the system had been tested for this class of risk, that logging captured what happened, and that oversight mechanisms were in place. "We fixed it" would not be the whole answer.

Most teams read the EU AI Act like a policy document. That is the wrong mental model.

For engineering organizations, the Act is closer to a lifecycle proof obligation. If you build or deploy a high-risk AI system, the law is not asking whether you care about safety, fairness, oversight, or transparency. It is asking whether you can demonstrate them, systematically, before deployment and after things change in production.

The AI Act entered into force on 1 August 2024. Most rules apply from 2 August 2026. The later deadline, 2 August 2027, covers high-risk AI systems embedded in regulated products such as medical devices and machinery. Some obligations, including the prohibitions on certain AI practices and AI literacy requirements, are already in force, and the Commission is still publishing implementation guidance through 2026.

That is why most compliance programs start in the wrong place. They start with policy. The better place to start is evidence.

Every meaningful obligation should map to four things:

1. **Obligation.** What the law requires.
2. **Control.** What your system or process does repeatedly.
3. **Eval.** How you test that the control actually works.
4. **Artifact.** What you retain as proof.

If you cannot point to all four, you do not have an operational compliance program. You have intent.

## Part one: Articles 9 to 15, provider-side technical requirements

The seven core technical requirements apply to providers of high-risk AI systems. These are the obligations that demand engineering infrastructure, not just policy documents.

### Article 9: Risk management system

The Act requires a risk management system that runs continuously throughout the AI system's lifecycle. It must identify and analyze known and foreseeable risks, estimate those risks, and adopt risk management measures. Testing must ensure the system performs consistently for its intended purpose.

A risk register is table stakes, but the register alone proves nothing. The evidence is the connection between a documented risk and a working control. For each risk in the register, there should be a control that addresses it, an evaluation that tests the control, and a record of when the evaluation last ran and what it found. The risk management system is not a document. It is a loop: identify, control, evaluate, record, review.

For an AI agent handling customer service inquiries, this means documenting that the agent can hallucinate product information (risk), that there is a retrieval verification step that checks generated responses against the product database (control), that a nightly eval suite measures hallucination rates across 500 representative queries (evaluation), and that last Tuesday it ran and the hallucination rate was 2.3%, down from 3.1% the prior week (evidence).

The eval result alone is not enough. The evidence must show the connection: this risk led to this control, which is validated by this test, which produced this result.

### Article 10: Data and data governance

Training, validation, and testing datasets must be relevant, sufficiently representative, and as free of errors as possible. Data governance must cover collection processes, data preparation, labeling, and the assumptions made about what the data represents.

A model card that describes the training data at a high level is a starting point, not a finish line. The evidence is a data lineage record: where the training data came from, when it was collected, how it was filtered, what labeling methodology was used, and what biases were identified during analysis. For fine-tuned models, this includes the composition of the fine-tuning dataset and any deduplication or augmentation steps.

Most teams I talk to cannot produce this. They can tell you what model they fine-tuned and roughly what data they used. They cannot tell you how the data was filtered, what was excluded and why, or whether the distribution of the training data matches the distribution of the production workload. That gap is the difference between having data governance and being able to prove it.

### Article 11: Technical documentation

The Act requires technical documentation drawn up before the system is placed on the market, and it must be kept up to date. Annex IV specifies the contents: system architecture, data provenance, human oversight measures, validation and testing, cybersecurity, risk management, and post-market monitoring. The documentation must demonstrate that the system complies with the requirements of the Act.

Technical documentation for an AI system is not the same as a README. For agent systems with tool access, it must also describe which tools the agent can invoke, what permissions those tools require, and what boundaries limit the agent's autonomy.

The key phrase in the Act is "kept up to date." A document created at launch and never revised does not satisfy the requirement. The evidence must include version history showing when the documentation was last updated and what changed. If the model was updated, the documentation should reflect the new version. If a new tool was added to the agent's capabilities, the documentation should describe it. A serious program generates the technical file from the SDLC, not as an afterthought.

### Article 12: Record-keeping

High-risk AI systems must be designed and developed with capabilities enabling the automatic recording of events (logs) while the system is operating. The logging capabilities must be appropriate to the intended purpose of the system and must support risk identification, post-market monitoring, and operation monitoring.

This is where most organizations have the largest gap. The Act is not asking for application logs. It is asking for structured records of what the AI system did, what inputs it received, what outputs it produced, and what decisions led to action.

For agent systems, the engineering best practice is to log the events that matter for traceability: context retrieved, tools invoked, outputs produced, human interventions, overrides, stop events, and system versions. This goes beyond what the statutory text literally requires, which is logging appropriate to intended purpose. But for systems with meaningful autonomy, broad traceability is the strongest way to demonstrate that the logging obligation is met.

The ForcedLeak vulnerability illustrates why this matters. When Agentforce followed hidden instructions in that web form submission, the logs existed in Salesforce's infrastructure, not in the deployer's environment. The deployer could not independently verify what data was accessed or where it was sent. Under the Act, the provider must design the system to enable automatic logging. The deployer, under Article 26, must keep automatically generated logs to the extent those logs are under their control. Relying solely on the provider's logging infrastructure leaves the deployer unable to fulfill their own obligations.

### Article 13: Transparency and provision of information to deployers

AI systems must be designed to be sufficiently transparent to enable deployers to interpret the system's output and use it appropriately. They must be accompanied by instructions for use that include the provider's identity, the system's capabilities and limitations, performance metrics, known risks, and human oversight measures.

For agent systems, transparency means more than a user-facing disclaimer. Deployers need enough information to understand the conditions under which the system performs well and the conditions under which it does not. "This system may produce inaccurate results" is not a limitation a deployer can act on. "This system's hallucination rate on product pricing queries is 4.2% based on the most recent evaluation, and pricing responses should be verified against the product database before being sent to customers" is.

The Article does not require action-level explanation of every decision the system makes. It requires enough transparency for deployers to interpret outputs and use the system appropriately. The instructions for use, system card, operating assumptions, and release notes form the evidence package.

### Article 14: Human oversight

High-risk AI systems must be designed to be effectively overseen by natural persons during the period the system is in use. Human oversight must aim to prevent or minimize the risks to health, safety, or fundamental rights. The Act is specific about what oversight means: the persons assigned must understand the system's capabilities and limitations, be able to properly monitor its operation, be aware of the tendency for automation bias, and be able to decide not to use the system or to disregard, override, or reverse its output. The system must include, where appropriate, a stop mechanism.

Human-in-the-loop is easy to promise and hard to prove. The evidence is not a policy statement saying "humans review high-risk decisions." The evidence is a routing rule that sends decisions above a certain risk threshold to a human queue, a record of how many decisions were routed in the last month, a log of the human reviewer's action on each routed decision, and a measurement of how long the review took.

The Act does not say every multi-step agent must be pausable at every point in every deployment. But for sufficiently autonomous workflows, pause and interrupt checkpoints are the strongest engineering evidence that Article 14 oversight is real rather than ceremonial. An agent that completes a ten-step process and then shows you what it did is providing a record. An agent that pauses at step four because the action exceeds its authority boundary, and waits for a human to approve before continuing, is providing oversight.

Training records matter here. Not a slide deck about AI in general, but documented training on the specific system, its known failure modes, and the criteria for intervention. The Act explicitly requires that the persons performing oversight have the competence, training, and authority necessary for their role.

### Article 15: Accuracy, robustness, and cybersecurity

High-risk AI systems must achieve appropriate levels of accuracy, robustness, and cybersecurity. They must be resilient to errors, faults, and inconsistencies, and they must be resistant to attempts by unauthorized third parties to exploit vulnerabilities.

Accuracy is the obligation that most teams already measure, but they measure it in ways that may not be sufficient. A single accuracy number from a held-out test set does not demonstrate performance across the conditions the system will encounter in production, including edge cases, adversarial inputs, and the demographic or geographic segments that the system serves.

Robustness is where drift monitoring connects to compliance. Essay #5 covered how model behavior can change substantially without any code change. The evidence for robustness is a monitoring system that detects when performance degrades, and an alert or gate that prevents the system from continuing to operate when performance drops below the acceptable threshold.

Cybersecurity for AI systems goes beyond traditional application security. The ForcedLeak attack was not a buffer overflow or a SQL injection. It was a prompt injection that exploited the fundamental architecture of an AI agent with tool access and a whitelisted network boundary. The evidence for cybersecurity includes adversarial testing specifically designed for AI systems: prompt injection tests, data poisoning tests, model extraction tests, and jailbreak tests. These are not standard penetration tests. The evidence must show that these tests were conducted, what was found, and what mitigations were applied.

## Part two: Article 26, deployer obligations

The Act splits obligations between providers and deployers, and the distinction matters more than most teams realize.

Deployers of high-risk AI systems must use the system in accordance with the provider's instructions for use. They must monitor the system's operation based on those instructions. They must inform the provider and, where relevant, the market surveillance authority when they identify a risk. They must keep automatically generated logs to the extent those logs are under their control. And for certain use cases, including creditworthiness assessment, insurance pricing, and public-sector decision-making, deployers must carry out a fundamental rights impact assessment before putting the system into service.

The practical evidence for deployers includes: the fundamental rights impact assessment where required, DPIA linkage where GDPR applies, worker notices where applicable, operator assignment records showing who is responsible for oversight, and monitoring records showing the system was used within the conditions the provider specified.

The deployment contract between provider and deployer becomes an evidence artifact in itself. The responsibility matrix, the change-management decision points, and the incident escalation paths all need to be documented. Under Article 25, if a deployer substantially modifies a high-risk system, changes its intended purpose, or puts their own name or trademark on it, they can become the provider for legal purposes. That is not a wording detail. It is an architectural fact about ownership that engineering and legal teams must understand together.

## Part three: Articles 72 to 73, post-market monitoring and serious incidents

Post-market monitoring is not model observability. It is an obligation to actively and systematically collect, document, and analyze relevant data over the system's lifetime so the provider can evaluate continuing compliance. That is a different standard from "we watch latency and cost."

The Act requires providers to establish a post-market monitoring system proportionate to the nature and risks of the AI system. The monitoring must be based on a plan that is part of the technical documentation.

When a serious incident occurs, one that causes death, serious damage to health, serious disruption to critical infrastructure, or serious harm to fundamental rights, the provider must report it to the market surveillance authorities of the relevant member states. The timeline for reporting is within 15 days of becoming aware, with shorter windows for more severe incidents. Deployers have a parallel duty: they must inform the provider without undue delay, and if they cannot reach the provider, they must report directly to the authority.

The evidence for this section is a monitoring plan, production monitoring reports, incident classification records, incident reports filed, corrective action records, and post-market review packs. Incident tabletop exercises and drift detection tests are the evals that prove the monitoring system works before a real incident forces the question.

## Quick-reference mapping

For teams that need the summary view, this table maps each obligation area to a practical control, an eval, and an evidence artifact.

| Obligation area | Practical control | Eval | Evidence artifact |
|---|---|---|---|
| Risk management (Art. 9) | Lifecycle risk register tied to intended purpose, foreseeable misuse, residual risk, change-triggered review | Scenario testing, pre-release risk review, re-review after major changes | Hazard log, mitigation decisions, residual risk sign-off, release review record |
| Data governance (Art. 10) | Dataset lineage, selection criteria, labeling QA, representativeness review, bias and data-gap review | Data quality checks, subgroup analysis, bias testing, provenance validation | Datasheets, provenance records, labeling guidelines, bias assessment |
| Technical documentation (Art. 11) | Versioned technical file generated from the SDLC | Release gate that fails if intended purpose, architecture, metrics, risk summary, oversight design, change history are incomplete | Annex IV dossier, signed test reports, architecture description, change log |
| Record-keeping (Art. 12) | Log inputs, outputs, versions, overrides, safety events, operating context | Trace completeness tests, replay drills, retention checks | Log schema, trace packs, retention policy, retained logs |
| Transparency (Art. 13) | Deployer-facing instructions stating intended purpose, performance limits, accuracy, misuse conditions | Operator comprehension tests, workflow dry runs, failure-mode walkthroughs | Instructions for use, system card, operating assumptions, release notes |
| Human oversight (Art. 14) | Meaningful checkpoints, override paths, stop procedures, escalation routes, operator training | Simulation where humans detect bad outputs, override correctly, avoid automation bias | SOPs, training records, override logs, safe-stop procedure evidence |
| Accuracy, robustness, cybersecurity (Art. 15) | Performance thresholds, fallback behavior, red-team coverage, adversarial resilience, secure pipelines | Benchmarking, robustness under faults, poisoning/evasion tests, subgroup review | Eval reports, security test results, benchmark logs, remediation tickets |
| Quality management (Art. 17) | Written procedures for design control, verification, validation, data management, incident handling | Internal audits, release gate audits, CAPA drills, modification-control reviews | QMS manual, audit reports, accountability matrix, procedure library |
| Conformity assessment (Arts. 16, 43, 47-49) | Release approval tied to conformity workflow, declaration, CE marking, EU database registration | Mock audit before market release, checklist validation | EU declaration of conformity, registration record, CE evidence |
| Post-market monitoring and incidents (Arts. 72-73) | Production monitoring plan collecting performance and risk signals, incident classification, corrective routing | Drift detection tests, alerting drills, incident tabletop exercises | Monitoring plan, monitoring reports, incident reports, corrective action records |
| Deployer obligations (Art. 26) | Pre-deployment impact assessment, competent oversight assignment, monitoring, log retention | Harm scenario review, affected-group analysis, oversight readiness review | FRIA, DPIA linkage, worker notices, operator assignment records |
| Value chain responsibility (Art. 25) | Change-management decision point for substantial modification, repackaging, changed intended purpose | Legal and engineering sign-off on whether a change turns you into the provider | Change classification memo, responsibility matrix, contract exhibits |

## Five evidence rails

The table shows what. These are the five infrastructure layers that make it work.

**First, versioned system identity.** Model, prompt, policy, tool configuration, dataset, evaluation suite, and deployment environment need a stable release identity. Otherwise documentation decays into narrative and cannot be reconciled with what actually ran.

**Second, risk-to-test traceability.** Every material risk should map to a mitigation and every mitigation should map to an eval. If a risk has no test, it is aspirational. If a test exists with no linked risk, it is probably vanity.

**Third, human oversight proof.** Oversight is not satisfied by writing "human in the loop" in a deck. You need evidence that operators were trained, had authority, could interpret outputs, could override them, and actually did so when needed.

**Fourth, production monitoring with legal consequence.** Post-market monitoring under the Act is not model observability. It is an obligation to actively and systematically collect, document, and analyze relevant data so the provider can evaluate continuing compliance. That is a different standard from watching latency and cost.

**Fifth, change control that understands provider risk.** Under the Act, if you substantially modify a high-risk system, put your own name on it, or change its intended purpose in ways that bring it into high-risk use, you can become the provider for legal purposes. Engineering and legal teams must evaluate changes together, not in sequence.

## A note on limited-risk systems

Not every AI system falls into the high-risk category. The Act also imposes narrower transparency obligations for certain systems, including those designed to interact directly with humans, systems that generate deepfakes, and certain AI-generated content. Those obligations are not a full conformity regime, but they still need controls, evals, and retained artifacts: disclosure UX, labeling logic, and proof that the labeling actually appears in the product. Those transparency obligations apply from 2 August 2026.

## Where NIST AI RMF and ISO 42001 fit

NIST AI RMF 1.0 is the easier crosswalk. It is voluntary, and its core is organized into four functions: Govern, Map, Measure, and Manage. The cleanest way to use it alongside the AI Act is as the operating model around the law. Govern maps to accountability, quality management, and policy. Map corresponds to intended purpose, affected persons, context, and impact assessment. Measure covers bias, robustness, security, transparency, and oversight evaluations. Manage addresses release gates, mitigations, post-market monitoring, and incident response.

The NIST Generative AI Profile (AI 600-1), published in July 2024, adds suggested actions specific to generative AI risks including confabulation, data privacy, and information integrity. In practice, NIST helps you structure the program. The EU AI Act tells you which proof points actually matter in regulated scenarios.

ISO/IEC 42001 is different. It is the first international AI management system standard, published in December 2023. It is not a law and not a system-specific evidence pack. It focuses on establishing, implementing, maintaining, and continually improving an AI management system across the organization, following the familiar Plan-Do-Check-Act structure of ISO 27001 and ISO 9001. That makes it useful as the governance spine: leadership, policy, objectives, lifecycle controls, monitoring, accountability, and continual improvement. ISO 42001 includes 38 controls across 9 control objectives covering AI policies, governance, resources, impact assessment, lifecycle management, data quality, transparency, and third-party relationships.

But ISO 42001 does not replace the artifact burden of the AI Act. It helps you prove that the organization governs AI systematically. The EU AI Act still asks whether a particular system can be evidenced through documentation, testing, logging, monitoring, and deployer-facing controls.

The serious move is to stack them correctly. Use ISO 42001 to build the management system. Use NIST AI RMF to organize risk work across the lifecycle. Use the EU AI Act to decide what evidence must exist for specific systems and roles.

## The question that matters

The mistake most teams make is asking whether their model is compliant.

The better question is whether every legal duty already has an owner, a control, a test, and a retained artifact tied to the system that actually shipped.

That is what gets forwarded between engineering leaders and legal teams. Not "we have an AI policy." Not "the benchmark passed." Not "the vendor told us they handle compliance."

Here is the obligation. Here is the control. Here is the eval. Here is the evidence.

That is what a regulator can inspect. That is what legal can defend. Good engineering makes compliance possible. It does not create the evidence on its own. The teams that build the evidence infrastructure now, not because the regulation is coming but because a system that can prove what it did is a better system, are the ones that will not be scrambling in August.

---

*Next in this series: ["The incident response gap in AI systems,"](/blog/the-incident-response-gap-in-ai-systems/) a walkthrough of what happens when an AI system fails and nobody has a process for capturing what went wrong.*

---

**Selected References**

- EU AI Act (Regulation (EU) 2024/1689), Articles 9-15, 16-21, 25-26, 43, 47-49, 72-73. Entered into force 1 August 2024; high-risk obligations applicable 2 August 2026; embedded-product high-risk obligations applicable 2 August 2027.
- Noma Security, ["ForcedLeak: Exploiting Salesforce Agentforce to Exfiltrate CRM Data via Indirect Prompt Injection,"](https://noma.security/blog/forcedleak-agent-risks-exposed-in-salesforce-agentforce/) disclosed September 2025. CVSS 9.4, reported July 28, 2025. Salesforce patched September 8, 2025.
- NIST AI RMF 1.0 (NIST AI 100-1), January 2023. Four functions: Govern, Map, Measure, Manage.
- NIST AI 600-1, Generative AI Profile, July 2024. Cross-sectoral profile extending AI RMF to generative AI risks.
- ISO/IEC 42001:2023, AI Management System standard. 38 controls across 9 control objectives. Published December 2023.
- Parminder Singh, "Due Diligence is Not Due Care: The AI Compliance Gap," March 2026.
