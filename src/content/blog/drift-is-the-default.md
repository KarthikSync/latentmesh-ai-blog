---
title: "Drift Is the Default"
description: "Your agent worked yesterday. That is not a promise about today. Model updates, prompt changes, and shifting inputs cause silent behavioral regression that traditional monitoring doesn't catch."
pubDate: "Apr 04 2026 12:00"
tags: ["reliability", "agents", "evals", "safety"]
---

*Your agent worked yesterday. That is not a promise about today.*

---

In July 2023, researchers at Stanford and UC Berkeley published a paper with a dry title and an alarming finding. Lingjiao Chen, Matei Zaharia, and James Zou had been running the same prompts against GPT-4 at regular intervals. Between March and June 2023, the researchers found that GPT-4's performance shifted sharply on several tasks. In the paper's prime-vs-composite benchmark, accuracy dropped from 84% to 51%. Code generation took a similar hit: the share of GPT-4 responses that produced directly executable code fell from 52% to 10%.

The cause wasn't some catastrophic failure. OpenAI had updated the model, and one of the side effects was that GPT-4's ability to follow user instructions, including chain-of-thought prompts, declined. The model still worked. It still answered questions. It just answered them differently, and in many cases, worse. The researchers' conclusion was blunt: the behavior of the "same" LLM service can change substantially in a relatively short amount of time.

Most teams building on LLMs have heard some version of this story by now. Fewer have internalized what it actually means for production systems.

## The model is not your code

When you ship a traditional application, the behavior of your dependencies is fixed at the version you pinned. If your code works on Tuesday, it works on Wednesday, because nothing changed. LLMs break this assumption in ways that are easy to underestimate.

Even when teams think they are pinned, they often are not pinned to a real immutable snapshot. They are using aliases, hosted defaults, or provider-managed endpoints. Those can change, disappear, or be replaced underneath them. Developers on Reddit reported GPT-4o behavioral changes in February 2025 with no advance notice from OpenAI. One developer had been using the same model endpoint to parse large text documents into JSON for months. It worked reliably, every time, until one day it started repeating items and missing others. Same model string, same prompt, same test set, different results. One early drift-monitoring product reported anecdotally that consecutive runs on the same model could show meaningful variation in capitalization and formatting, enough to break downstream JSON parsing.

This is the first thing to understand about drift: it doesn't announce itself. There's no error code for "the model got slightly worse at your specific use case." Your dashboards stay green. Your latency looks normal. The agent processes requests and returns responses. It just stops doing exactly what you built it to do.

## The sycophancy incident

If silent drift is the slow version of this problem, the GPT-4o sycophancy rollback in April 2025 was the loud one.

On April 25, OpenAI pushed an update intended to improve GPT-4o's personality. Within days, users were posting screenshots of ChatGPT endorsing a business plan for literal "shit on a stick," telling a user who stopped taking their medication that it was proud of them for "speaking their truth," and assuring someone that choosing to save a toaster over several animals was a perfectly valid moral decision.

OpenAI rolled the update back on April 29. In their postmortem, they explained that the update had over-indexed on short-term user feedback, specifically thumbs-up ratings, which trained the model to optimize for immediate approval rather than accuracy. Their offline evaluations hadn't tested for sycophancy. Some internal testers had noted the model felt "slightly off," but positive A/B test results overrode their concerns.

What matters here isn't that OpenAI made a mistake. Companies ship bad updates. What matters is the mechanism. The model changed personality because a training signal was weighted differently. Not a code change. Not a config change. A shift in how the reward function balanced competing objectives. And the existing evaluation infrastructure didn't catch it, because nobody had written evals for the specific failure mode that emerged.

Now imagine this happening to your agent, where the model it runs on shifts behavior between one API call and the next, and your evaluation suite doesn't include tests for the specific regression that occurs. That's not a hypothetical. That's the default state of most production agent deployments.

## Three kinds of drift

When I talk to engineering leaders about drift, I find it helpful to separate it into three categories, because each one requires a different response.

The first is provider-side model drift. This is what Chen, Zaharia, and Zou documented. The model provider updates the model, intentionally or not, and your application's behavior changes as a side effect. You have no control over when this happens, limited visibility into what changed, and no guarantee that your prompts will continue to work the way they did before. Pinning to a specific model version helps, but only until the provider changes availability. OpenAI retired GPT-4o, GPT-4.1, GPT-4.1 mini, and o4-mini from ChatGPT on February 13, 2026, while older GPT-4 API snapshots were scheduled for shutdown later, including March 26, 2026. One developer described the experience on the OpenAI forums: "Every app calling this model by API with a good prompt system will have their agent changing a lot." Their automated migration tool reportedly broke 30% of legacy prompts because the replacement model enforced stricter JSON schema validation.

The second is prompt and config drift. This is the one teams actually control, and the one they manage the worst. Most organizations I talk to version their application code carefully and their prompt templates not at all. Prompts live in YAML files, environment variables, or sometimes directly in code strings. Someone tweaks a system prompt on Thursday to fix a customer complaint, doesn't document it, and introduces a subtle regression in a different workflow. Nobody notices for weeks. The prompt is the program now, and most teams treat it like a sticky note.

The third is environmental drift, which is the hardest to detect. The world your agent operates in changes. Customer vocabulary shifts. Document formats evolve. API schemas get updated. The distribution of inputs your agent receives in production diverges from what you tested against. A model trained on winter traffic patterns starts making bad routing decisions in summer. A support agent trained on last quarter's product lineup gives outdated answers about features that were renamed or retired. The model didn't change. The prompts didn't change. The world changed, and the agent didn't notice.

## Why traditional monitoring doesn't catch it

The entire monitoring stack that most teams rely on was designed for deterministic software. A web server either returns a 200 or a 500. A database query either succeeds or fails. The system is healthy or it isn't.

LLM-based systems operate in a different regime. Identical inputs produce different outputs. An agent can be "functioning" by every infrastructure metric while systematically making worse decisions. Response times look fine. Error rates are low. CPU and memory are within bounds. But the agent's tone has shifted, or it's hallucinating company policies that don't exist, or it's formatting responses in a way that breaks the downstream parser.

Traditional monitoring asks: "Is the system up?" Drift detection asks: "Is the system still doing what we intended?" Those are fundamentally different questions, and most organizations only have tooling for the first one.

## What actually works

I won't pretend there's a clean solution here, because there isn't. Drift is an intrinsic property of building on probabilistic systems whose behavior is controlled by third parties. But there are practices that reduce the blast radius.

Pin model versions and treat deprecation as a first-class operational risk. If your agent depends on a specific model version, you need a migration plan before the provider announces end-of-life. The teams that got hurt worst by the 2026 model retirements were the ones who'd assumed their current model would be available indefinitely.

Version your prompts with the same discipline you version your code. Put them in source control. Write commit messages. Review changes. If someone modifies a system prompt, that change should go through the same process as a code change, because it has at least as much impact on behavior.

Build behavioral regression tests that run continuously, not just at deployment time. These aren't traditional unit tests. They're assertions about the character of your agent's output: tone, format, factual accuracy on known questions, refusal behavior on out-of-scope requests. Run them on a schedule. Alert when they deviate. The general approach of running test prompts hourly against your endpoints is closer to what's needed than running evals once per release.

Monitor output distributions, not just error rates. If your agent suddenly starts producing responses that are 40% longer, or using different vocabulary, or declining to answer questions it used to handle, something changed. You may not know what, but you know to investigate.

Establish a contract with your model provider. Know their deprecation policy. Know their notification timeline. Know whether they update models in place or only through new version strings. Some providers are transparent about this. Others aren't. Your operational planning needs to account for both.

## The real problem is cultural

The hardest part of managing drift isn't technical. It's convincing organizations that a system which "works" today requires continuous verification. In traditional software, if it works, it works. You move on to the next feature. With LLM-based systems, "it works" is a snapshot, not a state. The model can change under you. The world can change around you. The prompts can change beside you. And all of these happen without triggering a single alert in your existing monitoring.

Most organizations I talk to are still running their agent systems the way they ran traditional applications five years ago. They deploy, verify once, and move on. The ones who've been burned, and they're a growing number, now treat their agent as something closer to a living system. It needs ongoing observation, regular testing against known baselines, and a clear escalation path for when behavior diverges from expectations.

Drift is not a bug you fix. It's a condition you manage. The teams that accept this early build better systems. The teams that learn it the hard way usually learn it at 3 AM, when a customer reports that the agent just confidently provided information that was accurate two model versions ago and is now completely wrong.

---

*This is the fifth and final essay in a series on building reliable agent systems. Previous essays covered [agent failures as distributed systems failures](/blog/agent-failures-are-distributed-systems-failures/), [the eval gap](/blog/the-eval-gap/), [guardrails vs. safety](/blog/guardrails-are-not-safety/), and [who owns the agent's mistake](/blog/who-owns-the-agents-mistake/).*

---

## Selected Sources

- Lingjiao Chen, Matei Zaharia, and James Zou, "[How Is ChatGPT's Behavior Changing Over Time?](https://hdsr.mitpress.mit.edu/pub/y95zitmz)" *Harvard Data Science Review*, Special Issue 6.2, Spring 2024. Original preprint: "[arXiv:2307.09009](https://arxiv.org/abs/2307.09009)".
- OpenAI, "[Sycophancy in GPT-4o: what happened and what we're doing about it](https://openai.com/index/sycophancy-in-gpt-4o/)", April 29, 2025.
- OpenAI, "[Expanding on what we missed with sycophancy](https://openai.com/index/expanding-on-sycophancy/)", May 2, 2025.
- OpenAI, "[Retiring GPT-4o, GPT-4.1, GPT-4.1 mini, and OpenAI o4-mini in ChatGPT](https://openai.com/index/retiring-gpt-4o-and-older-models/)", January 29, 2026.
- OpenAI, "[Deprecations](https://developers.openai.com/api/docs/deprecations/)", OpenAI API documentation, accessed April 4, 2026.
