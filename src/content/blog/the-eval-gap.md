---
title: "The Eval Gap: Why Your Agent Works in Staging and Breaks in Production"
description: "Your benchmarks are passing. Your agent is failing. Most evals measure isolated performance under controlled conditions while production failure comes from distribution shift, tool-chain errors, and changing reality."
pubDate: "Apr 04 2026 09:00"
tags: ["evals", "reliability", "safety"]
summary: "Benchmarks pass in staging while agents fail in production. The gap is not missing tests. It is that most evals measure isolated performance under controlled conditions, while production failure comes from distribution shift, compound tool-chain errors, and configuration drift. Klarna's AI chatbot handled 2.3 million conversations with strong volume metrics, then the company started adding human support back into the loop. Standard evals test whether the final answer matched expectations. They do not verify intermediate steps or catch the case where an agent gets the right answer for the wrong reasons. This essay argues that agent evaluation is monitoring, not testing, and describes a layered pipeline: shadow mode, intermediate-step verification, weekly case rotation from production failures, and confidence-based routing."
summaryProblem: "Evals pass in staging because they test synthetic inputs against frozen assumptions."
summaryCoreIdea: "Production failures come from distribution shift, compound tool-chain errors, and prompt configuration drift."
summaryTakeaway: "A layered eval pipeline using shadow mode, intermediate-step verification, and weekly case rotation."
---

*Your benchmarks are passing. Your agent is failing. These are not contradictory statements.*

---

In early 2024, Klarna announced that its AI chatbot could do the work of 700 customer service agents. The numbers backed it up. The system handled two-thirds of all customer inquiries, about 2.3 million conversations. Resolution times improved. Costs fell. The CEO told Bloomberg that AI could already perform the jobs humans do. Every investor memo and tech newsletter cited Klarna as proof that AI-powered customer service was a solved problem.

By mid-2025, the public narrative had shifted. Klarna began adding human support capacity back into the loop. Whether the problem was the model, the workflow design, or the complexity of real customer interactions, the lesson was the same: volume metrics can look excellent while failure accumulates in the hardest cases.

Klarna did what the industry tells you to do. They measured. They optimized. They deployed at scale. The problem is not that teams fail to evaluate agents. It is that most evals measure isolated performance under controlled conditions, while production failure comes from distribution shift, tool-chain errors, configuration drift, and changing reality. That gap between what your evals cover and what production actually looks like is where agent systems most often break.

## The testing illusion

In traditional software, there's a well-understood progression: unit tests, integration tests, staging, canary, production. Each stage gets you closer to reality. Staging doesn't perfectly replicate production, but the delta is small and mostly predictable. You know what changes between environments. DNS, load, maybe some data volume. The logic stays the same.

Agent systems break this model. The gap between staging and production isn't a delta. It's a chasm. The thing you're testing isn't deterministic logic. It's a probabilistic system that responds differently to inputs it has never seen, using tools whose behavior changes underneath it. Your synthetic data is clean, your tool APIs return well-formed responses, and your prompts get tested against examples you wrote yourself. It's circular. You're testing whether the system handles the cases you already thought of, not the cases that will actually show up.

## Distribution shift is the whole problem

If you've worked with ML systems in production, distribution shift is old news. The training data doesn't match the real data. Models degrade. You retrain. But with agents, the shift is worse than anything traditional ML teams deal with, because the input space isn't just feature vectors. It's natural language. People are messy, contradictory, and creative in ways no synthetic dataset captures.

Your eval set has 200 refund requests. They're well-formed, grammatically correct, and they describe one problem at a time. Production gives you a customer who writes three paragraphs, buries the actual request in sentence four, contradicts themselves in sentence eight, and attaches a screenshot of the wrong order. Or someone who asks for a refund and a shipping update in the same message, or asks a question your taxonomy doesn't cover at all. The agent doesn't throw an error. It does something. Usually the wrong something.

And then there's temporal shift. The product changes. The refund policy changes. The API your agent calls to look up orders starts returning a new field. Your eval suite, frozen in time, keeps passing. The agent, operating against reality, keeps drifting.

## Compound errors in tool-call chains

Here's where agent evals diverge most from traditional ML evals. A classifier makes one prediction. An agent makes a chain of decisions, and each decision conditions the next.

Say your agent handles a billing inquiry. Step one: extract the customer ID from the message. Step two: call the billing API. Step three: interpret the response. Step four: decide what action to take. Step five: draft a reply.

If step one extracts a slightly wrong customer ID—maybe it grabs an order number instead—every subsequent step operates on bad data. The billing API returns someone else's record. The agent interprets it, finds no matching complaint, and tells the customer their account looks fine. End to end, the chain executed flawlessly. Every step did exactly what it was supposed to do, given its input. The output is still wrong.

Standard evals test the chain holistically: did the final answer match the expected answer? When it doesn't, you know the chain failed. You don't know where. When it does match, you assume the chain worked. You don't verify the intermediate steps. An agent that gets the right answer for the wrong reasons will eventually get the wrong answer too. The next input, slightly different, will expose the fragile reasoning and the chain will collapse.

## Prompt sensitivity and the butterfly effect

Agents are more sensitive to prompt variations than most teams realize. Small changes in phrasing—reordering instructions, changing a word, adding a line break—can shift behavior in ways that evals don't catch because the evals use the same prompt version.

Consider an agent that correctly routes support tickets 91% of the time with one system prompt. Someone adds a sentence clarifying edge case handling. Routing accuracy drops to 78%. The new sentence didn't introduce a bug. It shifted the model's attention. It started over-indexing on the edge case and misclassifying straightforward tickets.

The problem compounds when you version prompts independently from evals. Team A updates the prompt on Tuesday. Team B runs the eval suite on Thursday, but against the old prompt version because nobody updated the test config. The eval passes. The production agent, running the new prompt, is already misbehaving.

This is configuration drift. Distributed systems engineers know it well. The deployed state diverges from the tested state, and nobody notices until something breaks loudly enough.

## What a real eval pipeline looks like

So what actually works? Not a single eval suite. A layered system that mirrors the layered failure modes.

Start with offline evals, but treat them the way you'd treat unit tests. They catch regressions. They don't tell you the system works in production. They verify isolated behavior, not system behavior.

The real equivalent of staging is shadow mode. Run the agent against production traffic in parallel with whatever handles it today, without letting the agent's output reach the customer. Compare. The distribution shift shows up immediately. Cases your synthetic data never covered appear on day one.

Most teams check whether the agent produced the right final answer. That's not enough. You need to verify intermediate steps: did it extract the right entity, call the right API, interpret the response correctly, choose the right action? Log every step with enough context to reconstruct the reasoning. When a chain fails and you can't tell which link broke, you're flying blind.

Your eval set should change every week. Every production failure generates a new eval case. If the agent mishandled a message because the customer wrote in a way your eval set didn't anticipate, that message goes into the set. This is the feedback loop that keeps evals converging toward production reality instead of fossilizing around the assumptions you had at launch.

And when the agent isn't confident, don't let it guess. Route to a human. Then measure: how often does routing happen, and what do the routed cases look like? If routing is climbing, the distribution shifted. If routed cases cluster around a pattern, you've found a gap in your prompts or tools.

## The eval is not the product

There's a cultural problem here too. Teams treat eval scores like deployment gates. Green means go. The score becomes the goal instead of the signal.

This is what happened at Klarna. The dashboard metrics all pointed up and to the right. Nobody was tracking the metric that would have told them the product was degrading on the interactions that actually determined whether customers stayed.

The eval is a model of reality. Like all models, it's wrong. If your eval suite hasn't changed in a month but your product has, it's not useful anymore. If it doesn't include cases from actual production failures, it was never useful.

## The mental model

Agent evaluation is monitoring. Not testing. Testing assumes a stable system where you can verify behavior against a specification. Agents do not behave with the same stability teams expect from traditional software, and the specification is implicit in the prompts, which change. Monitoring assumes a running system that you observe, measure, and adjust continuously.

The teams that run agents well in production treat evals the way SREs treat observability. Not as a gate you pass once, but as an ongoing practice. They measure in production. They sample outputs. They review failures. They update their eval sets weekly. They track metrics like confidence distribution, routing rate, and intermediate step accuracy alongside the headline number.

Your eval suite passing does not prove your agent is reliable. It proves your agent performs on the cases your eval suite knows how to see.

Klarna's public arc suggests as much. The company didn't fix the problem by chasing a better benchmark. They started routing complex cases back to humans, and by most accounts, the experience improved. The headline metrics barely changed. What changed was what they chose to measure.
