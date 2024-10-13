import { is } from '@deskbtm/gadgets/is';
import { Box, rem } from '@mantine/core';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import type React from 'react';
import { useEffect, useReducer, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import type { ShowContextMenuParams } from './context-menu';
import * as styles from './ContextMenu.module.css';
import { ContextMenuProvider } from './ContextMenuContext';
import { ContextMenuDivider } from './Divider';
import { ContextMenuEvents } from './enums';
import { eventManager } from './event-manager';
import { useItemTracker } from './hooks';
import { ContextMenuItem } from './Item';
import { createKeyboardController } from './keyboard-controller';
import { ContextMenuLabel } from './Label';
import { ContextMenuScrollView } from './ScrollView';
import { ContextMenuSub } from './Sub';
import type { MenuAnimation, MenuId, TriggerEvent } from './types';
import { cloneItems, getMousePosition } from './utils';

export interface ContextMenuProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'id'> {
  /**
   * Unique id to identify the menu. Use to Trigger the corresponding menu
   */
  id: MenuId;

  /**
   * Any valid node that can be rendered
   */
  children: ReactNode;

  /**
   * Animation is appended to
   * - `.contextmenu_willEnter-${given animation}`
   * - `.contextmenu_willLeave-${given animation}`
   *
   * - To disable all animations you can pass `false`
   * - To disable only the enter or the exit animation you can provide an object `{enter: false, exit: 'exitAnimation'}`
   *
   * - default is set to `fade`
   */
  animation?: MenuAnimation;

  /**
   * Disables menu repositioning if outside screen.
   * This may be needed in some cases when using custom position.
   */
  disableBoundariesCheck?: boolean;

  /**
   * Prevents scrolling the window on when typing. Defaults to true.
   */
  preventDefaultOnKeydown?: boolean;

  /**
   * Used to track menu visibility
   */
  onVisibilityChange?: (isVisible: boolean) => void;
}

interface MenuState {
  x: number;
  y: number;
  visible: boolean;
  triggerEvent: TriggerEvent;
  propsFromTrigger: any;
  willLeave: boolean;
  backdropFilter: string;
}

const hideOnEvents: (keyof GlobalEventHandlersEventMap)[] = [
  'resize',
  'contextmenu',
  'click',
  'scroll',
  // comment blur in dev so you can toggle console without closing the menu
  'blur',
];

function reducer(
  state: MenuState,
  payload: Partial<MenuState> | ((state: MenuState) => Partial<MenuState>),
) {
  return { ...state, ...(is.function(payload) ? payload(state) : payload) };
}
const defaultBackdrop = 'saturate(180%) blur(10px)';

export const ContextMenu = ({
  id,
  style,
  className,
  children,
  animation = 'fade',
  preventDefaultOnKeydown = true,
  disableBoundariesCheck = false,
  onVisibilityChange,
  ...rest
}: ContextMenuProps) => {
  const [state, setState] = useReducer(reducer, {
    x: 0,
    y: 0,
    visible: false,
    triggerEvent: {} as TriggerEvent,
    propsFromTrigger: null,
    willLeave: false,
    backdropFilter: defaultBackdrop,
  });
  const nodeRef = useRef<HTMLDivElement>(null);
  const itemTracker = useItemTracker();

  const [menuController] = useState(() => createKeyboardController());
  const wasVisible = useRef<boolean>(null);
  const visibilityId = useRef<number>(null);

  // Subscribe event manager
  useEffect(() => {
    eventManager.on(id, show).on(ContextMenuEvents.hideAll, hide);

    return () => {
      eventManager.off(id, show).off(ContextMenuEvents.hideAll, hide);
    };
    // Hide rely on setState(dispatch), which is guaranteed to be the same across render
  }, [id, animation, disableBoundariesCheck, show, hide]);

  // Collect menu items for keyboard navigation
  useEffect(() => {
    !state.visible ? itemTracker.clear() : menuController.init(itemTracker);
  }, [state.visible, menuController, itemTracker]);

  function checkBoundaries(x: number, y: number) {
    if (nodeRef.current && !disableBoundariesCheck) {
      const { innerWidth, innerHeight } = window;
      const { offsetWidth, offsetHeight } = nodeRef.current;

      if (x + offsetWidth > innerWidth) x -= x + offsetWidth - innerWidth;
      if (y + offsetHeight > innerHeight) y -= y + offsetHeight - innerHeight;
    }

    return { x, y };
  }

  // when the menu is transitioning from not visible to visible,
  // the nodeRef is attached to the dom element this let us check the boundaries
  useEffect(() => {
    // state.visible and state{x,y} are updated together
    if (state.visible) setState(checkBoundaries(state.x, state.y));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.visible]);

  // subscribe dom events
  useEffect(() => {
    function preventDefault(e: KeyboardEvent) {
      if (preventDefaultOnKeydown) e.preventDefault();
    }

    function handleKeyboard(e: KeyboardEvent) {
      switch (e.key) {
        case 'Enter':
        case ' ':
          if (!menuController.openSubMenu()) hide();
          break;
        case 'Escape':
          hide();
          break;
        case 'ArrowUp':
          preventDefault(e);
          menuController.moveUp();
          break;
        case 'ArrowDown':
          preventDefault(e);
          menuController.moveDown();
          break;
        case 'ArrowRight':
          preventDefault(e);
          menuController.openSubMenu();
          break;
        case 'ArrowLeft':
          preventDefault(e);
          menuController.closeSubMenu();
          break;
        default:
          menuController.matchKeys(e);
          break;
      }
    }

    if (state.visible) {
      window.addEventListener('keydown', handleKeyboard);

      for (const ev of hideOnEvents) window.addEventListener(ev, hide);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyboard);

      for (const ev of hideOnEvents) window.removeEventListener(ev, hide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.visible, menuController, preventDefaultOnKeydown]);

  function show({ event, props, position }: ShowContextMenuParams) {
    event.stopPropagation();
    const p = position || getMousePosition(event);
    // check boundaries when the menu is already visible
    const { x, y } = checkBoundaries(p.x, p.y);

    flushSync(() => {
      setState({
        visible: true,
        willLeave: false,
        x,
        y,
        triggerEvent: event,
        propsFromTrigger: props,
      });
    });

    clearTimeout(visibilityId.current);
    if (!wasVisible.current && is.function(onVisibilityChange)) {
      onVisibilityChange(true);
      wasVisible.current = true;
    }
  }

  function hide(e?: Event) {
    type SafariEvent = KeyboardEvent & MouseEvent;

    if (
      e != null &&
      // Safari trigger a click event when you Ctrl + TrackPad
      ((e as SafariEvent).button === 2 || (e as SafariEvent).ctrlKey) &&
      // Firefox trigger a click event when right click occur
      e.type !== 'contextmenu'
    )
      return;

    if (
      animation &&
      (is.string(animation) || ('exit' in animation && animation.exit))
    ) {
      setState((state) => ({ willLeave: state.visible }));
    } else {
      setState((state) => ({
        visible: state.visible ? false : state.visible,
      }));
    }

    visibilityId.current = setTimeout(() => {
      if (is.function(onVisibilityChange)) {
        onVisibilityChange(false);
      }

      wasVisible.current = false;
    }) as unknown as number;
  }

  function handleAnimationEnd() {
    if (state.willLeave && state.visible) {
      //@todo
      flushSync(() => setState({ visible: false, willLeave: false }));
    } else {
      //@todo Fix opacity 0 ~ 1 animation, before pseudo element backdrop-filter flash.
      setState({
        backdropFilter: 'unset',
      });
    }
  }

  function handleAnimationStart() {
    if (!(state.willLeave && state.visible)) {
      setState({
        backdropFilter: defaultBackdrop,
      });
    }
  }

  function animateClz() {
    if (is.string(animation)) {
      return clsx({
        [styles[animation + 'In']]: visible && !willLeave,
        [styles[animation + 'Out']]: visible && willLeave,
        [styles.leaveDisabled]: visible && willLeave,
      });
    } else if (animation && 'enter' in animation && 'exit' in animation) {
      return clsx({
        [styles[animation.enter + 'In']]:
          animation.enter && visible && !willLeave,
        [styles[animation.exit + 'Out']]:
          animation.enter && visible && willLeave,
        [styles.leaveDisabled]: animation.enter && visible && willLeave,
      });
    }
    return null;
  }

  const { visible, triggerEvent, propsFromTrigger, x, y, willLeave } = state;

  return (
    <ContextMenuProvider value={itemTracker}>
      {visible && (
        <Box
          {...rest}
          className={clsx(styles.main, className, animateClz())}
          onAnimationStart={handleAnimationStart}
          onAnimationEnd={handleAnimationEnd}
          style={{
            ...style,
            left: x,
            top: y,
            backdropFilter: state.backdropFilter,
            opacity: 1,
          }}
          ref={nodeRef}
          role="menu"
        >
          <ContextMenuScrollView p={rem(4)}>
            {cloneItems(children, {
              propsFromTrigger,
              triggerEvent,
            })}
          </ContextMenuScrollView>
        </Box>
      )}
    </ContextMenuProvider>
  );
};

ContextMenu.Label = ContextMenuLabel;
ContextMenu.Label.displayName = '@publish/desktop/ContextMenu.Label';

ContextMenu.Item = ContextMenuItem;
ContextMenu.Item.displayName = '@publish/desktop/ContextMenu.Item';

ContextMenu.Sub = ContextMenuSub;
ContextMenu.Sub.displayName = '@publish/desktop/ContextMenu.Sub';

ContextMenu.Divider = ContextMenuDivider;
ContextMenu.Divider.displayName = '@publish/desktop/ContextMenu.Divider';

ContextMenu.displayName = '@publish/desktop/ContextMenu';
