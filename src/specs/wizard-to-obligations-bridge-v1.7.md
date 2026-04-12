# Wizard-to-Obligations Bridge Specification

**Version:** 1.7  
**Date:** April 12, 2026  
**Dependencies:** EU AI Act Classification Schema v1.4, Obligation Record Schema v1.4 (v1.3 + model-track extension defined in Section 5), UX Spec v1.0  
**Purpose:** Defines how the classifier wizard's output maps to obligation filtering inputs across two explicit tracks (system obligations and model obligations), and specifies the obligation list component that renders the filtered results.  
**Status:** Frozen  
**Changes from v1.6:** (1) Added `minItems: 1` to `model_risk_levels` and `holder_types` arrays. (2) Added editorial rule for `open_source_note` when `open_source_treatment == "reduced_scope"`. (3) Section 3.0 flow diagram updated to show role question as conditional.

---

## 1. Translation Map

The wizard produces a result payload (Classification Schema v1.4, Section 4). The obligation filter consumes two separate profile objects (system and model) plus a shared display context (see Section 2). This section defines the exact translation from wizard output to filter inputs for each track.

### 1.1 Risk Level Translation

The wizard produces granular `system_result` values. The obligation schema uses a simpler `risk_levels` enum. Translation is a many-to-one map.

| Wizard `system_result` | Obligation schema `risk_levels` value | Notes |
|---|---|---|
| `prohibited` | `unacceptable` | Obligations still relevant (e.g., Art. 5 reporting). Prohibited results show a dedicated message, not an obligation list. |
| `high_risk_annex_i` | `high_risk` | Same obligation set as Annex III high-risk, but with extended deadline (2027). |
| `high_risk_annex_iii` | `high_risk` | Primary target for the obligation list. |
| `limited_risk_transparency` | `limited_risk` | System track shows Art. 50 transparency obligations only. Model track renders independently if GPAI is applicable. |
| `minimal_risk` | `minimal_risk` | No system-track obligations shown by this tool. Model track renders independently if GPAI is applicable. |
| `not_ai_system` | N/A | No obligations. Never reaches the obligation list. |
| `out_of_scope` | N/A | No obligations. Never reaches the obligation list. |

```javascript
function translateRiskLevel(systemResult) {
  const map = {
    'prohibited': 'unacceptable',
    'high_risk_annex_i': 'high_risk',
    'high_risk_annex_iii': 'high_risk',
    'limited_risk_transparency': 'limited_risk',
    'minimal_risk': 'minimal_risk'
  };
  return map[systemResult] || null;
}
```

### 1.2 Annex III Category Extraction

The obligation filter needs to know which Annex III domains the system was classified under. The source of truth is the final `system_reasons[]` array in the result payload, not the Step 4 Tier 1 selections. Tier 1 selections are routing inputs (what the user clicked to enter a decision path); `system_reasons[]` contains only the sub-use-cases that survived the full decision flow including the Art. 6(3) exception test.

**Current bridge approach (acceptable for v1):** Parse `system_reasons[].code` to extract the domain. Reason codes follow the pattern `annex_iii_{domain}_{point}` (e.g., `annex_iii_employment_4a`). The domain segment maps to the obligation schema's `annex_iii_categories` enum.

**Ideal contract (future):** The classifier should emit an explicit normalized field like `matched_annex_iii_categories[]` in the result payload, rather than requiring the bridge to parse reason codes. This would make the bridge a clean field-to-field map rather than a code-parsing workaround. Flag this as a classifier schema enhancement for a future version.

Both the wizard and the obligation schema must reference the same canonical code set for Annex III categories. Three values currently diverge:

| Canonical code (shared registry) | Current wizard domain ID | Current obligation schema enum | Action |
|---|---|---|---|
| `biometrics` | `biometrics` | `biometrics` | Aligned |
| `critical_infrastructure` | `critical_infrastructure` | `critical_infrastructure` | Aligned |
| `education` | `education` | `education_vocational` | Update schema |
| `employment` | `employment` | `employment` | Aligned |
| `essential_services` | `essential_services` | `essential_services` | Aligned |
| `law_enforcement` | `law_enforcement` | `law_enforcement` | Aligned |
| `migration` | `migration` | `migration_asylum_border` | Update schema |
| `justice_democracy` | `justice_democracy` | `justice_democratic` | Update schema |

Three values need updating in the obligation schema to align with the shared canonical code set. The wizard may also need a minor update if reason codes use a different string than the canonical value.

```javascript
// v1 bridge: parse domain from final classification reasons
function extractAnnexCategories(wizardResult) {
  if (!wizardResult.system_reasons || wizardResult.system_reasons.length === 0) {
    return [];
  }
  const domainPattern = /^annex_iii_([a-z_]+)_\d/;
  const domains = new Set();
  for (const reason of wizardResult.system_reasons) {
    const match = reason.code.match(domainPattern);
    if (match) {
      domains.add(match[1]);
    }
  }
  return Array.from(domains);
}

// Future: classifier emits this directly
// wizardResult.matched_annex_iii_categories → ['employment', 'biometrics']
```

### 1.3 Role Translation (System Track Only)

The wizard collects `provider_or_deployer` in Section 5 (post-classification). This gates **system obligations only**. Model/GPAI obligations are gated separately by `gpai_obligation_holder` (see Section 1.4).

| Wizard `provider_or_deployer` | System obligation filter: `applies_to_roles` |
|---|---|
| `Provider` | `['provider']` |
| `Deployer` | `['deployer']` |
| `Both` | `['provider', 'deployer']` |

**Critical design note:** When role is `Both`, the filter should include obligations that apply to providers OR deployers (union, not intersection). The user is simultaneously both roles, so they owe both sets of obligations.

### 1.4 GPAI Model Translation (Model Track Only)

The wizard produces `model_result` as a parallel classification track, independent of the system classification. GPAI obligations are **not gated by `provider_or_deployer`**. They are gated by `gpai_obligation_holder`, which the wizard derives from a separate question ("Are you the provider placing this model on the EU market?").

The model profile maps to model-track obligation records (where `obligation_track == "model"`) using the `model_applicability` fields defined in Section 5.2. It does not use system-track fields like `risk_levels` or `applies_to_roles`.

| Wizard `model_result` | Model obligation filter: `model_applicability.model_risk_levels` |
|---|---|
| `none` | No model-track obligations shown. Block 4 does not render. |
| `gpai` | Include obligations where `model_risk_levels` contains `gpai` |
| `gpai_systemic_risk` | Include obligations where `model_risk_levels` contains `gpai` or `gpai_systemic_risk` (systemic risk is a superset) |

| Wizard `gpai_obligation_holder` | Model obligation filter: `model_applicability.holder_types` |
|---|---|
| `self` | Include obligations where `holder_types` contains `self`. Show as directly applicable. |
| `upstream_provider` | Include obligations where `holder_types` contains `upstream_provider`. Show with contextual note: "These obligations fall on your upstream model provider, not directly on you. Shown so you understand the regulatory context of the model you depend on." |
| `not_applicable` | Block 4 does not render. |

| Wizard `gpai_open_source_exception` | Post-filter behavior on `model_applicability.open_source_treatment` |
|---|---|
| `true` (and `model_result == 'gpai'`) | For obligations with `open_source_treatment == "reduced_scope"`: show with `open_source_note` attached. For obligations with `open_source_treatment == "exempt"`: omit from display entirely. The obligation does not apply. |
| `true` (and `model_result == 'gpai_systemic_risk'`) | No effect. Open-source exception does not apply to systemic risk models. |
| `false` | No effect. All model obligations shown at full scope. |

### 1.5 Art. 50 Transparency Triggers as System Conditions

The wizard populates `article_50_transparency_triggers[]` with specific triggers. These map to `system_conditions` in the obligation schema.

| Wizard Art. 50 trigger | Obligation schema `system_conditions.condition_id` |
|---|---|
| `interacts_directly_with_people` | `system_interacts_with_natural_persons` |
| `generates_synthetic_content` | `system_generates_synthetic_content` |
| `detects_emotions_or_categorises` | `system_categorises_biometrically` |
| `creates_deep_fakes` | `system_generates_synthetic_content` (same obligation, stricter labelling) |
| `generates_text_as_news` | `system_generates_text_published_as_news` |

### 1.6 Timing Data Pass-Through

The wizard's `timing` object passes through to the obligation list display layer. It does not participate in obligation filtering (all obligations apply regardless of deadline), and it does not modify stored obligation record fields. It drives two display-layer computations: `display_effective_from` on each obligation card, and the priority ranking.

**Key separation:** `effective_from` on the obligation record is the canonical legal date from the statute. `display_effective_from` is computed at render time by applying the wizard's timing context to the record's stored date. The record is never mutated.

| Wizard `timing` field | Display layer usage |
|---|---|
| `compliance_deadline` | Primary deadline shown on the result screen header |
| `rules_enforceable_now` | If true, show "Enforceable now" badge on obligations where `display_effective_from <= today` |
| `legacy_system` | If true, show note: "Legacy system. Obligations apply upon significant design change." |
| `annex_i_extended_deadline` | If present, compute `display_effective_from = annex_i_extended_deadline` for obligations where `system_result == high_risk_annex_i`. The obligation record's `effective_from` is unchanged. |
| `public_authority_deadline` | If present, compute `display_effective_from = public_authority_deadline` for deployer obligations when the deployer is a public authority. The obligation record's `effective_from` is unchanged. |

```javascript
// System-track only. Model-track obligations use their effective_from directly
// (no profile-specific deadline overrides apply to GPAI obligations).
function computeDisplayEffectiveFrom(obligation, timingContext, systemResult) {
  if (obligation.obligation_track !== 'system') {
    return obligation.effective_from;  // model-track: no overrides
  }

  // Default: use the obligation record's canonical date
  let displayDate = obligation.effective_from;

  // Annex I systems get extended deadline
  if (systemResult === 'high_risk_annex_i' && timingContext.annex_i_extended_deadline) {
    displayDate = timingContext.annex_i_extended_deadline;
  }

  // Public authority deployers get extended deadline
  if (timingContext.public_authority_deadline
      && obligation.applies_to_roles.includes('deployer')) {
    displayDate = timingContext.public_authority_deadline;
  }

  return displayDate;
}
```

### 1.7 Default Filter Settings (Not Wizard Translations)

These values are not translated from wizard output. They are default filter constraints for this specific tool context.

| Filter field | Default value | Rationale |
|---|---|---|
| `applicable_frameworks` | `['eu_ai_act']` | This wizard is EU AI Act only. When NIST/ISO frameworks are added, this becomes a user-selectable input. |
| `geography` | `['EU']` | Default jurisdiction for this wizard. All EU AI Act obligations carry `EU`. |
| `delivery_scope` | Include `system` and `both`, exclude `organizational` | System-track filter. Applies to Block 3 only. Model-track obligations (Block 4) use `obligation_track` as their discriminator. |
| `is_sme` | `null` | Not collected in v1. All obligations shown at full scope. |

---

## 2. Assembled Profile Vectors

The translation map produces two separate profile objects, one per obligation track, plus a shared display context. System and model obligations follow different actor models, different timelines, and different filtering logic. The bridge keeps them separate so the filter and UI can treat each track on its own terms.

```javascript
function buildSystemProfile(wizardResult, postClassification) {
  return {
    // From final classification result
    risk_level: translateRiskLevel(wizardResult.system_result),
    annex_iii_categories: extractAnnexCategories(wizardResult),
    art_50_triggers: wizardResult.article_50_transparency_triggers || [],

    // Role gates system obligations
    role: translateRole(postClassification.provider_or_deployer),

    // Default settings for this wizard
    applicable_frameworks: ['eu_ai_act'],
    geography: ['EU'],
    is_sme: null
  };
}

function buildModelProfile(wizardResult) {
  return {
    // From GPAI classification track
    model_result: wizardResult.model_result,
    gpai_obligation_holder: wizardResult.gpai_obligation_holder,
    gpai_open_source_exception: wizardResult.gpai_open_source_exception || false,

    // Default settings
    applicable_frameworks: ['eu_ai_act']
  };
}

function buildDisplayContext(wizardResult) {
  return {
    // Shared context for rendering, not filtering
    timing: wizardResult.timing,
    confidence: wizardResult.confidence,
    system_result: wizardResult.system_result  // needed for display_effective_from computation
  };
}
```

**Why two profiles:** The system track is gated by `provider_or_deployer` and filtered by risk level, Annex III categories, and Art. 50 triggers. The model track is gated by `gpai_obligation_holder` and filtered by `model_result`. These are different regulatory tracks under the AI Act (Chapter III vs. Chapter V), with different timelines (GPAI obligations enforceable from Aug 2025; high-risk system obligations from Aug 2026). Mixing them in one profile object obscures that separation.

---

## 3. Updated Flow

The current result screen (UX Spec Section 3.10) ends with classification + free-text `post_classification_notes`. The obligation list replaces the "What this means for you" section.

### 3.0 Actor Questions and Where They Come From

The obligation list requires two actor inputs, one per track. They come from different points in the flow:

| Actor input | Track it gates | Where it is captured | When it is asked |
|---|---|---|---|
| `provider_or_deployer` | System obligations (Block 3) | Post-classification role question on the result screen | After classification, before Block 3 renders. Shown only when Block 3 is active. |
| `gpai_obligation_holder` | Model obligations (Block 4) | Wizard Step 7, Q3: "Are you the provider placing this model on the EU market?" | During classification. Already captured by the wizard. Passed through in the result payload. |

The system-track role question is new (added to the result screen) and conditional on Block 3 rendering. The model-track actor question is not new; it is already part of the wizard's Step 7 GPAI flow and produces `gpai_obligation_holder` in the result payload. The bridge consumes it directly.

If `model_result == 'none'` (no GPAI track), the Step 7 actor question was never asked and `gpai_obligation_holder` is `not_applicable`. Block 4 does not render.

```
Wizard Steps 0-8 (includes Step 7 GPAI actor question)
  → Classification result (badge, reasons, GPAI result, timeline)
  → If Block 3 will render:
      System role question: "Did you build this system, or deploy one built by someone else?"
      [We built it]  [We deploy it]  [Both]
       (Provider)     (Deployer)      (Both)
  → Obligation list renders:
      Block 1: Coverage banner (split by track)
      Block 2: Priority queue (directly applicable only)
      Block 3: System obligations by category (if system_result qualifies)
      Block 4: Model obligations (if model_result != 'none')
```

### 3.1 Block Render Decisions

The obligation screen renders four blocks. Each block's visibility is determined independently. The system track depends on `system_result`. The model track depends on `model_result`. The overall screen renders if at least one track produces content.

**Block 3 (System Obligations) render decision:**

| `system_result` | Block 3 renders? | If not, show instead |
|---|---|---|
| `not_ai_system` | No | "This software does not meet the AI system definition under Article 3(1). No EU AI Act obligations apply." |
| `out_of_scope` | No | "This AI system is outside the scope of the EU AI Act. [Reason from system_reasons]" |
| `prohibited` | No | "This practice is prohibited under Article 5. It cannot be deployed in the EU. Consult legal counsel immediately." |
| `high_risk_annex_i` | Yes | System obligations with Annex I extended deadline applied |
| `high_risk_annex_iii` | Yes | System obligations at standard deadlines |
| `limited_risk_transparency` | Yes | Art. 50 transparency obligations only |
| `minimal_risk` | No | "No specific system obligations identified by this tool for your profile." |

**Block 4 (Model Obligations) render decision:**

| `model_result` | Block 4 renders? |
|---|---|
| `none` | No |
| `gpai` | Yes |
| `gpai_systemic_risk` | Yes |

**Block 1 (Coverage Banner) and Block 2 (Priority Queue):**

Block 1 renders whenever Block 3 or Block 4 renders. Its content adapts: show system coverage line if Block 3 is active, model coverage line if Block 4 is active, both if both are active.

Block 2 renders whenever there are directly applicable obligations from either track. If only upstream-provider model obligations exist (no system obligations, no self-held model obligations), Block 2 is empty and should not render.

**Combined screen decision:**

| Block 3 | Block 4 | Screen behavior |
|---|---|---|
| Renders | Renders | Full obligations screen: Blocks 1-4 |
| Renders | Does not render | System-only screen: Blocks 1-3 |
| Does not render | Renders | Model-only screen: Blocks 1, 2 (if self-held), 4. Show system-result message above Block 1. |
| Does not render | Does not render | No obligations screen. Show system-result message only. |

**Note on `minimal_risk` + GPAI:** A system classified as `minimal_risk` produces no system obligations (Block 3 does not render), but if `model_result != 'none'`, Block 4 still renders. The user sees the minimal-risk system message plus the model obligations section below it. The role question is not shown because Block 3 is not active and Block 4 is gated by `gpai_obligation_holder`, which was already captured in the wizard.

### 3.2 Role Question Placement

The `provider_or_deployer` question is shown **only when Block 3 will render** (i.e., when `system_result` produces system obligations). It gates system-track filtering only. Model-track filtering uses `gpai_obligation_holder`, which the wizard already captured in Step 7.

| Block 3 renders? | Block 4 renders? | Show role question? |
|---|---|---|
| Yes | Yes | Yes. Gates Block 3. Block 4 renders immediately alongside. |
| Yes | No | Yes. Gates Block 3. |
| No | Yes | No. Block 4 uses `gpai_obligation_holder` from wizard. Obligation list renders directly. |
| No | No | No. No obligations screen. |

**Design (when shown):** Inline on the result screen, after the classification badge and before the obligation list. Single question, three tappable cards (matching the wizard's existing card pattern). Block 3 appears immediately after selection. Block 4 appears alongside without waiting for this answer.

```
┌────────────────────────────────────────────────┐
│  CLASSIFICATION BADGE                          │
│  [icon] High-Risk AI System -- Annex III       │
│  [icon] GPAI Model (if applicable)             │
├────────────────────────────────────────────────┤
│  PLAIN-LANGUAGE SUMMARY                        │
│  2-3 sentences                                 │
├────────────────────────────────────────────────┤
│  TRIGGERING REASONS                            │
│  - Annex III, point 4(a): Recruitment          │
├────────────────────────────────────────────────┤
│  COMPLIANCE DEADLINE                           │
│  [timeline with highlighted date]              │
├────────────────────────────────────────────────┤
│  YOUR ROLE (shown only when Block 3 active)    │
│  "Are you the company that built this AI       │
│   system, or are you deploying one built       │
│   by someone else?"                            │
│                                                │
│  [We built it]  [We deploy it]  [Both]         │
│   (Provider)     (Deployer)      (Both)        │
├────────────────────────────────────────────────┤
│  OBLIGATIONS (appears after role selection)     │
│                                                │
│  Block 1: Coverage banner (split by track)     │
│  Block 2: Priority section                     │
│  Block 3: System obligations by category       │
│  Block 4: Model obligations (if applicable)    │
│                                                │
│  [Download PDF]  [Start over]                  │
└────────────────────────────────────────────────┘
```

---

## 4. Obligation List Component Specification

### 4.1 Four-Block Layout

**Block 1: Coverage Banner (Split by Track)**

Fixed banner at the top of the obligation list section, with separate coverage statements for each active track.

**System obligations coverage:**
"Showing applicable system obligations from [N] EU AI Act articles (Art. 9, 10, 11, 12, 13, 14, 15, 16, 17, 26, 27, 50, 72, 73). Organisational obligations (such as AI literacy under Art. 4) are not included. [Show covered articles]"

**Model obligations coverage** (shown only when `model_result != 'none'`):
"Showing GPAI model obligations from covered articles (Art. 53). [Show covered articles]"

Note: Arts. 54 (systemic risk) and 55 (codes of practice) are in the target scope but will be added as the obligation dataset expands. The banner should update to "Arts. 53-55" once those records are authored and reviewed. Until then, show only what the current dataset actually covers.

Both coverage statements share a common footer: "This is not a complete legal inventory."

Styling: muted background, informational tone. Not a warning, not an error. A factual scope statement.

**Block 2: Priority Section**

Headline: "Start here"

Shows the top 5-8 obligations that are **directly applicable to the user**, ranked by:
1. `display_effective_from` proximity (nearest deadline first, using computed dates)
2. `sanction_band.max_fine_turnover_pct` (higher penalty tier first)

**Directly applicable** means:
- System obligations where the user is the provider or deployer (as selected in the role question)
- Model obligations where `gpai_obligation_holder == 'self'` (the user is the GPAI provider)

**Excluded from Block 2:**
- Model obligations where `gpai_obligation_holder == 'upstream_provider'`. These are awareness context, not duties the user owes. They appear only in Block 4 with the upstream-provider note. Surfacing upstream duties in "Start here" would mislead users about what they personally need to implement.

Each item is a compact obligation card (see 4.2 below).

If `timing.legacy_system == true`, prepend a note: "Your system was on the market before the application date. These obligations apply if you make a significant design change."

If any directly applicable obligation has `display_effective_from <= today`, it gets an "Enforceable now" badge and sorts to the top regardless of other ranking.

**Block 3: System Obligations by Category**

All filtered system obligations grouped by the 20-category taxonomy, rendered as collapsible sections.

Each section header shows: category name + obligation count (e.g., "Human Oversight (3)").

Collapsed by default. User taps to expand and see obligation cards within that category.

Empty categories are not shown.

Sort order within each category: by `display_effective_from`, then by `source_code` for stable ordering.

**Block 4: Model Obligations (GPAI)**

Shown only when `model_result != 'none'`. This is a peer section to Block 3, not a category within it. Model obligations follow a different regulatory track (Chapter V), a different timeline (enforceable from Aug 2025), and a different actor model (`gpai_obligation_holder` rather than `provider_or_deployer`).

Section headline: "GPAI Model Obligations"

If `gpai_obligation_holder == 'upstream_provider'`, the entire section is wrapped in a contextual note:

```
┌─────────────────────────────────────────────────┐
│  i  These obligations fall on your upstream     │
│     model provider, not directly on you.        │
│     Shown so you understand the regulatory      │
│     context of the model you depend on.         │
└─────────────────────────────────────────────────┘
```

If `gpai_open_source_exception == true` and `model_result == 'gpai'`, show note: "Reduced obligations apply for open-source GPAI models under Art. 53(2)."

GPAI obligations are not grouped by the 20-category taxonomy (which is system-oriented). They render as a flat list within this section, since the initial GPAI obligation set is small (Art. 53 at launch, expanding to Arts. 53-55).

### 4.2 Obligation Card Design

Each obligation renders as a card. The card layout is the same across both tracks, but the field mappings differ.

```
┌─────────────────────────────────────────────────┐
│  [Priority badge]           [Effective date]    │
│  High                       2 Aug 2026          │
│                                                 │
│  Plain-language requirement                     │
│  "Your system must include measures that allow  │
│   human operators to effectively oversee the    │
│   system during operation."                     │
│                                                 │
│  Source: Art. 14(1)         Actor: Provider      │
│                                                 │
│  > Why this applies to you                      │
│  > Priority reasoning                           │
│                                                 │
│  [Enforceable now] (conditional badge)          │
└─────────────────────────────────────────────────┘
```

**System-track card fields (Block 3):**

| Card element | Schema field | Display logic |
|---|---|---|
| Priority badge | `priority_label` | Colour-coded: high (amber), medium (blue), standard (grey) |
| Effective date | `effective_from` + timing context | Computed as `display_effective_from` using `computeDisplayEffectiveFrom()` from Section 1.6. |
| Requirement text | `plain_language_requirement` | Primary display text. 1-3 sentences. |
| Source reference | `source_code` | e.g., "Art. 14(1)". Links to EUR-Lex if `legal_source.eur_lex_url` is present. |
| Actor indicator | `applies_to_roles` | Shows "Provider", "Deployer", or "Provider + Deployer" |
| "Why this applies" | Expandable. Generated from `applicability_conditions` matched against system profile. e.g., "This obligation applies because your system is classified as high-risk under Annex III (employment domain) and you are the provider." |
| Priority reasoning | `priority_reason` | Expandable. e.g., "High -- enforceable from 2 August 2026, falls in the EUR 15M / 3% sanction band." |
| Enforceable now badge | Computed from `display_effective_from <= today` | Shown only when the obligation is already enforceable based on the profile-aware date. |
| SME note | `sme_treatment_note` | Shown conditionally if `is_sme == true` and `sme_treatment != 'none'`. Not shown in v1 (SME status not collected). |

**Model-track card fields (Block 4):**

| Card element | Schema field | Display logic |
|---|---|---|
| Priority badge | `priority_label` | Same colour coding as system track. |
| Effective date | `effective_from` | Model-track obligations use the canonical date directly (no profile overrides). |
| Requirement text | `plain_language_requirement` | Primary display text. |
| Source reference | `source_code` | e.g., "Art. 53(1)(a)". |
| Actor indicator | `model_applicability.holder_types` | Shows "GPAI Provider" when holder is `self`. Shows "Upstream Provider" with contextual note when holder is `upstream_provider`. Does not use `applies_to_roles`. |
| "Why this applies" | Expandable. Generated from `model_result` and `gpai_obligation_holder`. e.g., "This obligation applies because the underlying model is classified as a GPAI model and you are the GPAI provider placing it on the EU market." |
| Priority reasoning | `priority_reason` | Expandable. Required for model-track cards that appear in Block 2 (where `gpai_obligation_holder == 'self'`). e.g., "High -- enforceable from 2 August 2025, GPAI provider obligations." |
| Open-source note | `model_applicability.open_source_note` | Shown when `open_source_treatment == "reduced_scope"` and the user's model qualifies. |
| Enforceable now badge | Computed from `effective_from <= today` | GPAI obligations (enforceable from Aug 2025) will typically show this badge. |

### 4.3 Art. 50 Transparency Obligations

Art. 50 obligations apply in parallel to any system classification (including high-risk). They appear within Block 3 (System Obligations) under the "Transparency and Disclosure" category. Art. 50 is a system-track obligation, not a model-track obligation.

Each Art. 50 obligation card should cross-reference the specific trigger from the wizard: "This applies because your system [interacts directly with people / generates synthetic content / etc.]"

### 4.4 Empty and Edge States

| State | Display |
|---|---|
| No system obligations match | "No specific system obligations identified by this tool for your profile. Other obligations such as AI literacy (Art. 4) may still apply to your organisation. Coverage may expand as our article dataset grows." + Coverage banner. Block 4 (model obligations) may still render if GPAI is applicable. |
| Only Art. 50 obligations (limited_risk) | Show Block 1 (banner) + Block 3 with only transparency category. Skip Block 2 (priority section). Banner reads: "Showing system-level transparency obligations only." Block 4 renders if GPAI is applicable. |
| High-risk with Art. 6(3) exception | Should not reach obligation list. Exception success means system exits high-risk. Wizard handles this. |
| Confidence is `ambiguous_consult_legal` | Show all applicable obligations but prepend a note: "Your classification has unresolved ambiguities. The obligations shown assume the classification is correct. We recommend confirming with legal counsel." |

### 4.5 PDF Export Extension

The existing PDF report (UX Spec Section 3.10) should be extended to include:

- Classification result (existing)
- Role selection
- Filtered obligation list (all obligations, not just priority)
- Coverage scope statement
- Priority reasoning for each obligation
- Timestamp and tool version

This makes the PDF a shareable compliance planning document, not just a classification receipt.

---

## 5. Obligation Schema Extensions Required

Before building the component, the obligation record schema (v1.3) needs extensions to support the model track. The current schema is fundamentally a system-obligation schema. The bridge now produces a model profile, but the schema has no clean way to receive it.

### 5.1 Add `obligation_track` Discriminator

Add a top-level field to every obligation record:

```json
"obligation_track": {
  "type": "string",
  "description": "Which regulatory track this obligation belongs to. System obligations come from Chapter III (high-risk systems) and Art. 50 (transparency). Model obligations come from Chapter V (GPAI models). This field is the primary discriminator for routing obligations to Block 3 vs Block 4 in the display.",
  "enum": ["system", "model"]
}
```

This replaces the implicit assumption that all records are system obligations. The filter uses it to route obligations to the correct track and block.

### 5.1b Track-Conditional Required Fields

The base obligation schema (v1.3) declares several fields as required. With the addition of `obligation_track`, requiredness becomes track-conditional. System-track fields are not meaningful on model-track records and vice versa.

**Always required (both tracks):**
`obligation_id`, `source_code`, `plain_language_requirement`, `legal_source`, `source_framework`, `obligation_track`, `category`, `effective_from`, `coverage_batch`, `record_version`, `last_reviewed_at`

**Required for system track only** (`obligation_track == "system"`):
`applies_to_roles`, `delivery_scope`, `applicability_conditions` (at least the object, even if empty)

**Required for model track only** (`obligation_track == "model"`):
`model_applicability` (with `model_risk_levels` and `holder_types` required inside)

**Not required for model track (may be absent or null):**
`applies_to_roles`, `delivery_scope`, `applicability_conditions`, `sme_treatment`

**Implementation note:** JSON Schema supports this via `if`/`then` blocks on `obligation_track`. System records validate against the existing required set. Model records validate against a parallel set that swaps `applies_to_roles` and `delivery_scope` for `model_applicability`.

**Category for model-track records:** The `category` enum is extended with `gpai_provider_obligations` for model-track records. This value is used for all GPAI obligations and does not participate in the Block 3 category grouping. Block 4 renders model obligations as a flat list, so the category serves only as a schema-level classifier and coverage-banner input, not a UI grouping mechanism. If the model obligation set grows to require sub-grouping (e.g., separating Art. 53 general obligations from Art. 54 systemic-risk obligations), additional model-specific category values can be added at that point.

### 5.2 Add Model-Specific Applicability Fields

For obligations where `obligation_track == "model"`, the existing `applies_to_roles` and `applicability_conditions` fields are not sufficient. Model obligations are gated by different actor logic and different conditions.

Add these fields (used only when `obligation_track == "model"`):

```json
"model_applicability": {
  "type": "object",
  "description": "Applicability conditions specific to model-track obligations. Used instead of system-track fields like applies_to_roles and risk_levels for filtering GPAI obligations.",
  "required": ["model_risk_levels", "holder_types"],
  "properties": {
    "model_risk_levels": {
      "type": "array",
      "description": "Which GPAI model classifications this obligation applies to.",
      "items": {
        "type": "string",
        "enum": ["gpai", "gpai_systemic_risk"]
      },
      "minItems": 1,
      "uniqueItems": true
    },
    "holder_types": {
      "type": "array",
      "description": "Which obligation holder types this obligation applies to. 'self' means the user is the GPAI provider. 'upstream_provider' means the obligation falls on someone else in the supply chain.",
      "items": {
        "type": "string",
        "enum": ["self", "upstream_provider"]
      },
      "minItems": 1,
      "uniqueItems": true
    },
    "open_source_treatment": {
      "type": "string",
      "description": "How this obligation is modified for open-source GPAI models under Art. 53(2). Only applies when model_risk_level is 'gpai' (not systemic risk).",
      "enum": ["none", "reduced_scope", "exempt"],
      "default": "none"
    },
    "open_source_note": {
      "type": "string",
      "description": "When open_source_treatment is not 'none', explains what changes for open-source models."
    }
  },
  "additionalProperties": false
}
```

### 5.3 Filtering Logic Update

The obligation schema's filtering pseudocode needs a track-aware branch:

```
for each obligation:

  if obligation.obligation_track == "system":
    // Existing system-track filter logic (unchanged)
    check source_framework → applicable_frameworks
    check applies_to_roles → profile.role
    check applicability_conditions (risk_levels, annex_iii, geographies, system_conditions)
    check delivery_scope (system or both)
    check review_status

  else if obligation.obligation_track == "model":
    // Model-track filter logic
    check source_framework → applicable_frameworks

    // Model risk level matching — SUPERSET RULE:
    // gpai_systemic_risk includes all gpai obligations plus systemic-risk-specific ones.
    // An obligation tagged for ['gpai'] matches both gpai and gpai_systemic_risk profiles.
    // An obligation tagged for ['gpai_systemic_risk'] matches only gpai_systemic_risk profiles.
    if modelProfile.model_result == 'gpai':
      require obligation.model_applicability.model_risk_levels contains 'gpai'
    else if modelProfile.model_result == 'gpai_systemic_risk':
      require obligation.model_applicability.model_risk_levels contains 'gpai'
              OR contains 'gpai_systemic_risk'

    check model_applicability.holder_types → modelProfile.gpai_obligation_holder
    check review_status

    // Open-source exemption (post-filter)
    if modelProfile.gpai_open_source_exception == true
       AND modelProfile.model_result == 'gpai':  // not systemic risk
      if obligation.model_applicability.open_source_treatment == "exempt":
        → OMIT from display entirely. The obligation does not apply.
      else if obligation.model_applicability.open_source_treatment == "reduced_scope":
        → INCLUDE, but attach open_source_note to display card.
      else:
        → INCLUDE at full scope.
```

**Design decision on `exempt`:** An exempt obligation is omitted, not shown with a note. The user should not see obligations that do not apply to them. This differs from `reduced_scope`, where the obligation still applies but in a lighter form. The distinction matters: showing an exempt obligation with a "does not apply" label adds noise without value and creates false anxiety. If the user needs to understand what exemptions they benefit from, that belongs in a summary statement on Block 4, not on individual cards.

**Editorial rule for `open_source_note`:** Records with `open_source_treatment == "reduced_scope"` cannot move to `approved` review status without an `open_source_note` explaining what changes for open-source models. This follows the same pattern as the SME treatment note rule in the obligation schema: the schema does not enforce the pairing at save time (to avoid blocking drafts), but the review gate catches it before production. Without the note, a reduced-scope card has no explanation, which defeats the purpose of carrying the field.

### 5.4 Annex III Category Canonical Code Set

Establish a single canonical code set for Annex III categories, consumed by the wizard, the obligation schema, and the bridge filter in lockstep. Three values currently diverge between the wizard and the obligation schema. Both must update to reference the same canonical values.

| Canonical value | Obligation schema action | Wizard action |
|---|---|---|
| `education` | Update from `education_vocational` | Already uses this value |
| `migration` | Update from `migration_asylum_border` | Already uses this value |
| `justice_democracy` | Update from `justice_democratic` | Already uses this value |

This is a shared-registry alignment, not one side adapting to the other.

### 5.5 Obligation Records Need Authoring

The component renders obligation records from a static JSON bundle. Before the component can be built and tested, author a minimum viable set of records across both tracks:

- **System track:** 10-15 records covering Art. 14 (human oversight) and Art. 12 (logging). These are well-understood obligations from the existing controls mapping work.
- **Model track:** 3-5 records covering Art. 53 (GPAI provider obligations). Needed to validate the model-track filtering and Block 4 rendering. Arts. 54-55 records are deferred until the coverage banner can honestly claim that scope.

---

## 6. Data Flow Summary

```
┌──────────────┐     ┌──────────────────────┐     ┌───────────────────┐
│  Wizard      │     │  Translation Map     │     │  System Filter    │
│  Result      │────>│                      │────>│                   │
│  Payload     │     │  buildSystemProfile()│     │  risk_level       │
│              │     │  extractAnnex()      │     │  annex_iii_cats   │
│ system_result│     │  translateRole()     │     │  art_50_triggers  │
│ system_reasons     │                      │     │  role             │
│ art_50_triggers    │                      │     │  delivery_scope   │
│              │     │                      │     │  review_status    │
│              │     └──────────────────────┘     └─────────┬─────────┘
│              │                                            │
│              │     ┌──────────────────────┐               v
│              │     │  Translation Map     │     ┌───────────────────┐
│              │────>│                      │     │  System           │
│ model_result │     │  buildModelProfile() │     │  Obligation Set   │
│ gpai_holder  │     │                      │     │  + Block 3        │
│ gpai_oss     │     └──────────┬───────────┘     └───────────────────┘
│              │                │
│              │                v                 ┌───────────────────┐
│              │     ┌──────────────────────┐     │  Model            │
│              │     │  Model Filter        │────>│  Obligation Set   │
│              │     │                      │     │  + Block 4        │
│              │     │  model_result        │     └───────────────────┘
│              │     │  gpai_holder         │
│              │     │  gpai_oss_exception  │              │
│              │     └──────────────────────┘              v
│              │                                  ┌───────────────────┐
│    timing    │─────────────────────────────────> │  Display Context  │
│  confidence  │                                  │                   │
│              │                                  │  display_effective│
└──────────────┘                                  │  _from computed   │
                                                  │  per obligation   │
                                                  └─────────┬─────────┘
                                                            │
                                                            v
                                                  ┌───────────────────┐
                                                  │  Obligation List  │
                                                  │  Component        │
                                                  │                   │
                                                  │  Block 1: Banner  │
                                                  │  (split by track) │
                                                  │  Block 2: Priority│
                                                  │  (direct only)    │
                                                  │  Block 3: System  │
                                                  │  Block 4: Model   │
                                                  └───────────────────┘
```

---

## 7. Open Questions

1. **Art. 6(3) exception with provider documentation.** When the exception succeeds, the wizard currently shows a note about Art. 6(4) documentation obligations. Should these obligations appear in the obligation list even though the system is no longer classified as high-risk? They are real legal duties but sit outside the standard obligation set.

2. **Deployer-becomes-provider scenario.** Known limitation #5 in the classification schema. If a deployer substantially modifies a system, they inherit provider obligations (Art. 25(1)(c)). Should the role question include a fourth option: "We deploy a modified version of someone else's system"? This would trigger provider obligations.

3. **Multi-system assessment.** The wizard currently assesses one system at a time. The obligation list component is scoped to one system. Multi-system support (showing obligation overlap across systems) is deferred.

4. **Obligation count expectation.** For a high-risk Annex III system where the user is a provider, approximately how many obligation records will the filter return? This affects the priority section cap (currently 5-8) and the browse section density. Need sample data to calibrate.
