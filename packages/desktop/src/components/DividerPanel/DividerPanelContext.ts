import { createSafeContext } from '@mantine/core';

export interface DividerPanelContext {
  collapsed: boolean;
  expanded: boolean;
  collapse(): void;
  expand(): void;
  setPosition: React.Dispatch<React.SetStateAction<number>>;
}

export const [DividerPanelProvider, useDividerPanel] =
  createSafeContext<DividerPanelContext>(
    'DividerPanel component was not found in tree',
  );
