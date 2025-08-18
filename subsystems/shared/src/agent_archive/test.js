import { AxAgent, AxAI, AxSignature } from "@ax-llm/ax";
import { schemaToSignature } from "./lib/signature.js";

export default async function (daemon) {
  const inputSchema = {
    type: "object",
    properties: {
      message: {
        type: "string",
        description: "User message",
      },
    },
    required: ["message"],
  };

  const outputSchema = {
    type: "object",
    name: "Intent Resolution",
    description:
      "Used as input by the IntentResolver to navigate the user to the desired UI",
    properties: {
      status: {
        type: "string",
        enum: ["success", "failure"],
        description: "Was the users Intent discovered and resolved?",
      },
      resolution: {
        type: "object",
        name: "Resolution",
        description:
          "Defining the type of resolution and payload for the IntentResolver.",
        properties: {
          type: {
            type: "string",
            enum: ["failure", "learning", "doing"],
            default: "failure",
            description: "how did the user resolve their intent?",
          },
          runtime: {
            type: "string",
            description: "Unique identifier of the runtime the user used.",
          },
          // slug: {type: "string", description: "Unique identifier of whatever entity type was resolved. for example the sessions slug.",},
        },
        required: ["type"],
      },
    },
    required: ["status"],
  };

  const signature = schemaToSignature(
    "did the user satisfy their intent? identify the runtime the user used.",
    inputSchema,
    outputSchema,
  );

  const functions = [
    {
      // name: "getAvailableRuntimes",
      name: "/daemon/runtimes/findAll",
      description:
        "get the runtimes that are available to the user, given their spoken language.",
      parameters: {
        type: "object",
        properties: {
          user: {
            type: "string",
            enum: ["english", "french", "german"],
            description:
              "what language does the user actively use in their message?",
          },
        },
        required: ["user"],
      },
      func: (param) => {
        console.log("runtime discovery args", param);
        return [
          { runtime: "spanish" },
          { runtime: "gym" },
          { runtime: "sunbathing" },
        ];
      },
    },
    // {
    //   name: "/daemon/runtimes/findAll",
    //   description: "get available runtimes, incl. example valences",
    //   parameters: {
    //     type: "object",
    //     properties: {
    //       user: {
    //         type: "string",
    //         enum: ["english", "french", "german"],
    //         description:
    //           "what language does the user actively use in their message?",
    //       },
    //     },
    //     required: ["user"],
    //   },
    //   func: async (args) => {
    //     console.log("runtime discovery args", args);
    //     return [
    //       { runtime: "spanish" },
    //       { runtime: "gym" },
    //       { runtime: "sunbathing" },
    //     ];

    //     // return [{runtime: "eng2esp", valences: [{slug: "spanish-session", literal: `start a spanish learning session by: 1. pulling available session[] from '/entities/session/findAll'. 2. identity the desired session's slug. 3. resolve Intent to a ResolutionType of SESSION.`,},],},];
    //   },
    // },
  ];
  const agent = new AxAgent({
    name: "DiscoveryAgent",
    signature: signature,
    description: signature.getDescription(),
    functions: functions,
  });

  const profile = daemon.services.llm.profiles.STRATEGIST;
  const ai = new AxAI({
    name: profile.provider,
    apiKey: profile.key,
    config: { model: profile.model },
  });

  const response = await agent.forward(
    ai,
    { message: "i wanted to learn spanish, and now i speak spanish." },
    { debug: true },
  );
  console.log("response", response);
}
// const signature = new AxSignature(
//   `updates:string[] -> summaryTitle:string, shortSummary:string`,
// );

// const profile = daemon.services.llm.profiles.STRATEGIST;
// const ai = new AxAI({
//   name: profile.provider,
//   apiKey: profile.key,
//   config: { model: profile.model },
// });

// const gen = new AxGen(signature);

// const updates = [
//   `Title: Purrfect Playtime Schedule Change at Cat Cafe
// Summary: The Purrfect Paws Cat Cafe has adjusted its daily playtime schedule due to renovations in the main lounge. Monday cuddle sessions are temporarily paused, and Friday afternoon play sessions are now from 3:00 PM to 4:15 PM in the newly renovated sunroom. Customers unable to attend the Friday slot can request a temporary pause on their reservation package by emailing purr@purrfectpaws.com. Sponsorships for additional cat trees and toys at alternative locations are available.`,

//   `Title: National Feline Agility Competition in Pasadena – Feb 22-24, 2025 | 15% Off Tickets!
// Summary: The National Feline Agility Competition (NFAC) is hosting its championship event in Pasadena, CA from February 22-24, 2025 at the Pasadena Convention Center. Tickets can be purchased at https://nationalfelineagility.com/tickets/pasadena2025/ with a 15% discount using the code MEOW15.`,

//   `Title: Open Cat Social Hour at Westwood Animal Shelter
// Summary: Open cat social hour at the Westwood Animal Shelter on Sunday, February 2, 2025 from 2:00 PM to 3:30 PM. A $5 donation is requested (cash donations preferred).`,
// ];

// const res = await gen.forward(ai, { updates }, { debug: false });
// console.log("RESULT:", res);
