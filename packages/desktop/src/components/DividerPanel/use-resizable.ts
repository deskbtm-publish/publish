import type React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';

export type DividerProps = React.ComponentPropsWithoutRef<'hr'>;

export type Resizable = {
  /**
   * border position
   */
  position: number;
  /**
   * position at end of drag
   */
  endPosition: number;
  /**
   * whether the border is dragging
   */
  isDragging: boolean;
  /**
   * props for drag bar
   */
  separatorProps: DividerProps;
  /**
   * set border position
   */
  setPosition: React.Dispatch<React.SetStateAction<number>>;
};

export type ResizeCallbackArgs = {
  /**
   * position at the time of callback
   */
  position: number;
};

export type UseResizableProps = {
  /**
   * direction of resizing
   */
  axis: 'x' | 'y';
  /**
   * ref of the container element
   */
  containerRef?: React.RefObject<HTMLElement | null | undefined>;
  /**
   * if true, cannot resize
   */
  disabled?: boolean;
  /**
   * initial border position
   */
  initial?: number;
  /**
   * minimum border position
   */
  min?: number;
  /**
   * maximum border position
   */
  max?: number;
  /**
   * calculate border position from other side
   */
  reverse?: boolean;
  /**
   * resizing step with keyboard
   */
  step?: number;
  shiftStep?: number;
  /**
   * callback when border position changes start
   */
  onResizeStart?: (args: ResizeCallbackArgs) => void;
  /**
   * callback when border position changes end
   */
  onResizeEnd?: (args: ResizeCallbackArgs) => void;
};

export type ResizableProps = UseResizableProps & {
  /**
   * callback children
   */
  children: (props: Resizable) => JSX.Element;
};

export const KEYS_LEFT = ['ArrowLeft', 'Left'];
export const KEYS_RIGHT = ['ArrowRight', 'Right'];
export const KEYS_UP = ['ArrowUp', 'Up'];
export const KEYS_DOWN = ['ArrowDown', 'Down'];
export const KEYS_AXIS_X = [...KEYS_LEFT, ...KEYS_RIGHT];
export const KEYS_AXIS_Y = [...KEYS_UP, ...KEYS_DOWN];
export const KEYS_POSITIVE = [...KEYS_RIGHT, ...KEYS_DOWN];

export const useResizable = ({
  axis,
  disabled = false,
  initial = 0,
  min = 0,
  max = Infinity,
  reverse,
  step = 10,
  shiftStep = 50,
  onResizeStart,
  onResizeEnd,
  containerRef,
}: UseResizableProps): Resizable => {
  const initialPosition = Math.min(Math.max(initial, min), max);
  const isResizing = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const positionRef = useRef(initialPosition);
  const [endPosition, setEndPosition] = useState(initialPosition);

  const ariaProps = useMemo<DividerProps>(
    () => ({
      role: 'separator',
      'aria-valuenow': position,
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-orientation': axis === 'x' ? 'vertical' : 'horizontal',
      'aria-disabled': disabled,
    }),
    [axis, disabled, max, min, position],
  );

  const handlePointermove = useCallback(
    (e: PointerEvent) => {
      if (!isResizing.current) return;

      if (disabled) return;

      e.stopPropagation();
      e.preventDefault();

      let currentPosition = (() => {
        if (axis === 'x') {
          if (containerRef?.current) {
            const containerNode = containerRef.current;
            const { left, width } = containerNode.getBoundingClientRect();
            return reverse ? left + width - e.clientX : e.clientX - left;
          }
          return reverse ? document.body.offsetWidth - e.clientX : e.clientX;
        }
        if (containerRef?.current) {
          const containerNode = containerRef.current;
          const { top, height } = containerNode.getBoundingClientRect();
          return reverse ? top + height - e.clientY : e.clientY - top;
        }
        return reverse ? document.body.offsetHeight - e.clientY : e.clientY;
      })();

      currentPosition = Math.min(Math.max(currentPosition, min), max);
      setPosition(currentPosition);
      positionRef.current = currentPosition;
    },
    [axis, disabled, max, min, reverse, containerRef],
  );

  const handlePointerup = useCallback(
    (e: PointerEvent) => {
      if (disabled) return;

      e.stopPropagation();
      isResizing.current = false;
      setIsDragging(false);
      setEndPosition(positionRef.current);
      document.removeEventListener('pointermove', handlePointermove);
      document.removeEventListener('pointerup', handlePointerup);
      if (onResizeEnd) onResizeEnd({ position: positionRef.current });
    },
    [disabled, handlePointermove, onResizeEnd],
  );

  const handlePointerdown = useCallback<React.PointerEventHandler>(
    (e) => {
      if (disabled) return;

      e.stopPropagation();
      isResizing.current = true;
      setIsDragging(true);
      document.addEventListener('pointermove', handlePointermove);
      document.addEventListener('pointerup', handlePointerup);
      if (onResizeStart) onResizeStart({ position: positionRef.current });
    },
    [disabled, handlePointermove, handlePointerup, onResizeStart],
  );

  const handleKeyDown = useCallback<React.KeyboardEventHandler>(
    (e) => {
      if (disabled) return;

      if (e.key === 'Enter') {
        setPosition(initial);
        positionRef.current = initial;
        return;
      }
      if (
        (axis === 'x' && !KEYS_AXIS_X.includes(e.key)) ||
        (axis === 'y' && !KEYS_AXIS_Y.includes(e.key))
      ) {
        return;
      }

      if (onResizeStart) onResizeStart({ position: positionRef.current });

      const changeStep = e.shiftKey ? shiftStep : step;
      const reversed = reverse ? -1 : 1;
      const dir = KEYS_POSITIVE.includes(e.key) ? reversed : -1 * reversed;

      const newPosition = position + changeStep * dir;
      if (newPosition < min) {
        setPosition(min);
        positionRef.current = min;
      } else if (newPosition > max) {
        setPosition(max);
        positionRef.current = max;
      } else {
        setPosition(newPosition);
        positionRef.current = newPosition;
      }

      if (onResizeEnd) onResizeEnd({ position: positionRef.current });
    },
    [
      disabled,
      axis,
      onResizeStart,
      shiftStep,
      step,
      reverse,
      position,
      min,
      max,
      onResizeEnd,
      initial,
    ],
  );

  const handleDoubleClick = useCallback<React.MouseEventHandler>(() => {
    if (disabled) return;
    setPosition(initial);
    positionRef.current = initial;
  }, [disabled, initial]);

  return {
    position,
    endPosition,
    isDragging,
    separatorProps: {
      ...ariaProps,
      onPointerDown: handlePointerdown,
      onKeyDown: handleKeyDown,
      onDoubleClick: handleDoubleClick,
    },
    setPosition,
  };
};
