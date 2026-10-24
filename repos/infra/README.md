# {{ projectName }} — Infrastructure

Terraform modules and environments for the **{{ projectName }}** platform.

## Layout

- `modules/` — reusable infrastructure modules
- `envs/` — dev, staging and prod compositions of those modules

## Commands

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan
```

The agent is plan-only: applying, upgrading and destroying is performed by a
person after review. The workspace contract
(`repositories/infrastructure.md` and `rules/change-safety.md`) lists the exact
read-only command set.
