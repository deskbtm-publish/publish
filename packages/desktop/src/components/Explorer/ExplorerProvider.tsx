import type { FC, PropsWithChildren } from 'react';
import { useMemo, useRef } from 'react';

import { ExplorerContext, type ExplorerTreeMethods } from './ExplorerContext';

export const EXPLORER_STORAGE_KEY = 'publish:desktop:Explorer:allCollapsed';

export interface ExplorerProviderProps extends PropsWithChildren {}

export const ExplorerProvider: FC<ExplorerProviderProps> = function (props) {
  const { children } = props;
  const treeRef = useRef<ExplorerTreeMethods>(null);

  const expandAll = treeRef.current!.expandAll;
  const collapseAll = treeRef.current!.collapseAll;
  const toggleAll = treeRef.current!.toggleAll;
  const allCollapsed = treeRef.current!.allCollapsed;

  const context = useMemo(
    () => ({
      expandAll,
      collapseAll,
      toggleAll,
      allCollapsed,
      treeRef,
    }),
    [allCollapsed, collapseAll, expandAll, toggleAll, treeRef],
  );

  return (
    <ExplorerContext.Provider value={context}>
      {children}
    </ExplorerContext.Provider>
  );
};
