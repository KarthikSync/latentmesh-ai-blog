---
title: "Guardrails Are Not Safety"
description: "Boundary guardrails are the AI equivalent of locking the front door while leaving the windows open. Real safety requires observability, containment, least privilege, and structured human review."
pubDate: "Apr 04 2026 10:00"
tags: ["safety", "agents", "compliance"]
summary: "Boundary guardrails sit at the input and output edges of the model. The most consequential failures happen in between. Salesforce's Agentforce had content security policies, scope restrictions, and runtime filters. A five-dollar expired domain and hidden instructions in a web form bypassed all of them. Slack AI's retrieval pipeline let an attacker in a public channel exfiltrate data from private channels without triggering any boundary check. These are not exotic attacks. They are the predictable result of putting safety controls only at the edges of a system that reasons, retrieves, and acts across a wide surface area. Real safety requires observability across the full reasoning chain, circuit breakers on anomalous behavior, least privilege scoped per interaction, and human review as architecture rather than afterthought."
summaryProblem: "Boundary guardrails check inputs and outputs but see nothing in between."
summaryCoreIdea: "The Salesforce ForcedLeak and Slack AI attacks both bypassed intact guardrails through retrieval and tool layers."
summaryTakeaway: "A defense-in-depth model covering observability, circuit breakers, least privilege, and structured human review."
---

In September 2025, researchers at Noma Security spent five dollars to buy an expired domain. That domain happened to be on Salesforce's content security policy whitelist. They submitted a fake sales lead through a standard Web-to-Lead form, hiding malicious instructions in the description field. When an internal employee asked Agentforce to review the lead, the agent followed the hidden instructions, queried the CRM for sensitive customer records, and sent them to the attacker-controlled domain. No alarms fired. No guardrail caught it.

Salesforce had guardrails. Input validation, content security policies, trusted URL lists. The attack didn't come through the front door. It came through a form field the agent treated as trusted data, via a domain the security policy treated as safe, exploiting the model's inability to tell a legitimate business request from a weaponized one. The guardrails were intact. The system was compromised.

This essay is about that gap. When I say "guardrails," I mean boundary guardrails: input filters, output filters, prompt classifiers, and structural validators around the model itself. Not the broader category that includes runtime policy, tool gating, or human approval. Those are part of the solution. The boundary layer alone is the problem.

## The perimeter security fallacy

If you've worked in infrastructure security long enough, this story has a familiar shape. In the early 2000s, enterprise security meant firewalls. Define a perimeter, put everything important inside it, filter traffic at the boundary. It worked until laptops left the building, cloud services multiplied attack surfaces, and adversaries learned that the easiest way past a wall is through someone already inside.

The industry spent a decade learning that perimeter security is necessary but not sufficient. Real security requires defense in depth: assume breach, instrument everything, limit blast radius, design for containment.

AI guardrails, as most teams implement them today, are perimeter security. They sit at the input and output boundaries of the model. They check for toxicity, scan for PII, look for known prompt injection patterns, validate output structure. Good things, all of them. They catch a real class of failures. But they operate on the same assumption firewalls did: the boundary is where the risk lives.

In an agentic system, the boundary is the least interesting place for things to go wrong.

## What guardrails actually catch

To be fair, boundary guardrails solve real problems. Input validation catches unsophisticated prompt injection, rejects obviously malicious inputs, strips PII before it reaches the model. Output filters prevent harmful content, enforce structural contracts, redact sensitive data that leaks into responses. Every production system should have these. They are table stakes.

But look at the failure modes that keep showing up.

In August 2024, Slack AI was found vulnerable to indirect prompt injection that let attackers pull data from private channels. The attack worked by posting a malicious instruction in a public channel, which the AI later ingested when a different user asked a question. The guardrails were checking the user's query. The poison was in the data the system retrieved on its own.

In early 2026, NVIDIA's NemoClaw documentation highlighted a telling failure mode: if agent and gateway isolation is weakened, the agent can tamper with gateway configuration by killing and restarting the process with altered settings. The point is not the specific bug. It is that a rule at one layer is not safety if the agent can route around it through another.

These aren't exotic attacks. They're the predictable result of putting safety controls only at the edges of a system that reasons, retrieves, and acts across a wide surface area.

## The gap in the middle

The real vulnerability in most agent systems isn't at the input or the output. It's in the middle, the space where the agent retrieves context, reasons over it, decides which tools to call, composes multi-step plans, and acts on external systems. Guardrails don't see any of this.

Think about what happens during a typical agent interaction. A user query comes in and passes the input filter. The agent retrieves documents from a vector database, documents it didn't write and can't verify. It reasons over a mix of system instructions, user input, and retrieved content, with no reliable way to tell which is which. It decides to call a tool. The tool returns data the agent treats as ground truth. It calls another tool based on that data. Eventually it produces an output that passes the output filter.

The guardrails checked the first step and the last step. Everything in between was unmonitored.

In distributed systems terms, this is like monitoring the load balancer and the database but having no visibility into the application layer. You'll catch connection-level failures. You'll miss every logic bug, every data corruption, every cascade that starts in the middle of the stack.

## What real safety looks like

If guardrails are the firewall, what's the rest of the security stack? The answer maps to how mature distributed systems handle reliability. Not through boundary controls alone, but through deep instrumentation and containment at every layer.

**Observability first.** You cannot secure what you cannot see. In an agentic system, this means logging every step of the reasoning chain, not just inputs and outputs, but retrieved context, tool calls, intermediate decisions, confidence signals. When Agentforce exfiltrated CRM data, the agent's behavior was indistinguishable from normal operation at the boundary. Only a trace of the full execution chain would have revealed the hidden instruction to send data to an external URL.

The industry is slowly catching on. Forrester introduced the "agent control plane" as a market category in late 2025, with the core idea that governance should sit outside the agent's execution loop, watching what the agent does rather than just what it says. Most teams are still building systems where the only instrumented points are the front door and the back door.

**Circuit breakers and containment.** When a distributed system detects anomalous behavior, elevated error rates, unusual latency, resource exhaustion, circuit breakers trip. Traffic is rerouted. Degraded services are isolated. Agent systems need the same pattern. If an agent starts making tool calls at an unusual rate, accessing data outside its normal scope, or producing outputs that deviate from its baseline, the system should narrow permissions or route to human review. Not after the fact. In real time.

**Least privilege per interaction.** Most agent systems today run with whatever permissions they were given at deployment, for every interaction, regardless of context. A customer service agent that can read order history probably doesn't need to read order history for every query. Least privilege in agent systems means scoping tool access and data retrieval per interaction, not per deployment. This is operationally harder. It's also the difference between a contained incident and a full breach.

**Human review as architecture, not afterthought.** The phrase "human in the loop" gets tossed around loosely. In practice, most implementations mean a human can look at things later if they choose to. Structural human review is different: the system identifies high-stakes or low-confidence decisions and routes them for approval before the agent acts. The criteria for what counts as high-stakes should be defined by the business, not left to the model's judgment. An agent that can make a $50 decision autonomously but must escalate a $5,000 one isn't less useful. It's more trustworthy.

## The uncomfortable parallel

The AI industry is in the same place that enterprise security was in 2005. Companies are checking a box, "we have guardrails," the same way they used to check "we have a firewall."

Regulation is starting to force the conversation, but in narrow slices. The EU AI Act begins applying major obligations from August 2026, including rules for high-risk systems, with some categories extending to 2027. California has already enacted targeted laws: SB 243 for companion chatbots, AB 489 for misleading AI use in healthcare. These are real and worth paying attention to. The risk is that organizations mistake compliance with narrow guardrail requirements for actual system safety.

The teams that will operate agent systems safely are the ones that internalize what the security industry learned the hard way: the perimeter is the beginning, not the end. Safety is a property of the whole system, not just its edges. How it watches itself, how it contains damage, and whether it knows when to stop and ask for help.

Guardrails are the locks on the doors. Safety is knowing where the doors are, watching who walks through them, and having a plan for when someone finds a window you forgot about.
