# Environment constraints

| Environment | Purpose | Guardrails |
| --- | --- | --- |
| dev | Day-to-day validation | The agent may plan freely; engineers apply. |
| staging | Pre-production rehearsal | Applies only after dev is healthy. |
| prod | Customer traffic | Change window plus approval required; smallest blast radius first. |

- Every environment has its own state backend, its own cloud project or account,
  and its own Kubernetes context; credentials for one environment never appear in
  another.
- All three environments use the same module versions; differences live only in
  variables and Helm values.
