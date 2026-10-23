# Terraform rules

Mandatory for every change in the `infrastructure` repository.

- The agent runs `terraform init`, `terraform fmt`, `terraform validate` and
  `terraform plan` only. The agent never runs `terraform apply` or any other
  state-mutating command; a platform engineer performs apply steps manually
  outside the agent after the plan is approved.
- State is remote (see the backend configuration in `envs/<env>/backend.tf`) with
  locking. Never copy state locally, never run state-modifying commands.
- All resources live in modules under `modules/`; environment roots in `envs/`
  only wire modules and variables — no inline resources.
- Every resource carries the standard tags from `conventions/naming.md`.
- `terraform fmt -check`, `validate` and a clean, reviewed `plan` output are
  required before a PR can merge.
- No secrets in `.tf` files, in committed tfvars, or in outputs; secret values are
  read at apply time from the platform vault.
