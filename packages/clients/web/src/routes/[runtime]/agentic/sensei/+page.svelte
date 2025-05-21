// render conversation component.
// prompt to screen 
// is there already the first message sent to the agent? at some point for sure. not first load
// send messages back and forth.
// each time updating the intent. probably mostly in state.
// what i want to implement is some protocol for intent resolution.
// i think thats something that sensei must implement.
// the ability to update intent.
// which needs to lead to an update on the client.
// the conversation loop exits
// the intent resolver kicks in and the page navigates to /agentic/dojo
// where the generator and the discriminator have at it.
// this can also resolve. in that case the intent defines some sort of ancestory.
// maybe something in the core or the client keeps track.

// i could also implement this without complex intent resolution in the first step
// by just maintaining the intent resolver function inside the page,
// and only make it sophisticated enough to toggle back and forth between sensei and dojo

// either i demo the agents and a tactic separately
// or if i can pull it off then i enable the toggling between pages.
// this requires me to implement the constrained trait on  on the intent and the pages.

