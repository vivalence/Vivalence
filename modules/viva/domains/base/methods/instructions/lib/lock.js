const ProvisioningLock = new Map();

export default {
  has: (scope) => ProvisioningLock.has(`${scope.user.id}-${scope.strategy.id}-${scope.tactic.id}`),
  set: (scope) =>
    ProvisioningLock.set(`${scope.user.id}-${scope.strategy.id}-${scope.tactic.id}`, new Date()),
  delete: (scope) =>
    ProvisioningLock.delete(`${scope.user.id}-${scope.strategy.id}-${scope.tactic.id}`),
};
