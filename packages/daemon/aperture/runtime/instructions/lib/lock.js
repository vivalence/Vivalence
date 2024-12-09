const ProvisioningLock = new Map();

const key = (scope) => `${scope.user.id}-${scope.dependency?.id}-${scope.tactic?.id}`;

export default {
  has: (scope) => ProvisioningLock.has(key(scope)),
  set: (scope) => ProvisioningLock.set(key(scope), new Date()),
  delete: (scope) => ProvisioningLock.delete(key(scope)),
};
