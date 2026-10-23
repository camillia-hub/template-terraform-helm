# Infrastructure workspace: Terraform + Helm

This workspace owns the cloud infrastructure and Kubernetes deployments of the
product platform: Terraform for cloud resources, Helm charts for workloads (see
`repositories/infrastructure.md`).

The agent's job is to **plan and prepare** changes. Applying them, upgrading
releases and any destructive step is performed by a person, outside the agent,
after review.

## How the agent should navigate this workspace

Read in this order before your first task:

1. `rules/` — hard rules: `terraform.md` (plan-only agent), `helm-kubernetes.md`
   (render/lint-only agent) and `change-safety.md` (who executes disruptive steps).
2. `conventions/` — repository layout, naming, and the plan-review process.
3. `camflows/` — the workspace's own `terraform-plan` camflow plus its event
   binding in `triggers.camflow.yaml`; it drives plan-producing tasks.
4. `repositories/infrastructure.md` — the repository layout and the exact,
   read-only command set.
5. `business/` — why the environments exist (`glossary.md`) and the
   change-management rules (`rules.md`).
6. `architecture/` and `technical/constraints/` — the platform shape and the
   pinned tool and environment versions.

When a task teaches you a durable fact about the platform, record it in
`business/` or `architecture/` — not only in the task paper.
