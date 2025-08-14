
// domain.modules

import {Aperture} from "@vector"

class Module {
  aperture = new Aperture();
  constructor(module) {
    this.module = module;
  }
  get manifest(){
    return this.module.manifest;
  }
};

class Tactic extends Module {
  //
  constructor(module){
    super(module)

    if(this.module.aperture){
	this.module.aperture(this.aperture);
    }

    if(this.module.generator){
	this.module.generator(this.aperture.branch('/generate'));
    }
  }
};

export function tactic(module, runtime) {
    const tactic = new Tactic(module);


    // tactic.aperture.open("/status", () => ({
    //   status: "strategy ok",
    //   manifest: strategy.manifest,
    // }));

  return tactic;
}

// export function boot(daemon, runtime) {
//   for [type, lookup[]] of config.modules
//     for lookup of lookup[]
//       module = domain.modules[type](registry.load(lookup))
//       if(traits['viewable']) {...}
//       if(traits['sessioned']) module.session()
//       if(traits['sessioned']) module.aperture.use(throwWithoutSession)
//       if(traits['generator']) module.aperture.use(throwWithoutSession)
   
const traits = {
  GENERATOR: (module)=> {
    const aperture = module.aperture
      .branch('/generate')
      .use(greedySession)
      .use(greedyView)

    module.generate(aperture)
  }
  VIEWABLE: (module)=> {
    domain.attach.view(module.view)
  },
  AGENTIC: (module)=> {
    module.aperture.use(inject(services.brain))
  },
  SESSIONED: (module)=> {
    module.aperture.use()
    module.aperture.open('/')
  }
}
export default function boot(runtime) {
  for (const [type, modules] of runtime.register.modules.entries()) {

    const aperture = new Aperture()
    if(some()) aperture.use(trace).use(greed).use()


    for (const module of modules){
      const instance  = runtime.register.domain.modules[type](module)
      applyTraits(instance)


      aperture.attach(`/${instance.manifest.slug}`, instance.aperture)
      runtime.modules[type].push(instance)
    }

    runtime.aperture
      .attach(`/${type}`,aperture)
    
  }
  return runtime;
}

    // // const aperture = runtime.aperture .branch(`/strategy/${module.manifest.slug}`) .use(async (ctx, next) => {ctx.module = strategy; return await next();});

    // const strategy = { ...module, aperture };

    // if (strategy.boot) {
    //   strategy.boot(runtime, strategy);
    //   delete strategy.boot;
    // }

    // strategy.aperture.open("/status", () => ({
    //   status: "strategy ok",
    //   manifest: strategy.manifest,
    // }));

    // runtime.modules.strategy[strategy.manifest.slug] = strategy;
    // // TODO @daemon: validate module
    // // TODO @runtime: strategy.view = runtime.attachments.views.register(strategy)
