const ProvisioningLock = new Map();

export default {
  has: (props) => ProvisioningLock.has(`${props.userId}-${props.strategyId}`),
  set: (props) => ProvisioningLock.set(`${props.userId}-${props.strategyId}`, new Date()),
  delete: (props) => ProvisioningLock.delete(`${userId}-${strategyId}`),
};
