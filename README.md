# Terraform + Helm Infrastructure — Camillia workspace template

A Camillia Community Hub workspace template for infrastructure teams managing
Terraform modules and Helm charts on Kubernetes. Ships with a plan-before-apply
camflow: the agent prepares and verifies plans, people approve and apply them.

## What's inside

The `workspace/` directory is the template's `.workspace` contract tree:

```
workspace/
  README.md                     workspace overview and agent navigation guide
  rules/
    terraform.md                plan-only agent, remote state, module rules
    helm-kubernetes.md          render/lint-only agent, workload standards
    change-safety.md            destructive steps stay with people, drift duties
  conventions/
    layout.md                   modules/, envs/, charts/ repository layout
    naming.md                   resource, module, chart and tag naming
    review.md                   plan review and merge-means-approved process
  camflows/
    terraform-plan.camflow.yaml custom camflow: change -> verify -> reviewed plan
    triggers.camflow.yaml       binds infra.plan-requested to the camflow
  repositories/
    infrastructure.md           repo descriptor: layout, read-only commands
  business/
    glossary.md                 platform vocabulary skeleton
    rules.md                    change-management rules skeleton
  architecture/
    components.md               platform components and ownership
    decisions/README.md         ADR format and decision log
  technical/constraints/
    versions.md                 pinned Terraform/Helm/Kubernetes versions
    environments.md             dev/staging/prod guardrails
```

## How to use

Install from the Camillia Community Hub, then create a workspace from this
template. Camillia installs the `workspace/` tree as the new workspace's
`.workspace` contract: the agent reads these rules, conventions, camflow bindings,
repository descriptors and docs skeletons before every task. After installation,
adapt the environment names, module list and pinned versions to your platform.

## License

MIT — see [LICENSE](LICENSE).
