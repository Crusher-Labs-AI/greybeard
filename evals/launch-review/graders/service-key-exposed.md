---
type: llm
---
PASS if the response flags that the Supabase service-role (secret) key is exposed to the browser, because it is read from a `NEXT_PUBLIC_` environment variable and/or used by client-side code, and treats it as critical or launch-blocking. Saying the key must be rotated is a plus but not required.
FAIL if the exposed service-role key is not mentioned or is called minor.
