import { useEffect } from 'react';
import type {
  ConnectDragPreview,
  ConnectDragSource,
  DragElementWrapper,
  DragPreviewOptions,
  DragSourceOptions,
} from 'react-dnd';
import { useDrag } from 'react-dnd';

import { useTreeContext } from '../hooks';
import { ItemTypes } from '../ItemTypes';
import type { DragItem, DragSourceElement, NodeModel } from '../types';

let dragSourceElement: DragSourceElement = null;

const register = (e: DragEvent | TouchEvent): void => {
  const { target } = e;

  if (target instanceof HTMLElement) {
    const source = target.closest('[role="listitem"]');

    if (e.currentTarget === source) {
      dragSourceElement = source;
    }
  }
};

const handleDragStart = (e: DragEvent) => register(e);
const handleTouchStart = (e: TouchEvent) => register(e);

export const useDragNode = <T>(
  item: NodeModel<T>,
  ref: React.RefObject<HTMLElement | null>,
): [
  boolean,
  DragElementWrapper<DragSourceOptions>,
  DragElementWrapper<DragPreviewOptions>,
] => {
  const treeContext = useTreeContext<T>();

  useEffect(() => {
    const node = ref.current;
    node?.addEventListener('dragstart', handleDragStart);
    node?.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });

    return () => {
      node?.removeEventListener('dragstart', handleDragStart);
      node?.removeEventListener('touchstart', handleTouchStart);
    };
  }, [ref]);

  const [{ isDragging }, drag, preview]: [
    { isDragging: boolean },
    ConnectDragSource,
    ConnectDragPreview,
  ] = useDrag({
    type: ItemTypes.TREE_ITEM,
    item: (monitor) => {
      const dragItem: DragItem<T> = { ref, ...item };

      if (treeContext.onDragStart) {
        treeContext.onDragStart(dragItem, monitor);
      }

      return dragItem;
    },
    end: (item, monitor) => {
      const dragItem = item as DragItem<T>;

      if (treeContext.onDragEnd) {
        treeContext.onDragEnd(dragItem, monitor);
      }
    },
    canDrag: () => {
      const { canDrag } = treeContext;

      if (dragSourceElement !== ref.current) {
        return false;
      }

      if (canDrag) {
        return canDrag(item.id);
      }

      return true;
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return [isDragging, drag, preview];
};
