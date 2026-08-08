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

# Child Flow Contracts

The main standards already cover naming Child flows so they're easy to identify. It's also worth documenting what a Child flow expects as an input, and what it returns, particularly for anything triggered over HTTP or via Run a Child Flow.

This doesn't need to be anything formal, a note in the flow description or a short section on the linked ticket/PBI is enough, listing the fields expected in and out, which are required, and their types. This saves whoever is calling the Child flow from having to open it up and reverse engineer the schema.

If you do need to make a breaking change to what a Child flow expects or returns, treat it the same as any other significant change, bump the version in the description (as covered in Flow Creation) so it's clear to anyone still calling the old contract that something's changed.

# DLP Considerations

Before adding a new connector to a flow, it's worth checking the environment's Data Loss Prevention policy first. Connectors are grouped (typically Business, Non-Business or Blocked) and mixing connectors from different groups in the same flow will get it blocked once DLP is enforced, this is much easier to catch while you're designing the flow than after it's built and ready to deploy.

If a flow needs an exception to the DLP policy for a specific connector, note this in the flow's description so it's clear this was an intentional, approved decision rather than something that will get flagged in a future review.

| Good Example | Good Reason | Bad Example | Bad Reason |
|--------------|-------------|-------------|------------|
|A flow using only Dataverse and Outlook, both grouped as Business| Consistent DLP grouping, won't be blocked once policy is enforced| A flow using Dataverse (Business) and Twitter (Non-Business) in the same flow| Will be blocked once DLP is enforced, requiring a rebuild to separate the connectors|
|Flow description noting "DLP exception approved for [connector] – ref #1234"| Clear that mixing groups here was a deliberate, approved decision| No mention of DLP anywhere despite mixed connector groups| Looks like an oversight rather than an approved exception, likely to get flagged in review|

# Testing

Before promoting a flow beyond a Dev environment, run it using the Test button with data that covers the happy path, at least one scenario that should trigger your error handling (to confirm the Scope/Catch actually works), and any known edge cases, similar to the year boundary check used elsewhere in this framework.

Where a flow calls out to an external system, prefer testing against a sandbox/staging connection where one is available, rather than testing directly against production, swap this using Connection References/Environment Variables as the flow is promoted through environments.

It's worth keeping a simple record of test cases (what you put in, what you expected to come out) alongside the flow's documentation, so if the flow changes later, someone can quickly re-run the same checks rather than working it out from scratch.

# Deployment Settings

For solutions being deployed across multiple environments, it's worth maintaining a deployment settings file (a JSON file listing Connection Reference logical names and Environment Variable values per environment), checked into source control alongside the solution.

`pac solution create-settings` will generate a starting template for you. This should be kept up to date whenever a new Connection Reference or Environment Variable is added to the solution, so deployments to Test/UAT/Prod don't need manual intervention each time.

As with the Environment Variables section, never put secrets into this file, it should only ever contain the mapping of Connection References/variable names to their environment specific values, not credentials themselves.

# Monitoring Beyond Logging

The Error Handling and logging section covers logging failures somewhere reviewable, for flows that are genuinely business critical, it's worth going a step further. Application Insights can be connected to give you proper telemetry on a flow beyond what's in the run history, and a simple Power BI report or dashboard (built from your logging table) can give a periodic view of failures, average run duration and how often actions are being throttled or retried, without needing someone to go and check each flow individually.

If you do want proactive alerting rather than a dashboard someone checks periodically, agree a sensible threshold first (e.g. more than 3 failures in an hour), and route it to a shared Teams channel or distribution list, not an individual's inbox, so it doesn't get missed if that person is away.

# HTTP Triggered Flows

For any flow triggered by an HTTP request, don't rely on the generated URL being hard to guess as your only line of defence. Depending on who's calling the flow, consider one of the following:

* A shared secret passed in the header or query string, checked with a Condition before the flow does anything else.
* Signature validation, if the calling system supports it (a number of SaaS platforms sign their webhook payloads).
* IP restrictions, either on the trigger itself or by putting something like Azure API Management or Front Door in front of the flow, where the calling system has known, stable IPs.

Whichever approach is used, note it in the flow's description, and if you're using a shared secret, treat it the same as any other credential, rotate it periodically, in line with the guidance on Service Principal secrets above.

| Good Example | Good Reason | Bad Example | Bad Reason |
|--------------|-------------|-------------|------------|
|HTTP trigger with a shared secret checked in a Condition before proceeding| Requests without the correct secret are rejected before doing anything| HTTP trigger with no validation, relying only on the URL being hard to guess| Anyone who obtains the URL can trigger the flow|
|Webhook flow validating an inbound signature from the calling SaaS platform| Confirms the payload genuinely came from the expected sender and hasn't been tampered with| Webhook flow accepting any payload posted to the URL| No way to tell a genuine request from a spoofed one|

---

As always, this is a living document, if you disagree with any of the above or have a better way of doing something, raise it and we can update this accordingly.
