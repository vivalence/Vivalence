You don't install applications — you install **modes** into daemons. A mode is four files: what it is (`manifest`), how it thinks (`harness`), what it exposes (`aperture`), what it shows (`app`). Traits are the only wiring — declare them and the runtime does the rest.

Here is a whole mode. It talks to an LLM.

`mode.viva.js` 

```js
import { App, v } from "@vivalence/typology";

export { harness } from "./harness.js";
export { aperture } from "./aperture.js";

export const manifest = {
  type: "demo",
  slug: "demo",
  traits: ["APPLICATION", "HARNESSED", "EXPOSED", "STANDALONE"],
};

export const app = new App("buffer/App.svelte", v.buffer({ data: {} }));
```

`harness.js` 

```js
import { Vector } from "@vivalence/typology";

export const harness = new Vector().use(async (ctx, next) => {
  ctx.hallucination.context.system("You are a demo. Demonstrate yourself.");
  await next();
});
```

`aperture.js` 

```js
import { Vector, v } from "@vivalence/typology";

export const aperture = new Vector().open("/hello/world", async (ctx) => {
  const { object } = await ctx.mode.harness.object.render({
    turns: [{ role: "user", parts: [{ type: "text", text: "Say hello." }] }],
    output: v.object({ greeting: v.string() }),
  });
  return { greeting: object.greeting };
});
```

Note `ctx.mode.harness.object.render`.

`buffer/App.svelte` 

```svelte
<script>
  let { terminal, buffer } = $props();
  let greeting = $state("");
  const modes = terminal.daemon.entities.mode.$entities.get();

  async function demonstrate() {
    const result = await buffer.mode.connection.call("/hello/world")
    greeting = result.greeting;
  }
</script>

<h1>hello world</h1>
<button onclick={demonstrate}>demonstrate</button>
<p>{greeting}</p>

<ul>
  {#each modes as mode}
    <li>{mode.type}/{mode.slug}</li>
  {/each}
</ul>
```


# :TODO:SLOP: Getting started 

You need [Deno](https://deno.com) 2.7+. Everything else the repo carries.

```sh
# 1 — deno
curl -fsSL https://deno.land/install.sh | sh      # or: brew install deno
deno --version

# 2 — repo + dependencies
git clone https://github.com/vivalence/vivalence.git
cd vivalence
deno task dependencies

# 3 — scaffold this machine's run surface (the ledger) + mount the standard packages
deno task ghost/run /ledger/install ./testament/ledger

# 4 — clone the localhost variant into place
deno task ghost/run /variant/clone @viva/variant/localhost ./testament/variant

# 5 — fill in your env
cd testament/variant && cp .env.example .env
$EDITOR .env            # set VIVA_*_MOUNT to your repo path + the five SECRET_* keys
cd ../..

# 6 — boot (two terminals, from the repo root)
deno task runtime/run
deno task kajuit/run

# 7 — create the first user (lighthouse gates login; no signup UI yet)
deno task ghost/run /variant/lighthouse/auth/signup you changeme
```

The runtime comes up on `:2501`, the kajuit web client on `:1794`. Once step 7 creates a user, open http://localhost:1794 and log in with those credentials.

# WIP
the sections must answer:
I. what is vivalence/how does it work/what makes it different.
2. how do i set this up/run it/build for it.
3. whats the architecture in detail.

# VivalenceOS
Using maps, sets, and trees to control things that are and do. Less is more. JSON is god.

what is it? why is it different.

## CONCEPT
vivalence is a operation system and application platform. 
you dont install applications - you install modes into daemons. 

### primitives:
a `daemon` is the equivalent of an application - each daemon is selfcontained, persistant, with its own types, entities, and businesslogic.

`modes` populate the application space and are bundled into persistant adressable daemons. modes bring functionality and data to daemons.

the dataspace is inhabited primarily by entities call `literals` and `symbols`, as well as arbitrary secondary entities. 
`literals` are concrete singleton data entities - like specific words, messages, people, etc.
`symbols` annotate and organize literals and give them meaning.

the abstraction into modes, literals, and symbols allows us to transport our dataspace not only between daemons, but across modes and effectively across business logic. or, from a different pov, it allows us to transport our businesslogic across dataspaces. its very powerful.

### functionality:

`traits` are used throughout the system to express the primitives. modes, symbols, and literals have their own trait-spaces. any traitspace is populated by traits defined by vivalence, and by the specific domain. 


## ARCHITECTURE 

### modes
the way modes implement functionaly is by implementing traits. 

the entire system works basically as a backend for mode traits.
if you want to bring data into the system - add a mode with a dataset trait. if you want to implement a chat interaction - implement a conversational trait. want to host an API - implement the exposed trait. etc.

every mode has a type and a set of traits. the types are mostly a organizational, interpretability, and security constraint. all actual functionality is a function of traits.

modes serve different roles within the system according to their type. for example, the core of each daemon - called `kernel` - is made up of 3 mode types: domain, ontology, corpus. 

- the `domain` modes implement: a. additional db-persisted entity types, b. the core business logic .
- the `ontology` modes provide the dimenions that literals and symbols can inhabit. 
 each of word,sentence,conjugation represesents an ontology.

- the `corpus` modes bring the data in the form literals and symbols, as well as 

### symbols & literals


## EXAMPLE

f.e. if we are building a language learning app: 

modes:xxx -games,tactics.xxx`
mode traits:zzz

literals: a literal might be a word - "hablar", a sentence - "quiero hablar contigo", a conjugation table - "hablo, hablas, habla, hablamos, xxx". if we were to build an email client, our literals would probably be "message" and "person". 
literal traits: a literal in our word ontology might implement the traits EXEMPLIFIED, TRANSLATED, VOCALIZED. 

symbols annotate literals. symbols organize literals and give them meaning.
an ontological symbol `part-of-speech.verb` on a literal `hablar` tells the system its dealing with a verb. a structural symbol such as `proficiency.a1.` tells our language learning system to practice this early. 
the literal `hablar` might have a douzen ontological symbols, plus any arbitrary amount of additional symbols. 





## IMPLEMENTATION
the entire system is constructed from an extremely limited set of primitives and largely self-contained. 

2.1 the system is derived from a library of prototypes, schematics, and routines - `@typology`.

2.2 there is a `@runtime` which runs multiple daemons. 

2.3 there is a rudimentary `web client` and an idea for a `shell client`. the kajuit client can be installed as an ios webapp through safari. 

2.4 there is a registry and an idea for a package manager.



## ORGANIZATION 
the system is entirely open source and free for private use. for commercial use i intent to implemnt flat, cheap, api-driven licensing. cost is going to be ~10$/month/soul. i call my business strategy `ubuiquity and a thin slice`. 
my intent for building vivalence was twofold. a. its the os i would have wanted. b. its intended as the os that will outlive all of us. its designed to be cultural inheritance. 






