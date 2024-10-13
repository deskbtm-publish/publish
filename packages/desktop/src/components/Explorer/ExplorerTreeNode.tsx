import type { Factory } from '@mantine/core';
import {
  ActionIcon,
  Box,
  factory,
  FocusTrap,
  Input,
  rem,
  Text,
  UnstyledButton,
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

export interface ExplorerTreeNodeProps extends RenderParams {
  node: NodeModel<NodeData>;
  isDragging: boolean;
  isSelected: boolean;
  onToggle(): void;
  onRename(id: number, name: string): void;
  onDelete(): void;
  onCopy(): void;
  onPaste(): void;
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
      // onRename,
    } = props;
    const { droppable, data } = node;
    const [renamed, setRename] = useState(false);

    const useClickOutsideRef = useClickOutside(() => {
      setRename(false);
    });
    const mergedRef = useMergedRef(useClickOutsideRef, handleRef);
    const [nodeText, setNodeText] = useInputState(node.text);

    const { show } = useContextMenu({
      id: EXPLORER_NODE_ID,
    });

    const rename = function () {
      setRename(true);
    };

    const newFile = function () {
      // setRename(true);
    };

    const showMenu = useCallback(
      (event: MouseEvent) => {
        event.stopPropagation();
        show({
          event,
          props: {
            rename,
            newFile,
            ...props,
          },
        });
      },
      [props, show],
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

    // const addNode = (node: any) => {
    //   const id = getLastId(tree) + 1;
    //   setTree([
    //     ...tree,
    //     {
    //       ...node,
    //       id,
    //     },
    //   ]);
    // };

    return (
      <UnstyledButton
        className={classes.node}
        ref={mergedRef}
        onContextMenu={showMenu}
        onClick={handleClick}
        mih={32}
        w="100%"
        title={node.text}
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
        <PolymorphicIcon type={data?.type} />

        <Box pl={5}>
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
            <Text size="sm" c="black" pos="relative" top={rem(1)}>
              {nodeText}
            </Text>
          )}
        </Box>
      </UnstyledButton>
    );
  },
);
