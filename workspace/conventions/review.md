# Plan review conventions

- Every PR includes the `terraform plan` output for each affected environment as a
  collapsed block in the description (or as an attached artifact).
- Reviewers check: no unexpected `must be replaced`, no unexplained deletions, and
  cost-relevant changes called out.
- The plan must be produced from the PR branch against current state; plans older
  than 24 hours are re-run before merge.
- Merge means "approved to apply": a platform engineer then performs the apply
  step manually outside the agent, per environment, dev first.
- Helm changes include the rendered `helm template` diff of the affected releases.
