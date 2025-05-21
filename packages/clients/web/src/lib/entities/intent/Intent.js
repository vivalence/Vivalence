const IntentStatusEnum = {
  DISCOVERY: "DISCOVERY",
  RESOLVED: "RESOLVED",
  ERROR: "ERROR",
};

const ResolutionTypeEnum = {
  SESSION: "SESSION",
  DEPENDENCY: "DEPENDENCY",
  GAME: "GAME",
  TACTIC: "TACTIC",
  STRATEGY: "STRATEGY",
  CONVERSATION: "CONVERSATION",
  NOTEBOOK: "NOTEBOOK",
};

const ResolutionTraitEnum = {
  CONSTRAINED: "CONSTRAINED",
  SCHEDULE: "SCHEDULE",
};

class Intent {
  constructor(id, manifest = {}) {
    this.id = id;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.status = IntentStatusEnum.DISCOVERY;
    this.manifest = {
      name: manifest.name || "",
      description: manifest.description || "",
      icon: manifest.icon || "",
    };
    this.resolution = {
      type: null,
      traits: [],
      input: {},
    };
    this.context = {};
    this.history = [];
  }

  get storable() {
    return {
      id: this.id,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      status: this.status,
      manifest: this.manifest,
      resolution: this.resolution,
      state: this.state,
      history: this.history,
    };
  }

  static fromStorage(data) {
    const intent = new Intent(data.id);
    intent.createdAt = new Date(data.createdAt);
    intent.updatedAt = new Date(data.updatedAt);
    intent.status = data.status;
    intent.manifest = data.manifest;
    intent.resolution = data.resolution;
    intent.state = data.state;
    intent.history = data.history;
    return intent;
  }
}

export { IntentStatusEnum, ResolutionTypeEnum, ResolutionTraitEnum, Intent };
