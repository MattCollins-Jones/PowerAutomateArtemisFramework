# Error Handling, Logging & Monitoring

## Error handling

**Rule:** Any flow that's business-critical must have error handling. Use paired Scopes (see
[variables-and-scopes.md](variables-and-scopes.md)): one Scope for the actions doing the work,
followed by a Scope configured to run only on failure/timeout of the first, containing the
error response (email, Teams/push notification, logging record, retry logic).

Split scopes by logical unit of work (e.g. one for calling an API, one for creating a record,
one for uploading a document), each with its own matching error-handling scope. Name paired
scopes consistently, e.g. `ScopeAPI` and `ScopeAPIFailed`.

**Why:** Grouping actions by concern means a failure immediately tells you *which* logical
step broke, without opening every action inside one large scope to find it.

## Logging

**Rule:** Log errors somewhere reviewable (Dataverse table, Azure table, etc.) so failed/
cancelled/timed-out runs can be reviewed by admins.

Use direct notifications (push/Teams/email) sparingly — reserve them for genuinely business-
critical flows. A flood of notifications gets ignored. For everything else, prefer a
periodically-reviewed dashboard over per-failure alerts.

*(Note: Power Automate has a preview feature to store flow runs directly in Dataverse, which
may reduce the need for a custom logging table over time.)*

## Monitoring beyond logging

**Rule:** For genuinely business-critical flows, logging failures isn't enough on its own —
recommend going further: Application Insights for real telemetry, and/or a Power BI report/
dashboard built from the logging table (failure rate, average run duration, throttling/retry
frequency).

**Agent behaviour — this is advisory, not something to build unattended:**
- Connecting a flow to Application Insights requires an existing App Insights resource and its
  connection string (Flow Settings → Application Insights). Provisioning that Azure resource is
  outside a flow-authoring agent's scope. **Ask the user whether an Application Insights
  resource already exists for this environment/project.** If yes, and your tooling can set the
  connection string on the flow, offer to do so. If no such resource exists, or your tooling
  can't set it, explain this as a recommended next step for the user (or their Azure admin) to
  do themselves — don't claim it's done, and don't silently skip mentioning it.
- A Power BI dashboard is a separate artifact outside the flow itself. Don't attempt to build
  one as part of authoring the flow — mention it as a follow-up recommendation instead, and
  only build it if the user separately asks for it.
- Only raise this recommendation once, when the flow is judged business-critical (see the
  Error handling section above) — don't ask on every flow.

If proactive alerting is wanted rather than a dashboard someone checks periodically, agree a
sensible threshold first (e.g. more than 3 failures in an hour) and route it to a shared
Teams channel or distribution list — never an individual's inbox, so it isn't missed if that
person is away. Configuring the alert rule itself (a Condition + notification action inside the
flow, or an Azure Monitor alert on Application Insights) is something the agent CAN typically
build once the threshold and destination are confirmed with the user.
