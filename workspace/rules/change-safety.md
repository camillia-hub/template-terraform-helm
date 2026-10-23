# Change safety rules

- Every infrastructure change is described in the task paper as: what changes,
  why, the exact plan or rendered-diff output, the rollback path and the blast
  radius.
- Destructive or disruptive steps (database replacement, node pool rotation,
  tearing down an environment, removing a release) are never executed by the
  agent. The task paper describes the step and states that a platform engineer
  runs it manually outside the agent after approval.
- Production changes require an approved task in the change-management process
  (see `business/rules.md`) before any apply step is scheduled.
- When a plan shows unexpected replacements or deletions, stop and flag it in the
  task paper instead of working around it.
- Drift detection: a plan-only run against each environment documents drift
  weekly; the agent opens a task when drift is found.
