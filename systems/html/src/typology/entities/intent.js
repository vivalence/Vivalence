export class Intent {
  implements(trait) {
    return this.traits.includes(trait.toUpperCase());
  }
}
export const prototype = Intent;
