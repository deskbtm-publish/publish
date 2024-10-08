import type { MantineColor } from '@mantine/core';
import { Box, parseThemeColor, useMantineTheme } from '@mantine/core';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import type React from 'react';
import { useRef } from 'react';

import { contextMenu } from './context-menu';
import * as styles from './ContextMenu.module.css';
import { useItemTrackerContext } from './hooks';
import type {
  BooleanPredicate,
  BuiltInOrString,
  HandlerParamsEvent,
  InternalProps,
  ItemParams,
} from './types';
import { getPredicateValue, isFn } from './utils';

export interface ItemProps
  extends InternalProps,
    Omit<React.HTMLAttributes<HTMLElement>, 'hidden' | 'disabled' | 'onClick'> {
  /**
   * Any valid node that can be rendered
   */
  children: ReactNode;

  /**
   * Passed to the `Item` onClick callback. Accessible via `data`
   */
  data?: any;

  /**
   * Disable `Item`. If a function is used, a boolean must be returned
   *
   * @param id The item id, when defined
   * @param props The props passed when you called `show(e, {props: yourProps})`
   * @param data The data defined on the `Item`
   * @param triggerEvent The event that triggered the context menu
   *
   *
   * ```
   * function isItemDisabled({ triggerEvent, props, data }: PredicateParams<type of props, type of data>): boolean
   * <Item disabled={isItemDisabled} data={data}>content</Item>
   * ```
   */
  disabled?: BooleanPredicate;

  /**
   * Hide the `Item`. If a function is used, a boolean must be returned
   *
   * @param id The item id, when defined
   * @param props The props passed when you called `show(e, {props: yourProps})`
   * @param data The data defined on the `Item`
   * @param triggerEvent The event that triggered the context menu
   *
   *
   * ```
   * function isItemHidden({ triggerEvent, props, data }: PredicateParams<type of props, type of data>): boolean
   * <Item hidden={isItemHidden} data={data}>content</Item>
   * ```
   */
  hidden?: BooleanPredicate;
  /**
   *
   * @param e keyboard event
   * @returns
   *
   * @example
   * ```ts
   * function handleItemClick({ id, triggerEvent, event, props, data }: ItemParams<type of props, type of data>){
   *    // retrieve the id of the Item
   *    console.log(id) // item-id
   *
   *    // access any other dom attribute
   *    console.log(event.currentTarget.dataset.foo) // 123
   *
   *    // access the props and the data
   *    console.log(props, data);
   *
   *    // access the coordinate of the mouse when the menu has been displayed
   *    const {  clientX, clientY } = triggerEvent;
   * }
   * <Item id="item-id" onClick={handleItemClick} data={{key: 'value'}} data-foo={123} >Something</Item>
   * ```
   */
  onClick?: (args: ItemParams) => void;
  /**
   * Let you implement keyboard shortcut for the menu item. It will trigger the
   * `onClick` handler if the given callback returns `true`
   *
   * @example
   * ```ts
   * function handleShortcut(e: React.KeyboardEvent<HTMLElement>){
   *   // let's say we want to match ⌘ + c
   *   return e.metaKey && e.key === "c";
   * }
   *
   * <Item onClick={doSomething}>Copy <RightSlot>⌘ C</RightSlot></Item>
   * ```
   */
  keyMatcher?: (e: KeyboardEvent) => boolean;
  closeOnClick?: boolean;
  handlerEvent?: BuiltInOrString<'onClick' | 'onMouseDown' | 'onMouseUp'>;
  /**
   * Menu item leading element.
   */
  leading?: React.ReactNode;
  /**
   * Menu item trailing element.
   */
  trailing?: React.ReactNode;
  /**
   * Mantine color. @see {@link MantineColor}
   */
  color?: MantineColor;
}

export const ContextMenuItem: React.FC<ItemProps> = ({
  id,
  children,
  className,
  style,
  triggerEvent,
  data,
  propsFromTrigger,
  keyMatcher,
  onClick = () => {},
  disabled = false,
  hidden = false,
  closeOnClick = true,
  handlerEvent = 'onClick',
  leading,
  trailing,
  color,
  ...rest
}) => {
  const itemNode = useRef<HTMLElement>(null);
  const itemTracker = useItemTrackerContext();
  const handlerParams = {
    id,
    data,
    triggerEvent: triggerEvent as HandlerParamsEvent,
    props: propsFromTrigger,
  } as ItemParams;
  const isDisabled = getPredicateValue(disabled, handlerParams);
  const isHidden = getPredicateValue(hidden, handlerParams);
  const theme = useMantineTheme();

  function handleClick(e: React.MouseEvent<HTMLElement>) {
    handlerParams.event = e;
    e.stopPropagation();

    if (!isDisabled) {
      !closeOnClick ? onClick(handlerParams) : dispatchUserHandler();
    }
  }

  // provide a feedback to the user that the item has been clicked before closing the menu
  function dispatchUserHandler() {
    const node = itemNode.current!;
    node.focus();
    node.addEventListener(
      'animationend',
      // defer, required for react 17
      () => setTimeout(contextMenu.hideAll),
      { once: true },
    );
    node.classList.add(styles.itemFeedback);
    onClick(handlerParams);
  }

  function registerItem(node: HTMLElement | null) {
    if (node && !isDisabled) {
      itemNode.current = node;
      itemTracker.set(node, {
        node,
        isSubMenu: false,
        keyMatcher:
          !isDisabled &&
          isFn(keyMatcher) &&
          ((e: KeyboardEvent) => {
            if (keyMatcher(e)) {
              e.stopPropagation();
              e.preventDefault();
              handlerParams.event = e;
              dispatchUserHandler();
            }
          }),
      });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
      handlerParams.event = e;
      dispatchUserHandler();
    }
  }

  if (isHidden) return null;

  const colors = color
    ? theme.variantColorResolver({ color, theme, variant: 'light' })
    : undefined;
  const parsedThemeColor = color ? parseThemeColor({ color, theme }) : null;

  return (
    <Box
      component="div"
      {...{ ...rest, [handlerEvent]: handleClick }}
      className={clsx(styles.item, className)}
      onKeyDown={handleKeyDown}
      ref={registerItem}
      tabIndex={-1}
      style={style}
      role="menuitem"
      aria-disabled={isDisabled}
      __vars={{
        '--contextmenu-item-color':
          parsedThemeColor?.isThemeColor &&
          parsedThemeColor?.shade === undefined
            ? `var(--mantine-color-${parsedThemeColor.color}-6)`
            : colors?.color,
        '--contextmenu-item-hover-color': colors?.hover,
      }}
    >
      {leading && <div data-position="left">{leading}</div>}
      {children && <div>{children}</div>}
      {trailing && <div data-position="right">{trailing}</div>}
    </Box>
  );
};
