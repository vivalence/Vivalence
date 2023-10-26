## Endpoint 1: Sentence Generation
Endpoint: /generation

### Request
```json
{
    "constraints": {
        "spokenLanguage": "English",
        "learningLanguage": "Spanish",
        "words": [
            {
            "spoken": "string",
            "learning": "string"
            }
        ],
        "grammar": {
            "verb": "string",
            "tense": "string",
            "performer": "string",
            "mood": "string"
        }, 
        "lenght": "Integer"
    }
}
```
- spokenLanguage: The user's primary language.
- learningLanguage: The language the user is learning.
- words: List of specific word pairs with Spanish and English translations.
- grammar: Grammar constraints for sentence generation.
- length: how many words the sentence should be

### Response
```json
{
  "sentenceSpoken": "string",
  "sentenceLearning": "string"
}
```
- sentenceLearning: Generated sentence in Spanish.
- sentenceSpoken: English translation of the generated Spanish sentence.

## Endpoint 2: User Translation Evaluation
Endpoint: /evaluation

### Request

```json
{
  "constraints": {
    "spokenLanguage": "string",
    "learningLanguage": "string",
    "words": [
      {
        "learning": "string",
        "spoken": "string"
      }
    ],
    "grammar": {
      "verb": "string",
      "tense": "string",
      "performer": "string",
      "mood": "string"
    }
  },
  "spokenPrompt": "string",
  "learningExpected": "string",
  "learningProvided": "string"
}
```
- constraints: The constraints object from Endpoint 1 that was used to generate the sentence.
- spokenPrompt: The English sentence prompt provided to the user.
- learningExpected: The correct Spanish translation of the English prompt.
- learningProvided: The user's translation of the English prompt into Spanish.

### Response (Version 1)
```json
{
  "accuracy": "string",
  "correctness": "string"
}
```
- accuracy: Percentage of the accuracy of the user's translation.
- correctness: Qualitative representation of the translation's correctness.

### Response (Version 2)
```json
{
  "accuracy": "string",
  "correctness": "string",
  "breakdown": {
    "word": {
      "accuracy": "string",
      "correctness": "string"
    }
  }
}
```

- accuracy: Percentage of the accuracy of the user's translation.
- correctness: Qualitative representation of the translation's correctness.
- breakdown: Word-by-word breakdown of accuracy and correctness.
