import React, { useState } from "react";
import { Input, Select, Form, Button, AutoComplete, List } from "antd";
import { DeleteOutlined, MenuOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

/* import { Resource } from "$types/index"; */
import { RelationItemProps } from "./types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";

const { Option } = Select;

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  onRemove: (id: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(0px, ${transform.y}px, 0)` : undefined,
    transition,
    display: "flex",
    alignItems: "center",
    padding: "5px",
    margin: "5px 0",
    background: "#fff",
    border: "1px solid #f1f1f1",
    boxShadow: "0 2px 4px 0 rgba(0,0,0,0.1)",
    borderRadius: "6px"
  };

  return (
    <div ref={setNodeRef} style={style}>
      <span style={{ flex: 1, paddingLeft: "8px" }}>{children}</span>
      {/* @ts-ignore */}
      <MenuOutlined
        {...attributes}
        {...listeners}
        style={{ cursor: "move", marginRight: "8px" }}
      />
      {/* @ts-ignore */}
      <DeleteOutlined onClick={() => onRemove(id)} style={{ cursor: "pointer" }} />
    </div>
  );
};

const RelationItem: React.FC<RelationItemProps> = ({
  relation,
  connections,
  onUpdate,
  onRemove
}) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<{ value: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(relation.data.length === 0);

  React.useEffect(() => {
    const options = connections[relation.type]
      .filter((item) => !relation.data.includes(item.id))
      .filter((item) => item.name.toLowerCase().includes(inputValue.toLowerCase()))
      .map((item) => {
        const itemtype = Array.isArray(item.type) ? item.type.join(", ") : item.type;
        return {
          value: item.id,
          label: (
            <>
              {item.name}
              <span style={{ float: "right" }}>{itemtype}</span>
            </>
          )
        };
      });
    setOptions(options);
  }, [relation.data, connections, relation.type, inputValue]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = relation.data.indexOf(active.id as string);
      const newIndex = relation.data.indexOf(over?.id as string);
      const newData = Array.from(relation.data);
      newData.splice(oldIndex, 1);
      newData.splice(newIndex, 0, active.id as string);
      onUpdate(relation.id, { data: newData });
    }
  };

  const handleAdd = (value: string) => {
    if (value && !relation.data.includes(value)) {
      onUpdate(relation.id, { data: [...relation.data, value] });
    }
    setInputValue(inputValue);
    setOpen(true);
  };

  const handleDropdownVisibleChange = (visible: boolean) => {
    if (visible) {
      setOpen(true);
    }
  };

  const handleRemove = (itemId: string) => {
    onUpdate(relation.id, { data: relation.data.filter((id) => id !== itemId) });
  };

  return (
    <Form layout="vertical">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: showDetails ? "1px solid lightgrey" : "none"

        }}
      >
        <Form.Item label="Key" style={{ flex: 1, marginRight: "8px" }}>
          <Input
            value={relation.key}
            onChange={(e) => onUpdate(relation.id, { key: e.target.value })}
            placeholder="Relation Key"
          />
        </Form.Item>
        <Form.Item label="Type" style={{ width: "120px", marginRight: "8px" }}>
          <Select
            value={relation.type}
            onChange={(value) => onUpdate(relation.id, { type: value })}
          >
            <Option value="units">Units</Option>
            <Option value="tags">Tags</Option>
            <Option value="games">Games</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Control">
          <Button.Group>
            <Button onClick={() => onRemove(relation.id)} danger>
              {/* @ts-ignore */}
              <DeleteOutlined />
            </Button>
            <Button onClick={() => setShowDetails(!showDetails)}>
              {/* @ts-ignore */}
              {showDetails ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              <span style={{ marginLeft: '-3px' }}>{relation.data.length}</span>
            </Button>
          </Button.Group>

        </Form.Item>
      </div>
      {showDetails && (
        <Form.Item>
          <AutoComplete
            value={inputValue}
            options={options}
            onSelect={handleAdd}
            onSearch={setInputValue}
            onChange={setInputValue}
            style={{ width: "100%", margin: "20px 0 10px" }}
            open={open}
            onDropdownVisibleChange={handleDropdownVisibleChange}
            onBlur={() => setOpen(false)}
            placeholder="Type to add new item"
          />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={() => handleAdd(inputValue)}
            style={{ display: "none" }}
          />
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={relation.data} strategy={verticalListSortingStrategy}>
              <List
                dataSource={relation.data}
                renderItem={(itemId: string) => {
                  const item = connections[relation.type].find((c) => c.id === itemId);
                  return item ? (
                    <SortableItem
                      key={item.id}
                      id={item.id}
                      onRemove={handleRemove}
                    >
                      {{ games: "Game", units: "Unit", tags: "Tag" }[relation.type]} : {item.name}
                    </SortableItem>
                  ) : null;
                }}
              />
            </SortableContext>
          </DndContext>
        </Form.Item>
      )}
    </Form>
  );
};

export default RelationItem;
