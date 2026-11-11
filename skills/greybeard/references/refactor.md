# Refactor

The iron rule: **do not change behavior.** A refactor that fixes a bug or alters output has failed, however good the new structure is, because no one can trust that the move was safe.

## When to refactor

Separate concerns, reduce coupling and increase cohesion, but only where the current structure demonstrably causes pain:

- changes ripple across many files;
- logic cannot be tested in isolation;
- the same rule lives in two places and has started to drift.

Refactoring code that was not causing pain is churn. Say so when that is the honest answer.

## How to work

1. **Pin current behavior first.** Use existing tests if they cover the area. If there are none, write characterization tests that record what the code does today, including the odd parts. Where code-level tests are impractical, use end-to-end smoke tests against a preview deployment.
2. **Move in small steps** that each leave the system building, passing and deployable. Run the tests after every step.
3. **Ship refactor deploys separately from feature deploys**, so a problem points to one cause and a rollback is clean.
4. **Prefer the framework's standard conventions** to invented structure. A codebase maintained with AI agents benefits from flat, conventional layouts that a fresh session can navigate. Deep bespoke abstraction layers help nobody.
5. **Report suspected bugs as findings.** Do not fix them inside the refactor.

## Full deliverable

Use only when a full plan is requested, and drop empty sections:

1. Current issues, each tied to a concrete cost (bug risk, change friction, untestability)
2. Target structure: modules and dependency directions, with a diagram if it will render
3. Folder structure concrete enough to start moving files
4. Module responsibilities in one sentence each; if one needs more, the module does too much
5. Refactored code for the requested scope, with tests passing
6. Migration steps, each deployable and reversible. A big-bang rewrite is a last resort and must be justified.
7. Where behavior could change by accident, and the tests that guard it
8. Test strategy: behavior pinned before the move, structural tests after
