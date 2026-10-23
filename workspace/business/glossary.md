# Business glossary

Use these terms in code, plans and conversations. Add a row when the platform
gains a concept; never invent synonyms.

| Term | Definition |
| --- | --- |
| Environment | An isolated deployment target: `dev`, `staging` or `prod`. |
| Platform | The shared Kubernetes cluster plus its managed cloud services. |
| Workload | An application deployed to the platform through a Helm chart. |
| Release | One installed instance of a Helm chart in a namespace. |
| Drift | The difference between Terraform state and the real infrastructure. |
| Change window | The approved time slot for production changes. |
