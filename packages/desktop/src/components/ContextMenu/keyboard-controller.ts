import * as classes from './ContextMenu.module.css';
// import * as classes from './ContextMenu.css';
import type { ItemTracker, ItemTrackerRecord } from './hooks';

interface Menu<T = ItemTrackerRecord> {
  items: T[];
  isRoot: boolean;
  focusedIndex: number;
  parentNode: HTMLElement;
}

export function createKeyboardController() {
  const menuList = new Map<HTMLElement, Menu>();
  let focusedIndex: number;
  let parentNode: HTMLElement;
  let isRoot: boolean;
  let currentItems: ItemTrackerRecord[];
  let forceCloseSubMenu = false;

  function init(rootMenu: ItemTracker) {
    currentItems = Array.from(rootMenu.values());
    focusedIndex = -1;
    isRoot = true;
  }

  function focusSelectedItem() {
    currentItems[focusedIndex].node.focus();
  }

  const isSubMenuFocused = () =>
    focusedIndex >= 0 && currentItems[focusedIndex].isSubMenu;

  const getSubMenuItems = () =>
    Array.from(currentItems[focusedIndex].subMenuRefTracker!.values());

  function isFocused() {
    if (focusedIndex === -1) {
      // focus first item
      moveDown();
      return false;
    }

    return true;
  }

  function moveDown() {
    if (focusedIndex + 1 < currentItems.length) {
      focusedIndex++;
    } else if (focusedIndex + 1 === currentItems.length) {
      focusedIndex = 0;
    }

    if (forceCloseSubMenu) closeSubMenu();

    focusSelectedItem();
  }

  function moveUp() {
    if (focusedIndex === -1 || focusedIndex === 0) {
      focusedIndex = currentItems.length - 1;
    } else if (focusedIndex - 1 < currentItems.length) {
      focusedIndex--;
    }

    if (forceCloseSubMenu) closeSubMenu();

    focusSelectedItem();
  }

  function openSubMenu() {
    if (isFocused() && isSubMenuFocused()) {
      const subMenuItems = getSubMenuItems();
      const { node, setSubMenuPosition } = currentItems[focusedIndex];

      menuList.set(node, {
        isRoot,
        focusedIndex,
        parentNode: parentNode || node,
        items: currentItems,
      });

      setSubMenuPosition!();
      node.classList.add(classes.subFocusOpen);
      parentNode = node;

      if (subMenuItems.length > 0) {
        focusedIndex = 0;
        currentItems = subMenuItems;
      } else {
        forceCloseSubMenu = true;
      }

      isRoot = false;

      focusSelectedItem();
      return true;
    }
    return false;
  }

  function closeSubMenu() {
    if (isFocused() && !isRoot) {
      const parent = menuList.get(parentNode)!;

      parentNode!.classList.remove(classes.subFocusOpen);
      currentItems = parent.items;
      parentNode = parent.parentNode;

      if (parent.isRoot) {
        isRoot = true;
        menuList.clear();
      }

      if (!forceCloseSubMenu) {
        focusedIndex = parent.focusedIndex;
        focusSelectedItem();
      }
    }
  }

  function matchKeys(e: KeyboardEvent) {
    // matches shortcut inside subMenu as well even when subMenu is not open
    // it matches native menu behavior
    function walkAndMatch(items: ItemTrackerRecord[]) {
      for (const item of items) {
        if (item.isSubMenu && item.subMenuRefTracker)
          walkAndMatch(Array.from(item.subMenuRefTracker.values()));

        item.keyMatcher && item.keyMatcher(e);
      }
    }
    walkAndMatch(currentItems);
  }

  return {
    init,
    moveDown,
    moveUp,
    openSubMenu,
    closeSubMenu,
    matchKeys,
  };
}
