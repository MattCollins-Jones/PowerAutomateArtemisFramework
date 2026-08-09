# Expressions and Loops

**Rule:** Write expressions directly in the action that needs them, rather than using a
separate action/function that does the same job with an extra API call (e.g. use a
`formatDateTime`/`convertTimeZone` expression instead of a "Convert time zone" action).

**Why:** Every action is an API call. Doing the work in an expression inside an existing
action's inputs avoids adding one.

**Exception:** When an expression becomes complex enough to hurt readability/maintainability
(e.g. building a multi-field FetchXML query with conditional concatenation), break it into
smaller Compose steps and feed their outputs into the final action. Optimising away every
Compose step at the cost of an unreadable wall of nested expressions is not the goal — balance
API call count against maintainability.

**Tip:** Use the experimental expression editor where available — it supports multi-line
formatting and indentation (`Ctrl + ]` / `Ctrl + [`), which is far easier to read than the
single-line standard editor, especially for nested `if()`/`and()`/`or()` statements.

## Avoiding unnecessary Apply to Each

**Rule:** If you only need a single item out of an array (e.g. the first matching row from a
List Rows result), use an expression to extract it directly instead of wrapping it in an Apply
to Each loop.

Example:
```
first(outputs('List_Rows_Action_Name')?['body/value'])?['contactid']
```

**Why:** Apply to Each loops add complexity and (per iteration) extra API calls — see
[performance-and-api-calls.md](performance-and-api-calls.md). If you already know you expect
zero or one result, a loop is unnecessary overhead.
