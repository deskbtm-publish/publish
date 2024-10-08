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
import { WithDefaultProps, useProps } from 'reactgets/hooks/use-props';

import { DividerHandle } from './DividerHandle';
import * as classes from './DividerPanel.module.css';
import { Panel, PanelProps } from './Panel';
import type { ResizeCallbackArgs, UseResizableProps } from './use-resizable';
import { useResizable } from './use-resizable';
import { IF } from 'reactgets';
import { DividerPanelProvider, useDividerPanel } from './DividerPanelContext';

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
  axis: 'x',
} satisfies DividerPanelProps;

export const DividerPanelInner = function ({
  ref,
  ...props
}: WithDefaultProps<DividerPanelProps, typeof defaultProps> & {
  ref?: React.RefObject<DividerPanelInnerRef | null>;
}) {
  const {
    children,
    dividerWidth,
    initial,
    hideDividerCollapsed,
    axis,
    ...rest
  } = props;
  const cRef = useRef<HTMLDivElement>(null);
  const direction = axis === 'x' ? 'row' : 'column';
  const { isDragging, position, separatorProps, setPosition } = useResizable({
    axis,
    initial,
    containerRef: cRef,
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
    <Flex ref={cRef} direction={direction} h="100%">
      <Box
        pos="relative"
        className={classes.panelSlideTransition}
        style={{
          width: rem(position),
          marginLeft: panel?.collapsed ? position * -1 : 0,
        }}
      >
        <Box flex={1}>{children?.[0]}</Box>
        <IF is={!panel?.collapsed}>
          <DividerHandle isDragging={isDragging} {...separatorProps} />
        </IF>
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

  const defaultStoreProps = {
    position: initial,
    expanded: true,
  };

  const store = useMemoStore<
    WithDefaultProps<DividerPanelStore, typeof defaultStoreProps>
  >(SPLIT_PANEL_STORAGE_KEY, {
    position: initial,
    expanded: true,
  });
  const initialPos = store.position;
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
    <DividerPanelProvider value={context}>
      <DividerPanelInner ref={panel} {...props} initial={initialPos} />
    </DividerPanelProvider>
  );
});

DividerPanel.Leading = Panel;
DividerPanel.Leading.displayName = '@publish/desktop/DividerPanel.Leading';

DividerPanel.Trailing = Panel;
DividerPanel.Trailing.displayName = '@publish/desktop/DividerPanel.Trailing';

DividerPanel.displayName = '@publish/desktop/DividerPanel';
