# Cloud Flow Coding Standards — Proposed Additions

This document proposes new sections to complement the existing
`Cloud-Flow-Coding-Standards` wiki page. Each section below is **draft
guidance** — edit, tighten, or discard anything that doesn't fit your
org's needs before merging into the main standards doc/wiki.

---

## 1. Retry Policies

Configure explicit retry policies on actions that call external services,
rather than relying solely on Scope-level try/catch.

- Default retry policy for HTTP / connector actions calling external APIs:
  `Exponential Interval`, count `4`, minimum interval `PT5S`, maximum
  interval `PT1H`.
- Use `None` only for actions that are explicitly non-idempotent (e.g.
  sending an email, creating a record) where a silent retry could cause
  duplicates — instead handle failure explicitly in the Catch scope.
- Document the chosen retry policy in the action's description if it
  deviates from the default, so reviewers know it was a deliberate choice.

```json
"retryPolicy": {
  "type": "exponential",
  "count": 4,
  "interval": "PT5S",
  "maximumInterval": "PT1H"
}
```

## 2. Secure Inputs / Outputs

Mark sensitive data at the action level so it's redacted from run history.

- Any action handling credentials, tokens, personal data, or secrets must
  have **Secure Inputs** and/or **Secure Outputs** enabled (Settings gear
  on the action → Secure Inputs/Outputs).
- This applies in addition to storing the secret itself in Key Vault —
  Key Vault protects the secret at rest, Secure Inputs/Outputs protects it
  from appearing in the flow's run history/telemetry.
- Flag in code review: any action referencing an Environment Variable or
  Key Vault secret should have secure inputs/outputs considered.

## 3. Concurrency Control

Set explicit concurrency behavior instead of leaving defaults unconsidered.

- **Apply to Each**: default concurrency is off (sequential). Only enable
  concurrency (and set a degree, e.g. 5–20) when loop iterations are
  independent of each other and the downstream system can handle parallel
  calls (check API rate limits first).
- **Trigger concurrency control**: for triggers that may fire in bursts
  (e.g. Dataverse row triggers), consider enabling trigger concurrency
  control and setting a `degreeOfParallelism` to avoid overwhelming
  downstream systems or hitting connector throttling.
- Document the chosen concurrency degree and the reasoning (e.g. "API X
  rate limit is 10 req/s, set to 5 for headroom") in the action/trigger
  description.

## 4. Pagination & Large Data Handling

- Avoid unbounded "get all records" calls. When using `List rows`
  (Dataverse), `Get items` (SharePoint), or similar, set an explicit
  `Top Count` and enable **Pagination** with a sane `Threshold` rather
  than defaulting to "all records."
- For flows that may process large result sets, prefer a paged/batched
  processing pattern (e.g. loop with `skiptoken`/paging cursor) over
  loading everything into memory in one action.
- Document the expected maximum record volume for each data-fetching
  action so future maintainers know if the pagination settings still hold.

## 5. Flow Run Duration & Timeout Limits

- Cloud flows have a maximum run duration of 30 days (default) — flows
  expected to run long (e.g. waiting on approvals) should have this
  documented explicitly, along with what happens if the timeout is hit.
- Set explicit **action-level timeouts** (`limit.timeout`, ISO 8601
  duration) on any HTTP/connector call that could hang, rather than
  relying on the connector's default (which can be very long).
- Standard default: `PT1M` for internal API calls, `PT5M` for
  external/third-party APIs unless a longer duration is justified and
  documented.

```json
"limit": {
  "timeout": "PT5M"
}
```

## 6. Child Flow Contracts

For any child flow invoked via HTTP trigger or "Run a Child Flow":

- Document the expected **input schema** (required/optional fields, types)
  and **output schema** in the flow's description or a linked doc.
- Version the contract — if breaking changes are made to inputs/outputs,
  bump the child flow's version suffix (per existing naming convention)
  rather than silently changing the contract for existing callers.
- Prefer a versioned trigger schema over free-form JSON so callers get
  validation errors early rather than runtime failures downstream.

## 7. DLP (Data Loss Prevention) Considerations

- Before introducing a new connector to a flow, check the environment's
  DLP policy to confirm the connector's data group (Business/
  Non-Business/Blocked) doesn't conflict with connectors already used in
  the same flow.
- Flows that mix a Business-grouped connector (e.g. Dataverse, SQL) with a
  Non-Business one (e.g. Twitter) in the same flow will be blocked by
  default DLP policies — validate this at design time, not at deployment.
- Document any DLP exceptions/exemptions granted for a flow's connectors
  in the flow description.

## 8. Testing Strategy

- Before promoting a flow beyond Dev, run it via the **Test** button with
  representative sample data covering: happy path, at least one expected
  error path (to validate Scope/Catch handling), and any documented edge
  cases (e.g. boundary values like the 2025/2026 year check pattern).
- Where flows depend on external connectors, prefer testing against a
  **staging/sandbox connection** in Dev/Test environments rather than
  production endpoints, swapped via environment variables or connection
  references at deployment time.
- Maintain a lightweight test-case list (inputs + expected output) per
  flow, stored alongside the flow's documentation, so regression testing
  after changes is repeatable.

## 9. Deployment Settings & Multi-Environment Configuration

- Maintain a `deployment-settings.json` per target environment
  (Dev/Test/Prod), checked into source control, listing:
  - Connection reference logical names → target connection IDs per
    environment.
  - Environment variable values per environment.
- Use `pac solution create-settings` to generate the template, and keep it
  updated whenever a new connection reference or environment variable is
  added to the solution.
- Never commit connection **secrets** into `deployment-settings.json` —
  only connection reference mappings; secrets stay in Key Vault per the
  existing Environment Variables section.

## 10. Observability Beyond Logging

- For business-critical flows, integrate run telemetry with **Application
  Insights** (via the flow's Run History Retention + Insights connector,
  or Dataverse Analytics) rather than relying solely on manual run-history
  inspection.
- Build a lightweight **Power BI dashboard** (or reuse an existing one)
  surfacing: failed runs per flow per day, average run duration, and
  throttled/retried action counts — to catch degradation before it
  becomes a user-reported incident.
- Define an alerting threshold (e.g. "> 3 failed runs in 1 hour") and
  route it to a Teams channel or email distribution list, not just the
  flow owner's personal notifications.

## 11. Webhook / HTTP Trigger Security

For any flow exposed via an HTTP request trigger:

- Do not rely on security-through-obscurity of the generated URL alone.
- Validate inbound requests using at least one of:
  - A shared secret passed in a header/query param, checked in a
    condition before proceeding.
  - HMAC signature validation if the calling system supports it (e.g.
    GitHub webhooks, some SaaS platforms).
  - IP allowlisting at the trigger or via Azure API Management / Front
    Door in front of the flow, if the calling system has stable egress
    IPs.
- Document which method is used, and rotate any shared secret on a
  defined schedule (align with the Service Principal secret rotation
  guidance in the Ownership section).

---

*Generated as a gap-analysis follow-up to `Cloud-Flow-Coding-Standards.md`.
Review each section, adjust to match your org's actual practices, and
merge the applicable parts into the main standards page.*
