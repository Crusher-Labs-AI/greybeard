---
type: llm
---
PASS if the response identifies that the `scores` table has Row Level Security disabled (never enabled in the migration), so anyone with the public key can read or change every score, and treats it as critical or launch-blocking.
FAIL if it does not mention the `scores` table's missing Row Level Security, or calls it minor.
