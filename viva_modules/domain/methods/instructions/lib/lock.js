const ProvisioningLock = new Map();

export default {
  has: (props) => ProvisioningLock.has(`${props.userId}-${props.tacticId}`),
  set: (props) => ProvisioningLock.set(`${props.userId}-${props.tacticId}`, new Date()),
  delete: (props) => ProvisioningLock.delete(`${props.userId}-${props.tacticId}`),
};
