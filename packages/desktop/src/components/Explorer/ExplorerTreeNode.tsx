import type { Factory } from '@mantine/core';
import {
  ActionIcon,
  Box,
  factory,
  FocusTrap,
  Input,
  rem,
  Text,
  useMantineTheme,
} from '@mantine/core';
import {
  getHotkeyHandler,
  useClickOutside,
  useInputState,
  useMergedRef,
  useWindowEvent,
} from '@mantine/hooks';
import type { NodeModel, RenderParams } from '@publish-kit/react-dnd-treeview';
import { IconChevronRight } from '@tabler/icons-react';
import { clsx } from 'clsx';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { EXPLORER_NODE_ID } from '../context-menus';
import { useContextMenu } from '../ContextMenu';
import * as classes from './ExplorerTreeNode.module.css';
import { PolymorphicIcon } from './PolymorphicIcon';
import type { NodeData } from './types';
import { useExplorer } from './use-explorer';
import { getExplorerBuiltinColors } from './utils';

export interface ExplorerTreeNodeProps extends RenderParams {
  node: NodeModel<NodeData>;
  isDragging: boolean;
  isSelected: boolean;
  onClick?: (e: MouseEvent<HTMLDivElement>, node: NodeModel<NodeData>) => void;
}

export type ExplorerTreeNodeFactory = Factory<{
  props: ExplorerTreeNodeProps;
  ref: HTMLElement;
}>;

export const ExplorerTreeNode = factory<ExplorerTreeNodeFactory>(
  (props, _ref) => {
    const {
      node,
      onClick,
      onToggle,
      isSelected,
      isDragging,
      isOpen,
      handleRef,
      containerRef: _,
      depth,
    } = props;
    const { droppable, data, id } = node;
    const [renamed, setRename] = useState(false);
    const { treeRef } = useExplorer();

    const useClickOutsideRef = useClickOutside(() => {
      setRename(false);
    });
    const mergedRef = useMergedRef(useClickOutsideRef, handleRef);
    const [nodeText, setNodeText] = useInputState(node.text);
    const theme = useMantineTheme();
    let vars;
    if (data?.type.includes('publish')) {
      const { color, hover } = getExplorerBuiltinColors(data.type, { theme });
      vars = {
        '--_explorer-node-color': color,
        '--_explorer-node-hover': hover,
      };
    }

    const { show } = useContextMenu({
      id: EXPLORER_NODE_ID,
    });
    const rename = function () {
      setRename(true);
    };

    // const rowVirtualizer = useVirtualizer({
    //   count: 10000,
    //   getScrollElement: () => parentRef.current,
    //   estimateSize: () => 35,
    // });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const newPublish = function () {
      treeRef.current?.addNode({
        text: Math.random().toString(36).substring(7),
        droppable: true,
        parent: id,
        data: {
          type: 'publish-text',
          size: 2.1,
          birthTime: '1',
          modifiedTime: '1',
        },
      });
    };

    const showMenu = useCallback(
      (event: MouseEvent) => {
        event.stopPropagation();
        show({
          event,
          props: {
            rename,
            newPublish,
            ...props,
          },
        });
      },
      [show, newPublish, props],
    );

    const handleClick = useCallback(
      (e) => {
        onToggle();
        onClick?.(e, node);
      },
      [node, onClick, onToggle],
    );

    useEffect(() => {
      if (isSelected) {
        handleRef.current?.classList.add(classes.selected);
      } else {
        handleRef.current?.classList.remove(classes.selected);
      }
    }, [handleRef, isSelected]);

    useEffect(() => {
      if (isDragging) {
        handleRef.current?.classList.add(classes.dragging);
      } else {
        handleRef.current?.classList.remove(classes.dragging);
      }
    }, [handleRef, isDragging]);

    useWindowEvent(
      'keydown',
      getHotkeyHandler([
        [
          'Enter',
          () => {
            setRename(false);
          },
        ],
        [
          'F2',
          () => {
            if (isSelected) setRename(true);
          },
        ],
      ]),
    );

    return (
      <Box
        className={classes.node}
        ref={mergedRef}
        onContextMenu={showMenu}
        onClick={handleClick}
        mih={32}
        title={node.text}
        style={{
          paddingInlineStart: rem(8 * (depth + 1)),
        }}
        mod={{
          id: node.id,
        }}
        __vars={vars}
      >
        <ActionIcon
          component="div"
          className={clsx(droppable && classes.chevron)}
          data-direction={isOpen ? 'down' : 'right'}
          size={17}
          c="gray"
          variant="transparent"
          aria-label="Folder collapse arrow"
        >
          {droppable && <IconChevronRight size={14} />}
        </ActionIcon>
        <PolymorphicIcon opened={isOpen} type={data?.type} />

        <Box pl={5} maw="50%">
          {renamed ? (
            <FocusTrap active>
              <Input
                variant="unstyled"
                value={nodeText}
                onChange={setNodeText}
                data-autofocus
              />
            </FocusTrap>
          ) : (
            <Text truncate="end" size="sm" pos="relative" top={rem(1)}>
              {nodeText}
            </Text>
          )}
        </Box>
      </Box>
    );
  },
);
