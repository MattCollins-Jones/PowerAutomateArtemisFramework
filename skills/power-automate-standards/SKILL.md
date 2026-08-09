# Skill: Power Automate Artemis Framework Standards

This skill provides the coding standards for building Power Automate Cloud Flows, based on
the [Power Automate Artemis Framework](https://github.com/MattCollins-Jones/PowerAutomateArtemisFramework/wiki).

## When to use this skill

Use this skill any time you are creating or modifying a Power Automate cloud flow, or reviewing
one for adherence to these standards. This includes: naming a flow/trigger/action, initialising
a variable, adding a scope, writing an expression, adding error handling, choosing a flow owner
or connection type, setting a retry policy, marking inputs/outputs as secure, configuring
concurrency, paging a data source, setting a timeout, building a long-running/polling pattern,
documenting a child flow's contract, or adding an HTTP trigger.

Do not apply this skill to Power Apps, Power BI, or non-Microsoft automation tools — it is
specific to Power Automate cloud flows.

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

1. **Solutions first.** Flows should be created inside a solution wherever possible, to enable
   modern ALM tooling. Only skip this if the environment has no Dataverse.
2. **Name things so the trigger and intent are obvious at a glance**, without opening the flow.
3. **Every action is an API call.** Fewer, more deliberate actions beat many convenient ones,
   especially inside loops.
4. **Make decisions deliberately, and leave a note explaining them.** Retry policies, timeouts,
   concurrency degree, and deviations from these standards should all be documented on the
   action/trigger itself (via a Note) so a future reviewer can tell a considered choice from an
   oversight.
5. **Prefer platform-native controls over custom logic.** E.g. use the HTTP trigger's built-in
   authentication and Asynchronous Pattern support before building your own validation/polling.

## Source of truth

These files are a distilled, AI-actionable version of the full standards document. If a rule
here seems ambiguous or you need the full rationale/background, refer to the wiki:
https://github.com/MattCollins-Jones/PowerAutomateArtemisFramework/wiki/Cloud-Flow-Coding-Standards
