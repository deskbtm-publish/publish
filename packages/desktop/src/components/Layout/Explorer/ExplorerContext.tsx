import type { TreeMethods } from '@publishjs/react-dnd-treeview';
import type { RefObject } from 'react';
import { createContext } from 'react';

export interface ExplorerContextProps {
  collapseAll(): void;
  expandAll(): void;
  toggle(): void;
  allCollapsed: boolean;
  treeRef: RefObject<TreeMethods> | null;
}

export const ExplorerContext = createContext<ExplorerContextProps>({
  collapseAll() {},
  expandAll() {},
  toggle() {},
  allCollapsed: false,
  treeRef: null,
});
