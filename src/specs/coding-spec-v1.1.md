# LatentMesh Reference Implementation — Coding Spec
## Version 1.1

---

## Overview

This spec defines every type, file, and contract needed to build a working reference implementation of the LatentMesh evidence plane. The implementation proves one loop: **obligation → control → SK filter → evidence → reviewer**.

**Runtime:** .NET 8, Semantic Kernel (latest stable), SQLite via Microsoft.Data.Sqlite, System.Text.Json  
**Obligations:** EU AI Act Article 12 (logging/traceability) + Article 14 (human oversight)  
**Agent:** Customer support agent with 3 tools + 1 fallback  
**Deployment:** docker-compose (agent app + OTel Collector)

---

## Pinned Implementation Details

### 1. Event Envelope

Every evidence event uses this exact shape. No exceptions.

```csharp
public sealed record EvidenceEvent
{
    public required string EventId { get; init; }        // GUID, unique per event
    public required string TraceId { get; init; }        // GUID, shared across one interaction
    public required int Attempt { get; init; }           // starts at 1, increments on retry
    public required DateTimeOffset Timestamp { get; init; }
    public required string EventType { get; init; }      // from the 8-event taxonomy
    public required string[] ArticleRefs { get; init; }  // e.g. ["art-12"]
    public required string[] ControlRefs { get; init; }  // e.g. ["CTRL-12.1"]
    public required JsonElement Payload { get; init; }   // event-specific data, varies by type
}
```

`EventId` is the primary key. `TraceId` is the correlation key. `Attempt` disambiguates retries. `Payload` is a `JsonElement` — not a `Dictionary`, not an `object` — so it serializes cleanly and the schema is explicit per event type.

### 2. Pack Upsert Rule

When the pack assembler runs:
- It queries all events for the given `TraceId`.
- It groups by `Attempt` and takes the **highest attempt number that has a `response.emitted` event** (meaning that attempt completed).
- If no attempt completed, the pack is marked `status: "incomplete"` and uses the latest attempt's artifacts.
- The pack is written via upsert keyed on `TraceId`. If a pack already exists for that `TraceId`, the entire row is replaced. This is safe because the pack is deterministically assembled from the same events.

### 3. Response Storage

`response.emitted` stores **both** full text and a SHA-256 hash. Full text is needed for the reviewer to see what was sent. The hash is needed for tamper detection — if someone later claims the response was different, the hash in the evidence pack is the source of truth.

---

## Event Taxonomy (8 events)

| Event Type | Payload Fields | Article Refs |
|---|---|---|
| `prompt.rendered` | `rendered_prompt` (string), `system_prompt_hash` (string), `model_id` (string), `temperature` (decimal) | `["art-12"]` |
| `model.completion.received` | `raw_completion` (string), `finish_reason` (string), `token_usage` (object: `prompt_tokens`, `completion_tokens`), `planned_actions` (string[]) | `["art-12"]` |
| `tool.call.requested` | `function_name` (string), `arguments` (object), `control_ref` (string) | `["art-12"]` |
| `oversight.pause_requested` | `function_name` (string), `arguments` (object), `rule_id` (string), `rule_condition` (object) | `["art-14"]` |
| `oversight.decision` | `decision` (enum: `approved`, `denied`), `reviewer_id` (string), `rationale` (string), `decision_timestamp` (DateTimeOffset) | `["art-14"]` |
| `tool.call.completed` | `function_name` (string), `result` (object), `duration_ms` (long) | `["art-12"]` |
| `response.emitted` | `response_text` (string), `response_hash` (string), `token_count` (int) | `["art-12"]` |
| `evidence.pack.assembled` | `pack_id` (string), `event_count` (int), `obligations_covered` (string[]), `status` (enum: `complete`, `incomplete`) | `["art-12"]` |

---

## Evidence Pack Schema

```csharp
public sealed record EvidencePack
{
    public required string PackId { get; init; }          // GUID
    public required string TraceId { get; init; }         // matches all events
    public required DateTimeOffset AssembledAt { get; init; }
    public required string Status { get; init; }          // "complete" or "incomplete"
    public required int Attempt { get; init; }            // which attempt this pack represents
    public required string[] ObligationsCovered { get; init; } // ["art-12", "art-14"]
    public required string[] ControlsCovered { get; init; }

    // Evidence sections
    public required TraceSection Trace { get; init; }
    public required ApprovalRecord[] ApprovalRecords { get; init; }
    public required EvalResult[] EvalResults { get; init; }   // empty array for v0
    public required ConfigSnapshot Config { get; init; }

    // Raw events for auditability
    public required EvidenceEvent[] RawEvents { get; init; }
}

public sealed record TraceSection
{
    public required string RenderedPrompt { get; init; }
    public required string SystemPromptHash { get; init; }
    public required string ModelCompletion { get; init; }
    public required ToolAction[] ToolActions { get; init; }
    public required string FinalResponse { get; init; }
    public required string FinalResponseHash { get; init; }
}

public sealed record ToolAction
{
    public required string FunctionName { get; init; }
    public required JsonElement Arguments { get; init; }
    public required JsonElement Result { get; init; }
    public required long DurationMs { get; init; }
    public required string ControlRef { get; init; }
    public required bool OversightTriggered { get; init; }
}

public sealed record ApprovalRecord
{
    public required string RuleId { get; init; }
    public required string FunctionName { get; init; }
    public required JsonElement Arguments { get; init; }
    public required string Decision { get; init; }       // "approved" or "denied"
    public required string ReviewerId { get; init; }
    public required string Rationale { get; init; }
    public required DateTimeOffset DecisionTimestamp { get; init; }
}

public sealed record EvalResult
{
    public required string EvalId { get; init; }
    public required string EvalType { get; init; }
    public required string Result { get; init; }
    public required JsonElement Details { get; init; }
}

public sealed record ConfigSnapshot
{
    public required string ModelId { get; init; }
    public required decimal Temperature { get; init; }
    public required string SystemPromptHash { get; init; }
    public required string PolicyManifestVersion { get; init; }
    public required DateTimeOffset CapturedAt { get; init; }
}
```

---

## Policy Manifest Schema

File: `oversight-rules.json`

```json
{
  "version": "0.1.0",
  "rules": [
    {
      "rule_id": "oversight-refund-threshold",
      "tool": "IssueRefund",
      "condition": {
        "field": "amount",
        "operator": "gt",
        "value": 50.00,
        "type": "decimal"
      },
      "action": "require_approval",
      "obligation_ref": "art-14",
      "control_ref": "CTRL-14.2"
    }
  ]
}
```

### Condition Evaluation

`PolicyEnforcer` loads rules at startup. When a tool call is requested:
1. Find all rules where `rule.tool` matches the function name.
2. For each matching rule, extract `condition.field` from the tool's argument dictionary.
3. Parse the argument value to the declared `condition.type` (`decimal`, `string`, `int`).
4. Apply the operator (`gt`, `gte`, `lt`, `lte`, `eq`, `in`).
5. If any rule's condition evaluates to `true` and `action` is `require_approval`, return the rule. Otherwise return null.

No expression parsing. No scripting. Typed comparison only.

```csharp
public sealed record PolicyRule
{
    public required string RuleId { get; init; }
    public required string Tool { get; init; }
    public required PolicyCondition Condition { get; init; }
    public required string Action { get; init; }
    public required string ObligationRef { get; init; }
    public required string ControlRef { get; init; }
}

public sealed record PolicyCondition
{
    public required string Field { get; init; }
    public required string Operator { get; init; }   // gt, gte, lt, lte, eq, in
    public required JsonElement Value { get; init; }
    public required string Type { get; init; }        // decimal, string, int
}
```

---

## File-by-File Specification

### Build Order and File List

Build in this exact order. Each step depends only on the steps above it.

---

### Step 1: Evidence Primitives

**File: `src/LatentMesh.RefImpl.Agent/Evidence/EvidenceEvent.cs`**
- The `EvidenceEvent` record defined above.
- No dependencies.

**File: `src/LatentMesh.RefImpl.Agent/Evidence/EvidencePack.cs`**
- The `EvidencePack`, `TraceSection`, `ToolAction`, `ApprovalRecord`, `EvalResult`, `ConfigSnapshot` records defined above.
- Depends on: `EvidenceEvent`.

**File: `src/LatentMesh.RefImpl.Agent/Evidence/EvidenceStore.cs`**
- Class `EvidenceStore` with constructor taking a SQLite connection string.
- `InitializeAsync()` — creates two tables:
  - `events` (event_id TEXT PK, trace_id TEXT, attempt INT, timestamp TEXT, event_type TEXT, article_refs TEXT, control_refs TEXT, payload TEXT)
  - `packs` (pack_id TEXT PK, trace_id TEXT UNIQUE, attempt INT, assembled_at TEXT, status TEXT, obligations_covered TEXT, controls_covered TEXT, pack_json TEXT)
- `WriteEventAsync(EvidenceEvent)` — inserts one event row.
- `GetEventsByTraceIdAsync(string traceId)` — returns all events for a trace, ordered by timestamp.
- `UpsertPackAsync(EvidencePack)` — inserts or replaces the pack row keyed on `trace_id`.
- `QueryPacksAsync(PackQuery query)` — returns packs filtered by article_id, control_id, date range, oversight-only flag. Used by the explorer.
- `GetPackByTraceIdAsync(string traceId)` — returns one pack.

**File: `src/LatentMesh.RefImpl.Agent/Evidence/PackQuery.cs`**
```csharp
public sealed record PackQuery
{
    public string? ArticleId { get; init; }
    public string? ControlId { get; init; }
    public DateTimeOffset? From { get; init; }
    public DateTimeOffset? To { get; init; }
    public bool OversightOnly { get; init; } = false;
    public int Limit { get; init; } = 50;
}
```

---

### Step 2: Policy Engine

**File: `src/LatentMesh.RefImpl.Agent/Policy/oversight-rules.json`**
- The JSON manifest defined above, embedded as a content file.

**File: `src/LatentMesh.RefImpl.Agent/Policy/PolicyRule.cs`**
- The `PolicyRule` and `PolicyCondition` records defined above.
- Also defines `PolicyManifest`:
```csharp
public sealed record PolicyManifest
{
    public required string Version { get; init; }
    public required PolicyRule[] Rules { get; init; }
}
```

**File: `src/LatentMesh.RefImpl.Agent/Policy/PolicyEnforcer.cs`**
- Class `PolicyEnforcer`.
- Constructor loads `oversight-rules.json` and deserializes to `PolicyManifest`.
- `Evaluate(string toolName, Dictionary<string, JsonElement> arguments)` — returns `PolicyRule?`. If a matching rule's condition is satisfied, returns the rule. Otherwise null.
- Internal method `EvaluateCondition(PolicyCondition condition, JsonElement argumentValue)` — does typed comparison. Switch on `condition.Type` to parse, switch on `condition.Operator` to compare.
- Property `ManifestVersion` — exposes the version string for config snapshots.

---

### Step 3: Interaction Context

**File: `src/LatentMesh.RefImpl.Agent/Orchestrator/InteractionContext.cs`**
- Class `InteractionContext`.
- Created by the orchestrator at the start of each interaction.
- Injected: `EvidenceStore` (so events can be persisted eagerly).
- Properties:
  - `TraceId` (string, GUID, set once at creation)
  - `Attempt` (int, starts at 1, incrementable)
  - `ActiveObligations` (string[], set at creation: `["art-12", "art-14"]`)
  - `Events` (thread-safe list of `EvidenceEvent`, in-memory copy for pack assembly)
- Methods:
  - `EmitEventAsync(string eventType, string[] articleRefs, string[] controlRefs, object payload)` — creates an `EvidenceEvent` with the context's TraceId, Attempt, current timestamp, serializes payload to `JsonElement`, adds to the in-memory list, **and writes to `EvidenceStore` immediately**. This ensures crash recovery: events emitted before a failure are already persisted.
  - `IncrementAttempt()` — bumps the attempt counter.
- This is the single source of truth for event accumulation during one interaction. Filters receive it via dependency injection (scoped lifetime).

---

### Step 4: Tools

**File: `src/LatentMesh.RefImpl.Agent/Tools/OrderTools.cs`**
- Static class with SK `[KernelFunction]` attributes.
- In-memory data: a small dictionary of fake orders.

```csharp
[KernelFunction("GetOrder")]
[Description("Retrieves order details by order ID")]
public static OrderResult GetOrder(string orderId) { ... }

[KernelFunction("CheckRefundEligibility")]
[Description("Checks whether an order is eligible for a refund")]
public static RefundEligibilityResult CheckRefundEligibility(string orderId) { ... }

[KernelFunction("IssueRefund")]
[Description("Issues a refund for an order")]
public static RefundResult IssueRefund(string orderId, decimal amount, string reason) { ... }
```

- Return types are simple records:
```csharp
public sealed record OrderResult(string OrderId, string CustomerName, decimal Total, string Status, DateTimeOffset OrderDate);
public sealed record RefundEligibilityResult(string OrderId, bool IsEligible, string Reason, decimal MaxRefundAmount);
public sealed record RefundResult(string OrderId, decimal AmountRefunded, string ConfirmationId, bool Success);
```

**File: `src/LatentMesh.RefImpl.Agent/Tools/EscalationTools.cs`**
```csharp
[KernelFunction("EscalateToHuman")]
[Description("Escalates a case to a human support agent")]
public static EscalationResult EscalateToHuman(string caseId, string reason) { ... }

public sealed record EscalationResult(string CaseId, string TicketId, string Message);
```

---

### Step 5: Filters

**File: `src/LatentMesh.RefImpl.Agent/Filters/PromptRenderEvidenceFilter.cs`**
- Implements `IPromptRenderFilter`.
- Injected: `InteractionContext`.
- In `OnPromptRenderAsync`:
  - After rendering, emits `prompt.rendered` with the rendered prompt, system prompt hash (SHA-256 of system message), model ID, and temperature.
  - Calls `await next(context)` first, then emits. The rendered prompt is only available after `next`.

**File: `src/LatentMesh.RefImpl.Agent/Filters/ModelCompletionEvidenceFilter.cs`**
- Implements `IFunctionInvocationFilter`.
- Only fires when the invoked function is the chat completion function (check `context.Function.PluginName` or function metadata).
- After `await next(context)`, emits `model.completion.received` with the raw completion text, finish reason, token usage, and planned actions extracted from the result.

**File: `src/LatentMesh.RefImpl.Agent/Filters/ToolCallEvidenceFilter.cs`**
- Implements `IAutoFunctionInvocationFilter`.
- Injected: `InteractionContext`, `PolicyEnforcer`, `IApprovalHandler`.
- In `OnAutoFunctionInvocationAsync`:
  1. **Pre-execution:** Emits `tool.call.requested` with function name, arguments, and the mapped control ref (lookup from a static control map: `GetOrder` → `CTRL-12.1`, `CheckRefundEligibility` → `CTRL-12.1`, `IssueRefund` → `CTRL-14.2`, `EscalateToHuman` → `CTRL-14.3`).
  2. **Policy check:** Calls `PolicyEnforcer.Evaluate(functionName, arguments)`.
     - If a rule fires:
       - Emits `oversight.pause_requested`.
       - Calls `IApprovalHandler.RequestApprovalAsync(...)` — blocks until decision.
       - Emits `oversight.decision`.
       - If denied: sets `context.Result` to a denial message, does NOT call `await next(context)`, returns.
  3. **Execution:** Starts a stopwatch, then calls `await next(context)`, then stops the stopwatch.
  4. **Post-execution:** Emits `tool.call.completed` with result and duration.

**File: `src/LatentMesh.RefImpl.Agent/Filters/IApprovalHandler.cs`**
- Interface:
```csharp
public interface IApprovalHandler
{
    Task<ApprovalDecision> RequestApprovalAsync(
        string traceId,
        string functionName,
        Dictionary<string, JsonElement> arguments,
        PolicyRule triggeredRule);
}

public sealed record ApprovalDecision(
    string Decision,      // "approved" or "denied"
    string ReviewerId,
    string Rationale,
    DateTimeOffset DecisionTimestamp);
```

**File: `src/LatentMesh.RefImpl.Agent/Filters/ConsoleApprovalHandler.cs`**
- Implements `IApprovalHandler`.
- For v0: prints the pending action to the console, prompts for approve/deny + rationale, returns the decision.
- Reviewer ID is hardcoded to `"console-reviewer-1"` for v0.

---

### Step 6: Pack Assembler

**File: `src/LatentMesh.RefImpl.Agent/Orchestrator/PackAssembler.cs`**
- Class `PackAssembler`.
- Injected: `EvidenceStore`.
- `AssembleAsync(string traceId, ConfigSnapshot config)`:
  1. Reads all events for the given `traceId` from `EvidenceStore` (not from an in-memory list — events were written eagerly by `InteractionContext`).
  2. Groups by attempt. Selects the highest attempt that contains a `response.emitted` event. Falls back to latest attempt if none completed.
  3. Extracts `TraceSection` from the selected attempt's events: finds `prompt.rendered`, `model.completion.received`, all `tool.call.*` events, `response.emitted`.
  4. Extracts `ApprovalRecord[]` from `oversight.decision` events.
  5. Sets `EvalResults` to empty array.
  6. Builds the `EvidencePack`. The pack's `RawEvents` array contains only the events from the selected attempt — it does **not** include `evidence.pack.assembled`.
  7. Calls `EvidenceStore.UpsertPackAsync(pack)`.
  8. After the pack is persisted, writes a separate `evidence.pack.assembled` event to the store. This is an **external bookkeeping event** — it confirms the pack was written but is not part of the pack itself and is not counted in the pack's `event_count`.
  9. Returns the pack.

**Ownership boundary:** `InteractionContext` writes events eagerly as they are emitted. `PackAssembler` only reads events and upserts the pack. No component batch-writes events after the fact.

---

### Step 7: Orchestrator

**File: `src/LatentMesh.RefImpl.Agent/Orchestrator/AgentOrchestrator.cs`**
- Class `AgentOrchestrator`.
- Injected: `Kernel` (SK), `EvidenceStore`, `PackAssembler`, `PolicyEnforcer`.
- `RunInteractionAsync(string customerMessage)`:
  1. Creates `InteractionContext` with new GUID trace ID, attempt 1, obligations `["art-12", "art-14"]`, and an `EvidenceStore` reference for eager event writes.
  2. Registers the context in DI scope so filters can access it.
  3. Invokes the SK agent with the customer message.
  4. After the agent returns, captures the final response. Emits `response.emitted` with full text + SHA-256 hash (written eagerly to store by the context).
  5. Builds `ConfigSnapshot` (model ID, temperature, system prompt hash, policy manifest version, current timestamp).
  6. Calls `PackAssembler.AssembleAsync(context.TraceId, configSnapshot)`.
  7. Returns the agent's response to the caller.
- Retry logic: wraps step 3 in a try/catch. On transient failure, calls `context.IncrementAttempt()` and retries up to 2 times.

**File: `src/LatentMesh.RefImpl.Agent/Program.cs`**
- Console app entry point.
- Sets up DI: SQLite connection, `EvidenceStore`, `PolicyEnforcer`, `ConsoleApprovalHandler`, SK Kernel with OpenAI chat completion, tool plugins, filters, `PackAssembler`, `AgentOrchestrator`.
- Runs a REPL loop: reads customer input from console, calls `orchestrator.RunInteractionAsync(input)`, prints the response.
- On startup, calls `EvidenceStore.InitializeAsync()`.

---

### Step 8: Evidence Explorer API

**File: `src/LatentMesh.RefImpl.Explorer/Program.cs`**
- ASP.NET Minimal API.
- Three endpoints:
  - `GET /api/packs?articleId=&controlId=&from=&to=&oversightOnly=&limit=` — calls `EvidenceStore.QueryPacksAsync`, returns JSON array of pack summaries.
  - `GET /api/packs/{traceId}` — calls `EvidenceStore.GetPackByTraceIdAsync`, returns full pack JSON.
  - `GET /api/summary?from=&to=` — queries all packs in range, returns counts: total interactions, Art. 12 count, Art. 14 count, approved, denied.
- Shares the same SQLite database file as the agent app.

---

### Step 9: Explorer UI

**File: `src/LatentMesh.RefImpl.Explorer/wwwroot/index.html`**
- Single-page React app (loaded via CDN, no build step for v0).
- Three tabs: **Pack List**, **Pack Detail**, **Obligation Summary**.
- Fetches from the three API endpoints above.
- Pack List: table with columns (trace ID truncated, timestamp, obligations, oversight triggered, status). Click a row to open Pack Detail.
- Pack Detail: vertical timeline view showing each event in order — prompt, model output, tool calls, oversight decisions, response. Each section tagged with obligation/control badges.
- Obligation Summary: two cards (Art. 12 count, Art. 14 count) + a small bar chart of approved vs. denied for the selected date range.

---

### Step 10: OTel Pipeline

**File: `otel-collector-config.yaml`**
- Receivers: OTLP (gRPC on 4317, HTTP on 4318).
- Processors: batch.
- Exporters:
  - `operational`: stdout for v0 (represents the ops observability sink).
  - `evidence`: OTLP/HTTP to a local endpoint or file exporter. For v0, this is a file exporter writing to `/data/evidence-traces/`.
- Pipelines:
  - `traces/operational`: receiver → batch → operational exporter.
  - `traces/evidence`: receiver → batch → evidence exporter.
- The agent app sends spans to the collector tagged with `pipeline=operational` or `pipeline=evidence`. The collector routes by attribute.

**File: `docker-compose.yml`**
```yaml
services:
  agent:
    build: ./src/LatentMesh.RefImpl.Agent
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
      - EVIDENCE_DB_PATH=/data/evidence.db
    volumes:
      - evidence-data:/data
    stdin_open: true
    tty: true

  explorer:
    build: ./src/LatentMesh.RefImpl.Explorer
    ports:
      - "5100:8080"
    environment:
      - EVIDENCE_DB_PATH=/data/evidence.db
    volumes:
      - evidence-data:/data

  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    volumes:
      - ./otel-collector-config.yaml:/etc/otelcol/config.yaml
      - evidence-data:/data
    ports:
      - "4317:4317"
      - "4318:4318"

volumes:
  evidence-data:
```

**File: `src/LatentMesh.RefImpl.Agent/Dockerfile`**
- .NET 8 SDK build stage, runtime stage. Copies published output.

**File: `src/LatentMesh.RefImpl.Explorer/Dockerfile`**
- Same pattern. Exposes port 8080.

---

### Step 11: Tests

**File: `tests/LatentMesh.RefImpl.Tests/HappyPathTests.cs`**
- Scenario 1: Customer asks about an order. Only `GetOrder` and `CheckRefundEligibility` are called. No oversight triggered.
- Asserts: pack exists, status is complete, `ApprovalRecords` is empty, `ObligationsCovered` contains `art-12` only, all 7 expected events are present (prompt.rendered, model.completion.received, tool.call.requested ×2, tool.call.completed ×2, response.emitted — no oversight events).

**File: `tests/LatentMesh.RefImpl.Tests/OversightApprovalTests.cs`**
- Scenario 2: Customer requests a refund above threshold. `IssueRefund` triggers oversight. Approval handler is mocked to return `approved`.
- Asserts: pack exists, `ApprovalRecords` has one entry with `decision = "approved"`, `ObligationsCovered` contains both `art-12` and `art-14`, `oversight.pause_requested` and `oversight.decision` events are present, `tool.call.completed` for `IssueRefund` is present.

**File: `tests/LatentMesh.RefImpl.Tests/OversightDenialTests.cs`**
- Scenario 3: Same setup, approval handler returns `denied`.
- Asserts: pack exists, `ApprovalRecords` has one entry with `decision = "denied"`, `tool.call.completed` for `IssueRefund` is NOT present, agent response indicates denial/escalation.

**File: `tests/LatentMesh.RefImpl.Tests/ExplorerQueryTests.cs`**
- Scenario 4+5: Seeds the evidence store with multiple packs (some with oversight, some without). Queries by `articleId = "art-14"` and asserts only oversight packs are returned. Fetches one pack by trace ID and asserts all sections are present and linked.

All tests use an in-memory SQLite database and a mocked `IApprovalHandler` (no console interaction). The SK kernel is configured with a mocked chat completion service that returns deterministic responses.

---

## Control Map (static, hardcoded for v0)

| Tool | Control Ref | Obligation |
|---|---|---|
| `GetOrder` | `CTRL-12.1` (automated logging of data access) | Art. 12 |
| `CheckRefundEligibility` | `CTRL-12.1` | Art. 12 |
| `IssueRefund` | `CTRL-14.2` (human oversight over consequential actions) | Art. 14 |
| `EscalateToHuman` | `CTRL-14.3` (human handoff capability) | Art. 14 |

This map lives as a static dictionary in `ToolCallEvidenceFilter`. In Phase 2 it moves to the policy manifest.

---

## Files Referenced in This Spec

| # | File Path | Build Step |
|---|---|---|
| 1 | `src/LatentMesh.RefImpl.Agent/Evidence/EvidenceEvent.cs` | 1 |
| 2 | `src/LatentMesh.RefImpl.Agent/Evidence/EvidencePack.cs` | 1 |
| 3 | `src/LatentMesh.RefImpl.Agent/Evidence/EvidenceStore.cs` | 1 |
| 4 | `src/LatentMesh.RefImpl.Agent/Evidence/PackQuery.cs` | 1 |
| 5 | `src/LatentMesh.RefImpl.Agent/Policy/oversight-rules.json` | 2 |
| 6 | `src/LatentMesh.RefImpl.Agent/Policy/PolicyRule.cs` | 2 |
| 7 | `src/LatentMesh.RefImpl.Agent/Policy/PolicyEnforcer.cs` | 2 |
| 8 | `src/LatentMesh.RefImpl.Agent/Orchestrator/InteractionContext.cs` | 3 |
| 9 | `src/LatentMesh.RefImpl.Agent/Tools/OrderTools.cs` | 4 |
| 10 | `src/LatentMesh.RefImpl.Agent/Tools/EscalationTools.cs` | 4 |
| 11 | `src/LatentMesh.RefImpl.Agent/Filters/PromptRenderEvidenceFilter.cs` | 5 |
| 12 | `src/LatentMesh.RefImpl.Agent/Filters/ModelCompletionEvidenceFilter.cs` | 5 |
| 13 | `src/LatentMesh.RefImpl.Agent/Filters/ToolCallEvidenceFilter.cs` | 5 |
| 14 | `src/LatentMesh.RefImpl.Agent/Filters/IApprovalHandler.cs` | 5 |
| 15 | `src/LatentMesh.RefImpl.Agent/Filters/ConsoleApprovalHandler.cs` | 5 |
| 16 | `src/LatentMesh.RefImpl.Agent/Orchestrator/PackAssembler.cs` | 6 |
| 17 | `src/LatentMesh.RefImpl.Agent/Orchestrator/AgentOrchestrator.cs` | 7 |
| 18 | `src/LatentMesh.RefImpl.Agent/Program.cs` | 7 |
| 19 | `src/LatentMesh.RefImpl.Explorer/Program.cs` | 8 |
| 20 | `src/LatentMesh.RefImpl.Explorer/wwwroot/index.html` | 9 |
| 21 | `otel-collector-config.yaml` | 10 |
| 22 | `docker-compose.yml` | 10 |
| 23 | `src/LatentMesh.RefImpl.Agent/Dockerfile` | 10 |
| 24 | `src/LatentMesh.RefImpl.Explorer/Dockerfile` | 10 |
| 25 | `tests/LatentMesh.RefImpl.Tests/HappyPathTests.cs` | 11 |
| 26 | `tests/LatentMesh.RefImpl.Tests/OversightApprovalTests.cs` | 11 |
| 27 | `tests/LatentMesh.RefImpl.Tests/OversightDenialTests.cs` | 11 |
| 28 | `tests/LatentMesh.RefImpl.Tests/ExplorerQueryTests.cs` | 11 |
