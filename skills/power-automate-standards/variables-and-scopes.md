# Variables and Scopes

## Variables

**Rule:** Initialise all variables at the start of the flow (variables cannot be initialised
inside a Scope or many other controls), grouped together. Prefix every variable name with
`var`.

**Why:** A consistent `var` prefix makes variables easy to spot in dynamic content pickers and
in expressions, consistent with JavaScript/Power Fx conventions. Grouping initialisation at
the top is also a technical requirement, not just style.

| Good | Good Reason | Bad | Bad Reason |
|---|---|---|---|
| `varUserID` | Prefix identifies it as a variable, name identifies the value | `User` | Not clearly a variable or an ID |
| `varCountOfRows` | Prefix + clear description | `IntRows` | Uses a data-type prefix instead of `var`, unclear purpose |

Do not prefix variables with their data type (e.g. `Int`, `Str`) — use `var` consistently
instead. (Data-type prefixes ARE used for Environment Variables — see
[environment-variables.md](environment-variables.md) — because that is a different naming
context.)

## Scopes

**Rule:** Use Scopes to group logically related actions, and use a paired Scope for Try/Catch
style error handling: one Scope containing the "do the work" actions, followed by a second
Scope configured to run only if the first fails or times out, containing your error handling
(log to a table, send a notification, etc).

**Why:** Grouping makes large flows navigable, and lets you apply error handling per logical
unit of work rather than per individual action.

**Guidance:** Split scopes along logical boundaries — e.g. one Scope to call an API, a
separate Scope to write the result to Dataverse. This makes it immediately obvious which part
of the flow failed (the API call vs. the write) without opening every action inside a single
giant scope. See [error-handling-and-logging.md](error-handling-and-logging.md) for how the
paired "failed" scope should be named and used.
