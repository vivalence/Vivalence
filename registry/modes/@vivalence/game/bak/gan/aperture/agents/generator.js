import { Type } from "@sinclair/typebox";
import { Agent } from "@vivalence/shared/agent";
import { History, Planning, Session, Learnables } from "../../types/index.ts";

const GeneratorInput = Type.Object({
  session: Session,
  learnables: Learnables,
  history: History,
  step: Type.String({
    description: "The slug of the active session step.",
  }),
  input: Type.String(),
});

const GeneratorOutput = Type.Object({
  activeStep: Type.String({
    description: `
	This is the internal monologue.
	Describe where the user is, and critique yourself up until now.
	what can be done better? Have you been too verbose, unclear, repetitive?
	Have you been too obvious, too obscuse?
    `,
  }),
  activePrompt: Type.String({
    description: `as concise as possible. format is html, using only: <br, em>.

    A Prompt is the most minimal and concise way possible to request the knowledge.
    A prompt doesnt include chatter and there is no feel-good talk. A prompt is direct.
    Without revealing the learnable. Its consise, direct and structured. No more than 200 characters.
    a prompt starts with the goal, give clues but not solutions, and then expects active learning.
    Multiple lines, bits of information. We don't want full text or conversation.

    `,
  }),
});

export default async function generator(input, ctx) {
  const agent = new Agent("generator") //
    .withBrain(ctx.runtime.services.brain)
    .withInput(GeneratorInput)
    .withOutput(GeneratorOutput);

  agent
    .enhance(
      `### identity
	You are inside viva. the agentic symbolic intelligence operating system.
	your tone is direct and personal. active voice and very minimal use of punctuation.
	All output is used for input into other llms! So, there is no need for niceties. Be a helpful, concise and diligent agent.
	The user is learning a language, and you help them by chosing exercises for them to do.
	The language is: ${JSON.stringify(ctx.runtime.statics.language)}.
      `,
    )
    .enhance(
      `### Examples:
	# First messages
	For the first message, it might be cool to give an overview of the most important learnables.
	"""
	    We will cover 'ego (i)', 'tu (you)' and 'id (it)',<br/>
	    applying them to 'amare (to love)', 'currere (to run)', 'volare (to fly)'.<br/>
	    <br/>
	    Any questions before we start?
	"""
	You see that we dont have to move to the first step immediately. in this case, you can leave the first step empty ''.
	# Moving from basic conjugation to possession

	[{"slug": "curro", "status": "KNOWN", "known": "curro", "learning": "i run"}
	{"slug": "canis", "status": "UNKNOWN", "known": "dog", "learning": "canis"}]
	"""
	    "Ego curro" is correct!<br/>
	    <br/>
	    And once more in the third person: 'My dog runs'.<br/>
	    'Meus' means 'my' and 'canis' means 'dog'.<br/>
	    <br/>
	"""
	# After user correctly answers both "Vos amatis" (You all love) and "Vos curritis" (You all run)
	[{"slug": "second_plural_rule", "status": "UNKNOWN", "known": "second person plural rule", "learning": "Second person plural ending rule"}]

	"""
	    "Vos curritis" is correct!<br/>
	    <br/>
	    You've now used second person plural with 'amare' and 'currere'.<br/>
	    Look at the endings: am-atis, curr-itis.<br/>
	    <br/>
	    What rule can you state about second person plural endings for regular verbs?
	"""
	# User mistake correction example
	The has made a mistake, so we state the correction and the rule they violated. we also introduce some small change to keep learning active.

	# After user incorrectly says "Ego facere" instead of "Ego facio"
	[{"slug": "first_person_io", "status": "UNKNOWN", "known": "first person -io ending", "learning": "First person -io ending rule"}
	{"slug": "ludus", "status": "UNKNOWN", "known": "sports", "learning": "Ludus"}]
	"""
	    Close! The correct form is "Ego facio" (I do).<br/>
	    The verb "facere" becomes "facio" in first person because third conjugation verbs take -io ending for first person singular.<br/>
	    <br/>
	    Try again:<br/>
	    How do you say "I do sports"?<br/>
	    Sports is "ludos".
	"""

	# Continuing to the next learnable after correct response.
	Confirm the previous message learnable with something like 'Correct, "xyz" means "abc".'

	[{"slug": "ego", "status": "KNOWN", "known": "I", "learning": "Ego"}
	{"slug": "ego_video", "status": "UNKNOWN", "known": "I see", "learning": "Ego video"}]"""
	    "[correct_user_message]" is correct!<br/>
	    <br/>
	    Next:</br>
	    State that you see something. 'I see ...'.<br/>
	    Hint: The infinitive for 'to see' is 'videre'. Inflect 'videre' with -o for first person signular.<br/>
	    <br/>
	    How would you say 'I see a cat (cat=felem)'?
	"""
	The tone is direct and personal. active voice and very minimal use of punctuation.
	`,
    )
    .enhance(
      `### task
	write the next prompt for the user.
	the prompt must be minimal. no more than a few words.
	respond to user requests.
	keep some variance in your prompt and keep it interesting. 
 `,
    );
  console.log(JSON.stringify(input, null, 2));
  const output = await agent.generate(input);
  console.log(JSON.stringify(output, null, 2));
  return output;
}
