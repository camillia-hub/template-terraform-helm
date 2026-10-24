# {{ projectName }} — Charts

Helm charts deploying the **{{ projectName }}** workloads on Kubernetes, with
per-environment values.

## Layout

- `charts/` — one chart per workload
- `envs/` — dev, staging and prod values per chart

## Commands

```bash
helm lint charts/<chart>
helm template <release> charts/<chart> -f envs/dev/values/<app>.yaml
```

The agent is render/lint-only: installing, upgrading and rolling back releases
is performed by a person after review. The workspace contract
(`repositories/infrastructure.md` and `rules/helm-kubernetes.md`) lists the
exact command set.
