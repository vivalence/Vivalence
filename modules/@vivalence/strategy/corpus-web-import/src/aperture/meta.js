// /src/methods/meta.js

import { createAnkiClient } from "../interfaces/anki.js";

/**
 * Retrieves schema and metadata from an Anki instance
 * @param {Object} body - Request body containing Anki connection details
 * @param {Object} ctx - Context object
 * @returns {Promise<Object>} - Comprehensive metadata about the Anki instance
 */
export default async function meta({ anki, ...body }, ctx) {
  try {
    const client = createAnkiClient(anki.url);

    // Collect all metadata in parallel for efficiency
    const [schema, decks, stats, noteTypes] = await Promise.all([
      client.getSchema(),
      client.getDecks(),
      client.getStats(),
      client.getNoteTypes(),
    ]);

    // Get a sample of cards and notes for structure reference
    const sampleCards = await client.getCards(null, 5);
    const sampleNotes = await client.getNotes(5);
    const sampleReviews = await client.getReviewHistory(5);

    return {
      status: "success",
      schema,
      statistics: stats,
      structure: {
        decks: {
          count: stats.decks,
          sample: decks.slice(0, 5),
          schema: schema.decks,
        },
        cards: {
          count: stats.cards,
          sample: sampleCards,
          schema: schema.cards,
        },
        notes: {
          count: stats.notes,
          sample: sampleNotes,
          schema: schema.notes,
        },
        noteTypes: {
          count: noteTypes.length,
          sample: noteTypes.slice(0, 5),
          schema: schema.models || [],
        },
        reviews: {
          count: stats.reviews,
          sample: sampleReviews,
          schema: schema.revlog,
        },
      },
    };
  } catch (error) {
    console.error("Error retrieving Anki metadata:", error);
    return {
      status: "error",
      message: error.message,
      stack: error.stack,
    };
  }
}
