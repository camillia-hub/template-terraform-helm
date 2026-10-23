# Business rules — change management

- BR-1 Production changes happen only inside an approved change window with a
  linked task; dev may be changed at any time.
- BR-2 Every change rolls out dev, then staging, then prod, in that order; a
  failing stage stops the rollout.
- BR-3 The agent prepares plans; people approve and execute them. No unattended
  production mutation.
- BR-4 Destructive operations (tearing down environments, removing data
  resources, uninstalling releases) require a named approver on the task and are
  executed by a platform engineer manually outside the agent.
- BR-5 Costs: a change that raises the monthly estimate by more than 10% needs a
  note in the task paper and product-owner sign-off.
