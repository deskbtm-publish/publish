import type { RefObject } from 'react';
import { useEffect } from 'react';
import type { DragElementWrapper, DragSourceOptions } from 'react-dnd';

export const useDragHandle = (
  containerRef: RefObject<HTMLElement | null>,
  handleRef: RefObject<any>,
  drag: DragElementWrapper<DragSourceOptions>,
) => {
  if (handleRef.current) {
    drag(handleRef);
  } else {
    drag(containerRef);
  }

  useEffect(() => {
    if (handleRef.current) {
      drag(handleRef);
    } else {
      drag(containerRef);
    }
  }, [handleRef.current]);
};
