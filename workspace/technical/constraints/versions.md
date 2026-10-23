# Version constraints

| Tool | Pinned version | Notes |
| --- | --- | --- |
| Terraform | >= 1.9, < 2.0 | `required_version` set in each environment root. |
| Helm | 3.x | Chart `apiVersion: v2` only. |
| Kubernetes | 1.31 | Manifests must not use API versions removed in 1.31 or earlier. |
| Provider plugins | locked | `.terraform.lock.hcl` files are committed; upgrades are dedicated chore PRs. |

CI runs the exact pinned versions; local tooling should match (`terraform version`,
`helm version`).
