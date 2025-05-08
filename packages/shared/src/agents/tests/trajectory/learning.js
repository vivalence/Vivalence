import { Trajectory } from "@vivalence/trajectory";
import { Type } from "@sinclair/typebox";
import parsers from "@vivalence/trajectory/parsers";

export const createTestTrajectory = () => {
  const UnitId = Type.String();
  const UnitStatus = Type.Union([
    Type.Literal("new"),
    Type.Literal("learning"),
    Type.Literal("reviewing"),
    Type.Literal("mastered")
  ]);

  const UnitByStatusInput = Type.Object({
    status: UnitStatus
  });

  const UnitByStatusOutput = Type.Array(Type.Object({
    id: UnitId,
    content: Type.String(),
    status: UnitStatus
  }));

  const UnitPendingOutput = Type.Array(Type.Object({
    id: UnitId,
    content: Type.String(),
    status: UnitStatus,
    dueDate: Type.Optional(Type.String())
  }));

  const ClassifyTextInput = Type.Object({
    text: Type.String()
  });

  const TokenAnnotation = Type.Object({
    token: Type.Object({
      text: Type.String()
    }),
    annotation: Type.Object({
      pos: Type.String(),
      grammar: Type.Optional(Type.Object({
        case: Type.Optional(Type.String()),
        number: Type.Optional(Type.String()),
        gender: Type.Optional(Type.String()),
        tense: Type.Optional(Type.String()),
        person: Type.Optional(Type.String())
      }))
    })
  });

  const ClassifySentenceOutput = Type.Array(TokenAnnotation);
  const ClassifyWordOutput = TokenAnnotation;

  const ReviewAnnotationInput = Type.Object({
    annotations: Type.Array(TokenAnnotation),
    expected: Type.Optional(Type.Array(TokenAnnotation))
  });

  const ReviewOutput = Type.Object({
    correct: Type.Boolean(),
    feedback: Type.String(),
    corrections: Type.Optional(Type.Array(TokenAnnotation))
  });

  const trajectory = new Trajectory(Object.values(parsers));
  
  trajectory.use(async (input, ctx, next) => {
    ctx.database = {
      units: {
        getByStatus: (status) => [
          { id: "1", content: "puella currit", status, dueDate: "2025-05-17T10:00:00Z" },
          { id: "2", content: "puer currit", status, dueDate: "2025-05-17T11:00:00Z" },
          { id: "3", content: "puella legit", status, dueDate: "2025-05-18T10:00:00Z" }
        ],
        getPending: () => [
          { id: "4", content: "puer legit", status: "new", dueDate: "2025-05-16T14:00:00Z" },
          { id: "5", content: "puella dormit", status: "reviewing", dueDate: "2025-05-16T16:30:00Z" }
        ]
      },
      classify: {
        sentence: (text) => text.split(" ").map(word => ({
          token: { text: word.toLowerCase() },
          annotation: {
            pos: ["puella", "puer"].includes(word.toLowerCase()) ? "NOUN" : "VERB",
            grammar: {
              case: ["puella", "puer"].includes(word.toLowerCase()) ? "nominative" : undefined,
              number: "singular",
              gender: word.toLowerCase() === "puella" ? "feminine" : 
                     word.toLowerCase() === "puer" ? "masculine" : undefined,
              tense: ["currit", "legit", "dormit"].includes(word.toLowerCase()) ? "present" : undefined,
              person: ["currit", "legit", "dormit"].includes(word.toLowerCase()) ? "third" : undefined
            }
          }
        })),
        word: (text) => {
          const word = text.trim().toLowerCase();
          return {
            token: { text: word },
            annotation: {
              pos: ["puella", "puer"].includes(word) ? "NOUN" : "VERB",
              grammar: {
                case: ["puella", "puer"].includes(word) ? "nominative" : undefined,
                number: "singular",
                gender: word === "puella" ? "feminine" : 
                       word === "puer" ? "masculine" : undefined,
                tense: ["currit", "legit", "dormit"].includes(word) ? "present" : undefined,
                person: ["currit", "legit", "dormit"].includes(word) ? "third" : undefined
              }
            }
          };
        }
      },
      review: {
        annotation: (annotations, expected) => {
          const correct = !expected || JSON.stringify(annotations) === JSON.stringify(expected);
          return {
            correct,
            feedback: correct 
              ? "The analysis is correct. Well done!" 
              : "There are some errors in your analysis.",
            corrections: correct ? undefined : expected
          };
        }
      }
    };
    
    return await next();
  });
  
  trajectory
    .branch((p) => p.path.pattern({
      path: "/pick",
      valence: "Access and select learning units based on various criteria. This path handles the selection and filtering of language learning content."
    }))
    .branch((p) => p.path.pattern({
      path: "/units",
      valence: "Operations related to language learning units. Units are the basic content pieces containing vocabulary, phrases, or sentences."
    }))
    .branch((p) => p.path.pattern({
      path: "/byStatus",
      valence: "Select learning units based on their learning status (new, learning, reviewing, mastered). This helps create targeted learning sessions based on the learner's progress.",
      input: UnitByStatusInput,
      output: UnitByStatusOutput
    }))
    .open((p) => p.sig.pattern({ path: "/" }), async (input, ctx) => {
      return ctx.database.units.getByStatus(input.status);
    });
  
  trajectory
    .branch((p) => p.path.pattern({
      path: "/pick",
      valence: "Access and select learning units based on various criteria. This path handles the selection and filtering of language learning content."
    }))
    .branch((p) => p.path.pattern({
      path: "/units",
      valence: "Operations related to language learning units. Units are the basic content pieces containing vocabulary, phrases, or sentences."
    }))
    .branch((p) => p.path.pattern({
      path: "/pending",
      valence: "Get units that are due for learning or review based on spaced repetition algorithms. This provides the next items the learner should focus on.",
      output: UnitPendingOutput
    }))
    .open((p) => p.sig.pattern({ path: "/" }), async (input, ctx) => {
      return ctx.database.units.getPending();
    });
  
  trajectory
    .branch((p) => p.path.pattern({
      path: "/classify",
      valence: "Analyze and annotate language content with grammatical information. This path handles linguistic analysis of Latin text."
    }))
    .branch((p) => p.path.pattern({
      path: "/sentence",
      valence: "Parse a complete Latin sentence and identify all tokens with their grammatical properties. This provides detailed analysis of sentence structure and word functions.",
      input: ClassifyTextInput,
      output: ClassifySentenceOutput
    }))
    .open((p) => p.sig.pattern({ path: "/" }), async (input, ctx) => {
      return ctx.database.classify.sentence(input.text);
    });
  
  trajectory
    .branch((p) => p.path.pattern({
      path: "/classify",
      valence: "Analyze and annotate language content with grammatical information. This path handles linguistic analysis of Latin text."
    }))
    .branch((p) => p.path.pattern({
      path: "/word",
      valence: "Analyze a single Latin word and identify its grammatical properties such as part of speech, case, gender, number, tense, etc.",
      input: ClassifyTextInput,
      output: ClassifyWordOutput
    }))
    .open((p) => p.sig.pattern({ path: "/" }), async (input, ctx) => {
      return ctx.database.classify.word(input.text);
    });
  
  trajectory
    .branch((p) => p.path.pattern({
      path: "/review",
      valence: "Evaluate language analysis for correctness and provide feedback. This path handles assessment of learner understanding."
    }))
    .branch((p) => p.path.pattern({
      path: "/annotation",
      valence: "Review grammatical annotations for correctness and provide detailed feedback. This helps assess the learner's understanding of language structures and grammar.",
      input: ReviewAnnotationInput,
      output: ReviewOutput
    }))
    .open((p) => p.sig.pattern({ path: "/" }), async (input, ctx) => {
      return ctx.database.review.annotation(input.annotations, input.expected);
    });
  
  return trajectory;
};
