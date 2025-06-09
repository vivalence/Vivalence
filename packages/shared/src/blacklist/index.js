export class Blacklist {
  constructor(input = {}) {
    this.units = input.units || [];
    this.tags = input.tags || [];
    this.instructions = input.instructions || [];
  }
  fromScope(scope) {
    const extractIds = (obj) => {
      if (obj.unit) {
        this.units.push(obj.unit.id);
        extractIds(obj.unit);
      }

      if (obj.units && Array.isArray(obj.units)) {
        obj.units.forEach((unit) => {
          this.units.push(unit.id);
          extractIds(unit);
        });
      }

      if (obj.tag) {
        this.tags.push(obj.tag.id);
        extractIds(obj.tag);
      }

      if (obj.tags && Array.isArray(obj.tags)) {
        obj.tags.forEach((tag) => {
          this.tags.push(tag.id);
          extractIds(tag);
        });
      }

      if (obj.instruction) {
        if (obj.instruction.id) this.instructions.push(obj.instruction.id);
      }

      Object.keys(obj).forEach((key) => {
        if (["unit", "units", "tag", "tags", "instruction"].includes(key))
          return;
        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key])
        ) {
          extractIds(obj[key]);
        }
      });
    };
    if (scope) extractIds(scope);
    return this.prune();
  }
  fromBuffer(buffer) {
    [buffer.active, ...buffer.queue]
      .filter((item) => item?.scope)
      .map((item) => item.scope)
      .forEach((scope) => this.fromScope(scope));
    return this;
  }
  async fromQueue(scope, ctx) {
    const criteria = {};

    if (scope.instruction) criteria.id = scope.instruction.id;
    // if (scope.dependency) criteria.dependency = scope.dependency.id;
    if (scope.tactic) criteria.tactic = scope.tactic.slug;
    if (scope.game) criteria.game = scope.game.slug;
    if (scope.user) criteria.user = scope.user.id;

    const instructions = await ctx.runtime.entities.instruction.find(criteria);

    instructions.map((instruction) => {
      if (instruction.data.type !== "SIGNAL")
        this.fromScope(instruction.data.scope);
    });

    return this;
  }

  prune() {
    if (this.units && Array.isArray(this.units)) {
      this.units = Array.from(new Set(this.units));
    }

    if (this.tags && Array.isArray(this.tags)) {
      this.tags = Array.from(new Set(this.tags));
    }

    if (this.instructions && Array.isArray(this.instructions)) {
      this.instructions = Array.from(new Set(this.instructions));
    }

    return this;
  }
}
