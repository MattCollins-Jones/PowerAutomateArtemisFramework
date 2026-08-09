# API Call Efficiency, Concurrency & Pieter's Method

## API call budgeting

**Rule:** Every action in a flow costs 1 API call. Be deliberate about action count,
especially inside Apply to Each loops — a loop with 5 actions run over 10 records is 50 API
calls, not 5.

**Why:** Flows that run frequently and/or contain many actions can push an environment over
its API entitlement, causing throttling or additional cost. This compounds fastest inside
loops, so loops deserve the most scrutiny.

## Concurrency control

**Rule:** Apply to Each loops run sequentially by default. Turn on concurrency control (and
pick a degree) only when each iteration is independent of the others, and after checking what
the downstream system can actually sustain — don't just set a high degree hoping for speed.

Triggers can also have concurrency control applied — worth considering for triggers that fire
in bursts (e.g. a Dataverse trigger on a table that gets bulk-updated), so you don't spawn many
concurrent runs hammering the same downstream system at once.

**Agent behaviour — confirm independence before enabling:** Not every loop or trigger can
safely run concurrently — iterations that read-modify-write the same record, shared variable,
or external resource with ordering requirements will produce race conditions if parallelised.
Before turning concurrency on, check (or ask the user to confirm) whether iterations are truly
independent of each other and of run order. If it's unclear whether the downstream
system/record is safely parallelisable, ask rather than assume — this is the same failure mode
as the race-condition example in the table below.

Always note the chosen degree, and why, on the loop/trigger.

| Good | Good Reason | Bad | Bad Reason |
|---|---|---|---|
| Apply to Each, Concurrency On, Degree 5, calling an API rate-limited to 10/sec | Speeds things up while leaving headroom under the rate limit | Apply to Each, Concurrency On, Degree 50, same API | Will likely get throttled, causing more failures than running sequentially |
| Apply to Each, Concurrency Off, each iteration updates the same parent record | Avoids a race condition where iterations overwrite each other | Apply to Each, Concurrency On, each iteration updates the same parent record | Iterations run in parallel and can overwrite each other's changes |

## Pieter's Method

**Rule:** If an Apply to Each is only being used to build up a variable (Append to
Array/String Variable), turning on concurrency control won't help — those actions can't run in
parallel because every iteration must wait its turn to update the same variable. Instead, use
a Compose action inside the loop, then reference that Compose's output collection from outside
the loop once it finishes.

**Why:** Because no variable is being written to per-iteration, this plays nicely with
concurrency control and can meaningfully speed up larger loops.

**Further reading:**
- [Compose instead of Append to Array/String Variable inside an Apply to Each](https://sharepains.com/2019/07/09/compose-apply-to-each-power-automate/)
- [The advanced Pieter's method](https://sharepains.com/2020/03/11/pieters-method-for-advanced-in-flows/)

Worth applying any time a loop iterates through more than a handful of records and currently
relies on Append to Array/String Variable.
