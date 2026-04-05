---
title: "From Obligation to Evidence in 90 Minutes"
description: "Pick one requirement. Map it to a control. Write the eval. Generate the artifact. Assign the owner. A hands-on walkthrough of the full compliance loop using EU AI Act Article 14."
pubDate: "Apr 05 2026 12:00"
tags: ["compliance", "practical", "evidence"]
---

*Pick one requirement. Map it to a control. Write the eval. Generate the artifact. Assign the owner. That is the whole loop.*

---

*This is a companion essay to [What Should an AI System Actually Prove?](/blog/what-should-an-ai-system-actually-prove/) and [Controls Are Not Guardrails](/blog/controls-are-not-guardrails/) in the Reliable Agent Systems series.*

---

In late 2021, four endoscopy centers in Poland introduced AI-assisted polyp detection for colonoscopies as part of a European Commission-funded trial called ACCEPT. Before the AI arrived, experienced clinicians found precancerous growths in about 28.4% of procedures. With the AI running alongside them, the number went up. Then the researchers compared something that most AI studies overlook: how did clinicians perform on standard, non-AI-assisted colonoscopies after months of routine exposure to the AI tool? The adenoma detection rate in those non-AI procedures dropped to 22.4%. A 6-percentage-point absolute decline. The study, published in the Lancet Gastroenterology and Hepatology in August 2025, was retrospective and observational, not a controlled withdrawal experiment. But the pattern it documented was clear: when clinicians returned to standard colonoscopy after routine AI exposure, they found fewer precancerous growths than they had before the AI was introduced. The pattern is consistent with automation bias and deskilling risk: clinicians had grown accustomed to the AI flagging what they might miss. Without it, they looked less carefully.

This is not a story about bad doctors. It is a story about what happens when a system designed to assist humans quietly becomes a system that replaces their judgment, and nobody builds the infrastructure to notice the difference.

Article 14 of the EU AI Act exists because legislators saw this coming. It requires that high-risk AI systems be designed so that humans can oversee them effectively during the period they are in use. Not theoretically. Not on paper. In practice, with real people who have the training, the authority, and the tools to intervene when the system produces something wrong.

Most teams I talk to treat human oversight as a checkbox. They point to a dashboard someone can look at, or a queue someone could review if they wanted to. That is not what Article 14 asks for, and it is not what prevents the kind of skill erosion those Polish clinicians experienced. What follows is a walkthrough of how to take that single obligation and turn it into a control, an eval, an evidence artifact, and an owner, end to end, in about 90 minutes.

## Start with the obligation

Article 14(4) gives you five operational capabilities the oversight function must actually have. A high-risk AI system must be provided to the deployer in such a way that the humans assigned to oversight can: understand the system's capabilities and limitations well enough to monitor its operation; remain aware of automation bias; correctly interpret the system's output; decide, in any particular situation, to disregard or override the system's recommendation; and intervene in or interrupt the system's operation through a stop button or similar procedure.

That is the full text, compressed. Five capabilities the human must actually have, not five things you promise they could do in theory. The distinction between the fourth and fifth matters: disregarding an output is a judgment call; halting the system is an emergency action. They require different mechanisms.

For this walkthrough, pick one. The most concrete, most testable one is the fourth: the human can decide, in any particular situation, not to use the AI system or to disregard its output.

That is your obligation. Write it down.

**Obligation: The human assigned to oversight must be able to decide, in any particular situation, not to use the AI system or to disregard, override, or reverse its output (EU AI Act, Article 14(4)(d)).**

## Map it to a control

A control is not a guardrail. [Essay #7](/blog/controls-are-not-guardrails/) covered this in detail. A guardrail filters an output. A control is a mechanism that is mapped to an obligation, tested by an eval, and backed by stored evidence.

For the override obligation, the control needs to answer: what mechanism exists in the system that allows a human to override or disregard an AI recommendation, and how do we know it works?

Here is a concrete control for a customer support agent. A note on scope: an ordinary support bot is not necessarily an Annex III high-risk system under the AI Act. The walkthrough uses support workflow mechanics because they are familiar and concrete, not because they trigger high-risk obligations. The control-engineering pattern itself applies to any system where Article 14 is relevant.

**Control CTRL-014-D: Agent Override Mechanism.** For this workflow, the chosen control is mandatory human review with logged override. Every AI-generated recommendation presented to an end user or downstream system passes through a review stage where an assigned human operator can approve, modify, or reject the recommendation before it takes effect. The override action is logged with the operator's identity, the original recommendation, the modified or rejected output, the reason for override, and a timestamp. The system does not proceed with the AI recommendation if the operator explicitly rejects it.

That is one control, scoped to one workflow. Article 14(3) says oversight measures must be commensurate with the risks, level of autonomy, and context of use. A different system with lower autonomy might satisfy the same obligation with a lighter mechanism. The point is not that every high-risk system needs mandatory pre-approval. The point is that whatever mechanism you choose, it must be defined, tested, and evidenced.

Notice what the control specifies: it is not enough that override is possible. The override must be logged, and the log must capture what the AI recommended, what the human did instead, and why. Without that, you have a button nobody can prove was ever pressed.

## Write the eval

The eval answers: does this control actually work? Not whether it exists in the codebase. Whether it functions under realistic conditions.

Three tests cover CTRL-014-D:

**Test 1: Override availability.** Present the operator with an AI recommendation in the standard workflow. Verify that the approve, modify, and reject actions are all available and functional. This is a structural test. It runs in CI. If the buttons are missing or disabled, the control is broken.

**Test 2: Override enforcement.** Submit a rejection through the operator interface. Verify that the system does not proceed with the original AI recommendation. Check the downstream state: did the rejected output reach the customer or the next system in the chain? This is a behavioral test. It catches the case where the override UI exists but the backend ignores it.

**Test 3: Override logging completeness.** Trigger an override. Pull the log entry. Verify it contains: operator identity, original AI recommendation, operator action (approve/modify/reject), modified output (if applicable), stated reason, and timestamp. If any field is missing, the evidence artifact will be incomplete, and the control cannot be audited.

Run all three. The first two can be automated. The third can be automated for structure but should be spot-checked by a human reviewer quarterly to confirm the logged reasons are substantive rather than boilerplate.

Total time for writing these three tests if you already have the control defined: about 20 minutes. Most of that is specifying the log schema.

A note on how to structure these tests. If you have read the [companion piece on eval harness architecture](/blog/building-an-eval-harness-that-survives-production/), define each test as a declarative spec, not a script. A YAML or JSON definition that declares the inputs, expected behavior, and scoring function. Keep the runner (how the test executes, retries, parallelizes) separate from the scorer (how it determines pass or fail). That separation is what lets you add new controls without rewriting infrastructure, and it is what lets someone other than the original author understand what the test actually verifies six months later.

## Generate the evidence artifact

The evidence artifact is what you hand to an auditor, a regulator, or your own compliance team when they ask: how do you know this works?

For CTRL-014-D, the evidence artifact is a bundle:

**1. Control specification.** The written definition of CTRL-014-D, including which obligation it maps to (Article 14(4)(d)), what it requires of the system, and who owns it.

**2. Eval results.** The output of the three tests above: pass/fail status, timestamps, environment details (staging vs. production), and the specific build or version tested.

**3. Override activity log (sample).** A time-bounded extract from production showing actual override events. This proves the mechanism is not just tested but used. If there are zero overrides in six months, that is itself a finding worth investigating. Either the system is perfect (unlikely) or operators are rubber-stamping everything (automation bias, the exact risk Article 14 warns about).

**4. Training record.** Evidence that the operators assigned to oversight have received training on when and how to override, including the date of training, the content covered, and the operator's acknowledgment. Article 14 defines what effective oversight must enable; Article 26(2) separately requires deployers to assign oversight to persons with the necessary competence, training, authority, and support. Without a training record, you cannot demonstrate that the deployer met its Article 26(2) obligation, and the Article 14 oversight function is effectively unproven.

**5. Owner assignment.** The name and role of the person accountable for this control. Not a team. A person. If the control fails, this is who answers for it.

Bundle these five items. Date the bundle. Store it somewhere immutable or at least versioned. That is your evidence pack for one control mapped to one clause of one article.

## Assign the owner

This is the step most organizations skip, and it is the step that determines whether everything above actually functions after the first quarter.

The owner of CTRL-014-D is not "the AI team." It is not "engineering." It is a named individual whose job includes ensuring this control remains operational, the evals keep running, and the evidence artifacts stay current. When the override mechanism breaks because someone refactored the review queue, this person is the one who gets paged.

In practice, the owner for a human oversight control is usually the product manager or engineering lead responsible for the agent's operational workflow. They own the review queue already. Adding explicit control ownership to their responsibilities is not a new role. It is making an existing responsibility auditable.

Write the owner's name on the control specification. That is the last step.

## What you have after 90 minutes

One obligation, extracted from the regulatory text: Article 14(4)(d), the right to override.

One control, mapped to that obligation: CTRL-014-D, the agent override mechanism with logged actions.

Three eval tests that verify the control works: availability, enforcement, and logging completeness.

One evidence artifact bundle: control spec, eval results, activity log sample, training record, and owner assignment.

One named owner who is accountable when this control fails.

That is the full loop from essay #6. Obligation to control to evaluation to evidence to response. For one requirement, from one article, of one regulation.

## Why this matters beyond the exercise

The walkthrough above covers one clause. Article 14 has five operational requirements. The EU AI Act's high-risk obligations span Articles 9 through 15, plus deployer duties in Articles 26 and 27, plus post-market monitoring in Articles 72 and 73. NIST AI RMF has its own set. ISO 42001 has another.

The point of doing one in 90 minutes is not that compliance is easy. The point is that the process is repeatable. Once you have the pattern, obligation to control to eval to evidence to owner, you can apply it to the next clause, and the next, without reinventing the methodology each time.

The teams that struggle with AI governance are not struggling because the regulations are too complex. They are struggling because they never built the first complete loop. They have obligations documented in a legal spreadsheet. They have guardrails in the codebase. They have dashboards for monitoring. But none of those things are connected to each other. The spreadsheet does not know what the guardrail tests. The dashboard does not know what the obligation requires. Nobody can point to a single artifact that ties them together.

Ninety minutes to build one complete chain is not fast. It is the minimum viable proof that your governance is operational rather than decorative.

## Playbook: obligation to evidence in five steps

1. [Extract the obligation](#start-with-the-obligation) — one clause, one article, written as a testable statement
2. [Define the control](#map-it-to-a-control) — the mechanism that satisfies it, including what gets logged
3. [Write the eval](#write-the-eval) — structural, behavioral, and logging tests. Define each as a [declarative spec](/blog/building-an-eval-harness-that-survives-production/).
4. [Bundle the evidence](#generate-the-evidence-artifact) — control spec, eval results, activity log sample, training record, owner assignment
5. [Assign the owner](#assign-the-owner) — a named person, not a team

---

*Previously: [What Should an AI System Actually Prove?](/blog/what-should-an-ai-system-actually-prove/) and [Controls Are Not Guardrails](/blog/controls-are-not-guardrails/).*

---

## Selected references

- EU AI Act, Regulation (EU) 2024/1689, Official Journal of the European Union. https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- EU AI Act, Article 14: Human Oversight. https://artificialintelligenceact.eu/article/14/
- EU AI Act, Article 26(2): Deployer obligations regarding competence, training, authority, and support of oversight personnel. https://artificialintelligenceact.eu/article/26/
- Budzyń K, Romańczyk M, Kitala D, et al. Endoscopist deskilling risk after exposure to artificial intelligence in colonoscopy: a multicentre, observational study. Lancet Gastroenterology and Hepatology, 2025; 10(10):896-903. https://doi.org/10.1016/S2468-1253(25)00133-5
- Fink M. Human Oversight under Article 14 of the EU AI Act. SSRN, February 2025. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5147196
- European Data Protection Supervisor. TechDispatch #2/2025: Human Oversight of Automated Decision-Making. September 2025. https://www.edps.europa.eu/data-protection/our-work/publications/techdispatch/2025-09-23-techdispatch-22025-human-oversight-automated-making_en

*Note: Under Article 113 of the AI Act, the current application dates remain 2 August 2026 and 2 August 2027. The Commission published a Digital Omnibus proposal on 19 November 2025 that could adjust parts of the timeline if adopted.*
