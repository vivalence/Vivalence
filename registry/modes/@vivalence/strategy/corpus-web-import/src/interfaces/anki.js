export function createAnkiClient(url) {
  let requestQueue = Promise.resolve();

  const client = {
    async invoke(action, params = {}) {
      return new Promise((resolve, reject) => {
        requestQueue = requestQueue
          .then(() => this._doRequest(action, params))
          .then((result) => {
            return new Promise((r) => setTimeout(() => r(result), 100));
          })
          .then(resolve)
          .catch(reject);
      });
    },

    async _doRequest(action, params = {}) {
      try {
        console.log(`Requesting ${action}...`);
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            version: 6,
            params,
          }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(`AnkiConnect error: ${data.error}`);
        }

        return data.result;
      } catch (error) {
        console.error(`Error executing Anki action ${action}:`, error);
        throw error;
      }
    },

    async getSchema() {
      try {
        const modelNames = await this.invoke("modelNames");
        const deckNames = await this.invoke("deckNames");

        return {
          models: modelNames,
          decks: deckNames,
        };
      } catch (error) {
        console.error("Error getting schema:", error);
        throw error;
      }
    },

    async getDecks() {
      try {
        const deckNames = await this.invoke("deckNames");
        const deckList = [];

        for (const name of deckNames) {
          const cardIds = await this.invoke("findCards", {
            query: `deck:"${name}"`,
          });

          deckList.push({
            name,
            id: name,
            cardCount: cardIds.length,
          });
        }

        return deckList;
      } catch (error) {
        console.error("Error getting decks:", error);
        throw error;
      }
    },

    async getCards(deckName = null, limit = 100) {
      try {
        const query = deckName ? `deck:"${deckName}"` : "";
        const cardIds = await this.invoke("findCards", { query });
        const limitedIds = cardIds.slice(0, limit);

        if (limitedIds.length === 0) {
          return [];
        }

        return this.invoke("cardsInfo", { cards: limitedIds });
      } catch (error) {
        console.error("Error getting cards:", error);
        throw error;
      }
    },

    async getNotes(query = "", limit = 100) {
      try {
        const noteIds = await this.invoke("findNotes", { query });
        const limitedIds = noteIds.slice(0, limit);

        if (limitedIds.length === 0) {
          return [];
        }

        return this.invoke("notesInfo", { notes: limitedIds });
      } catch (error) {
        console.error("Error getting notes:", error);
        throw error;
      }
    },

    async getNoteTypes() {
      try {
        const modelNames = await this.invoke("modelNames");
        const models = [];

        for (const name of modelNames) {
          try {
            const fields = await this.invoke("modelFieldNames", { modelName: name });
            models.push({
              name,
              fields,
            });
          } catch (error) {
            models.push({
              name,
              error: error.message,
            });
          }
        }

        return models;
      } catch (error) {
        console.error("Error getting note types:", error);
        throw error;
      }
    },

    async getReviewHistory(limit = 100) {
      try {
        const recentlyReviewed = await this.invoke("findCards", {
          query: "rated:31",
        });

        const limitedCards = recentlyReviewed.slice(0, limit);

        if (limitedCards.length === 0) {
          return [];
        }

        return this.invoke("cardsInfo", { cards: limitedCards });
      } catch (error) {
        console.error("Error getting review history:", error);
        throw error;
      }
    },

    async getStats() {
      try {
        const deckNames = await this.invoke("deckNames");
        const noteIds = await this.invoke("findNotes", { query: "" });
        const cardIds = await this.invoke("findCards", { query: "" });

        return {
          decks: deckNames.length,
          notes: noteIds.length,
          cards: cardIds.length,
          reviews: -1,
        };
      } catch (error) {
        console.error("Error getting stats:", error);
        throw error;
      }
    },
  };

  return client;
}
