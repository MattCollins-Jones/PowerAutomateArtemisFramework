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

**Rule:** For genuinely business-critical flows, go beyond basic logging: connect Application
Insights for real telemetry, and/or build a simple Power BI report/dashboard from your logging
table showing failure rate, average run duration, and throttling/retry frequency.

If proactive alerting is wanted rather than a dashboard someone checks periodically, agree a
sensible threshold first (e.g. more than 3 failures in an hour) and route it to a shared
Teams channel or distribution list — never an individual's inbox, so it isn't missed if that
person is away.
