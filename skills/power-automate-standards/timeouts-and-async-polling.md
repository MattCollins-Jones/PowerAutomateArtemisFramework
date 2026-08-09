# Timeouts, Flow Duration & Long-Running/Async Work

## Flow duration

**Rule:** Cloud flows have a maximum run duration (30 days by default). If you're building
something expected to genuinely run long (e.g. waiting on an approval), document this in the
flow description, along with what should happen if that limit is ever hit.

## Action timeouts

**Rule:** Set an explicit timeout on any action calling out to an API — don't rely on the
connector's own default. Use ISO 8601 duration format (e.g. `PT5M` for 5 minutes).

- Internal/first-party calls: ~1 minute is usually enough.
- Third-party API calls: 5 minutes is a reasonable starting point.
- Anything longer should be a conscious, documented decision, not an accident.

| Good | Good Reason | Bad | Bad Reason |
|---|---|---|---|
| HTTP action calling an internal API, Timeout PT1M | Fails fast if something's wrong internally, rather than hanging | HTTP action calling an internal API, no Timeout set | Could hang a long time on the connector default before the flow moves on |
| HTTP action calling a slow third-party reporting API, Timeout PT5M, noted in the action | A deliberate, documented decision for a known-slow API | HTTP action calling a third-party API, timeout left on a very long default with no explanation | Unclear if the long timeout is intentional or an oversight |

## Long-running work: async HTTP and polling

**Rule:** For processes that won't complete within a normal HTTP timeout (report generation,
video transcoding, bulk export), don't just set a huge timeout and hope. Prefer, in order:

1. **The HTTP action's built-in Asynchronous Pattern support**, if the API returns a standard
   `202 Accepted` with a `Location`/`Retry-After` header. Power Automate polls this
   automatically — no extra actions or Do Until loop needed. This is always preferred where
   the API supports it.
2. **A manual polling loop**, only if the API doesn't support pattern 1 but does give you a
   job/request ID to query: kick off the job, then use a Do Until loop with a Delay and a
   status-check call inside it, exiting once status is complete (or failed).

### Manual polling pitfalls to avoid

- **Always cap the Do Until with a count limit as well as a status condition.** Without a
  count limit, a job that never returns the expected status will spin until the flow's overall
  duration limit (or the loop's own limits) are hit, wasting API calls the whole time.
- **Add a Delay between polls, and don't poll too aggressively.** Hammering an endpoint every
  few seconds for a job that takes twenty minutes burns API calls for no benefit — 30 seconds
  to a few minutes is more sensible, depending on typical job duration.
- **Each poll is its own API call.** A job polled every 30 seconds for an hour is 120 API
  calls just for polling — factor this into your API call budget (see
  [performance-and-api-calls.md](performance-and-api-calls.md)), and consider an
  increasing/exponential delay between polls instead of a fixed one.
- **Document the expected duration and polling strategy in the flow description**, e.g. "polls
  export job every 60s, expected to complete within 10 minutes, hard capped at 30 polls" — so
  anyone reviewing run history later understands why the run took as long as it did.
- **Consider whether this needs to happen inside a single flow run at all.** For genuinely long
  waits (hours), prefer a webhook/callback from the calling system if it supports one, or split
  "start the job" and "handle the completed job" into two flows joined by a webhook/scheduled
  check, rather than one flow sitting in a Do Until for hours.

| Good | Good Reason | Bad | Bad Reason |
|---|---|---|---|
| Do Until loop polling job status, Delay 60s, Count limit 30, noted "job normally completes in under 10 mins" | Bounded, documented, and paced sensibly against expected job duration | Do Until loop polling job status with no count limit, no delay | Risks hammering the API and running indefinitely if the job never reaches the expected status |
| HTTP action using the built-in Asynchronous Pattern against an API returning 202/Location | No extra actions needed, handled natively | Manually building a polling loop against an API that already supports 202/Location natively | Unnecessary complexity when the platform would have handled it |
