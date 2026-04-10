# EU AI Act Risk Classification Tool — UX Specification

**Version:** 1.0  
**Date:** April 2026  
**Schema reference:** `eu-ai-act-classification-schema-final.md`  
**Target audience:** Beginner developers and product teams with no regulatory background  
**Platform:** Web (responsive, mobile-friendly)

---

## 1. Design Principles

**Guided, not interrogative.** The tool walks the user through a decision tree, not a form dump. Each screen has a single purpose, one primary question, and a clear "why we're asking" explanation.

**Progressive disclosure.** Show only what the user needs at each step. Sub-questions appear conditionally. Legal article references are hidden behind a toggle. Helper text is always visible (not tooltips — beginners don't hover).

**Early exits are reassuring, not abrupt.** When the tool determines a result early (e.g., "out of scope" at Step 1), it explains why in plain language and offers a "start over" option.

**No false precision.** When the tool cannot determine classification with confidence, it says so and recommends legal counsel. It never presents an ambiguous result as definitive.

---

## 2. Information Architecture

### Screen flow

The tool uses the 9-step decision flow defined in the schema (Steps 0-8). Each step maps to one screen or screen group. Conditional steps are skipped entirely when not applicable — the user never sees a screen that says "this doesn't apply to you."

```
Landing page
  → Step 0: AI system gate
  → Step 1: Scope gate
  → Step 2: Prohibited practices
  → Step 3: Annex I product safety
  → Step 4: Annex III domain picker (Tier 1)
    → Step 4b: Annex III sub-use-cases (Tier 2, per domain)
  → Step 5: Art. 6(3) exception test
  → Step 6: Art. 50 transparency check
  → Step 7: GPAI model track
  → Step 8: Timing overlay
  → Result screen
    → Post-classification obligations section
```

### Screen skip logic

| Condition | Screens skipped |
|---|---|
| `is_ai_system == false` | All. Jump to result: `not_ai_system` |
| Any scope exclusion triggered | Steps 2-8. Jump to result: `out_of_scope` |
| Any Art. 5 prohibition triggered (no exception) | Steps 3-8. Jump to result: `prohibited` |
| `is_safety_component_or_product == false` | Step 3 exits after first field |
| No Annex III domains selected | Step 5 skipped |
| `annex_iii_match == true` AND exception fails | Step 6 still shown (Art. 50 applies to high-risk too) |
| `assessment_target == system_only` | Step 7 exits after first field |
| Classification is `minimal_risk` AND `free_open_source == true` | Result shows open-source exclusion note |

---

## 3. Screen-by-Screen Specification

### 3.0 Landing Page

**Purpose:** Set expectations, build trust, establish scope.

**Content:**
- Headline: "Is your AI system high-risk under the EU AI Act?"
- Subhead: "Answer a few questions about your system. We'll tell you where it falls under Regulation 2024/1689 and what that means for you."
- Estimated time: "Takes 3-8 minutes depending on your system"
- Trust statement: "This tool does not store your answers. It provides a preliminary assessment only and does not constitute legal advice."
- Single CTA button: "Start assessment"

**Visual treatment:**
- Clean, minimal layout
- EU AI Act regulation reference in monospace as a credibility signal
- No illustration or decorative imagery — this is a professional tool, not a marketing page

---

### 3.1 Step 0 — AI System Gate

**Screen title:** "Let's start with a basic question"  
**Primary question:** "Does your software learn from data or inputs to generate outputs like predictions, recommendations, decisions, or content — rather than following only hand-written rules?"  
**Schema reference:** `is_ai_system` field in Step 0

**Layout:**
- Question text (large, readable)
- "Why we ask" block below the question: "The EU AI Act only applies to 'AI systems' as defined in Article 3(1). Software that follows only hand-coded if/then rules with no learned component may not qualify."
- Three options as large tappable cards:
  - **Yes** — "It uses machine learning, neural networks, or statistical methods"
  - **No** — "It only follows hand-coded rules"
  - **I'm not sure** — "I need help determining this"
- "Continue" button (disabled until selection made)

**Interaction:**
- "No" → Result screen: `not_ai_system` with explanation
- "I'm not sure" → Show inline helper: "If your system uses any of these: machine learning, deep learning, natural language processing, computer vision, reinforcement learning, or statistical pattern recognition, the answer is almost certainly Yes. If you're still unsure, consult your engineering team or proceed with Yes to be safe."
- "Yes" → Next step

**Legal reference toggle:** Hidden by default. When expanded: "Article 3(1): 'AI system' means a machine-based system that is designed to operate with varying levels of autonomy..."

---

### 3.2 Step 1 — Scope Gate

**Screen title:** "Does the EU AI Act apply to you?"  
**Schema reference:** All fields in Step 1 (`eu_nexus` through `free_open_source`)

**Layout:** Sequential yes/no questions with early exit. Each question appears one at a time. If any exclusion triggers, the flow stops and shows the result immediately.

**Question sequence and exit behaviour:**

1. **EU nexus** — "Will this AI system be placed on the market, put into service, or have its outputs used within the EU or EEA?"
   - Helper: "This includes: selling or licensing the system to EU customers, deploying it for EU-based users, or even running it outside the EU if the outputs affect people in the EU."
   - `No` → exit: `out_of_scope`

2. **Military/defence** — "Is this system developed or used exclusively for military, defence, or national security purposes?"
   - Helper: "The keyword is 'exclusively.' If the system has any civilian application, this exclusion does not apply."
   - `Yes` → exit: `out_of_scope`

3. **Third-country public authority** — "Is this system used exclusively by a foreign government under an international cooperation agreement with the EU?"
   - Helper: "This is a narrow exclusion for non-EU governments operating under specific treaties with the EU for law enforcement or judicial cooperation."
   - `Yes` → exit: `out_of_scope`

4. **Scientific R&D only** — "Is this system used solely for scientific research and will never be deployed to real users?"
   - Helper: "If the system might eventually be placed on the market or put into service, this exclusion does not apply. 'Research only' means it stays in the lab."
   - `Yes` → exit: `out_of_scope`

5. **Pre-market testing** — "Is this system only being tested internally and not exposed to real people outside your development team?"
   - Helper: "Testing within a controlled environment with no impact on real people is excluded. Once you run a pilot with real users, this exclusion no longer applies."
   - `Yes` → exit: `out_of_scope`

6. **Personal/non-professional** — "Is this system used by an individual purely for personal, non-professional activity?"
   - Helper: "If you're a hobbyist running AI for personal projects with no commercial or professional use, you're not a deployer under the Act."
   - `Yes` → exit: `out_of_scope`

7. **Open source** — "Is this an open-source AI system released under a free and open-source licence?"
   - Helper: "Open-source AI has a conditional exclusion. We'll flag this and check whether it applies after we determine your risk level. Being open-source does NOT automatically exempt you from the Act."
   - `Yes` → flag, continue (do not exit)
   - `No` → continue

**Early exit screen design:**
When any exclusion triggers, show:
- Green checkmark icon
- "Based on your answer, the EU AI Act likely does not apply to this system."
- Reason: "[Specific exclusion cited]"
- Legal reference (collapsed): "Article 2(X)..."
- Caveat: "This is a preliminary assessment. If your circumstances change (e.g., you start serving EU users), reassess."
- "Start over" button

---

### 3.3 Step 2 — Prohibited Practices

**Screen title:** "Let's check if any of these practices are banned"  
**Schema reference:** All fields in Step 2

**Design approach:** This is the most sensitive step. The user may discover their system is illegal. The tone must be informative, not accusatory.

**Layout:** Present all 8 prohibited practices as expandable cards. Each card shows:
- Practice name (bold)
- One-sentence plain-language description
- "Learn more" expandable section with:
  - Detailed explanation
  - Concrete examples of what counts and what doesn't
  - Exception details (if any)
  - Legal reference

**Card states:**
- Default: collapsed, neutral border
- Expanded: shows detail
- "Yes, this applies": red highlight with exception sub-questions (if applicable)
- "No": green checkmark, card collapses

**Practice cards (8 total):**

1. **Manipulative or deceptive AI**
   - Summary: "AI that uses subliminal or deceptive techniques to distort someone's behaviour and cause harm"
   - Example YES: "A shopping app that uses subliminal visual cues to push compulsive purchases"
   - Example NO: "A recommendation engine that suggests products based on browsing history"

2. **Exploiting vulnerabilities**
   - Summary: "AI that targets someone's age, disability, or economic hardship to manipulate their behaviour"
   - Example YES: "An AI toy that encourages dangerous behaviour in children"
   - Example NO: "An accessibility tool that adapts interfaces for users with disabilities"

3. **Social scoring**
   - Summary: "AI that rates people based on their social behaviour and penalises them in unrelated areas of life"
   - Example YES: "A system that denies housing based on social media activity"
   - Example NO: "A credit scoring system based on financial data (this may be high-risk, but not prohibited)"

4. **Criminal prediction from profiling**
   - Summary: "AI that predicts someone will commit a crime based only on who they are, not what they've done"
   - Has exception: "Assessments based on objective, verifiable facts linked to criminal activity are permitted"
   - Sub-question if Yes: "Is the assessment based on objective, verifiable facts directly linked to criminal activity?"

5. **Untargeted facial scraping**
   - Summary: "AI that builds facial recognition databases by mass-scraping photos from the internet or CCTV"
   - No exceptions

6. **Emotion recognition at work or school**
   - Summary: "AI that reads people's emotions in workplaces or educational settings"
   - Has exception: "Allowed only for medical or safety reasons"
   - Sub-question if Yes: "Is it used solely for medical or safety reasons?"

7. **Biometric categorisation of protected traits**
   - Summary: "AI that uses biometric data to infer someone's race, political opinions, religion, sexual orientation, etc."
   - Has exception: "Labelling/filtering of lawfully acquired biometric datasets, or law enforcement categorisation"

8. **Real-time biometric identification by police in public spaces**
   - Summary: "Live facial recognition in publicly accessible spaces for law enforcement"
   - Has three narrow exceptions (nested sub-questions):
     - Targeted search for specific crime victims
     - Preventing imminent terrorist threat
     - Locating suspects of serious crimes (requires judicial authorisation)

**Exit behaviour:**
- If ANY practice is flagged "Yes" with no applicable exception → result: `prohibited`
- Result screen tone: factual, not alarming. "Based on your answers, this system appears to involve a practice prohibited under Article 5 of the EU AI Act. These prohibitions have been enforceable since 2 February 2025."
- Include: "What to do next" section recommending legal review

---

### 3.4 Step 3 — Annex I Product Safety

**Screen title:** "Is your AI part of a regulated product?"  
**Schema reference:** Step 3 fields

**Layout:** Three sequential questions, each appearing only if the previous answer is "Yes."

**Q1:** "Is your AI system a safety component of a physical product, or is it the product itself?"
- Helper visual: show examples as icon + label pairs:
  - Medical device with AI diagnostics
  - Vehicle with AI braking system
  - Industrial machine with AI safety monitoring
- `No` → skip to Step 4
- `Yes` → show Q2

**Q2:** "Select the EU product-safety law that covers your product"
- Dropdown/searchable list of 17 Annex I categories (from schema)
- Each option shows the regulation number in smaller text
- "I don't know" option → show helper: "Check with your product compliance or regulatory team. If your product carries a CE marking, it's likely covered by one of these laws."
- `None / I don't know` → skip to Step 4

**Q3:** "Does that law require your product to undergo assessment by a third-party notified body before it can be sold in the EU?"
- Helper: "Not all regulated products need third-party assessment. Some can self-certify. Your product compliance team will know."
- `Yes` → classification: `high_risk_annex_i` (continue to Step 6 for Art. 50 check)
- `No` → skip to Step 4
- `I'm not sure` → flag: "We recommend consulting your product compliance team. For now, we'll continue the assessment for other risk triggers."

---

### 3.5 Step 4 — Annex III Domain Picker

**Screen title:** "What is your AI system used for?"  
**Schema reference:** Step 4, Tier 1 and Tier 2

**Tier 1 layout:** 8 domain cards in a 2-column grid (mobile: single column). Each card shows:
- Icon (simple, not decorative)
- Domain name
- One-sentence description in beginner language
- "You're probably here if..." trigger examples

Cards are multi-select (checkbox-style). User selects all that apply, then continues.

**Tier 2 layout:** For each selected domain, show a dedicated sub-screen with specific sub-use-cases as checkboxes. Each sub-use-case includes:
- Plain-language description
- Cross-reference warnings where applicable (e.g., "If this involves inferring protected traits from biometrics, it may be prohibited — check your Step 2 answers")
- Exception fields where applicable (financial fraud, travel documents, campaign logistics)

**Sub-use-case cross-references (surface in UI):**
- `bio_categorisation` → "Note: if this infers race, religion, or sexual orientation from biometrics, it may be prohibited under Art. 5(1)(g), not just high-risk"
- `bio_emotion_recognition` → "Note: emotion recognition in workplaces or education may be prohibited under Art. 5(1)(f)"
- `le_reoffending` → "Note: if risk assessment is based solely on profiling without objective facts, it may be prohibited under Art. 5(1)(d)"

**No domains selected:** Show reassuring message: "Your system doesn't appear to fall into any Annex III domain. Let's check a few more things." → Skip to Step 6.

---

### 3.6 Step 5 — Article 6(3) Exception Test

**Screen title:** "Your system matches an Annex III use case — but it might not be high-risk"  
**Schema reference:** Step 5 fields  
**Conditional:** Only shown if any Annex III sub-use-case was selected

**Layout:** Sequential questions with clear logic explanation.

**Opening explainer:** "The EU AI Act has a safety valve. Even if your system falls under Annex III, it's NOT considered high-risk if it meets ALL of these conditions. Let's check."

**Q1 (blocker question — shown first, prominently):**
"Does your system perform profiling — automatically processing personal data to evaluate, analyse, or predict things about people?"
- Helper: "Examples of profiling: building user profiles for ad targeting, scoring job candidates, predicting customer churn based on behaviour patterns, assessing creditworthiness"
- `Yes` → show explanation: "Because your system profiles people, the exception does not apply. Your system is high-risk." → `high_risk_annex_iii`
- `No` → continue

**Q2:** "Could this system pose a significant risk of harm to people's health, safety, or fundamental rights?"
- Helper: "Think about worst-case scenarios. If the system makes a mistake or is misused, could someone lose a job, be denied benefits, face discrimination, or be physically harmed?"
- `Yes` → exception blocked

**Q3:** "Does this system's output materially influence decisions about people — meaning a human decision-maker relies on or routinely follows the AI's output?"
- Helper: "If a human always makes the final decision but practically always agrees with the AI, the influence is material. If the AI output is one of many minor inputs and the human frequently overrides it, it may not be material."
- `Yes` → exception blocked

**Q4 (only if Q2 and Q3 are both No):**
"Which of the following best describes what your system does?"
- Option A: "It only performs a narrow mechanical task (format conversion, deduplication, data structuring)"
- Option B: "It only improves a result that a human already fully completed (spell-check, reformatting)"
- Option C: "It only flags patterns in past human decisions so humans can self-correct — it doesn't change those decisions"
- Option D: "It only prepares materials for a later human assessment (gathering files, organising data)"
- Option E: "None of the above"
- Single select. A-D → exception may apply. E → exception does not apply.

**Result logic:**
- If Q1=No AND Q2=No AND Q3=No AND Q4 in {A,B,C,D} → exception succeeds. System exits high-risk. Show: "Based on your answers, this system may qualify for the Article 6(3) exception. However, you must document this assessment before placing the system on the market and notify the relevant national authority."
- Otherwise → `high_risk_annex_iii`

---

### 3.7 Step 6 — Transparency Check (Article 50)

**Screen title:** "Does your system need to tell people it's AI?"  
**Schema reference:** Step 6 fields

**Design note:** This step is shown regardless of prior classification. Even high-risk systems have Art. 50 transparency obligations. For high-risk systems, frame it as "in addition to your high-risk obligations..."

**Layout:** 5 yes/no questions with conditional exception sub-questions. Each question has a one-line helper.

1. "Does the system interact directly with people where it might not be obvious they're talking to AI?" (chatbots, voice assistants, avatars)
2. "Does the system generate synthetic audio, images, video, or text?" (content generation)
   - If Yes → "Is the manipulation limited to standard editing like brightness or cropping?"
3. "Does the system detect emotions or categorise people biometrically?" (outside high-risk/prohibited contexts)
4. "Does the system create deep fakes — content that looks like a real person/place/event but is AI-generated?"
5. "Does the system generate text published as news or public-interest content?"
   - If Yes → "Has a human editor reviewed the text and taken editorial responsibility?"

---

### 3.8 Step 7 — GPAI Model Track

**Screen title:** "One more thing: are you also assessing a foundation model?"  
**Schema reference:** Step 7 fields

**Opening context:** "The EU AI Act treats AI systems (applications) and GPAI models (foundation models like GPT, Claude, Gemini, Llama) as separate categories. If you're only deploying an application built on someone else's model, you can skip this section."

**Q1:** "Are you assessing..."
- "Only an AI system / application" → skip, `model_result = none`
- "Only a GPAI model (foundation model)" → continue
- "Both" → continue

**Q2:** "Is this model a general-purpose AI model — capable of performing many different tasks across many applications?"
- Helper: "Most large language models, multimodal models, and large image generators qualify. A narrow model trained for one specific task (e.g., a fraud classifier) does not."

**Q3:** "Are you the provider placing this model on the EU market?"
- Helper: "If you're using someone else's model via API, you are not the GPAI provider. But your upstream provider has GPAI obligations."

**Q4:** "Was the model trained with more than 10²⁵ FLOPs?"
- Options: Yes / No / I don't know
- Helper: "For reference, GPT-4-class models are believed to exceed this threshold. Your ML engineering team or model card should have this information."

**Q5 (conditional):** "Has the European Commission designated this model as having systemic risk?"
**Q6 (conditional):** "Has the Commission accepted a rebuttal of the systemic risk designation?"

---

### 3.9 Step 8 — Timing Overlay

**Screen title:** "When do these rules apply?"  
**Schema reference:** Step 8 fields

**Layout:** A visual timeline showing the Act's enforcement milestones (from schema Section 4 timing table), with the user's applicable deadline highlighted.

**Questions (2-3, conditional on classification):**
- "Was this system already on the market before [relevant date]?"
- "Has it undergone a significant design change since then?"
- (If high-risk + public authority): "Will this system be used by a government body?"

---

### 3.10 Result Screen

**Purpose:** Present classification clearly, explain what it means, and give actionable next steps.

**Layout structure:**

```
┌────────────────────────────────────────────────┐
│  CLASSIFICATION BADGE                          │
│  [icon] High-Risk AI System — Annex III        │
│  (colour-coded: red for prohibited,            │
│   orange for high-risk, yellow for             │
│   transparency, green for minimal)             │
├────────────────────────────────────────────────┤
│  PLAIN-LANGUAGE SUMMARY                        │
│  2-3 sentences explaining what this means      │
│  in beginner terms                             │
├────────────────────────────────────────────────┤
│  TRIGGERING REASONS                            │
│  • Annex III, point 4(a): Recruitment          │
│    and candidate evaluation                    │
│  • (list all matched sub-use-cases)            │
├────────────────────────────────────────────────┤
│  GPAI MODEL RESULT (if applicable)             │
│  [icon] GPAI model / GPAI with systemic risk   │
├────────────────────────────────────────────────┤
│  COMPLIANCE DEADLINE                           │
│  [timeline visual with highlighted date]       │
├────────────────────────────────────────────────┤
│  WHAT THIS MEANS FOR YOU                       │
│  (post-classification obligations section)     │
│  → Key obligations listed                      │
│  → Provider vs. deployer distinction           │
│  → GDPR note if applicable                     │
├────────────────────────────────────────────────┤
│  CONFIDENCE INDICATOR                          │
│  [clear match / likely match / ambiguous]      │
│  + recommendation for legal review             │
├────────────────────────────────────────────────┤
│  ACTIONS                                       │
│  [Download PDF report]                         │
│  [Start over]                                  │
│  [Learn more at LatentMesh]                    │
└────────────────────────────────────────────────┘
```

**Confidence indicator logic:**
- **Clear match:** All answers were definitive yes/no, no "unsure" responses, classification maps cleanly to a single result
- **Likely match:** One or more "unsure" answers, but the classification is still deterministic based on other answers
- **Ambiguous — consult legal counsel:** Multiple "unsure" answers, or the system sits on the boundary of an Art. 6(3) exception, or Annex I conformity assessment requirement is unclear

**PDF report:** Generate a downloadable one-page summary containing: system name (if provided), classification result, all triggering reasons with article references, exception test results, compliance deadline, and the disclaimer that this is not legal advice.

---

## 4. Component Library

### 4.1 Question Card

Used for every individual question across all steps.

```
┌─────────────────────────────────────────┐
│  Question text                     [?]  │ ← legal ref toggle
│                                         │
│  Why we ask: helper text in muted       │
│  colour, always visible                 │
│                                         │
│  [Option A]  [Option B]  [Option C]     │ ← tappable cards or buttons
│                                         │
│  ▸ Show examples                        │ ← expandable
│  ▸ Show legal reference                 │ ← expandable
└─────────────────────────────────────────┘
```

### 4.2 Domain Card (Step 4 Tier 1)

```
┌─────────────────────────────────────────┐
│  [□] Domain icon                        │
│                                         │
│  Domain name (bold)                     │
│  One-sentence description               │
│                                         │
│  You're probably here if:               │
│  • example trigger 1                    │
│  • example trigger 2                    │
└─────────────────────────────────────────┘
```

Selected state: checkbox filled, border highlight, subtle background colour change.

### 4.3 Prohibited Practice Card (Step 2)

```
┌─────────────────────────────────────────┐
│  ⚠ Practice name (bold)                │
│  One-sentence summary                   │
│                                         │
│  ▸ What counts / what doesn't           │
│  ▸ Exceptions (if any)                  │
│                                         │
│  Does this apply?   [Yes]  [No]         │
│                                         │
│  (if Yes + exceptions exist):           │
│  ┌─ Exception sub-question ──────────┐  │
│  │  [Yes]  [No]                      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 4.4 Progress Indicator

Horizontal stepper with numbered circles and connecting line. Labels: AI check → Scope → Prohibited → Product → Use case → Exception → Transparency → GPAI → Timeline → Result

- Completed steps: filled circle, dark colour
- Current step: filled circle, accent colour, slightly larger
- Future steps: hollow circle, muted
- Skipped steps: not shown (stepper adapts to actual path taken)

### 4.5 Early Exit Screen

```
┌─────────────────────────────────────────┐
│                                         │
│  [large icon: checkmark or stop sign]   │
│                                         │
│  Result headline                        │
│  Explanation paragraph                  │
│                                         │
│  Legal reference (collapsed)            │
│  Caveat text in muted colour            │
│                                         │
│  [Start over]     [Download summary]    │
└─────────────────────────────────────────┘
```

---

## 5. Interaction Patterns

### 5.1 Legal Reference Toggle

Every screen has a "Show legal references" toggle in the top-right corner of the question area. Default: OFF. When ON, article numbers appear inline next to each question and option. Persists across screens (user's preference is remembered for the session).

### 5.2 Back Navigation

Users can navigate back to any completed step via the progress indicator or a "Back" button. Answers are preserved. Changing an earlier answer triggers re-evaluation of all downstream steps. If a changed answer makes a previously answered step irrelevant (e.g., changing scope to "out of scope"), downstream answers are cleared with a confirmation: "Changing this answer will reset your responses from [Step X] onward."

### 5.3 "I'm Not Sure" Handling

Available on selected questions (marked in schema as `yes_no_unsure`). Behaviour:
1. Show inline helper text with guidance on how to find the answer
2. If the user proceeds with "unsure," the tool continues but flags the uncertainty
3. Result screen shows "Likely match" or "Ambiguous" confidence instead of "Clear match"
4. PDF report notes which questions were answered "unsure"

### 5.4 Cross-Reference Warnings

When a Tier 2 sub-use-case overlaps with a prohibited practice (e.g., biometric categorisation of protected traits), show an inline warning banner:

```
⚠ This use case may be prohibited under Article 5, not just high-risk.
Review your Step 2 answers to confirm.  [Review Step 2]
```

### 5.5 Session Persistence

Answers are held in browser memory (React state) for the duration of the session. No localStorage, no server-side storage, no cookies. If the user closes the tab, answers are lost. The PDF download is the persistence mechanism.

---

## 6. Content Guidelines

### Voice and tone

- Direct and factual, never condescending
- Explain concepts as if the reader is smart but has never read the regulation
- Avoid legal jargon in primary question text; use it only in expandable legal reference sections
- Never use "simple," "just," or "easy" when describing compliance obligations
- Acknowledge complexity honestly: "This is a genuinely difficult question. If you're unsure, consult your legal team."

### Terminology mapping

| Legal term | Beginner term used in UI | When to show legal term |
|---|---|---|
| Provider | "The company that built the AI system" | Legal reference toggle |
| Deployer | "The company that uses/deploys the AI system" | Legal reference toggle |
| Placing on the market | "Making available for use in the EU" | Legal reference toggle |
| Putting into service | "Deploying for real users" | Legal reference toggle |
| Notified body | "Third-party assessor" | Legal reference toggle |
| Conformity assessment | "Compliance assessment / certification process" | Legal reference toggle |
| Natural person | "A person / individual" | Always use beginner term |
| Profiling | Explain inline: "automatically processing personal data to evaluate or predict things about people" | Always explain |
| Intended purpose | "What the system is designed and marketed to do" | Legal reference toggle |

### Error states

- No field should feel like a trap. If a user selects "Yes" on a prohibited practice, don't flash red. Show the result calmly with an explanation.
- If the tool cannot reach a classification (all "unsure" answers), show: "We don't have enough information to classify your system. Here's what we recommend you clarify with your team: [list of unresolved questions]."

---

## 7. Accessibility Requirements

- All interactive elements keyboard-navigable
- WCAG 2.1 AA minimum contrast ratios
- Screen-reader-friendly: all icons have alt text, all expandable sections use proper ARIA attributes
- No information conveyed by colour alone (colour-coded badges also have text labels and icons)
- Focus management: when a conditional sub-question appears, focus moves to it
- Reduced motion: respect `prefers-reduced-motion` for any animations

---

## 8. Analytics Events (Optional)

Track these events to understand where users drop off and which classifications are most common:

| Event | Data |
|---|---|
| `assessment_started` | timestamp |
| `step_completed` | step_id, answers (anonymised) |
| `early_exit` | step_id, result |
| `exception_test_result` | passed/failed, blocker_reason |
| `assessment_completed` | system_result, model_result, confidence, duration_seconds |
| `pdf_downloaded` | system_result |
| `legal_toggle_activated` | step_id |

---

## 9. Open Questions for Design Review

1. **Multi-language support:** Should the tool support other EU languages beyond English? The Act applies across 27 member states.
2. **Save and resume:** Should we add optional email-based save/resume for users who need to consult colleagues mid-assessment? This would require server-side storage.
3. **Comparison mode:** Should users be able to assess multiple systems side by side?
4. **API version:** Should we expose the classification logic as an API for programmatic use by compliance tools?
5. **Feedback loop:** Should the result screen include a "Was this helpful? / Was this accurate?" feedback mechanism to improve the tool?
