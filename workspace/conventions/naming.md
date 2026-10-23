# Naming conventions

## Terraform

- Root files: `main.tf`, `variables.tf`, `outputs.tf`, `backend.tf`, `README.md`.
- Resources and modules use `snake_case`; names describe the thing, not the
  provider (`aws_db_instance.orders`, not `aws_db_instance.rds1`).
- Modules are named after their domain: `modules/database`, `modules/cluster`.
- Every resource gets the standard tags or labels: `environment`, `project`,
  `owner`, `cost-center` and `managed-by = "terraform"`.

## Helm

- Charts are kebab-case (`orders-api`); release names match the chart name plus a
  suffix when deployed more than once (`orders-api-canary`).
- Values keys are camelCase; one values file per app per environment.

## Git

- Branches: `infra/<task-id>-<slug>`; commits follow Conventional Commits with a
  scope (`feat(cluster): add spot node pool`).
