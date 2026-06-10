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






