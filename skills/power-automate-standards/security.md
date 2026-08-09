# Secure Inputs & Outputs

**Rule:** Any action handling a password, token, or other personal/sensitive data must have
**Secure Inputs** and/or **Secure Outputs** enabled (Settings/cog icon on the action), so the
values are redacted from run history.

**Why this is different from Key Vault:** Key Vault (see
[environment-variables.md](environment-variables.md)) protects *where a secret is stored*.
Secure Inputs/Outputs protects *what shows up in the flow's run telemetry* once that secret has
been used in an action. Both matter together — if you pull a secret from Key Vault or an
Environment Variable and use it in an action, mark that action's inputs and/or outputs Secure.

| Good | Good Reason | Bad | Bad Reason |
|---|---|---|---|
| HTTP action calling an API with a Key Vault secret, Secure Inputs enabled | Secret is redacted from run history | HTTP action with the same secret, Secure Inputs left off | Secret is visible in plain text to anyone viewing run history |
| Update Row writing a customer's date of birth, Secure Outputs enabled | Personal data isn't retained in run history | Update Row writing sensitive personal data, no Secure settings | Personal data persists in run history for as long as retention is configured |
