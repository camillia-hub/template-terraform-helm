# Repository layout conventions

```
infrastructure/
  modules/            reusable Terraform modules (network, cluster, database, ...)
    <module>/
      main.tf
      variables.tf
      outputs.tf
      README.md       inputs, outputs, example usage
  envs/
    dev/
      backend.tf
      main.tf         wires modules for this environment
      variables.tf
      values/         per-app Helm values for this environment
    staging/
    prod/
  charts/             Helm charts (one per app plus platform-baseline)
  pipelines/          CI definitions for fmt, validate and plan
```

- One environment equals one Terraform root under `envs/`; environments never
  share state.
- New reusable infrastructure goes into `modules/`, never inline into environment
  roots.
