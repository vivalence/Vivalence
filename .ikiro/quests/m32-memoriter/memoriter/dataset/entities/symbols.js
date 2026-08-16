import { root, ontological, structural } from "./build.js";

const roots = [
  root("word", "Vocabulum", "A single vocabulary item."),
  root("sentence", "Sententia", "A complete sentence."),
];

const partOfSpeech = [
  ontological("word.part-of-speech.noun", "Nomen", "Nouns, nominative singular."),
  ontological("word.part-of-speech.verb", "Verbum", "Verbs, present infinitive."),
  ontological("word.part-of-speech.adjective", "Adiectivum", "Adjectives, masculine nominative singular."),
  ontological("word.part-of-speech.adverb", "Adverbium", "Manner, time, degree."),
  ontological("word.part-of-speech.pronoun", "Pronomen", "Personal and demonstrative pronouns."),
  ontological("word.part-of-speech.preposition", "Praepositio", "Spatial and grammatical relations."),
  ontological("word.part-of-speech.conjunction", "Coniunctio", "Connectors."),
  ontological("word.part-of-speech.phrase", "Locutio", "Fixed expressions and greetings."),
];

const gender = [
  ontological("word.gender.masculine", "Masculinum", "Masculine nouns."),
  ontological("word.gender.feminine", "Femininum", "Feminine nouns."),
  ontological("word.gender.neuter", "Neutrum", "Neuter nouns."),
];

const level = [
  structural("level.primus", "Gradus Primus", "First steps."),
  structural("level.secundus", "Gradus Secundus", "Building fluency."),
];

const topic = [
  structural("topic.religio", "Religio", "God, faith, prayer, the sacred."),
  structural("topic.bellum", "Bellum", "War, arms, the legions."),
  structural("topic.familia", "Familia", "Family, kin, the household."),
  structural("topic.corpus", "Corpus", "The body and its life."),
  structural("topic.natura", "Natura", "Sky, sea, beasts, the world."),
  structural("topic.urbs", "Urbs", "The city, law, and public life."),
  structural("topic.tempus", "Tempus", "Time, days, seasons."),
  structural("topic.virtus", "Virtus", "Virtue, mind, and character."),
  structural("topic.vita", "Vita", "Daily life, food, home."),
  structural("topic.sermo", "Sermo", "Speech, greeting, conversation."),
];

export const symbols = [...roots, ...partOfSpeech, ...gender, ...level, ...topic];
