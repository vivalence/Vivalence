// /src/methods/import.js

import { createAnkiClient } from "../interfaces/anki.js";

/**
 * Imports entities from an Anki instance by type
 * @param {Object} body - Request body containing Anki connection details and import parameters
 * @param {Object} ctx - Context object
 * @returns {Promise<Object>} - Imported entities
 */
export default async function importEntities(
  { anki, entityType, id, limit, offset, ...body },
  ctx,
) {
  try {
    const client = createAnkiClient(anki.url);
    let result;

    // Default pagination values
    limit = limit || 100;
    offset = offset || 0;

    switch (entityType) {
      case "decks":
        result = await client.getDecks();
        if (id) {
          result = result.find((deck) => deck.id === id);

          // If a specific deck is requested, also fetch its cards
          if (result) {
            const deckCards = await client.getCards(id);
            result.cards = deckCards;
          }
        } else {
          // Apply pagination if no specific ID is requested
          result = result.slice(offset, offset + limit);
        }
        break;

      case "cards":
        if (id) {
          // If specific card ID is provided
          const query = `SELECT * FROM cards WHERE id = ${id}`;
          const card = await client.executeQuery(query);

          if (card && card.length > 0) {
            // Get the note associated with this card
            const noteQuery = `SELECT * FROM notes WHERE id = ${card[0].nid}`;
            const note = await client.executeQuery(noteQuery);
            result = { ...card[0], note: note[0] };
          } else {
            result = null;
          }
        } else {
          // Get paginated cards
          const query = `SELECT * FROM cards LIMIT ${limit} OFFSET ${offset}`;
          result = await client.executeQuery(query);
        }
        break;

      case "notes":
        if (id) {
          const query = `SELECT * FROM notes WHERE id = ${id}`;
          result = await client.executeQuery(query);
          result = result && result.length ? result[0] : null;

          // Get cards for this note
          if (result) {
            const cardsQuery = `SELECT * FROM cards WHERE nid = ${id}`;
            const cards = await client.executeQuery(cardsQuery);
            result.cards = cards;
          }
        } else {
          const query = `SELECT * FROM notes LIMIT ${limit} OFFSET ${offset}`;
          result = await client.executeQuery(query);
        }
        break;

      case "noteTypes":
        if (id) {
          const query = `SELECT * FROM models WHERE id = ${id}`;
          result = await client.executeQuery(query);
          result = result && result.length ? result[0] : null;
        } else {
          const query = `SELECT * FROM models LIMIT ${limit} OFFSET ${offset}`;
          result = await client.executeQuery(query);
        }
        break;

      case "reviewHistory":
        const reviewQuery = id
          ? `SELECT * FROM revlog WHERE cid = ${id} ORDER BY id DESC`
          : `SELECT * FROM revlog ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

        result = await client.executeQuery(reviewQuery);
        break;

      case "collection":
        // Get overall collection information
        const colQuery = `SELECT * FROM col`;
        result = await client.executeQuery(colQuery);
        result = result && result.length ? result[0] : null;
        break;

      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }

    return {
      status: "success",
      entityType,
      data: result,
      pagination: {
        limit,
        offset,
        hasMore: Array.isArray(result) && result.length === limit,
      },
    };
  } catch (error) {
    console.error(`Error importing Anki ${entityType}:`, error);
    return {
      status: "error",
      entityType,
      message: error.message,
      stack: error.stack,
    };
  }
}
