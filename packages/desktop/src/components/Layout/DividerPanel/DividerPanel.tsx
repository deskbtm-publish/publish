import type { Factory } from '@mantine/core';
import { Box, factory, Flex, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { LocalStore } from '@publish/shared';
import { useMemoStore } from '@publish/shared';
import debounce from 'lodash.debounce';
import type { PropsWithChildren } from 'react';
import { useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { type FC } from 'react';
import React from 'react';
import { useProps } from 'reactgets/hooks/use-props';

import { DividerHandle } from './DividerHandle';
import * as classes from './DividerPanel.module.css';
import { DividerPanelContext } from './DividerPanelContext';
import { Panel, PanelProps } from './Panel';
import { useDividerPanel } from './use-divider-panel';
import type { ResizeCallbackArgs, UseResizableProps } from './use-resizable';
import { useResizable } from './use-resizable';

export interface DividerPanelProps
  extends Partial<UseResizableProps>,
    PropsWithChildren {
  hideDividerCollapsed?: boolean;
  dividerWidth?: number;
}

export interface DividerPanelStore {
  position?: number;
  expanded?: boolean;
}

export type DividerPanelFactory = Factory<{
  props: DividerPanelProps;
  ref: HTMLDivElement;
  staticComponents: {
    Leading: FC<PanelProps>;
    Trailing: FC<PanelProps>;
  };
}>;

export interface DividerPanelInnerRef {
  setPosition: React.Dispatch<React.SetStateAction<number>>;
}

export const SPLIT_PANEL_STORAGE_KEY = 'publish:desktop:DividerPanel';

const defaultProps = {
  hideDividerCollapsed: true,
  initial: 278,
  min: 208,
  max: 608,
  dividerWidth: 16,
};

export const DividerPanelInner = function ({
  ref,
  ...props
}: DividerPanelProps & {
  ref?: React.RefObject<DividerPanelInnerRef | null>;
}) {
  const { children, dividerWidth, initial, hideDividerCollapsed, ...rest } =
    props;
  const { isDragging, position, separatorProps, setPosition } = useResizable({
    axis: 'x',
    initial,
    onResizeEnd: debounce(({ position }: ResizeCallbackArgs) => {
      LocalStore.set(SPLIT_PANEL_STORAGE_KEY, { position, expanded: true });
    }, 50),
    ...rest,
  });
  const panel = useDividerPanel();

  useImperativeHandle(ref, () => {
    return {
      setPosition,
    };
  }, [setPosition]);

  return (
    <Flex direction="row" h="100%">
      <Box
        pos="relative"
        className={classes.panelSlideTransition}
        style={{
          width: rem(position),
          marginLeft: panel?.collapsed ? position * -1 : 0,
        }}
      >
        <Box flex={1}>{children?.[0]}</Box>
        <DividerHandle isDragging={isDragging} {...separatorProps} />
      </Box>
      <Box
        pos="relative"
        flex={1}
        style={{
          overflow: 'hidden',
        }}
      >
        {children?.[1]}
      </Box>
    </Flex>
  );
};

DividerPanelInner.displayName = '@publish/desktop/DividerPanelInner';

export const DividerPanel = factory<DividerPanelFactory>((_props, _ref) => {
  const props = useProps(defaultProps, _props);
  const { children, initial } = props;

  if (React.Children.count(children) !== 2) {
    throw new Error('Must have two children');
  }

  const store = useMemoStore<DividerPanelStore>(SPLIT_PANEL_STORAGE_KEY);
  const { position } = store;
  const initialPos = position ?? initial;
  const [expanded, handlers] = useDisclosure(store.expanded);
  const collapsed = !expanded;
  const panel = useRef<DividerPanelInnerRef>(null);

  const collapse = useCallback(
    function () {
      LocalStore.set<DividerPanelStore>(SPLIT_PANEL_STORAGE_KEY, {
        expanded: false,
      });

      handlers.close();
    },
    [handlers],
  );

  const expand = useCallback(
    function () {
      LocalStore.set<DividerPanelStore>(SPLIT_PANEL_STORAGE_KEY, {
        expanded: true,
      });
      handlers.open();
    },
    [handlers],
  );

  const setPosition = useCallback<React.Dispatch<React.SetStateAction<number>>>(
    (p) => {
      panel.current?.setPosition(p);
    },
    [],
  );

  const context = useMemo(
    () => ({
      collapse,
      expand,
      expanded,
      collapsed,
      setPosition,
    }),
    [collapse, collapsed, expand, expanded, setPosition],
  );

  return (
    <DividerPanelContext value={context}>
      <DividerPanelInner ref={panel} {...props} initial={initialPos} />
    </DividerPanelContext>
  );
});

DividerPanel.Leading = Panel;
DividerPanel.Leading.displayName = '@publish/desktop/DividerPanel.Leading';

DividerPanel.Trailing = Panel;
DividerPanel.Trailing.displayName = '@publish/desktop/DividerPanel.Trailing';

DividerPanel.displayName = '@publish/desktop/DividerPanel';
