---
title: "I Built a Free EU AI Act Compliance Checker"
description: "A schema-driven way to turn scope questions into a preliminary risk classification, triggering reasons, and a downloadable record."
pubDate: "May 04 2026 09:00"
tags: ["compliance", "practical"]
summary: "Most AI compliance work starts in the wrong place — a policy question, then a spreadsheet, then a meeting. The EU AI Compliance Checker is a guided ten-step flow that produces a preliminary risk classification under Regulation 2024/1689. It walks through scope, prohibited practices, Annex I product safety, Annex III use cases, Article 6(3) exceptions, Article 50 transparency duties, GPAI model classification, and the compliance timeline. The output is a classification, triggering reasons, and article references, downloadable as a branded PDF. It runs in the browser with no account and nothing stored on the server. A schema-driven flow makes the classification path explicit and repeatable — the only way to detect drift between assessments separated by months and a feature release."
summaryProblem: "Most teams classify AI risk once, informally, and the assessment goes stale without anyone noticing."
summaryCoreIdea: "A schema-driven classifier makes the classification path explicit, repeatable, and comparable over time."
summaryTakeaway: "Run the free EU AI Compliance Checker on a system you are building this week — no account, no storage, downloadable PDF record."
---

Most AI compliance work starts in the wrong place.

It starts with a policy question, then jumps to a spreadsheet, then becomes a meeting. By the time the team has a defensible answer, the system may already have shipped. The better starting point is a repeatable classifier.

That is why I built this tool.

The [EU AI Compliance Checker](/tools/eu-ai-compliance-checker/) is a guided ten-step flow that takes a system you are building, deploying, or procuring and produces a preliminary risk classification under Regulation 2024/1689. The flow walks through scope, prohibited practices, Annex I product safety, Annex III use cases, Article 6(3) exceptions, Article 50 transparency duties, GPAI model classification, and the compliance timeline. The output is a classification, the triggering reasons that produced it, and the relevant article references. You can download the result as a branded PDF and keep it as a record.

It runs in your browser. No account. Nothing stored on the server.

## Why repeatable matters

Most teams I talk to have done this assessment once. Usually informally, usually in a doc, usually some months ago. Then a new feature shipped, or the GPAI model underneath them got reclassified, or the deployer relationship shifted, and the original assessment quietly went stale without anyone updating it.

A spreadsheet is not a classifier. A meeting is not a classifier. Both produce an answer once and then degrade.

A schema-driven flow makes the classification path explicit and repeatable, which is the only way you can detect drift between two assessments separated by six months and a feature release. The checker is aligned with v1.4 of the risk schema, which means every triggering reason maps back to a specific clause in a specific article. Two people assessing the same system get the same classification for the same reasons. Two assessments of the same system at different points in time can be compared.

That is the property that makes a classification worth keeping.

## Why no account and nothing stored

Compliance scope information is sensitive. A team running an early classification on a candidate Annex III use case is producing exactly the kind of artifact you do not want sitting in a third party's database, especially before the team has decided what to do about the result.

So the tool keeps state in the browser session and writes nothing back. The downloadable report is generated client-side. Close the tab and the assessment is gone. If you want a record, you keep the PDF.

This is not an engineering compromise. It is the product position. A free preliminary classifier for a regulation with material penalties should not require you to hand the inputs to a vendor first.

## What it is not

A preliminary risk classifier is the front door, not the audit. It is not legal advice. It does not replace the documented assessment a provider may need to make when relying on the Article 6(3) exception path. It does not produce the technical documentation Article 11 calls for, or the post-market monitoring plan Article 72 calls for, or any of the downstream artifacts that follow once you know which risk class you are operating in.

What it does is show which classification path your answers triggered, and why. That is enough to start the next conversation correctly.

## How this fits the larger picture

LatentMesh writes about [the evidence plane for AI systems](/blog/the-evidence-plane-for-ai-systems/): the layer that connects obligations, controls, evaluations, evidence artifacts, and the response loop into a system of preserved relationships. A classification is the first object in that chain. It tells you which obligations are in scope, which is the question every downstream control, eval, and artifact has to answer to.

The checker is the smallest possible version of that idea, scoped to the EU AI Act's classification surface. The full picture is in the [AI Compliance hub](/ai-compliance/), which walks the loop from obligation through to response.

## What comes next

The next iteration extends the output beyond classification. A high-risk Annex III result, today, tells you the regime applies. The next version surfaces the specific obligations attached: Article 14 human oversight, Article 12 logging, Article 53 GPAI provider documentation and transparency duties, and Article 55 systemic-risk duties where applicable. Same shape after that: more tools, guided, schema-driven, no account, no storage, downloadable record.

Run the [EU AI Compliance Checker](/tools/eu-ai-compliance-checker/) on something you are working on this week. Then tell me which question the flow handled badly, or which article it surfaced that you had not been tracking.

---

*This is part of [LatentMesh](https://latentmesh.ai/), a body of work on AI compliance, evaluation, and governance for production systems. For the full series and companion articles in order, see the [Reading List](/reading-list/).*
