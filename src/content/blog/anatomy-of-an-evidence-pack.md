---
title: "Anatomy of an Evidence Pack"
description: "Your system passed the eval. Can you prove it? An evidence pack is a structured, continuously generated collection of artifacts — traces, eval results, approvals, config snapshots, and incident records — that proves your AI system did what you said it would do."
pubDate: "Apr 04 2026 16:00"
tags: ["compliance", "evidence", "agents"]
summary: "OpenAI split a monolithic service into microservices and missed a single Kafka environment variable. For three months, enterprise customers had gaps in their audit logs. Some fields, including who performed each action, could not be recovered. OpenAI's advice to affected customers: use your own internal logs as a secondary source. The vendor told its enterprise customers to maintain their own compliance evidence. An evidence pack is not a folder assembled before an audit. It is five categories of artifacts generated continuously: traces showing what the system did, eval results showing it met its specification, approval records showing who authorized changes, configuration snapshots showing what was running, and incident records showing what went wrong. Each artifact links to the others. Integrity requires append-only storage and independent timestamps."
summaryProblem: "OpenAI lost three months of enterprise audit logs from a single missing environment variable."
summaryCoreIdea: "Vendor logs are not your compliance evidence, and reconstructing evidence after the fact costs months."
summaryTakeaway: "Five artifact categories with integrity requirements that make documentation into evidence."
---

In November 2025, OpenAI split a monolithic internal service into smaller microservices. During the migration, an engineer missed a single environment variable, a Kafka configuration that told one of the new services where to publish audit log events. The service started handling API requests. It stopped recording them. For three months, enterprise customers using OpenAI's API had gaps in their audit logs, and nobody at OpenAI noticed. The company's own monitoring had a separate, unrelated issue that prevented it from catching the drop in log volume. A customer finally reported the problem in February 2026. When OpenAI tried to backfill the missing data, they discovered that some fields, including the identity of who performed each action, could not be recovered. The underlying data simply was not stored anywhere else.

OpenAI's postmortem was straightforward about what happened: the logs were gone, some of them permanently. Their advice to affected customers was equally direct. Use your own internal identity and change-management logs as a secondary source for investigations spanning this period.

That sentence is the entire argument for this essay. The vendor told its enterprise customers: we lost your compliance evidence, and you should have had your own copy.

## The audit trail is not someone else's problem

Most organizations building on LLMs treat logging as a feature of the platform they are using. OpenAI has audit logs. Azure has audit logs. AWS has CloudTrail. The assumption is that the platform handles evidence collection, and the team building the application can focus on building the application.

This assumption fails in at least three ways. First, platform logs capture platform events, not application-level decisions. They record that an API call was made, not why your agent chose to escalate a customer complaint to a human reviewer, or why it decided not to. Second, platform logs are subject to the platform's own operational failures, as OpenAI demonstrated. Third, and most importantly, the compliance obligation belongs to you, not to your vendor. When a regulator asks for evidence that your AI system operated correctly during a given period, pointing at a vendor's status page is not a defensible answer.

Around the same time, Australia's New South Wales Reconstruction Authority was dealing with a different kind of evidence failure. Between March 12 and 15, 2025, a former contractor uploaded an Excel spreadsheet with over 12,000 rows of personal and health data from the Northern Rivers Resilient Homes Program to ChatGPT, a tool not authorized for government use. The breach was not disclosed publicly until October 2025, more than six months later. Public disclosures described the spreadsheet upload and the ensuing forensic investigation, but did not provide a complete interaction-level record of what was submitted to or returned by the tool. The investigation took months. The authority ultimately confirmed 2,031 people were affected.

OpenAI lost three months of enterprise audit logs because of a missing environment variable. A government contractor fed thousands of rows of personal data into a public AI tool with no way to reconstruct what happened afterward. If your compliance strategy depends on someone else's logs being complete and reliable, this is the part where you reconsider.

## What goes into an evidence pack

An evidence pack is not a folder of documents you assemble before an audit. It is a structured, continuously generated collection of artifacts that proves your AI system did what you said it would do.

The concept is not new. Anyone who has been through a SOC 2 audit or an ISO 27001 certification knows the rhythm: state a control, prove the control operates, show the evidence. What is new is that AI systems generate a different kind of evidence than traditional software. A web application either authenticates a user or it does not. An AI agent that summarizes legal documents and routes them for human review generates decisions that are probabilistic, context-dependent, and non-deterministic. The evidence has to account for that.

An evidence pack for an AI system contains five categories of artifacts, and each one answers a different question an auditor or regulator will ask.

## 1. Traces: what did the system actually do?

A trace is a record of a single execution of your AI system, from input to output, including every intermediate step. For a retrieval-augmented generation pipeline, that means the user's query, the documents retrieved, the prompt constructed from those documents, the model's response, and any post-processing applied. For an agentic system with tool use, it also means the tools invoked, the parameters passed, the results returned, and the decision context, tool-selection metadata, and structured rationale captured for each tool call.

The trace must be complete enough that someone who was not present can reconstruct the full decision path. The EU AI Act's Article 12 requires high-risk systems to generate automatic event logs throughout their lifecycle. Under the current text, those obligations apply from August 2026 for stand-alone high-risk systems, though both the European Parliament and the Council have backed an omnibus amendment that would delay those dates to December 2027 and August 2028 respectively. The amendment is not yet final. Regardless of which deadline holds, what regulators will ask for is the same. Not a summary of what the system generally does. A record of what it actually did, for a specific input, at a specific time, with a specific model version.

Most observability tools capture something that looks like a trace. Few capture one that is complete enough to satisfy the question: can you show me exactly why the system produced this output for this user at this time? The gap is usually in the retrieval context (which documents were selected and which were not), the system prompt (which may change between deployments), and the model version (which may change without anyone on the team knowing, as we covered in essay five).

## 2. Eval results: does the system still meet its specification?

An evidence pack includes the results of every evaluation run against your system, with the date, the eval suite version, the model version, the dataset used, and the pass/fail outcome for each test case. This is not a dashboard metric. It is a dated, versioned, reproducible record that proves your system met its performance criteria at a specific point in time.

The distinction matters because dashboards show current state. Evidence packs show history. If your agent's accuracy on a classification task was 94% on January 15, 93% on February 1, and 91% on March 1, and an incident occurred on March 3, the auditor wants to see that trajectory. They want to know whether anyone noticed the decline, whether a threshold existed that should have triggered an alert, and whether anyone acted on it.

Eval results without timestamps, version numbers, and configuration hashes are anecdotes. Eval results with them are evidence.

## 3. Approval records: who authorized this to run?

Every deployment of your AI system, and every change to its configuration, should have a recorded approval. This includes the obvious ones: a new model version, a modified system prompt, a change to the retrieval index. It also includes the less obvious ones: a change to the guardrail thresholds, an update to the tool permissions, a modification to the escalation rules.

The approval record does not need to be complex. It needs to be immutable. Who approved it, when they approved it, what they approved, and what the system looked like before and after. If your team deploys changes through CI/CD, the deployment pipeline is already generating most of this data. The question is whether you are storing it in a form that survives the next infrastructure migration, the next vendor change, or the next reorganization of your engineering team.

The EU AI Act requires that human oversight mechanisms be documented. Article 14 specifies that high-risk systems must have interfaces that allow natural persons to understand the system's capacities and limitations, to monitor operation, and to intervene. An approval record proves that a human was in the loop before the system changed. Without it, you are asserting human oversight without evidence.

## 4. Model cards and configuration snapshots: what was the system at this point in time?

A model card is a document that describes the model in use: its version, its training data summary, its known limitations, its intended use cases, and its performance characteristics. A configuration snapshot captures the full runtime state of your system at a given moment: the model, the prompt template, the retrieval settings, the guardrail parameters, the tool definitions, the escalation rules.

Together, they answer a question that sounds simple but is surprisingly hard to answer six months after the fact: what exactly was running in production on that date?

Configuration snapshots are the evidence counterpart to the drift problem from essay five. If your system's behavior changes because a model update altered how it handles ambiguous queries, and you do not have a snapshot of the pre-update configuration, you cannot prove what changed. You cannot investigate the incident. You cannot demonstrate to a regulator that you had controls in place, because you cannot show what the controls were operating on.

## 5. Incident and response records: what went wrong, and what did you do?

When something goes wrong, the evidence pack captures the incident: what happened, when it was detected, who was notified, what action was taken, and what changed as a result. The EU AI Act's Article 73 requires providers of high-risk systems to report serious incidents to market surveillance authorities within 15 days. You cannot meet that timeline if your incident record is a Slack thread and a postmortem document written two weeks later from memory.

An incident record in an evidence pack is not a narrative. It is a structured document that links to the specific traces that show the failure, the eval results that preceded it, the configuration snapshot that was active when it occurred, and the approval record for the change that resolved it. Every artifact in the pack connects to every other artifact. That is what makes it a system, not a folder.

![How an incident pulls the evidence pack together](/images/evidence-pack-diagram.svg)

## The integrity problem

None of this evidence is worth anything if it can be altered after the fact. A log that can be edited is not a log. An eval result that can be regenerated with different parameters is not evidence. An approval record stored in a system where the approver has write access is not proof of approval.

Integrity is the property that separates documentation from evidence. It means the artifacts are stored in a way that makes tampering detectable: append-only storage, cryptographic hashes, independent timestamps, separation between the system that generates the evidence and the system that stores it. The EU AI Act does not use the word "blockchain," and you do not need one. But its retention requirements are serious. Article 18 requires providers to keep core technical and quality documentation at the disposal of national competent authorities for ten years after the system has been placed on the market. Automatically generated logs, under Article 19, must generally be kept for an appropriate period of at least six months, unless other law requires more. Either way, the records need to survive intact, and that is a long time to guarantee that nobody, including your own engineers, modified a log entry.

The practical implementation is not exotic. Write your traces and eval results to immutable storage. Generate a manifest that lists every artifact with its hash. Store the manifest separately from the artifacts. Timestamp it with an independent source. This is how financial services firms have handled audit evidence for decades. The only thing that has changed is that AI systems generate more of it, more often, with less human intervention.

## Building the pack into the pipeline

The most common failure mode I see is not that teams refuse to build evidence packs. It is that they plan to build them later, after the product ships, after the next funding round, after the compliance team hires someone to own it. The evidence pack becomes a backlog item tagged "governance" that nobody picks up because it does not ship features.

This is a mistake, and not only for compliance reasons. The same traces that satisfy an auditor are the traces that let your engineers debug a production failure at 2 AM. The same eval history that proves your system meets its specification is the eval history that tells you when it stopped meeting it. The same approval records that demonstrate human oversight are the records that tell you which change introduced the regression.

Evidence packs are not a tax on engineering. They are an operational tool that happens to also satisfy the regulator. The teams I talk to that build them early report fewer production incidents, faster root-cause analysis, and shorter time to resolution when things break. The teams that build them late, usually after an incident or an audit finding, report exactly the experience you would expect: a scramble through Slack messages, deployment logs, and the memories of engineers who may or may not still work there.

Nearly two-thirds of organizations spend at least three months per year preparing for audits, according to A-LIGN's 2025 Compliance Benchmark Report. That number tells you everything about how most companies treat evidence. They do not maintain it. They reconstruct it, at great cost, on a deadline, with incomplete source material. The organizations that maintain continuous evidence spend days on audit preparation, not months.

## What the auditor actually asks

When an auditor shows up, whether internal, external, or regulatory, they ask some version of four questions:

Can you show me what the system did? Show me the traces.

Can you show me that it works correctly? Show me the eval results.

Can you show me who approved the current configuration? Show me the approval records.

Can you show me what you did when something went wrong? Show me the incident records.

If you can answer all four, with dated and versioned artifacts that link to each other and cannot be modified after the fact, you have an evidence pack. If you cannot answer even one, you have a gap. And under the EU AI Act, depending on which obligation was breached and how a member state enforces it, that gap can carry penalties of up to 15 million euros or 3% of worldwide annual turnover.

The distance between "we think we're compliant" and "we can prove it" is exactly the distance between documentation and evidence. An evidence pack closes that gap. Not with a policy statement. Not with a framework diagram. With artifacts that a regulator can inspect, verify, and trace from obligation to control to proof.

---

*Next in this series: [Mapping the EU AI Act to engineering evidence](/blog/mapping-the-eu-ai-act-to-engineering-evidence/) will take each major obligation from the Act and map it to a specific control, eval, and evidence artifact.*

---

**Selected References**

- OpenAI, ["Issues with API Platform Audit Logs,"](https://status.openai.com/incidents/01KJXA4N2X4W8KHZFSSFH0V0Q7/write-up) incident postmortem, February 2026. Three months of dropped audit logs due to a missing Kafka environment variable during a microservice migration.
- NSW Reconstruction Authority data breach, [disclosed October 2025](https://dig.watch/updates/thousands-affected-by-ai-linked-data-breach-in-new-south-wales). Former contractor uploaded 12,000+ rows of personal and health data from the Resilient Homes Program to ChatGPT between March 12-15, 2025. Six-month delay before public disclosure. Authority later confirmed 2,031 people affected.
- EU AI Act: [Article 12](https://artificialintelligenceact.eu/article/12/) (automatic event logging, six-month minimum retention for deployers), [Article 14](https://artificialintelligenceact.eu/article/14/) (human oversight), [Article 18](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-18) (ten-year retention for core technical and quality documentation), [Article 19](https://artificialintelligenceact.eu/article/19/) (log retention), [Article 73](https://artificialintelligenceact.eu/article/73/) (serious incident reporting within 15 days), [Article 99](https://artificialintelligenceact.eu/article/99/) (penalties). Current text applies high-risk obligations from August 2026, though the [Digital Omnibus on AI](https://www.europarl.europa.eu/legislative-train/package-digital-package/file-digital-omnibus-on-ai) (backed by both Council and Parliament, not yet final) proposes delaying to December 2027 (Annex III) and August 2028 (Annex I).
- A-LIGN, [2025 Compliance Benchmark Report](https://www.a-lign.com/resources/2026-compliance-benchmark-report). Nearly two-thirds of organizations spend at least three months per year preparing for audits. 92% conduct two or more audits annually.
- [AI Incident Database](https://incidentdatabase.ai/), 108 new incident IDs logged between November 2025 and January 2026.
