import { use } from 'react';
import type { DragElementWrapper } from 'react-dnd';
import { useDrop } from 'react-dnd';

import { useTreeContext } from '../hooks';
import { ItemTypes } from '../ItemTypes';
import { PlaceholderContext } from '../providers';
import type { NodeModel } from '../types';
import { getDropTarget, isDroppable, isNodeModel } from '../utils';

export const useDropRoot = <T>(
  ref: React.RefObject<HTMLElement | null>,
): [boolean, NodeModel<T>, DragElementWrapper<HTMLElement>] => {
  const treeContext = useTreeContext<T>();
  const placeholderContext = use(PlaceholderContext);
  const [{ isOver, dragSource }, drop] = useDrop({
    accept: [ItemTypes.TREE_ITEM, ...treeContext.extraAcceptTypes],
    drop: (dragItem: any, monitor) => {
      const { rootId, onDrop } = treeContext;
      const { dropTargetId, index } = placeholderContext;

      if (
        monitor.isOver({ shallow: true }) &&
        dropTargetId !== undefined &&
        index !== undefined
      ) {
        // If the drag source is outside the react-dnd,
        // a different object is passed than the NodeModel.
        onDrop(isNodeModel<T>(dragItem) ? dragItem : null, rootId, index);
      }

      placeholderContext.hidePlaceholder();
    },
    canDrop: (dragItem, monitor) => {
      const { rootId } = treeContext;

      if (monitor.isOver({ shallow: true })) {
        if (dragItem === undefined) {
          return false;
        }

        return isDroppable(dragItem, rootId, treeContext);
      }

      return false;
    },
    hover: (dragItem, monitor) => {
      if (monitor.isOver({ shallow: true })) {
        const { rootId } = treeContext;
        const { dropTargetId, index, showPlaceholder, hidePlaceholder } =
          placeholderContext;

        const dropTarget = getDropTarget<T>(
          null,
          ref.current,
          monitor,
          treeContext,
        );

        if (
          dropTarget === null ||
          !isDroppable(dragItem, rootId, treeContext)
        ) {
          hidePlaceholder();
          return;
        }

        if (dropTarget.id !== dropTargetId || dropTarget.index !== index) {
          showPlaceholder(dropTarget.id, dropTarget.index);
        }
      }
    },
    collect: (monitor) => {
      const dragSource: NodeModel<T> = monitor.getItem();

      return {
        isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
        dragSource,
      };
    },
  });

  return [isOver, dragSource, drop];
};
