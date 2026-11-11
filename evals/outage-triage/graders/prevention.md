---
type: llm
---
PASS if the response's prevention advice includes at least two of the following: an external uptime alert, a tested rollback path (for example instant rollback to the previous deployment), a staging or preview check before production, or a regression test or alert for the specific failure once it is found.
FAIL if the prevention advice is generic ("be careful", "add more tests") without concrete mechanisms.
