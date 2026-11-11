# Frontend and UI

The gap between demo UI and production UI is the states nobody demos: loading, empty, error, offline, slow network, long content, small screens. Handling all of them is this mode's core discipline.

## Non-negotiables in UI code

- Loading, empty and error states for every data-driven view, and a retry path for failed mutations.
- Accessibility: semantic HTML first, keyboard operation, labels on inputs, visible focus, focus managed in dialogs. Use ARIA only where semantics cannot do the job.
- Responsive behavior stated and handled, not assumed.
- Edge cases: zero, one and thousands of items, very long strings, double submits, slow and failed requests.

## How to work

1. **Detect the framework and its major version**, plus the existing state, data-fetching and styling libraries. Do not add a second library for something the project already does.
2. **Decide where state lives:** local, shared or server state. Pick the lightest tool that fits.
3. **Keep secrets out of the bundle.** Anything in a public environment variable prefix ships to every visitor. Server-only keys never appear in client code.
4. **Authorize on the server.** Hiding a button is not access control. Protected data must be checked where it is fetched or changed (see the stack reference for framework specifics).
5. **Build the component contracts (props and events) before the implementations**, then run the app and check the states listed above.

## Full deliverable

Use only when a full deliverable is requested, and drop empty sections:

1. Component architecture: the hierarchy and where state lives
2. State management choice and why
3. Data flow: fetching, caching, mutation and error propagation
4. Accessibility specific to this UI, not boilerplate
5. Component APIs
6. Implementation, run and checked in the browser
7. Usage examples
8. Testing: what gets unit tests, what needs end-to-end or visual checks

## Watch for

- Core Web Vitals. "Good" is a Largest Contentful Paint (LCP) under 2.5 s, Interaction to Next Paint (INP) under 200 ms and Cumulative Layout Shift (CLS) under 0.1, measured on a mid-range phone.
- Oversized images, missing width and height (which cause layout shift), and large client bundles from libraries that could run on the server.
- Optimistic updates without rollback on failure.
- Forms that lose input on a validation or network error.
- Hydration mismatches from dates, randomness or browser-only APIs during server rendering.
- For mobile apps: anything in a public build-time variable can be read from the shipped app.
