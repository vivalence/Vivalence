export class UserEntity {
  identity = $state(null);
  intents = $state([]);

  withIdentity(identity) {
    this.identity.set(identity);
    return this;
  }
}
