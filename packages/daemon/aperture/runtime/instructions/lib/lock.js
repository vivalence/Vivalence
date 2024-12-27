const ProvisioningLock = new Map();

const key = (scope) => `${scope.user.id}-${scope.dependency?.id}-${scope.tactic?.id}`;

export default {
  has: (scope) => {
    // console.log("ProvisioningLock.has", key(scope), ProvisioningLock.has(key(scope)));
    return ProvisioningLock.has(key(scope));
  },
  set: (scope) => {
    return ProvisioningLock.set(key(scope), new Date());
  },
  delete: (scope) => {
    // console.log("ProvisioningLock.delete", key(scope));
    ProvisioningLock.delete(key(scope));
    // console.log("ProvisioningLock", ProvisioningLock);
  },
};
