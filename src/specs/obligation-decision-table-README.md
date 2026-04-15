# Obligation decision tables — column reference

Companion doc for the three CSVs in this folder:

- `obligation-decision-table-system.csv` (15 rows) — Chapter III + Art. 50 obligations
- `obligation-decision-table-model.csv` (4 rows) — Art. 53 GPAI obligations
- `obligation-decision-table-exception.csv` (2 rows) — Art. 6(3) success-path duties

Each row is one obligation. The columns describe the conditions under which the bridge (`src/lib/eu-ai-act-classifier/bridge.ts`) + filter (`src/lib/eu-ai-act-classifier/obligationFilter.ts`) will surface that obligation to the user. Source of truth for the data is `src/data/eu-ai-act-classifier/obligations/*.ts` and the `ObligationRecord` type in `src/data/eu-ai-act-classifier/obligation-types.ts`.

---

## Columns that appear in all three CSVs

### `obligation_id`
Stable, unique identifier for the obligation record. The prefix encodes the track:

- `sys-*` — system track (Chapter III + Art. 50). Example: `sys-art14-1`.
- `mod-*` — model track (Chapter V, GPAI). Example: `mod-art53-1a`.
- `exc-*` — exception-duty (duties that persist after Art. 6(3) success). Example: `exc-art6-4`.

Used by the UI to key cards and by the PDF export to cross-reference obligations.

### `source_code`
Human-readable legal citation, as it appears on the UI card and in the PDF. Example: `Art. 14(1)-(4)`, `Art. 53(1)(a)`. Not a URL — the full legal source (article, paragraph, EUR-Lex URL) lives in the `legal_source` object in the TypeScript record and isn't flattened into the CSV.

### `plain_language_requirement`
The one- to three-sentence summary shown on the obligation card. Written for practitioners, not lawyers — it paraphrases the article text rather than quoting it. This is the body of the card in `ObligationCard.tsx`.

### `effective_from`
ISO date the obligation becomes enforceable.

- `2025-08-02` — GPAI obligations (Art. 53) are enforceable now. In the UI these get an "Enforceable now" badge.
- `2026-08-02` — Chapter III high-risk obligations, Art. 50 transparency obligations, and the Art. 6(3) exception duties all become enforceable on this date.

The ranker in `priorityRanker.ts` sorts by proximity to this date (closer → higher).

### `sanction_band`
Maximum fine band that applies to breaches of the obligation, formatted as `EUR <amount> / <turnover pct>`. The AI Act defines three bands:

- `EUR 35M / 7%` — prohibited practices under Art. 5 (not in these tables; prohibited practices suppress all obligations).
- `EUR 15M / 3%` — most Chapter III and Chapter V obligations.
- `EUR 7.5M / 1%` — Art. 50 transparency obligations and information duties.

Used by the ranker as a tiebreaker when two obligations share a deadline.

### `priority_label`
Display-time priority for ordering on the result screen. Values: `high`, `medium`, `standard`. Drives the coloured pill badge on the card and feeds the priority queue in Block 2 of the result UI.

---

## System-track columns (`...-system.csv`)

### `applies_to_roles`
Which role the obligation binds, matched against the user's role selection on the result screen. One or more of:

- `provider` — the entity that places the system on the market (or the substantial modifier, once the "substantial modification" follow-up is confirmed).
- `deployer` — the entity using the system under its own authority.

Multi-valued cells use `"provider, deployer"` (quoted, comma-separated). `sys-art73-1` (incident reporting) and `sys-art50-1` (AI interaction disclosure) both bind both roles. The filter in `filterSystemObligations()` intersects this against the role vector built by `translateRole()`.

### `risk_levels`
Which classification outcomes cause the obligation to appear. Uses the obligation schema's risk enum (`ObligationRiskLevel`), which is a level set above the wizard enum:

- `high_risk` — covers both `high_risk_annex_i` and `high_risk_annex_iii` wizard results (collapsed by `translateRiskLevel()` in `bridge.ts`).
- `limited_risk` — Art. 50 transparency obligations. Also fires for `high_risk`, because the AI Act applies transparency rules to any system meeting the trigger regardless of risk tier.
- `minimal_risk`, `unacceptable` — not currently used in any system-track row.

Multi-valued cells look like `"high_risk, limited_risk"`. All Chapter III obligations (Art. 9–15, 26, 27, 72, 73) are single-valued `high_risk`; only the three Art. 50 rows are multi-valued.

### `system_conditions`
Extra trigger that must be satisfied on top of `risk_levels`. Blank when the obligation applies by risk level alone. The three trigger IDs in these CSVs:

- `system_interacts_with_natural_persons` — the system interacts directly with people (Art. 50(1)). Translated from wizard field `interacts_directly_with_people`.
- `system_generates_synthetic_content` — the system generates or manipulates synthetic audio, image, video, or text (Art. 50(2), Art. 50(4)). Translated from wizard triggers `generates_synthetic_content`, `generates_deepfakes`, and `emotion_recognition_or_biometric_cat`.
- `system_generates_text_published_as_news` — AI-generated text published for public-interest purposes (not yet wired to any obligation row but reserved in the bridge map).

Mapping from wizard trigger names to condition IDs lives in `mapTriggerToConditionId` in `bridge.ts`.

### `delivery_scope`
How the obligation is delivered. Values in `ObligationRecord` type are `system`, `organizational`, or `both`. All rows in these CSVs are `system` — i.e., the obligation binds to the AI system itself (documentation, logging, safeguards, disclosures) rather than to the provider organisation as a whole.

---

## Model-track columns (`...-model.csv`)

### `model_risk_levels`
Which GPAI classification outcomes fire the obligation. Values:

- `gpai` — general-purpose AI model without systemic risk.
- `gpai_systemic_risk` — GPAI meeting the Art. 51 systemic-risk threshold (10²⁵ FLOPs or equivalent).

Every row in the model CSV lists both, because Art. 53 obligations apply to all GPAI models; Art. 55 adds more on top for systemic-risk models (those rows are deferred — see the note in `model-obligations.ts`).

The filter uses a superset rule: if `model_risk_levels` contains `gpai`, a model classified as `gpai_systemic_risk` still matches (systemic-risk is a superset of plain GPAI).

### `holder_types`
Who holds the obligation relative to the model. Values:

- `self` — the user is the entity that placed the GPAI model on the market (they're the provider of the model itself).
- `upstream_provider` — the user integrates a third-party GPAI model. These obligations appear with a contextual note saying "your upstream provider carries this duty; verify they are doing it."

Obligations that bind both (`"self, upstream_provider"`) appear in both contexts. Copyright (Art. 53(1)(c)) and training-content summary (Art. 53(1)(d)) are `self`-only because they can only be discharged by whoever trained the model.

### `open_source_treatment`
How the obligation changes for a GPAI model released under a free and open-source licence, per Art. 53(2). Values:

- `none` — the obligation still applies in full (e.g., copyright compliance under Art. 53(1)(c) cannot be waived by open-source status).
- `reduced_scope` — the obligation applies with a narrower scope. See `open_source_note` for what's reduced.
- `exempt` — the obligation does not apply to open-source models. Only Art. 53(1)(d) training-content summary is in this bucket.

The post-filter in `obligationFilter.ts` removes `exempt` rows when the model is open-source, and flags `reduced_scope` rows for the UI to render the contextual note.

### `open_source_note`
Free-text explanation shown on the card when `open_source_treatment` is `reduced_scope` (or `exempt`, if the row were rendered). Blank otherwise.

---

## Exception-track columns (`...-exception.csv`)

### `applies_to_roles`
Same semantics as in the system track. Both rows (`exc-art6-4`, `exc-art49-2`) are `provider` — these are the two duties the provider retains even after the Art. 6(3) exception lifts the high-risk classification.

### `triggered_when`
The specific condition on the wizard result that causes these rows to be rendered in the "Duties that still apply after the Art. 6(3) exception" section. Currently:

> Art. 6(3) exception applies to an Annex III system (`exception_applies = true`)

These rows do not use the standard `applicability_conditions.risk_levels` filter path — the filter recognises the exception-duty subclass and routes them to a separate block in the UI.

### `delivery_scope`
Same semantics as system track. Both rows are `system`.

---

## Columns omitted from the CSVs

A few fields from `ObligationRecord` are intentionally not flattened into the CSVs because they are internal to the TypeScript records or the UI, not decision inputs:

| Omitted field | Where to find it |
|---|---|
| `obligation_track` | Implied by the file (and the `obligation_id` prefix). |
| `legal_source.eur_lex_url` | In the TypeScript record; surfaced as a link on the card. |
| `category` | The 21-value taxonomy used to group cards in Block 3 of the UI; deterministic from the article, not a decision input. |
| `coverage_batch`, `record_version`, `last_reviewed_at`, `review_status` | Content-lifecycle metadata. |
| `priority_reason` | Free-text rationale shown on card expansion. |
| `sme_treatment`, `sme_treatment_note` | SME-specific treatment flags. Not populated in v1. |

If any of these become decision inputs (for instance if SME treatment starts changing which obligations appear), they should be added as CSV columns here too.

---

## Keeping this in sync

These CSVs are a flattened snapshot of the TypeScript records. When the source files change, these need to be regenerated:

- `src/data/eu-ai-act-classifier/obligations/system-obligations.ts`
- `src/data/eu-ai-act-classifier/obligations/model-obligations.ts`
- `src/data/eu-ai-act-classifier/obligations/exception-obligations.ts`
- `src/lib/eu-ai-act-classifier/bridge.ts` (trigger → condition_id map)
- `src/lib/eu-ai-act-classifier/obligationFilter.ts` (filter logic)

There is no automated generator — these were authored by hand against the records.
