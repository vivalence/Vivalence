import { Game, Unit, Tag, Resource } from "$types/index";

export interface Relation {
    id: string;
    key: string;
    type: "units" | "tags" | "games";
    data: string[];
}

export interface RelationsEditProps {
    value?: Relation[];
    onChange: (relations: Relation[]) => void;
    connections: {
        units?: Tag[];
        tags?: Unit[];
        games?: Game[];
        [key: string]: Connection[];
    };
}

export interface RelationItemProps {
    relation: Relation;
    connections: {
        [key: string]: Connection[];
    };
    onUpdate: (id: string, updates: Partial<Relation>) => void;
    onRemove: (id: string) => void;
    dragHandleProps?: any;
}
