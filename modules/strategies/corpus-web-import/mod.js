import meta from "./src/aperture/meta.js";
import importEntities from "./src/aperture/import.js";
import fs from "fs-extra";

import { createAnkiClient } from "./src/interfaces/anki.js";

async function boot(ctx) {
  ctx.aperture.branch("/interfaces/anki").open("/meta", meta).open("/import", importEntities);
  return ctx;
}

const manifest = {
  type: "strategy",
  slug: "anki-importer",
  traits: ["data-import", "anki"],
  version: "0.1.0",
  docs: {
    name: "Anki Importer",
    description: "Strategy for importing data from an Anki instance",
    icon: { emoji: "🧠" },
  },
};

export { manifest, boot };

function buildCurriculaTree(decks) {
  // Create a map to store the tree structure
  const treeMap = {};
  const rootNodes = [];

  // First pass: create all nodes
  decks.forEach((deck) => {
    const segments = deck.name.split("::");
    const id = deck.name;

    // Create or update node
    if (!treeMap[id]) {
      treeMap[id] = {
        id,
        name: segments[segments.length - 1],
        fullName: deck.name,
        cardCount: deck.cardCount,
        children: [],
        depth: segments.length - 1,
      };
    } else {
      // Update existing node with deck data
      treeMap[id].cardCount = deck.cardCount;
    }

    // If this is a root node, add to rootNodes
    if (segments.length === 1) {
      rootNodes.push(treeMap[id]);
      return;
    }

    // Get or create parent node
    const parentId = segments.slice(0, segments.length - 1).join("::");
    if (!treeMap[parentId]) {
      treeMap[parentId] = {
        id: parentId,
        name: segments[segments.length - 2],
        fullName: parentId,
        children: [],
        depth: segments.length - 2,
      };
    }

    // Add this node as a child of parent
    if (!treeMap[parentId].children.includes(treeMap[id])) {
      treeMap[parentId].children.push(treeMap[id]);
    }
  });

  // Sort children by name
  Object.values(treeMap).forEach((node) => {
    node.children.sort((a, b) => a.name.localeCompare(b.name));
  });

  // Sort root nodes by name
  rootNodes.sort((a, b) => a.name.localeCompare(b.name));

  return rootNodes;
}

/**
 * Transforms note types into standardized game objects
 * @param {Array} noteTypes - Array of note type objects
 * @returns {Array} - Array of game objects
 */
function transformGames(noteTypes) {
  return noteTypes.map((noteType) => {
    return {
      id: noteType.name,
      name: noteType.name,
      fields: noteType.fields,
      fieldCount: noteType.fields.length,
      // Group similar note types by their base name (removing suffixes)
      baseType: noteType.name
        .replace(/[-_][a-f0-9]{5,6}$/, "")
        .replace(/[-_]\d+$/, "")
        .replace(/\+{1,6}$/, "")
        .replace(/_{1,20}$/, ""),
    };
  });
}
async function testConnection() {
  console.log("Connecting to Anki...");
  const client = createAnkiClient("http://localhost:8765");

  // Fetch all required data
  const [decks, stats, noteTypes] = await Promise.all([
    client.getDecks(),
    client.getStats(),
    client.getNoteTypes(),
  ]);

  console.log(`Retrieved ${noteTypes.length} note types and ${decks.length} decks`);

  // Transform the data
  const curricula = buildCurriculaTree(decks);
  const games = transformGames(noteTypes);

  // Create the final data structure
  const result = {
    stats: {
      cards: stats.cards,
      notes: stats.notes,
      decks: stats.decks,
      noteTypes: noteTypes.length,
    },
    curricula,
    games,
    extractedAt: new Date().toISOString(),
  };

  // // Write to file
  // const jsonContent = JSON.stringify(result, null, 2);
  await fs.writeJson("anki-data.json", result);

  console.log("Anki data extracted and saved to anki-data.json");
  return result;
}

testConnection();
