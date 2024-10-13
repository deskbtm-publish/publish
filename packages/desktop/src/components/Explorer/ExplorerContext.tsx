import type { ForwardedRef } from 'react';
import { createContext } from 'react';

export interface ExplorerNode {
  rename(id: number, name: string): void;
  onSelect?: () => void;
}

export interface ExplorerTreeMethods {
  expandAll(): void;
  collapseAll(): void;
  toggleAll(): void;
  allCollapsed: boolean;
}

export interface ExplorerContextProps extends ExplorerTreeMethods {
  treeRef: ForwardedRef<ExplorerTreeMethods>;
}

export const ExplorerContext = createContext<ExplorerContextProps>({
  collapseAll() {},
  expandAll() {},
  toggleAll() {},
  allCollapsed: false,
  treeRef: null,
});
