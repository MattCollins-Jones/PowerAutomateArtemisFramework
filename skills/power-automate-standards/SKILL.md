# Skill: Power Automate Artemis Framework Standards

This skill provides the coding standards for building Power Automate Cloud Flows, based on
the [Power Automate Artemis Framework](https://github.com/MattCollins-Jones/PowerAutomateArtemisFramework/wiki).

## When to use this skill

Use this skill any time you are creating or modifying a Power Automate cloud flow, or reviewing
one for adherence to these standards. This includes: **creating a new flow (always check the
solution-first gate below first)**, naming a flow/trigger/action, initialising a variable,
adding a scope, writing an expression, adding error handling, choosing a flow owner or
connection type, setting a retry policy, marking inputs/outputs as secure, configuring
concurrency, paging a data source, setting a timeout, building a long-running/polling pattern,
documenting a child flow's contract, or adding an HTTP trigger.

Do not apply this skill to Power Apps, Power BI, or non-Microsoft automation tools — it is
specific to Power Automate cloud flows.

## CRITICAL: Solution-first creation gate

This gate runs **before any other topic file** and **before any flow-creation tool/action is
called**. It is not optional and is not just a "principle" to weigh against others — treat it
as a hard precondition, the same way you'd treat a missing required parameter.

1. Check whether the target environment has Dataverse.
2. If it does, list the available unmanaged solutions in that environment.
3. Ask the user to either select an existing solution, or explicitly approve creating a new one
   — do not pick one for them silently.
4. Do not create the flow until a solution has been selected/approved.
5. Create the flow inside that solution, using Connection References (never raw Connections —
   see [ownership-and-connections.md](ownership-and-connections.md)).

**Never create a standalone (non-solution) flow** unless the user has explicitly approved it
*after* being warned that it will lack solution membership and ALM support (no export/import
between environments, no version control alongside other components).

**If the environment has no Dataverse at all**, solutions aren't available — say so, and
proceed with a standalone flow without asking again.

**If your available tooling cannot create a flow directly inside a solution** (e.g. an API/tool
that only supports standalone creation), stop and explain this limitation to the user. Do not
silently fall back to standalone creation as if it were equivalent — that's the same failure
this gate exists to prevent.

This gate applies regardless of which topic file below you're also using — e.g. if the task is
"add naming to a flow" but no flow exists yet, this gate still runs first.

## How to use this skill

Each topic below lives in its own file so only the relevant rules need to be loaded for the task
at hand. Load the file(s) that match what you're currently building. Every rule file follows the
same structure: a short **Rule**, a one-line **Why**, and a **Good vs Bad** table of concrete
examples — mimic the Good examples, avoid the Bad ones.

| Topic | File | Load this when you're... |
|---|---|---|
| Naming flows, triggers, actions, child flows | [naming.md](naming.md) | Creating or renaming a flow, trigger, or action |
| Flow descriptions & versioning | [flow-documentation.md](flow-documentation.md) | Finishing a flow or making a significant change to one |
| Variables and scopes | [variables-and-scopes.md](variables-and-scopes.md) | Initialising variables, grouping actions, building try/catch |
| Expressions and loops | [expressions-and-loops.md](expressions-and-loops.md) | Writing expressions, avoiding unnecessary Apply to Each loops |
| API call efficiency & Pieter's Method | [performance-and-api-calls.md](performance-and-api-calls.md) | Working inside a loop, worried about API call volume |
| Error handling and logging | [error-handling-and-logging.md](error-handling-and-logging.md) | Adding error handling/logging to a business-critical flow |
| Ownership: service accounts & principals | [ownership-and-connections.md](ownership-and-connections.md) | Deciding who should own a flow or its connections |
| Connection references | [ownership-and-connections.md](ownership-and-connections.md) | Adding a connection to a flow inside a solution |
| Environment variables | [environment-variables.md](environment-variables.md) | Adding configurable values/config data to a flow |
| Retry policies | [retry-and-resilience.md](retry-and-resilience.md) | Configuring an action that calls an external service |
| Secure inputs/outputs | [security.md](security.md) | Handling secrets, tokens, or personal data in an action |
| HTTP triggered flows | [http-triggers.md](http-triggers.md) | Adding a "When an HTTP request is received" trigger |
| Concurrency control | [performance-and-api-calls.md](performance-and-api-calls.md) | Deciding whether an Apply to Each should run in parallel |
| Pagination & large data volumes | [pagination-and-large-data.md](pagination-and-large-data.md) | Using List Rows / Get Items or similar list actions |
| Timeouts, duration & async polling | [timeouts-and-async-polling.md](timeouts-and-async-polling.md) | Setting action timeouts, or calling a long-running process |
| Child flow contracts | [child-flows.md](child-flows.md) | Building or calling a Run a Child Flow action |
| Monitoring beyond logging | [error-handling-and-logging.md](error-handling-and-logging.md) | Adding telemetry/dashboards for business-critical flows |

## Core principles (apply regardless of which topic file is loaded)

1. **Solutions first.** See the Solution-first creation gate above — this is enforced before
   any flow is created, not just a preference to weigh against others.
2. **Name things so the trigger and intent are obvious at a glance**, without opening the flow.
3. **Every action is an API call.** Fewer, more deliberate actions beat many convenient ones,
   especially inside loops.
4. **Make decisions deliberately, and leave a note explaining them.** Retry policies, timeouts,
   concurrency degree, and deviations from these standards should all be documented on the
   action/trigger itself (via a Note) so a future reviewer can tell a considered choice from an
   oversight.
5. **Prefer platform-native controls over custom logic.** E.g. use the HTTP trigger's built-in
   authentication and Asynchronous Pattern support before building your own validation/polling.
6. **When you don't have enough information to apply a rule confidently, ask — don't guess.**
   This applies wherever a rule depends on context you haven't been given, for example: which
   solution to use, whether an app/environment prefix is needed, how large the organisation is
   (for ownership/licensing guidance), whether an Application Insights resource already exists,
   or whether a caller can support a bearer token or a request schema. A silent guess that turns
   out wrong is worse than a short clarifying question — this is the same failure mode that
   caused the solution-first gate and Application Insights sections to be added above, applied
   as a general principle rather than something to patch file-by-file as new gaps are found.
7. **When two rules pull in different directions, say so and let the user decide** rather than
   silently picking one. For example, Concurrency Control for throughput vs. avoiding a race
   condition on a shared record (see [performance-and-api-calls.md](performance-and-api-calls.md)),
   or a longer timeout for a known-slow API vs. failing fast (see
   [timeouts-and-async-polling.md](timeouts-and-async-polling.md)). State the trade-off briefly
   and apply whichever the user confirms, noting the reasoning on the action/trigger as usual.

## Source of truth

These files are a distilled, AI-actionable version of the full standards document. If a rule
here seems ambiguous or you need the full rationale/background, refer to the wiki:
https://github.com/MattCollins-Jones/PowerAutomateArtemisFramework/wiki/Cloud-Flow-Coding-Standards
