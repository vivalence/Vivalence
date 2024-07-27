import { Relation, RelationsEditProps } from "./types";

export function validateRelation(
  relation: Relation,
  allRelations: Relation[],
  connections?: RelationsEditProps["connections"],
): { isValid: boolean; error?: string } {
  if (!relation.key || relation.data.length === 0) {
    return { isValid: false, error: "Relation key and data cannot be empty" };
  }

  const isDuplicate = allRelations.filter((r) => r.key === relation.key && r.id !== relation.id).length > 0;
  if (isDuplicate) {
    return { isValid: false, error: "Duplicate relation key found" };
  }

  const connectionIds = connections?.[relation.type.toLowerCase() + "s"]?.map((item) => item.id) || [];
  const invalidIds = relation.data.filter((id) => !connectionIds.includes(id));
  if (invalidIds.length > 0) {
    return { isValid: false, error: `Invalid IDs found: ${invalidIds.join(", ")}` };
  }

  return { isValid: true };
}

export function addRelation(relations: Relation[]): Relation[] {
  const newRelation: Relation = { id: Date.now().toString(), key: "", type: "units", data: [] };
  return [...relations, newRelation];
}

export function removeRelation(relations: Relation[], id: string): Relation[] {
  return relations.filter((relation) => relation.id !== id);
}

export function updateRelation(
  relations: Relation[],
  id: string,
  updates: Partial<Relation>,
): Relation[] {
  return relations.map((relation) => relation.id === id ? { ...relation, ...updates } : relation);
}

export function reorderRelations(
  relations: Relation[],
  activeId: string,
  overId: string,
): Relation[] {
  const oldIndex = relations.findIndex((relation) => relation.id === activeId);
  const newIndex = relations.findIndex((relation) => relation.id === overId);

  const newRelations = Array.from(relations);
  const [reorderedItem] = newRelations.splice(oldIndex, 1);
  newRelations.splice(newIndex, 0, reorderedItem);

  return newRelations;
}
