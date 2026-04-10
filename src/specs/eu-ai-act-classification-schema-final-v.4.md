# EU AI Act Risk Classification Schema — Revised Version

**Version:** 1.4 (incorporates four rounds of external legal review)  
**Scope:** Regulation (EU) 2024/1689  
**Sources merged:** LLM X output, LLM Y output, independent verification against Articles 2, 3, 5, 6, 50, 51, 111, 113 and Annexes I, III  
**Last verified:** April 2026  
**v1.1 changes:** Fixed AI system gate (Art. 3(1) alignment), personal/non-professional scope handling (Art. 2(10)), Art. 6(4) obligation description, Art. 50 concurrency model, GPAI classification/obligation separation, GPAI open-source treatment, and timing overlay precision.  
**v1.2 changes:** Fixed Art. 50(4) editorial exception to include legal persons (not just natural persons). Removed speculative model-specific example from FLOPs threshold question.  
**v1.3 changes:** Operationalized open-source exclusion as explicit post-Step-6 conversion rule (Art. 2(12)). Improved open-source helper text with Recital 103 nuances (monetisation, personal data conditions).  
**v1.4 changes:** Separated Art. 2(12) open-source test (licence-based) from GPAI open-source test (public weights/architecture). Synced Section 1 result model schema with Section 4 payload structure.

---

## 1. Result Model

The Act treats AI systems and GPAI models as separate classification tracks. A single product can carry both a system result and a model result simultaneously (e.g., a recruitment tool built on a foundation model could be `high_risk_annex_iii` + `gpai`).

```json
{
  "system_result": [
    "not_ai_system",
    "out_of_scope",
    "prohibited",
    "high_risk_annex_i",
    "high_risk_annex_iii",
    "limited_risk_transparency",
    "minimal_risk"
  ],
  "system_reasons": "array of { code, label, legal_ref, plain_explanation }",
  "article_6_3_exception": {
    "checked": "boolean",
    "applies": "boolean",
    "reason": "string",
    "provider_documentation_required": "boolean",
    "registration_required_art_49_2": "boolean"
  },
  "article_50_transparency_triggers": "array of { trigger, article, obligation } — always populated regardless of system_result",
  "model_result": [
    "none",
    "gpai",
    "gpai_systemic_risk"
  ],
  "gpai_obligation_holder": [
    "self",
    "upstream_provider",
    "unknown",
    "not_applicable"
  ],
  "gpai_open_source_exception": "boolean",
  "scope_status": [
    "in_scope",
    "excluded_under_art_2_12",
    "out_of_scope"
  ],
  "deployer_obligation_exempt": "boolean",
  "open_source": {
    "flagged": "boolean",
    "exclusion_applies": "boolean",
    "exclusion_article": "string or null"
  },
  "timing": {
    "compliance_deadline": "ISO date",
    "rules_enforceable_now": "boolean",
    "legacy_system": "boolean",
    "significant_change_detected": "boolean",
    "public_authority_deadline": "ISO date or null",
    "gpai_legacy_deadline": "ISO date or null",
    "annex_i_extended_deadline": "ISO date or null"
  },
  "confidence": [
    "clear_match",
    "likely_match",
    "ambiguous_consult_legal"
  ],
  "post_classification_notes": "array of strings"
}
```

**Design rationale (from Y, validated):** "Limited risk" and "minimal risk" are not formal statutory classes the way Annex I, Annex III, and Article 5 categories are. The Act is explicit about prohibited practices, high-risk systems, Article 50 transparency duties, and GPAI models. This schema reflects that hierarchy without inventing labels the Act does not use.

**Beginner-facing display labels:**

| Internal enum | Display label |
|---|---|
| `not_ai_system` | Not an AI system under the Act |
| `out_of_scope` | Out of scope |
| `prohibited` | Prohibited — this practice is banned |
| `high_risk_annex_i` | High-risk — product safety (Annex I) |
| `high_risk_annex_iii` | High-risk — use case (Annex III) |
| `limited_risk_transparency` | Transparency obligations apply |
| `minimal_risk` | Minimal or no specific obligations identified |
| `gpai` | GPAI model obligations apply |
| `gpai_systemic_risk` | GPAI model with systemic risk |

---

## 2. Decision Flow

```
START
│
├─ Step 0: AI system definition gate (Art. 3(1))
│    └─ No → not_ai_system → END
│
├─ Step 1: Scope gate (Art. 2)
│    └─ Excluded → out_of_scope → END
│
├─ Step 2: Prohibited practices (Art. 5)
│    └─ Any trigger (no exception met) → prohibited → END
│
├─ Step 3: Annex I product safety (Art. 6(1))
│    └─ All three conditions met → high_risk_annex_i
│
├─ Step 4: Annex III use-case domains (Art. 6(2))
│    └─ Any match → Step 5
│
├─ Step 5: Art. 6(3) exception test
│    └─ Exception fails → high_risk_annex_iii
│    └─ Exception succeeds → continue
│
├─ Step 6: Art. 50 transparency check [ALWAYS RUN — parallel layer]
│    Populates article_50_transparency_triggers[] regardless of system_result.
│    If no prior system_result set:
│      └─ Any trigger → system_result = limited_risk_transparency
│      └─ No trigger → system_result = minimal_risk
│    If system_result already set (high_risk_annex_i or high_risk_annex_iii):
│      └─ Art. 50 triggers are recorded as additional obligations, not a reclassification
│
├─ Step 6b: Open-source conversion (Art. 2(12)) [POST-STEP-6 RULE]
│    If free_open_source == true AND system_result == minimal_risk
│    AND article_50_transparency_triggers is empty:
│      └─ system_result = out_of_scope (excluded_under_art_2_12)
│    Otherwise: open-source flag has no effect on classification
│
├─ Step 7: GPAI model track (Arts. 3(63), 51) [PARALLEL — independent of system_result]
│    └─ Not GPAI → model_result = none
│    └─ GPAI below threshold → model_result = gpai
│    └─ GPAI above threshold / Commission designated → model_result = gpai_systemic_risk
│
├─ Step 8: Timing overlay (Arts. 111, 113)
│
END
```

---

**Design note (v1.1):** In v1.0, Step 6 was conditional — only reached if the system was not already classified as high-risk or prohibited. This was incorrect. Article 50(6) explicitly states that paragraphs 1-4 "shall not affect the requirements and obligations set out in Chapter III." A high-risk system can simultaneously have Art. 50 transparency triggers. Step 6 now runs for every in-scope system and populates `article_50_transparency_triggers[]` as a parallel output, not a classification fallback.

---

## 3. Step-by-Step Field Specification

### Step 0 — AI System Definition Gate

**Screen title:** "Is this an AI system under the EU AI Act?"  
**Why this step exists:** The Act only applies to "AI systems" as defined in Article 3(1). The legal definition is broader than everyday usage of "AI" — it covers any machine-based system that infers from inputs how to generate outputs, which includes not only machine learning but also logic-based and knowledge-based approaches (Recital 12).

| Field ID | Question (beginner language) | Why we ask | Type | Article | Decision rule |
|---|---|---|---|---|---|
| `is_ai_system` | Does this software infer from the inputs it receives how to generate outputs — such as predictions, content, recommendations, or decisions — for explicit or implicit objectives? | The EU AI Act defines an "AI system" as a machine-based system that infers how to produce outputs. This is broader than "machine learning." It includes systems that use logic-based reasoning, knowledge graphs, expert systems, or statistical methods — not only neural networks. The key test is whether the system **infers** how to generate outputs, as opposed to software that executes only rules defined entirely and explicitly by a human programmer. | `yes_no_unsure` | Art. 3(1), Recital 12 | `false` → `not_ai_system`. `unsure` → flag for legal review, continue provisionally. |

**Helper text:** "The answer is Yes if your system uses any of the following to produce its outputs: machine learning or deep learning, natural language processing, computer vision, expert systems or knowledge-based reasoning, statistical inference, or any combination of these. The answer is No only if the software executes rules that were entirely and explicitly written by human programmers, with no inference or learned component at all. If you're unsure, proceed with Yes — it's safer to assess and find you're out of scope than to skip the assessment."

**Correction note (v1.1):** The original v1.0 gate asked whether the software "learns from data," which is narrower than the legal test. Article 3(1) uses "infers from the input it receives," and Recital 12 confirms that logic-based and knowledge-based approaches are included. The revised question tracks the statutory language.

---

### Step 1 — Scope Gate

**Screen title:** "Does the EU AI Act apply to you?"  
**Why this step exists:** Even if you have an AI system, several exclusions can take you out of scope entirely.

| Field ID | Question | Why we ask | Type | Article | Decision rule |
|---|---|---|---|---|---|
| `eu_nexus` | Will this AI system be placed on the market, put into service, or have its outputs used within the EU/EEA? | The Act applies to providers placing systems on the EU market, deployers within the EU, and third-country actors whose system outputs are used in the EU. | `yes_no` | Art. 2(1) | `false` → `out_of_scope` |
| `military_defence_exclusion` | Is this system developed or used exclusively for military, defence, or national security purposes? | These are fully excluded from the Act. | `yes_no` | Art. 2(3) | `true` → `out_of_scope` |
| `third_country_public_authority` | Is this system used exclusively by a public authority in a third country under an international cooperation agreement with the EU for law enforcement or judicial cooperation? | Certain third-country government uses are excluded. | `yes_no` | Art. 2(4) | `true` → `out_of_scope` |
| `scientific_rnd_only` | Is this system used solely for scientific research and development, and will never be placed on the market or put into service? | Pure research AI that never reaches production or end-users is excluded. | `yes_no` | Art. 2(6) | `true` → `out_of_scope` |
| `premarket_testing_only` | Is this system being used only for testing, development, or pre-market activities, and will not be exposed to real people outside the development team? | Pre-market testing and development activities are excluded, provided the system is not affecting real people. | `yes_no` | Art. 2(8) | `true` → `out_of_scope` |
| `personal_nonprofessional` | Are you a private individual using this AI system purely for personal, non-professional activity (e.g., a hobby project with no commercial use)? | Article 2(10) exempts the **deployer obligations** of natural persons using AI for purely personal, non-professional activity. It does NOT take the system itself out of scope. If you are the provider (the company that built or markets the system), this exclusion does not apply to you even if your end-users are consumers. | `yes_no` | Art. 2(10) | `true` → flag `deployer_obligation_exempt = true`. Do NOT set `out_of_scope`. Continue the assessment — the system remains in scope for provider obligations. If the user is assessing only their deployer obligations, surface this in post-classification. |
| `free_open_source` | Is this AI system released under a free and open-source licence that allows users to access, use, modify, and redistribute it? | Open-source AI systems are generally excluded from the Act UNLESS they are high-risk (Annex I or III), prohibited (Art. 5), or have transparency obligations (Art. 50). This exclusion is checked again after classification. Important: simply having a public repository does not automatically qualify. Recital 103 clarifies that systems where the AI component is monetised through support services, platform access, or commercial licensing may not meet the exclusion. The exclusion also does not apply where personal data is used for purposes beyond improving security, compatibility, or interoperability. Note: for GPAI models specifically, a separate and stricter openness test applies in Step 7 (publicly available model weights, architecture, and usage documentation). | `yes_no` | Art. 2(12), Recital 103 | Flag for post-classification re-evaluation. Do NOT exit scope yet. |

**Important logic note on open source:** If `free_open_source == true`, do NOT immediately mark as `out_of_scope`. Continue through the full flow. After Step 6 completes, apply the open-source conversion rule (see below).

**Post-Step-6 open-source conversion rule (v1.3):**

```
if free_open_source == true:
  if system_result in ['prohibited', 'high_risk_annex_i', 'high_risk_annex_iii']:
    → open_source_exclusion_applies = false  # Act applies regardless of licence
  else if article_50_transparency_triggers is not empty:
    → open_source_exclusion_applies = false  # Art. 50 obligations still apply
  else if system_result == 'minimal_risk':
    → system_result = 'out_of_scope'
    → scope_status = 'excluded_under_art_2_12'
    → open_source_exclusion_applies = true
  else if system_result == 'limited_risk_transparency':
    → open_source_exclusion_applies = false  # transparency triggers keep it in scope
```

**Correction note (v1.3):** In v1.0-v1.2, the prose correctly described the open-source conditional exclusion but the executable logic did not include a final conversion step. A system flagged `free_open_source == true` that landed at `minimal_risk` would be reported as in-scope when it should be `out_of_scope` under Art. 2(12). This rule closes that gap.

---

### Step 2 — Prohibited Practices (Article 5)

**Screen title:** "Could this system involve a banned AI practice?"  
**Why this step exists:** Eight practices are outright prohibited. Some have narrow exceptions. These have been enforceable since 2 February 2025.

| Field ID | Question | Why we ask | Type | Article | Exceptions | Decision rule |
|---|---|---|---|---|---|---|
| `prohibited_manipulation` | Does the system use subliminal techniques, or deliberately manipulative or deceptive techniques, that distort a person's behaviour in a way that causes or is likely to cause significant harm? | Manipulative AI that bypasses conscious awareness is banned. | `yes_no` | Art. 5(1)(a) | None | `true` → `prohibited` |
| `prohibited_vulnerability_exploitation` | Does the system exploit a person's age, disability, or specific social or economic situation to harmfully distort their behaviour? | AI that targets vulnerable groups to manipulate them is banned. | `yes_no` | Art. 5(1)(b) | None | `true` → `prohibited` |
| `prohibited_social_scoring` | Does the system evaluate or classify people based on their social behaviour or personal characteristics, leading to detrimental treatment in unrelated contexts or treatment that is disproportionate? | Government or private social scoring that penalises people across domains is banned. | `yes_no` | Art. 5(1)(c) | None | `true` → `prohibited` |
| `prohibited_criminal_prediction` | Does the system predict that a specific person will commit a crime based solely on profiling or personality traits — without objective, verifiable facts linked to criminal activity? | Predictive policing based purely on who someone "is" rather than what they've done is banned. | `yes_no` | Art. 5(1)(d) | Exception: assessments based on objective, verifiable facts directly linked to criminal activity are permitted. | `true` AND no exception → `prohibited` |
| `prohibited_criminal_prediction_exception` | Is the risk assessment based on objective, verifiable facts directly linked to criminal activity? | This is the only carve-out for criminal risk prediction. | `yes_no` (conditional: only if above = yes) | Art. 5(1)(d) | — | `true` → not prohibited, continue |
| `prohibited_facial_scraping` | Does the system create or expand facial recognition databases through untargeted scraping of images from the internet or CCTV footage? | Building face databases by mass-scraping is banned regardless of purpose. | `yes_no` | Art. 5(1)(e) | None | `true` → `prohibited` |
| `prohibited_emotion_workplace_education` | Does the system infer the emotions of people in workplaces or educational institutions? | Emotion recognition in these settings is banned because of the power imbalance. | `yes_no` | Art. 5(1)(f) | Exception: medical or safety reasons (e.g., detecting a driver falling asleep, monitoring patient distress in clinical care). | `true` AND no exception → `prohibited` |
| `prohibited_emotion_medical_safety_exception` | Is the emotion inference performed solely for medical or safety reasons? | This is the only carve-out for workplace/education emotion recognition. | `yes_no` (conditional) | Art. 5(1)(f) | — | `true` → not prohibited, continue |
| `prohibited_biometric_categorisation` | Does the system categorise people individually based on their biometric data to infer sensitive attributes: race, political opinions, trade union membership, religious beliefs, sex life, or sexual orientation? | Biometric-based inference of protected characteristics is banned. | `yes_no` | Art. 5(1)(g) | Exception: labelling or filtering of lawfully acquired biometric datasets, or law enforcement categorisation of biometric data. | `true` AND no exception → `prohibited` |
| `prohibited_rbi_law_enforcement` | Does the system perform real-time remote biometric identification in publicly accessible spaces for law enforcement purposes? | Live facial recognition in public by police is banned with only three narrow exceptions. | `yes_no` | Art. 5(1)(h) | Three exceptions below. | `true` AND no exception → `prohibited` |
| `rbi_exception_victim_search` | Is it used solely for the targeted search for specific victims of abduction, trafficking, or sexual exploitation? | One of three narrow exceptions. | `yes_no` (conditional) | Art. 5(2) | — | `true` → not prohibited |
| `rbi_exception_imminent_threat` | Is it used to prevent a specific, substantial, and imminent threat to life, or a genuine and foreseeable terrorist attack? | Second narrow exception. | `yes_no` (conditional) | Art. 5(2) | — | `true` → not prohibited |
| `rbi_exception_serious_crime` | Is it used to locate or identify a suspect of a specific serious criminal offence, with prior judicial or independent administrative authorisation? | Third narrow exception. Requires prior authorisation. | `yes_no` (conditional) | Art. 5(2) | — | `true` → not prohibited |

**Aggregation rule:** `any(prohibited_trigger == true AND no applicable exception) → system_result = prohibited`

---

### Step 3 — Annex I Product Safety (Article 6(1))

**Screen title:** "Is your AI system part of a regulated product?"  
**Why this step exists:** AI that serves as a safety component of, or is itself, a product covered by specific EU product-safety legislation is automatically high-risk if it must undergo third-party conformity assessment. Compliance deadline: 2 August 2027 (extended timeline).

| Field ID | Question | Why we ask | Type | Article | Decision rule |
|---|---|---|---|---|---|
| `is_safety_component_or_product` | Is your AI system a safety component of a physical product, or is it the product itself? For example: an AI system that controls braking in a vehicle, an AI diagnostic module in a medical device, or an AI component in industrial machinery. | The Act treats AI embedded in regulated products differently from standalone AI software. | `yes_no` | Art. 6(1)(a) | `false` → skip to Step 4 |
| `covered_by_annex_i_legislation` | Is that product (or the product containing your AI) covered by any of the following EU product-safety laws? | These are the specific EU harmonised laws listed in Annex I. If your product type appears in this list, the answer is Yes. | `single_select` from list | Art. 6(1)(a), Annex I | `none selected` → skip to Step 4 |
| `requires_third_party_conformity` | Under that product-safety law, is your product required to undergo a third-party conformity assessment (i.e., assessment by a "notified body") before being placed on the market? | Not all regulated products require third-party assessment. Only those that do trigger high-risk under the AI Act. If you are unsure, check with your product compliance team. | `yes_no_unsure` | Art. 6(1)(b) | All three `true` → `high_risk_annex_i`. `unsure` → flag for legal review. |

**Annex I product categories (selection list for `covered_by_annex_i_legislation`):**

1. Machinery and machinery products (Regulation 2023/1230)
2. Toys (Directive 2009/48/EC)
3. Recreational craft and personal watercraft (Directive 2013/53/EU)
4. Lifts and safety components for lifts (Directive 2014/33/EU)
5. Equipment for potentially explosive atmospheres (Directive 2014/34/EU)
6. Radio equipment (Directive 2014/53/EU)
7. Pressure equipment (Directive 2014/68/EU)
8. Cableway installations (Regulation 2016/424)
9. Personal protective equipment (Regulation 2016/425)
10. Appliances burning gaseous fuels (Regulation 2016/426)
11. Medical devices (Regulation 2017/745)
12. In vitro diagnostic medical devices (Regulation 2017/746)
13. Civil aviation — aircraft, engines, parts (Regulation 2018/1139)
14. Motor vehicles and trailers (Regulation 2018/858)
15. Agricultural and forestry vehicles (Regulation 167/2013)
16. Marine equipment (Directive 2014/90/EU)
17. Rail system interoperability (Directive 2016/797)

**Helper text:** "If you're unsure whether your product falls under one of these laws, your product compliance or legal team will know. Most consumer products sold in the EU carry a CE marking, which indicates they've been assessed under one of these frameworks."

---

### Step 4 — Annex III Use-Case Domains (Article 6(2))

**Screen title:** "What is your AI system intended to do?"  
**Why this step exists:** The Act lists eight domains of use. If your system's intended purpose falls into any of them, it is presumed high-risk (subject to the exception test in Step 5).

**Design note:** This step uses a two-tier approach. First, the user selects which broad domains may apply (8 cards). Then, for each selected domain, specific sub-use-cases are shown. This is important because the exception logic and specific obligations differ at the sub-use-case level.

#### Tier 1 — Domain selection (multi-select cards)

| Domain ID | Card title | Card description (beginner language) | Annex III point |
|---|---|---|---|
| `biometrics` | Biometric identification and categorisation | Your system identifies, categorises, or reads the emotions of people using their physical features (face, voice, fingerprints, gait). | Point 1 |
| `critical_infrastructure` | Critical infrastructure | Your system manages or is a safety component in essential services like electricity, water, gas, heating, road traffic, or digital infrastructure. | Point 2 |
| `education` | Education and vocational training | Your system makes decisions about students: admissions, grading, exam monitoring, or determining what level of education someone should receive. | Point 3 |
| `employment` | Employment and worker management | Your system is involved in hiring, evaluating, promoting, terminating, or monitoring workers. | Point 4 |
| `essential_services` | Access to essential services and benefits | Your system evaluates people's eligibility for public benefits, credit, insurance, or emergency services. | Point 5 |
| `law_enforcement` | Law enforcement | Your system helps police or justice authorities assess risk, evaluate evidence, detect crime, or investigate individuals. | Point 6 |
| `migration` | Migration, asylum, and border control | Your system is used for visa/asylum processing, border identification, or assessing migration-related risks. | Point 7 |
| `justice_democracy` | Justice and democratic processes | Your system assists courts with legal research or interpretation, or influences elections and referenda. | Point 8 |

#### Tier 2 — Sub-use-case detail (conditional, per selected domain)

**Domain 1: Biometrics**

| Field ID | Sub-use-case | Helper text | Annex III ref | Notes |
|---|---|---|---|---|
| `bio_remote_identification` | Remote biometric identification (not real-time by law enforcement, which is Art. 5) | Identifying people at a distance using face, voice, gait, etc. Includes post-identification (after the fact). | III-1(a) | |
| `bio_verification_only` | One-to-one biometric verification only | Confirming "are you who you claim to be?" (e.g., unlocking a phone with your face). | — | If ONLY verification, this is explicitly excluded from Annex III, point 1(a). Skip this system from biometrics high-risk. |
| `bio_categorisation` | Biometric categorisation by sensitive attributes | Inferring race, gender, age, ethnicity, or other protected characteristics from biometric data. Note: if this infers race, political opinions, religion, sex life, or sexual orientation, check Article 5 — it may be prohibited, not just high-risk. | III-1(b) | Cross-check Art. 5(1)(g) |
| `bio_emotion_recognition` | Emotion recognition | Inferring emotional states from biometric signals (facial expressions, voice tone, body language). Note: emotion recognition in workplaces or education may be prohibited under Art. 5(1)(f). | III-1(c) | Cross-check Art. 5(1)(f) |

**Domain 2: Critical infrastructure**

| Field ID | Sub-use-case | Annex III ref |
|---|---|---|
| `infra_safety_component` | AI that is a safety component in the management and operation of road traffic, or supply of water, gas, heating, or electricity | III-2(a) |
| `infra_digital` | AI that is a safety component in the management and operation of critical digital infrastructure | III-2(b) |

**Domain 3: Education**

| Field ID | Sub-use-case | Annex III ref |
|---|---|---|
| `edu_admission` | Determining access to or admission into educational or vocational training institutions | III-3(a) |
| `edu_learning_outcomes` | Evaluating learning outcomes, including when those outcomes are used to steer the learning process | III-3(b) |
| `edu_level_assessment` | Assessing the appropriate level of education an individual will receive or be able to access | III-3(c) |
| `edu_proctoring` | Monitoring and detecting prohibited behaviour of students during tests | III-3(d) |

**Domain 4: Employment**

| Field ID | Sub-use-case | Annex III ref |
|---|---|---|
| `emp_recruitment` | Placing targeted job advertisements, screening or filtering applications, or evaluating candidates | III-4(a) |
| `emp_work_decisions` | Making decisions affecting the terms of work relationships, promotion, termination, task allocation based on behaviour or personal traits, or monitoring and evaluating performance and behaviour | III-4(b) |

**Domain 5: Essential services**

| Field ID | Sub-use-case | Annex III ref | Exceptions |
|---|---|---|---|
| `svc_public_benefits` | Evaluating eligibility for public assistance benefits and services, or granting, reducing, revoking, or reclaiming such benefits | III-5(a) | |
| `svc_creditworthiness` | Evaluating creditworthiness or establishing credit scores | III-5(b) | Exception: AI used solely for detecting financial fraud is NOT high-risk |
| `svc_financial_fraud_only` | Is this system used solely for detecting financial fraud (not credit scoring)? | — | `true` → exclude from high-risk |
| `svc_insurance` | Risk assessment and pricing for natural persons in life and health insurance | III-5(c) | |
| `svc_emergency` | Evaluating and classifying emergency calls, or dispatching/prioritising emergency first response services, including emergency healthcare triage | III-5(d) | |

**Domain 6: Law enforcement**

| Field ID | Sub-use-case | Annex III ref |
|---|---|---|
| `le_victim_risk` | Assessing the risk of a natural person becoming a victim of criminal offences | III-6(a) |
| `le_polygraph` | Polygraphs and similar tools used during criminal investigations or proceedings | III-6(b) |
| `le_evidence` | Evaluating the reliability of evidence during criminal investigations or proceedings | III-6(c) |
| `le_reoffending` | Assessing the risk of a natural person offending or reoffending (not solely based on profiling — that's Art. 5) | III-6(d) |
| `le_profiling` | Profiling of natural persons during detection, investigation, or prosecution of criminal offences | III-6(e) |

**Domain 7: Migration**

| Field ID | Sub-use-case | Annex III ref | Exceptions |
|---|---|---|---|
| `mig_polygraph` | Polygraphs and similar tools during migration interviews | III-7(a) | |
| `mig_risk_assessment` | Assessing security, irregular migration, or health risks posed by a person intending to enter or having entered the EU | III-7(b) | |
| `mig_application` | Examining or assisting with applications for asylum, visa, and residence permits, and associated complaints | III-7(c) | |
| `mig_identification` | Detecting, recognising, or identifying natural persons in the context of border management (excluding travel document verification) | III-7(d) | Exception: verifying travel documents is NOT high-risk |
| `mig_travel_doc_only` | Is this system used solely for verifying travel documents? | — | `true` → exclude from high-risk |

**Domain 8: Justice and democratic processes**

| Field ID | Sub-use-case | Annex III ref | Exceptions |
|---|---|---|---|
| `justice_legal_research` | Assisting a judicial authority in researching and interpreting facts and the law, and in applying the law to a concrete set of facts, or used in alternative dispute resolution | III-8(a) | |
| `justice_elections` | Influencing the outcome of an election or referendum, or the voting behaviour of persons exercising their vote | III-8(b) | Exception: AI used for organising, optimising, and structuring political campaigns (logistics/admin) that is not directly exposed to voters is NOT high-risk |
| `justice_campaign_admin_only` | Is this system used solely for organising/optimising political campaign logistics, with no direct voter exposure? | — | `true` → exclude from high-risk |

**Aggregation rule:** `any sub-use-case selected (excluding exception-only fields) → annex_iii_match = true → proceed to Step 5`

---

### Step 5 — Article 6(3) Exception Test

**Screen title:** "Even though your system falls under Annex III, it may not be high-risk"  
**Why this step exists:** Article 6(3) provides a derogation. An Annex III system is NOT high-risk if it meets ALL of the following conditions. However, profiling of natural persons is an absolute blocker: if the system profiles, the exception is never available.

**Conditional:** Only shown if `annex_iii_match == true`.

| Field ID | Question | Why we ask | Type | Article | Decision rule |
|---|---|---|---|---|---|
| `profiles_natural_persons` | Does this system perform profiling of natural persons — meaning it automatically processes personal data to evaluate, analyse, or predict aspects of a person's behaviour, preferences, reliability, economic situation, health, location, or movements? | If your system profiles people, it is ALWAYS high-risk under Annex III. No exception is possible. | `yes_no` | Art. 6(3) final subparagraph | `true` → exception blocked, `high_risk_annex_iii` |
| `significant_risk_of_harm` | Could this system pose a significant risk of harm to health, safety, or fundamental rights of people? | The exception only applies if the system does NOT pose significant risk. If it can meaningfully affect someone's health, safety, or rights, the exception does not apply. | `yes_no` | Art. 6(3) first subparagraph | `true` → exception blocked |
| `material_influence_on_decision` | Does this system materially influence the outcome of a decision about a person? For example: does it produce a score, recommendation, or output that a human decision-maker relies on, even if the human has final say? | "Materially influencing" means the system's output meaningfully shapes the decision. If a human always makes the decision and the AI output is just one minor input among many, this may be No. If the human routinely follows the AI output, this is Yes. | `yes_no` | Art. 6(3) first subparagraph | `true` → exception blocked |
| `narrow_procedural_task` | Does the system ONLY perform a narrow procedural task? Examples: converting data between formats, deduplicating records, structuring data into a database. | If the system's sole function is a mechanical, procedural operation with no evaluative judgment, this exception limb may apply. | `yes_no` | Art. 6(3)(a) | |
| `improves_completed_human_activity` | Does the system ONLY improve the result of a previously completed human activity — without changing the human's original assessment? | For example: spell-checking a human-written report, or reformatting a human-completed evaluation. The human did the substantive work; the AI only polishes it. | `yes_no` | Art. 6(3)(b) | |
| `pattern_detection_no_replacement` | Does the system ONLY detect decision-making patterns or deviations from prior human decisions — without replacing or influencing the human assessment, and with proper human review? | For example: flagging that a human reviewer has been inconsistent in their grading, so the human can self-correct. The AI does not change any grades. | `yes_no` | Art. 6(3)(c) | |
| `preparatory_task` | Does the system ONLY perform a preparatory task for a later human assessment? | For example: gathering and organising case files before a human judge reviews them. The AI does not assess the case; it prepares materials. | `yes_no` | Art. 6(3)(d) | |

**Exception logic:**

```
exception_success =
  profiles_natural_persons == false
  AND significant_risk_of_harm == false
  AND material_influence_on_decision == false
  AND one_of(narrow_procedural_task, improves_completed_human_activity,
             pattern_detection_no_replacement, preparatory_task) == true
```

If `exception_success == true` → system exits high-risk. Continue to Step 6.  
If `exception_success == false` → `system_result = high_risk_annex_iii`.

**Provider obligation note:** Even if the exception succeeds, the provider must: (1) document the assessment before placing the system on the market or putting it into service (Art. 6(4)); (2) register the system in the EU database under Article 49(2); and (3) make the documentation available to national competent authorities upon request. Note: Article 6(4) does NOT impose a proactive notification duty to national authorities. The obligation is to document, register, and provide documentation when asked.

**Correction note (v1.1):** The original v1.0 stated the provider must "notify the relevant national authority," which was incorrect. Article 6(4) requires documentation and registration (Art. 49(2)), not proactive notification.

---

### Step 6 — Transparency Obligations (Article 50) [ALWAYS-ON OVERLAY]

**Screen title:** "Does your system need to be transparent about being AI?"  
**Why this step exists:** Article 50 imposes transparency obligations that apply regardless of risk classification. A high-risk system can also trigger Art. 50 obligations. Article 50(6) explicitly states that these obligations operate without prejudice to Chapter III (high-risk) requirements. This step runs for every in-scope system.

**Applies to:** All systems that passed the scope gate, including those already classified as high-risk or prohibited. For prohibited systems, Art. 50 triggers are recorded for completeness but are moot (the system cannot be deployed). For high-risk systems, Art. 50 triggers represent additional transparency duties on top of Art. 13 deployer-facing transparency requirements.

| Field ID | Question | Why we ask | Type | Article | Exception | Decision rule |
|---|---|---|---|---|---|---|
| `interacts_directly_with_people` | Does the system interact directly with people (e.g., a chatbot, voice assistant, or avatar) where it may not be obvious they are talking to AI? | People have a right to know when they're interacting with AI. If it's obvious (e.g., a clearly labelled "AI assistant" button), this may not apply. | `yes_no` | Art. 50(1) | Exception: AI used to detect, prevent, or investigate criminal offences (with safeguards). | Trigger |
| `generates_synthetic_content` | Does the system generate or manipulate synthetic audio, image, video, or text content? | Providers must ensure AI-generated content is marked in a machine-readable format and detectable as artificial. | `yes_no` | Art. 50(2) | Exception: AI used for criminal offence detection/prevention. Also: does not apply to content that is standard editing (e.g., brightness adjustment) or does not substantially alter the input. | Trigger |
| `standard_editing_exception` | Is the system's content manipulation limited to standard editing (e.g., adjusting brightness, contrast, cropping) that does not substantially alter the content? | Standard editing that doesn't change meaning or appearance in a misleading way is excluded. | `yes_no` (conditional) | Art. 50(2) | — | `true` → no trigger |
| `emotion_recognition_or_biometric_cat` | Does the system perform emotion recognition or biometric categorisation on people? | Even outside high-risk contexts, deployers must inform people when emotion recognition or biometric categorisation is being applied to them. | `yes_no` | Art. 50(3) | Exception: AI used for criminal offence detection with safeguards. | Trigger |
| `generates_deepfakes` | Does the system generate or manipulate image, audio, or video content that constitutes a "deep fake" — content that resembles real persons, objects, places, or events and would falsely appear authentic? | Deployers must disclose that deep fake content has been artificially generated or manipulated. | `yes_no` | Art. 50(4) | Exceptions: (1) authorised for criminal offence detection; (2) content is clearly artistic, creative, satirical, or fictional, and appropriate safeguards for third-party rights exist. | Trigger |
| `ai_generated_public_interest_text` | Does the system generate text that is published for the purpose of informing the public on matters of public interest? | AI-generated text published as news or public-interest information must be labelled as artificially generated, unless it has undergone human editorial review and a natural person holds editorial responsibility. | `yes_no` | Art. 50(4) | Exception: human editorial review with editorial responsibility. | Trigger |
| `public_interest_text_human_review_exception` | Has the AI-generated text undergone human editorial review, and does a natural or legal person hold editorial responsibility for the publication? | If an editor (individual or organisation) reviews and takes editorial responsibility, the labelling requirement does not apply. | `yes_no` (conditional) | Art. 50(4) | — | `true` → no trigger |

**Aggregation rule (revised v1.1):**
- Always populate `article_50_transparency_triggers[]` with any matched triggers, regardless of `system_result`.
- If `system_result` is not yet set (i.e., system is not prohibited, high_risk_annex_i, or high_risk_annex_iii):
  - `any(trigger == true AND no applicable exception)` → `system_result = limited_risk_transparency`
  - `no triggers` → `system_result = minimal_risk`
- If `system_result` is already set (high-risk or prohibited): Art. 50 triggers are recorded as additional obligations in `article_50_transparency_triggers[]` but do NOT change the system_result.

**Correction note (v1.1):** In v1.0, this step was conditional — only reached if the system was not already high-risk or prohibited. This contradicted Article 50(6), which states Art. 50 obligations operate without prejudice to Chapter III. Step 6 now runs for all in-scope systems.

---

### Step 7 — GPAI Model Track (Articles 3(63), 51, 53, 55)

**Screen title:** "Are you also assessing a general-purpose AI model?"  
**Why this step exists:** GPAI model classification runs as a parallel track, independent of the system classification. A system can be high-risk AND built on a GPAI model with systemic risk. GPAI obligations have been enforceable since 2 August 2025.

| Field ID | Question | Why we ask | Type | Article | Decision rule |
|---|---|---|---|---|---|
| `assessment_target` | Are you assessing: (a) only an AI system (application), (b) only a GPAI model (foundation/base model), or (c) both? | The Act treats systems and models differently. You may need to assess both if you build a foundation model AND deploy it as an application. | `single_select: system_only, model_only, both` | — | `system_only` → skip remaining GPAI questions |
| `is_gpai_model` | Is the model a general-purpose AI model — meaning it displays significant generality, can perform a wide range of distinct tasks, and can be integrated into a variety of downstream systems or applications? | The Act defines GPAI models broadly. Most large language models, large multimodal models, and large image generation models qualify. A narrow model trained for one specific task (e.g., a fraud-detection classifier) does not. | `yes_no` | Art. 3(63) | `false` → `model_result = none` |
| `provider_placing_on_eu_market` | Are you the provider placing this GPAI model on the EU market (including making it available via API, download, or integration into other products)? | GPAI obligations under Articles 53-55 fall on the provider who places the model on the market. If you are using someone else's model, the model is still classified as GPAI — but the obligations fall on the upstream provider, not you. | `yes_no` | Art. 53 | Does NOT affect `model_result`. Only affects `gpai_obligation_holder`. See logic below. |
| `gpai_open_source` | Is this GPAI model released under a free and open-source licence (with publicly available model weights, architecture, and usage information)? | Open-source GPAI models benefit from reduced obligations under Article 53(2) — certain transparency requirements are relaxed. However, this exception does NOT apply if the model has systemic risk, and copyright-related obligations still apply. | `yes_no` | Art. 53(2), Recital 102 | Affects obligation scope in post-classification, not classification itself. |
| `training_compute_above_threshold` | Was the model trained using a total compute of more than 10²⁵ floating-point operations (FLOPs)? | This is the current threshold for presumed systemic risk. If you don't know, check the model card, training report, or consult your ML engineering team. | `yes_no_unsure` | Art. 51(2) | `true` → `model_result = gpai_systemic_risk` |
| `commission_designated_systemic` | Has the European Commission designated this model as having systemic risk (even if it's below the FLOPs threshold)? | The Commission can designate models as systemic risk based on high-impact capabilities, regardless of training compute. | `yes_no` | Art. 51(1) | `true` → `model_result = gpai_systemic_risk` |
| `commission_rebuttal_accepted` | Has the provider successfully rebutted the systemic risk presumption, and has the Commission accepted this rebuttal? | Providers can present arguments that their model does not in fact have systemic-risk capabilities. If the Commission accepts, the designation is withdrawn. | `yes_no` (conditional: only if above = yes) | Art. 51(2) | `true` → `model_result = gpai` (downgraded) |

**Logic (revised v1.1):**

```
# Classification — based on model characteristics, NOT on who the user is
if assessment_target == 'system_only' → model_result = none
else if is_gpai_model == false → model_result = none
else if (training_compute_above_threshold == true || commission_designated_systemic == true)
        AND commission_rebuttal_accepted != true
     → model_result = gpai_systemic_risk
else → model_result = gpai

# Obligation ownership — separate from classification
if model_result != 'none':
  if provider_placing_on_eu_market == true → gpai_obligation_holder = 'self'
  else → gpai_obligation_holder = 'upstream_provider'

# Open-source exception scope (post-classification)
if gpai_open_source == true AND model_result == 'gpai':
  → gpai_open_source_exception = true  # reduced Art. 53 obligations
if gpai_open_source == true AND model_result == 'gpai_systemic_risk':
  → gpai_open_source_exception = false  # no exception for systemic risk models
```

**Correction note (v1.1):** In v1.0, setting `provider_placing_on_eu_market = false` collapsed `model_result` to `none`, conflating "this is not a GPAI model" with "this user does not hold GPAI provider obligations." These are distinct questions. The model classification comes from Article 3(63); the obligation holder is determined separately. A downstream integrator or deployer using a GPAI model via API should still see `model_result = gpai` with `gpai_obligation_holder = upstream_provider`, so they understand the regulatory context of the model they depend on.

**Open-source GPAI note (v1.1):** v1.0 did not address the separate open-source treatment for GPAI models. Article 53(2) provides reduced transparency obligations for open-source GPAI models (e.g., relaxed technical documentation and downstream information requirements), but this exception does not apply to models with systemic risk (Art. 53(2) final sentence), and copyright-related obligations under Art. 53(1)(d) still apply regardless.

---

### Step 8 — Timing Overlay (Articles 111, 113)

**Screen title:** "When do these rules apply to you?"  
**Why this step exists:** Different parts of the Act became enforceable at different times. The classification doesn't change, but the compliance deadline does.

| Field ID | Question | Type | Article | Effect |
|---|---|---|---|---|
| `placed_on_market_before_2026_08_02` | Was this AI system already placed on the market or put into service before 2 August 2026? | `yes_no` | Art. 111(1) | If yes: the Regulation applies to these systems only if, from 2 August 2026, they undergo significant changes in their design. Systems that are not significantly changed continue to operate under pre-existing rules until a significant change triggers full compliance. |
| `significant_design_change_after_cutoff` | Has the system undergone a significant change in design after the relevant application date? | `yes_no` | Art. 111(1) | If yes: the system is treated as newly placed on the market. Full Chapter III obligations apply from the date of the significant change. A "significant change" means a change that affects the system's compliance with the requirements of Chapter III or results in a modification to the intended purpose for which the system has been assessed. |
| `intended_for_public_authority_use` | Will this high-risk system be used by a public authority (government, municipality, public institution)? | `yes_no` | Art. 111(2) | Providers and deployers of high-risk AI systems intended for use by public authorities shall take the necessary steps to comply with the requirements and obligations of this Regulation by 2 August 2030. This applies to systems already on the market before 2 August 2026 that have not undergone significant design changes. |
| `gpai_on_market_before_2025_08_02` | Was this GPAI model already placed on the market before 2 August 2025? | `yes_no` | Art. 111(3) | Providers of GPAI models that were placed on the market before 2 August 2025 shall take the necessary steps to comply with Articles 53 and 55 by 2 August 2027. |
| `annex_i_product` | (Auto-populated from Step 3) Was the system classified as high-risk under Annex I (product safety)? | `auto` | Art. 113(a) | High-risk AI systems covered by Annex I Section A (existing harmonised legislation) have an extended application date of 2 August 2027. |

**Correction note (v1.1):** v1.0 compressed the Art. 111 conditions too loosely. The revised wording distinguishes between: (a) legacy systems with no significant change (Regulation applies only upon significant change), (b) legacy systems with significant change (full obligations from date of change), (c) public authority legacy systems (2030 deadline), and (d) legacy GPAI models (2027 deadline). The key nuance is that "legacy" does not mean "exempt" — it means "deferred until significant change or statutory deadline."

**Key dates reference (display in UI):**

| Milestone | Date | Status |
|---|---|---|
| Prohibited practices + AI literacy | 2 February 2025 | **Enforceable now** |
| GPAI model obligations | 2 August 2025 | **Enforceable now** |
| High-risk system obligations (Annex III) + Art. 50 transparency | 2 August 2026 | Upcoming |
| High-risk systems embedded in regulated products (Annex I) | 2 August 2027 | Future |
| Public authority legacy systems | 2 August 2030 | Future |

---

## 4. Result Payload

```json
{
  "system_result": "high_risk_annex_iii",
  "system_reasons": [
    {
      "code": "annex_iii_employment_4a",
      "label": "Recruitment and candidate evaluation",
      "legal_ref": "Annex III, point 4(a)",
      "plain_explanation": "Your system screens, filters, or evaluates job candidates. Under the EU AI Act, this is considered high-risk because AI-driven hiring decisions can significantly affect people's livelihoods and rights."
    }
  ],
  "article_6_3_exception": {
    "checked": true,
    "applies": false,
    "reason": "System profiles natural persons (profiling blocker)",
    "provider_documentation_required": true,
    "registration_required_art_49_2": true
  },
  "article_50_transparency_triggers": [
    {
      "trigger": "interacts_directly_with_people",
      "article": "Art. 50(1)",
      "obligation": "People must be informed they are interacting with AI"
    }
  ],
  "model_result": "gpai",
  "gpai_obligation_holder": "upstream_provider",
  "gpai_open_source_exception": false,
  "scope_status": "in_scope",
  "deployer_obligation_exempt": false,
  "open_source": {
    "flagged": false,
    "exclusion_applies": false,
    "exclusion_article": null
  },
  "timing": {
    "compliance_deadline": "2026-08-02",
    "rules_enforceable_now": false,
    "legacy_system": false,
    "significant_change_detected": false,
    "public_authority_deadline": null,
    "gpai_legacy_deadline": null,
    "annex_i_extended_deadline": null
  },
  "confidence": "clear_match",
  "post_classification_notes": [
    "As a provider of a high-risk system, your key obligations include: risk management system (Art. 9), data governance (Art. 10), technical documentation (Art. 11), record-keeping (Art. 12), transparency to deployers (Art. 13), human oversight design (Art. 14), and accuracy/robustness/cybersecurity (Art. 15).",
    "You must register this system in the EU database before placing it on the market (Art. 49).",
    "This system also triggers Art. 50(1) transparency obligations: users must be informed they are interacting with AI.",
    "The underlying model is classified as a GPAI model. GPAI provider obligations (Arts. 53-55) fall on the upstream model provider, not on you as the system deployer.",
    "If your system processes personal data, GDPR applies alongside the AI Act. A Data Protection Impact Assessment (GDPR Art. 35) is likely required."
  ]
}
```

---

## 5. Post-Classification Section (not classification inputs)

These fields affect obligations, not risk level. Collect them AFTER classification to generate the "what this means for you" output.

| Field ID | Question | Why it matters (post-classification) |
|---|---|---|
| `provider_or_deployer` | Did your organisation build this AI system, or are you using one built by someone else? (Provider / Deployer / Both) | Providers and deployers have different obligations under the Act. Providers bear the heaviest requirements. If a deployer substantially modifies the system, they inherit provider obligations (Art. 25(1)(c)). If `deployer_obligation_exempt == true` (personal/non-professional use under Art. 2(10)), deployer obligations do not apply to that individual — but provider obligations remain unaffected. |
| `data_types_processed` | What types of data does your system process? (PII, health data, biometric data, financial records, public data) | Does not change risk level but determines whether GDPR, HIPAA (if US), or sector-specific data laws apply alongside the AI Act. |
| `deployment_model` | How is the system deployed? (Self-hosted, SaaS/cloud, hybrid, embedded in product) | Affects data residency considerations and whether Annex I timeline (2027) applies. |
| `geography_detail` | Which specific EU/EEA member states will the system operate in? | Different member states may have different national competent authorities and may implement supplementary rules. |

---

## 6. Self-Evaluation

### What this schema gets right (verified against the Act)

1. **Dual-track classification.** The system/model split correctly mirrors the Act's separate treatment of AI systems (Chapter III) and GPAI models (Chapter V). No other tool I reviewed handles this correctly.

2. **Article 6(3) exception completeness.** The schema captures all four exception limbs (a-d), both threshold conditions (significant risk, material influence), and the profiling blocker. Most tools miss the threshold conditions or the profiling carve-out.

3. **Article 5 exception nesting.** The prohibited practices section handles the conditional exceptions (Art. 5(1)(d) criminal prediction with objective facts, Art. 5(1)(f) medical/safety, Art. 5(1)(h) three narrow law enforcement exceptions) as nested sub-questions rather than lumping them into a single yes/no.

4. **Annex III sub-use-case granularity.** Breaking domains into specific sub-use-cases (28 fields vs. 8 in LLM X) allows the tool to correctly handle intra-domain exceptions (financial fraud exclusion in III-5(b), travel document exclusion in III-7(d), campaign logistics exclusion in III-8(b), biometric verification exclusion in III-1).

5. **Scope gate completeness.** Seven exclusion fields covering all Art. 2 exclusions, including the open-source conditional exclusion (Art. 2(12)).

6. **Open-source handling.** Correctly treats it as a conditional flag rather than an immediate scope exit. (v1.3) Now fully operationalized: explicit post-Step-6 conversion rule flips `minimal_risk` to `out_of_scope` when Art. 2(12) applies. Helper text surfaces Recital 103 monetisation and personal data conditions. Also covers open-source GPAI model treatment under Art. 53(2).

7. **Timing overlay.** Treats compliance deadlines as a separate layer rather than conflating them with classification, which is how the Act itself works. (v1.1) Now includes precise Art. 111 conditions and Annex I extended deadline.

### Fixes applied in v1.1 (from external legal review)

| # | Issue | Severity | Fix applied |
|---|---|---|---|
| 1 | Step 0 gate used "learns from data" instead of Art. 3(1)'s "infers from inputs" — could misclassify logic-based and knowledge-based AI as "not AI" | Must-fix | Rewrote question and helper to track statutory language including Recital 12 |
| 2 | `personal_nonprofessional` wired as blanket `out_of_scope` — Art. 2(10) is an actor-specific deployer exemption, not a system-level exclusion | Must-fix | Changed to flag `deployer_obligation_exempt = true` without exiting scope. System remains assessable for provider obligations. |
| 3 | Art. 6(4) note stated provider must "notify national authority" — incorrect. Art. 6(4) requires documentation before market placement + registration under Art. 49(2). Documentation is provided to authorities upon request, not proactively. | Must-fix | Rewrote provider obligation note with correct Art. 6(4) and Art. 49(2) requirements |
| 4 | Step 6 (Art. 50) was conditional on system not being high-risk — contradicts Art. 50(6) which says Art. 50 obligations apply without prejudice to Chapter III | Must-fix | Step 6 now runs for all in-scope systems. Populates `article_50_transparency_triggers[]` as parallel output. Only sets `system_result` if no prior classification exists. |
| 5 | GPAI track collapsed `model_result` to `none` when user is not the GPAI provider — conflates model classification with obligation ownership | Should-fix | Separated classification (`model_result`) from obligation holder (`gpai_obligation_holder = self / upstream_provider`). Model retains its classification regardless of who the assessed actor is. |
| 6 | No coverage of open-source GPAI model exceptions under Art. 53(2) | Should-fix | Added `gpai_open_source` field and exception logic. Exception applies only to non-systemic-risk models. Copyright obligations unaffected. |
| 7 | Timing overlay compressed Art. 111 conditions too loosely | Should-fix | Rewrote all four timing fields with precise Art. 111 paragraph references and distinguished legacy-no-change, legacy-with-change, public-authority, and GPAI-legacy scenarios. Added Annex I extended deadline field. |

### Fixes applied in v1.2 (from second external legal review)

| # | Issue | Severity | Fix applied |
|---|---|---|---|
| 8 | Art. 50(4) editorial exception said "natural person" — Act says "natural or legal person" | Must-fix | Corrected question and helper text |
| 9 | FLOPs threshold question included speculative model-specific example ("GPT-4-class") | Should-fix | Removed. Question now points to model cards and internal training records only. |

### Fixes applied in v1.3 (from third external legal review)

| # | Issue | Severity | Fix applied |
|---|---|---|---|
| 10 | Open-source exclusion described in prose but not operationalized in decision logic — a `free_open_source == true` system landing at `minimal_risk` would be reported as in-scope when Art. 2(12) should exclude it | Must-fix | Added explicit post-Step-6 conversion rule: `free_open_source == true AND system_result == minimal_risk AND no Art. 50 triggers → system_result = out_of_scope`. Added to decision flow as Step 6b. Updated result payload with `open_source.exclusion_applies` field. |
| 11 | Open-source question helper text too binary — Recital 103 conditions (monetisation, personal data use) not surfaced for beginners | Should-fix | Expanded helper text to note that open repository alone is insufficient; monetisation through support/services/platform access or personal data use beyond security/compatibility/interoperability may disqualify the exclusion. |

### Fixes applied in v1.4 (from fourth external legal review)

| # | Issue | Severity | Fix applied |
|---|---|---|---|
| 12 | `free_open_source` question used GPAI-specific openness test (public weights, architecture) for the generic Art. 2(12) system-level exclusion — could wrongly exclude non-GPAI open-source systems that don't have "weights" | Should-fix | Rewrote to licence-based test: "released under a free and open-source licence that allows users to access, use, modify, and redistribute it." Public-weights/architecture test now appears only in the Step 7 GPAI branch. |
| 13 | Section 1 result model and Section 4 result payload structurally out of sync (payload had `scope_status`, nested `open_source` object, `timing` sub-fields not reflected in model) | Should-fix | Expanded Section 1 result model to match full payload structure including all nested objects, enums, and field types. |

### Known limitations and caveats (updated v1.4)

1. **Not legal advice.** This tool provides a preliminary assessment only. The Article 6(3) exception in particular requires documented legal analysis by the provider. The tool cannot replace that analysis.

2. **Commission guidance gap.** Article 6(5) required the Commission to publish guidelines with practical examples of high-risk and non-high-risk use cases by 2 February 2026. Those guidelines, once published, may refine the classification boundaries in ways this schema cannot anticipate. The schema should be updated when they are available.

3. **Digital Omnibus uncertainty.** The European Commission's Digital Package on Simplification (proposed November 2025) may amend the AI Act's implementation timeline and simplify certain requirements. If enacted, the timing overlay will need updating.

4. **Annex I product identification is hard for beginners.** Asking a non-technical user whether their product requires third-party conformity assessment under a specific EU directive is challenging. This field will likely need a helper wizard or "I don't know" path that recommends consulting product compliance teams.

5. **Intended purpose ambiguity and deployer-becomes-provider.** The Act classifies based on "intended purpose" (Art. 3), which is the provider's stated use. But deployers may repurpose a system. Article 25(1)(c) states that a deployer who substantially modifies a system or changes its intended purpose becomes a provider. The tool does not currently handle this reclassification scenario. A future version should add a Step 1 question: "Have you substantially modified a system originally built by another provider?"

6. **Multi-result systems.** A system can hit multiple Annex III categories simultaneously. The schema preserves all matched reasons in `system_reasons[]`, but the UI should make clear that the system has a single classification with potentially multiple triggering use cases.
