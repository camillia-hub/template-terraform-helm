# Repository: infrastructure

| | |
| --- | --- |
| Name | `infrastructure` |
| Stack | Terraform 1.9+, Helm 3, Kubernetes 1.31 (see `technical/constraints/versions.md`) |

## Layout

```
infrastructure/
  modules/      reusable Terraform modules
  envs/         dev / staging / prod Terraform roots and Helm values
  charts/       Helm charts (one per app plus platform-baseline)
  pipelines/    CI: fmt, validate, plan
```

## Commands (all read-only for the agent)

| Task | Command |
| --- | --- |
| Format check | `terraform -chdir=envs/dev fmt -check -recursive` |
| Init without backend | `terraform -chdir=envs/dev init -backend=false` |
| Validate | `terraform -chdir=envs/dev validate` |
| Plan | `terraform -chdir=envs/dev plan` |
| Lint a chart | `helm lint charts/<chart>` |
| Render a chart | `helm template <release> charts/<chart> -f envs/dev/values/<app>.yaml` |
| Read cluster state (non-prod) | `kubectl get`, `kubectl describe`, `kubectl logs` |

The agent never runs apply, upgrade, rollback, uninstall or deletion commands;
those steps are performed by a platform engineer manually outside the agent once
the plan is approved (see `conventions/review.md`).
