# Additional Standards (Draft)

This is a proposed extension to the main coding standards, covering areas that aren't discussed yet. As with the rest of the framework, this is a starting point rather than a finished set of rules, so feel free to edit the wording, change the examples or drop anything that doesn't fit how your organisation works before merging this into the main page.

# Retry Policies

By default, actions that call an external service (an API, a connector) will retry on failure using the platform default. It's worth being deliberate about this instead of leaving it as-is, particularly for anything calling a third party.

For most connector/HTTP actions calling out to an API, an Exponential retry policy with a count of 4, a minimum interval of 5 seconds and a maximum interval of an hour is a sensible starting point. This gives a transient failure (a timeout, a 429, a blip in the other system) a chance to resolve itself without you having to build that logic yourself in a Scope.

Where retrying an action automatically isn't safe, for example sending an email or creating a record, where retrying could send a second email or create a duplicate record, set the retry policy to None and rely on your Scope/Catch error handling instead to decide what happens on failure.

| Good Example | Good Reason | Bad Example | Bad Reason |
|--------------|-------------|-------------|------------|
|Retry Policy: Exponential, Count 4, Interval PT5S| Gives transient errors a chance to resolve, sensible defaults for most APIs| Retry Policy: Default (left unset)| No thought given to whether the action should retry, or how|
|Retry Policy: None, on a Send an Email action| Prevents duplicate emails being sent on a retried action| Retry Policy: Exponential, on a Create Row action with no idempotency check| Could create multiple duplicate records if the create succeeds but the response times out|

If you deviate from these defaults for a specific action, it's worth adding a Note to the action explaining why, so the next person to look at the flow understands it was a deliberate choice and not an oversight.

# Secure Inputs and Outputs

Some actions in a flow will handle data that shouldn't be visible in the run history, this includes passwords, tokens, or other personal/sensitive data. Power Automate lets you mark an action's inputs and/or outputs as Secure, from the Settings (cog icon) on the action, which redacts them from the run history.

This is a different concern to storing secrets in Key Vault, mentioned in the Environment Variables section. Key Vault protects where the secret lives, Secure Inputs/Outputs protects what appears in the flow's run telemetry once it's been used. Both should be considered together, if you're pulling a secret out of Key Vault or an Environment Variable and using it in an action, that action's inputs and/or outputs should usually be marked Secure.

| Good Example | Good Reason | Bad Example | Bad Reason |
|--------------|-------------|-------------|------------|
|HTTP action calling an API with a Key Vault secret, Secure Inputs enabled| The secret used in the request is redacted from the run history| HTTP action calling an API with a Key Vault secret, Secure Inputs left off| The secret is visible in plain text to anyone who can view the run history|
|Update Row action writing a customer's date of birth, Secure Outputs enabled| Personal data isn't left sitting in the run history| Update Row action writing sensitive personal data, no Secure settings applied| Personal data is retained in run history for as long as retention is configured|

# Concurrency Control

Apply to Each loops run sequentially by default, one iteration at a time. This is usually the safest option, but for loops where each iteration doesn't depend on the others, you can turn on concurrency control and pick a degree (how many iterations run at once).

Before turning this on, check what the downstream system can actually handle. If you're calling an API with a rate limit of 10 requests a second, setting your concurrency degree to 5 gives you some headroom, setting it higher could just get you throttled instead of speeding anything up.

Triggers can also have concurrency control applied, this is worth considering for triggers that might fire in bursts, for example a Dataverse trigger on a table that gets bulk updated, so you don't end up with dozens of flow runs hammering the same downstream system at once.

Whatever degree you land on, it's worth noting the reasoning next to the setting (in the action or trigger's Note), so it's clear this was a considered decision and not just left on a default.

| Good Example | Good Reason | Bad Example | Bad Reason |
|--------------|-------------|-------------|------------|
|Apply to Each, Concurrency Control On, Degree 5, calling an API rate limited to 10/sec| Speeds up the loop while leaving headroom under the API's rate limit| Apply to Each, Concurrency Control On, Degree 50, calling the same API| Will likely get throttled, causing more failures/retries than running sequentially|
|Apply to Each, Concurrency Control Off, where each iteration updates the same parent record| Avoids race conditions where two iterations could overwrite each other's update| Apply to Each, Concurrency Control On, where each iteration updates the same parent record| Iterations run in parallel and can overwrite each other's changes|

## Pieter's Method

Turning on concurrency speeds up an Apply to Each, but the loop is still the bottleneck if you're using it purely to build up a variable, append to array/append to string variable actions can't run in parallel with concurrency control switched on, as each iteration needs to wait its turn to update the same variable.

Pieter Veenstra (SharePains) covers a neat way round this, referred to as Pieter's method, using a Compose action inside the Apply to Each instead of appending to a variable, then referencing that Compose's output collection from outside the loop once it's finished. As there's no variable being written to on each iteration, this plays nicely with concurrency control and can give a significant speed improvement on larger loops.

Worth a read if you're building anything that loops through more than a handful of records and currently leans on Append to Array/String Variable:

* [Compose instead of Append to Array/String Variable inside an Apply to Each](https://sharepains.com/2019/07/09/compose-apply-to-each-power-automate/)
* [The advanced Pieter's method (using it with other actions, and the concurrency speed-up)](https://sharepains.com/2020/03/11/pieters-method-for-advanced-in-flows/)

# Pagination and Large Data Volumes

When retrieving records with actions like List Rows (Dataverse) or Get Items (SharePoint), avoid just leaving these to pull back everything. Set an explicit Top Count and turn on Pagination with a sensible Threshold, rather than defaulting to "get everything".

If a flow is likely to deal with a genuinely large number of records, consider a paged approach, looping through using a paging cursor/skiptoken, rather than trying to bring everything back in a single action. This keeps the flow more predictable and avoids hitting connector limits as your data grows.

It's worth noting, in the action or the flow description, roughly how many records this is expected to deal with, so if that volume grows significantly over time, whoever maintains the flow knows to revisit the pagination settings.

| Good Example | Good Reason | Bad Example | Bad Reason |
|--------------|-------------|-------------|------------|
|List Rows – List Active Accounts, Top Count 500, Pagination On, Threshold 5000| Explicit limit set, with pagination available if the table grows beyond a single page| List Rows – List Active Accounts, no Top Count set| Will attempt to return every record with no limit, which can time out or fail as the table grows|
|Get Items – Get Open Requests, note added stating "expected ~200 rows/day"| Future maintainers know the expected volume and when to revisit the settings| Get Items – Get Open Requests, no indication of expected volume| No way to tell if current settings are still appropriate as data grows|

# Flow Run Duration and Timeouts

Cloud flows have a maximum run duration (30 days by default). Most flows won't get anywhere near this, but if you're building something that's expected to run for a long time, for example waiting on an approval, it's worth documenting this in the flow description, along with what should happen if that limit is ever hit.

Separately to the overall flow duration, individual actions calling out to an API can hang far longer than you'd want if left unconfigured. Set an explicit timeout on the action (Settings > Timeout, in ISO 8601 duration format, e.g. PT5M for 5 minutes) rather than relying on the connector's own default. A minute is usually enough for an internal/first-party call, five minutes is a reasonable starting point for a third-party API, longer than that should be a conscious decision, not an accident.

| Good Example | Good Reason | Bad Example | Bad Reason |
|--------------|-------------|-------------|------------|
|HTTP action calling an internal API, Timeout PT1M| Fails fast if something's gone wrong internally, rather than leaving the flow hanging| HTTP action calling an internal API, no Timeout set| Could hang for a long time on the connector's default before the flow moves on|
|HTTP action calling a slow third-party reporting API, Timeout PT5M, noted in the action| A deliberate, documented decision to allow more time for a known-slow API| HTTP action calling a third-party API, Timeout left on a very long default with no explanation| Unclear whether the long timeout is intentional or just an oversight|

## Long-Running Work: Async HTTP and Polling

Some processes you call out to, a report being generated, a video being transcoded, a bulk export, simply won't be ready by the time a normal HTTP action's timeout is up. Rather than setting a huge timeout and hoping for the best, this is a good use case for the HTTP action's built in **Asynchronous Pattern** support, or for building your own polling loop.

If the API you're calling supports the standard long-running operation pattern (returns a `202 Accepted` with a `Location`/`Retry-After` header), the HTTP action will handle this automatically, it polls the location on your behalf and only completes once the operation is actually finished. This is the preferred option where the API supports it, as it needs no extra actions building and no Do Until loop maintained.

Where the API doesn't support that pattern but does give you back a job/request ID you can query for status, you'll need to build the polling yourself: kick off the job, then use a Do Until loop with a Delay action and a status-check call inside it, exiting once the status comes back as complete (or failed).

A few pitfalls worth calling out if you're going down the manual polling route:

* **Always cap the Do Until with a count limit as well as a condition**, not just "until status = complete". Without this, a job that never finishes (or never returns the status you're expecting) will spin until the flow's overall run duration or the Do Until's own limits are hit, wasting API calls in the meantime.
* **Add a Delay between polls**, and don't poll too aggressively, hammering an endpoint every few seconds for a job that takes twenty minutes just burns through API calls for no benefit. A delay of 30 seconds to a few minutes, depending on how long the job normally takes, is more sensible.
* **Each poll is its own API call**, so a job that takes an hour and is polled every 30 seconds is 120 API calls, just for polling. Factor this into the API call budgeting mentioned earlier in this framework, and consider whether an increasing (exponential-style) delay between polls is more appropriate than a fixed one.
* **Document the expected duration and polling strategy in the flow description**, e.g. "polls export job every 60s, expected to complete within 10 minutes, hard capped at 30 polls". This means anyone looking at run history later understands why the flow took the time it did, and isn't left wondering if the long duration is a sign of something wrong.
* **Consider whether this really needs to happen inside a single flow run at all.** For genuinely long waits (hours, not minutes), a webhook/callback from the calling system (if it supports one) avoids tying up a flow run polling for a long period, or consider splitting the "start the job" and "handle the completed job" steps into two flows joined by a webhook or scheduled check, rather than one flow sitting in a Do Until for hours.

| Good Example | Good Reason | Bad Example | Bad Reason |
|--------------|-------------|-------------|------------|
|Do Until loop polling a job status, Delay 60s, Count limit 30, noted "job normally completes in under 10 mins"| Bounded, documented, and paced sensibly against the expected job duration| Do Until loop polling a job status with no count limit, no delay| Risks hammering the API and running indefinitely if the job never reaches the expected status|
|HTTP action using the built in Asynchronous Pattern against an API that returns 202/Location| No extra actions needed, handled natively by the connector| Manually building a polling loop against an API that already supports 202/Location natively| Unnecessary complexity when the platform would have handled this already|

# Child Flow Inputs and Outputs

The main standards already cover naming Child flows so they're easy to identify. It's also worth documenting what a Child flow expects as an input, and what it returns, particularly for anything triggered over HTTP or via Run a Child Flow.

This doesn't need to be anything formal, a note in the flow description or a short section on the linked ticket/PBI is enough, listing the fields expected in and out, which are required, and their types. This saves whoever is calling the Child flow from having to open it up and reverse engineer the schema.

If you do need to make a breaking change to what a Child flow expects or returns, treat it the same as any other significant change, bump the version in the description (as covered in Flow Creation) so it's clear to anyone still calling the old inputs/outputs that something's changed.

# Monitoring Beyond Logging

The Error Handling and logging section covers logging failures somewhere reviewable, for flows that are genuinely business critical, it's worth going a step further. Application Insights can be connected to give you proper telemetry on a flow beyond what's in the run history, and a simple Power BI report or dashboard (built from your logging table) can give a periodic view of failures, average run duration and how often actions are being throttled or retried, without needing someone to go and check each flow individually.

If you do want proactive alerting rather than a dashboard someone checks periodically, agree a sensible threshold first (e.g. more than 3 failures in an hour), and route it to a shared Teams channel or distribution list, not an individual's inbox, so it doesn't get missed if that person is away.

# HTTP Triggered Flows

The When an HTTP request is received trigger now supports an authentication parameter directly on the trigger, this should be your first line of defence, rather than something bolted on inside the flow afterwards. There are three options:

* **Any user in my tenant** – the default for new flows. Only requests carrying a valid bearer token for your own tenant will trigger the flow.
* **Specific users in my tenant** – restricts this further to named users or service principal object IDs that you list on the trigger. Use this where only one or two specific systems/service accounts should ever be calling this flow.
* **Anyone** – the old, legacy behaviour, no additional authentication, anyone with the URL can trigger it. This should be treated as the exception now, not the default, and only used where the calling system genuinely can't send a bearer token (e.g. a third party webhook that only supports a shared secret).

Where the calling system is another Microsoft Entra ID (Azure AD) registered app/service and can obtain a token, prefer setting this to Any user in my tenant or Specific users in my tenant over building your own validation logic inside the flow, this is enforced before the flow even starts running, rather than being a Condition you have to remember to add and maintain yourself.

Whatever mode the trigger is set to, also set a proper JSON schema for the Request Body, rather than leaving it wide open or generating it once from a sample and forgetting about it. Power Automate validates the incoming request against this schema before any actions run, so a malformed or unexpected payload gets rejected up front rather than causing a confusing failure two or three actions into the flow. This is a good baseline for every HTTP triggered flow, it's free, it's built in, but it only checks the shape of the request, not who sent it or whether it's genuine, so it's not a substitute for the authentication settings above.

For calling systems that can't authenticate this way (a lot of third party SaaS webhooks fall into this category), the trigger will need to stay on Anyone, and you'll still want to protect it yourself:

* A shared secret passed in the header or query string, checked with a Condition before the flow does anything else.
* Signature validation, if the calling system supports it. A number of SaaS platforms sign their webhook payloads with an HMAC hash of the body using a shared secret, sent in a header (e.g. `X-Hub-Signature-256`). Power Automate doesn't have a native action for this, the usual approach is a small Azure Function that recomputes the hash and returns whether it matches, called from a Condition near the start of the flow, terminating the run if it doesn't. This proves the payload hasn't been tampered with in transit, which authentication alone doesn't cover.
* IP restrictions, where the calling system has known, stable IPs. This isn't a setting on the Power Automate trigger itself, it needs something in front of the flow, such as Azure API Management or Front Door, configured to only forward requests from the allowed IP ranges on to the flow's URL. This is genuinely useful where you want one shared choke point across several flows/APIs, but it's additional Azure infrastructure to build and maintain, not a checkbox on the trigger.

Whichever approach is used, note it in the flow's description, including which authentication mode is set on the trigger and why. If the trigger is intentionally left on Anyone, say so, and explain what's compensating for it (shared secret, signature check etc.), so this doesn't look like an oversight in a future review. If you're using a shared secret, treat it the same as any other credential, rotate it periodically, in line with the guidance on Service Principal secrets above.

| Good Example | Good Reason | Bad Example | Bad Reason |
|--------------|-------------|-------------|------------|
|HTTP trigger set to Specific users in my tenant, listing the calling service principal's object ID, with a defined request body schema| Only the intended caller can trigger the flow, enforced by the platform before the flow runs, and malformed requests are rejected before any actions run| HTTP trigger left on Anyone with no other validation, calling system is a first party Entra ID app that could authenticate| Misses out on built in, platform enforced authentication for no reason|
|HTTP trigger on Anyone (third party webhook, can't send a bearer token), with a signature check against a shared secret in an early Condition, noted in the flow description| A deliberate, documented compensating control for a caller that can't use OAuth, and confirms the payload is genuine| HTTP trigger on Anyone with no validation, relying only on the URL being hard to guess| Anyone who obtains the URL can trigger the flow with any payload|
|Webhook endpoint restricted to known caller IPs via API Management in front of the flow| Requests from outside the expected source are rejected before reaching the flow at all| HTTP trigger URL shared directly, no schema and no way to restrict by caller| No control over who can call it, or what they send|

---

As always, this is a living document, if you disagree with any of the above or have a better way of doing something, raise it and we can update this accordingly.
