# Helm and Kubernetes rules

- Workloads deploy through the charts in `charts/`; per-environment values live in
  `envs/<env>/values/<app>.yaml`.
- The agent renders and lints (`helm template`, `helm lint`) and may read cluster
  state (`kubectl get`, `kubectl describe`, `kubectl logs`) in non-production
  namespaces only.
- The agent never mutates a cluster: no install, upgrade or rollback commands and
  no manifest deletion. Release changes and any removal of resources are
  performed by a person manually outside the agent, after the rendered diff is
  reviewed.
- Every workload sets resource requests and limits, a liveness and a readiness
  probe, and runs as a non-root user.
- Images are referenced by immutable tags (semver or digest), never `latest`.
- Namespace-level defaults (network policy, limit range) come from the
  `charts/platform-baseline` chart and are not repeated per app.
