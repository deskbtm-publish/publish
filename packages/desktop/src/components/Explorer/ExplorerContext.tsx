import { type Override } from '@publish/shared';
import { type NodeModel } from '@publish-kit/react-dnd-treeview';
import type { RefObject } from 'react';
import { createContext } from 'react';

import { type NodeData } from './types';

export interface ExplorerNode {
  rename(id: number, name: string): void;
  onSelect?: () => void;
}

export interface ExplorerTreeMethods {
  expandAll(): void;
  collapseAll(): void;
  toggleAll(): void;
  addNode(
    node: Omit<
      Override<NodeModel<NodeData>, { parent?: number | string }>,
      'id'
    >,
  ): void;
  allCollapsed: boolean;
}

export interface ExplorerContextProps {
  treeRef: RefObject<ExplorerTreeMethods | null>;
}

export const ExplorerContext = createContext({} as ExplorerContextProps);
