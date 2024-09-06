import React, { useCallback } from "react";
import { Button } from "antd";
import RelationItem from "./RelationItem"; // Import RelationItem instead of SortableRelationItem
import { PlusOutlined } from "@ant-design/icons";
import { Relation, RelationsEditProps } from "./types";
import Container from "$components/kit/Container";

const RelationsEdit: React.FC<RelationsEditProps> = (props) => {
  const { value = [], onChange, connections = {} } = props;

  const addRelation = useCallback(() => {
    const newRelation: Relation = {
      id: Date.now().toString(),
      key: "",
      type: "units",
      data: [],
    };
    onChange([...value, newRelation]);
  }, [value, onChange]);

  const updateRelation = useCallback(
    (id: string, updates: Partial<Relation>) => {
      onChange(
        value.map((relation) => (relation.id === id ? { ...relation, ...updates } : relation)),
      );
    },
    [value, onChange],
  );

  const removeRelation = useCallback(
    (id: string) => {
      onChange(value.filter((relation) => relation.id !== id));
    },
    [value, onChange],
  );

  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          // @ts-ignore
          icon={<PlusOutlined />}
          onClick={addRelation}
          style={{ marginLeft: "auto", marginBottom: "20px" }}
        >
          Add Relation
        </Button>
      </div>
      {value
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .map((relation) => (
          <div
            key={relation.id}
            style={{
              marginBottom: "20px",
              padding: "20px",
              boxShadow: "0 2px 4px 0 rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
              borderRadius: "6px",
            }}
          >
            <RelationItem
              relation={relation}
              connections={connections}
              onUpdate={updateRelation}
              onRemove={removeRelation}
            />
          </div>
        ))}
    </Container>
  );
};

export default RelationsEdit;
