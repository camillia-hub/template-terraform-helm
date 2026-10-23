# Platform components

| Component | Managed by | Responsibility |
| --- | --- | --- |
| Network (VPC, subnets, DNS) | Terraform `modules/network` | Connectivity and isolation. |
| Kubernetes cluster | Terraform `modules/cluster` | Runs all workloads. |
| Databases | Terraform `modules/database` | Managed PostgreSQL per environment. |
| platform-baseline chart | Helm `charts/platform-baseline` | Namespaces, network policies, limit ranges. |
| App charts | Helm `charts/<app>` | One chart per workload. |
| CI pipelines | `pipelines/` | fmt, validate and plan on every PR. |

Environments are fully separate roots under `envs/` with separate state; nothing
is shared between them except module sources.
