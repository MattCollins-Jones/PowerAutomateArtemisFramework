# Retry Policies & Resilience

**Rule:** Don't leave the platform default retry policy unexamined on actions calling an
external service (API/connector). Make a deliberate choice:

- **Safe-to-retry actions** (e.g. calling a read API): use **Exponential** retry, count 4,
  minimum interval 5 seconds, maximum interval 1 hour, as a sensible default starting point.
- **Non-idempotent actions** (e.g. Send an Email, Create Row with no idempotency check): set
  retry policy to **None**, and rely on Scope/Catch error handling (see
  [error-handling-and-logging.md](error-handling-and-logging.md)) to decide what happens on
  failure instead.

**Why:** Retrying blindly can resolve transient failures (timeouts, 429s, blips) for free — but
retrying an action with side effects (sending an email, creating a record) risks duplicating
that side effect if the first attempt actually succeeded but the response timed out.

| Good | Good Reason | Bad | Bad Reason |
|---|---|---|---|
| Retry Policy: Exponential, Count 4, Interval PT5S | Gives transient errors a chance to resolve with sensible defaults | Retry Policy: Default (left unset) | No thought given to whether/how the action should retry |
| Retry Policy: None, on a Send an Email action | Prevents duplicate emails on a retried action | Retry Policy: Exponential, on a Create Row with no idempotency check | Could create duplicate records if the create succeeds but the response times out |

If you deviate from the sensible defaults above for a specific action, add a Note to the
action explaining why — so the next person understands it was deliberate.
