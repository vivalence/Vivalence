import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RelationItemProps } from './types';
import RelationItem from './RelationItem';

const SortableRelationItem: React.FC<RelationItemProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.relation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <RelationItem {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
};

export default SortableRelationItem;
