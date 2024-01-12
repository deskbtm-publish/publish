import type { MantineStyleProps, MantineThemeColors } from '@mantine/core';
import { Box, Text, UnstyledButton } from '@mantine/core';
import {
  getHotkeyHandler,
  useDisclosure,
  useWindowEvent,
} from '@mantine/hooks';
import type {
  DragLayerMonitorProps,
  NodeModel,
} from '@minoru/react-dnd-treeview';
import {
  getBackendOptions,
  isAncestor,
  MultiBackend,
  Tree,
} from '@minoru/react-dnd-treeview';
import type { FC } from 'react';
import type { MouseEvent } from 'react';
import { useCallback, useState } from 'react';
import { DndProvider } from 'react-dnd';

import { EXPLORER_MENU_ID } from '~/components/context-menus';
import { useContextMenu } from '~/components/ContextMenu';

import * as styles from './explorer.css';
import { MultipleDragPreview } from './MultipleDragPreview';
import { SingleDragPreview } from './SingleDragPreview';
import { TreeNode } from './TreeNode';
import type { NodeData } from './types';

const initialData = [
  {
    id: 1,
    parent: 0,
    droppable: true,
    text: 'Folder 1',
    data: {
      type: 'folder',
      size: '2.1MB',
    },
  },
  {
    id: 2,
    parent: 1,
    droppable: false,
    text: 'File 1-1',
    data: {
      type: 'csv',
      size: '0.5MB',
    },
  },
  {
    id: 3,
    parent: 1,
    droppable: false,
    text: 'File 1-2',
    data: {
      type: 'text',
      size: '4.8MB',
    },
  },
  {
    id: 4,
    parent: 0,
    droppable: true,
    text: 'Folder 2',
    data: {
      type: 'folder',
      size: '2.1MB',
    },
  },
  {
    id: 5,
    parent: 4,
    droppable: true,
    data: {
      type: 'folder',
      size: '2.1MB',
    },
    text: 'Folder 2-1',
  },
  {
    id: 6,
    parent: 5,
    droppable: false,
    text: 'File 2-1-1',
    data: {
      type: 'image',
      size: '2.1MB',
    },
  },
  {
    id: 7,
    parent: 0,
    droppable: false,
    text: 'File 3',
    data: {
      type: 'image',
      size: '0.8MB',
    },
  },
];

export interface NavMenuTile {
  label: string;
  to?: string;
  replace?: boolean;
  type?: 'node' | 'link';
  icon?: React.ReactNode;
  color?: keyof MantineThemeColors;
  children?: NavMenuTile[];
  access?: string[];
  onClick?: () => Promise<void> | void;
}

interface NavMenuTileProps {
  label: string;
  active: boolean;
}

const NavMenuTile: FC<NavMenuTileProps> = function ({ label }) {
  return (
    <UnstyledButton>
      <Text size="sm">{label}</Text>
    </UnstyledButton>
  );
};

interface NavMenuProps extends MantineStyleProps {}

export const Explorer: FC<NavMenuProps> = function () {
  const [tree, setTree] = useState(initialData);
  const [isCtrlPressing, ctrlHandler] = useDisclosure(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<NodeModel<NodeData>[]>([]);
  const { show } = useContextMenu({
    id: EXPLORER_MENU_ID,
  });
  const showMenu = useCallback(
    (e: MouseEvent) => {
      show({ event: e });
    },
    [show],
  );

  useWindowEvent(
    'keydown',
    getHotkeyHandler([
      [
        'mod',
        () => {
          ctrlHandler.open();
        },
      ],
      [
        'escape',
        () => {
          setSelectedNodes([]);
        },
      ],
    ]),
  );

  useWindowEvent(
    'keyup',
    getHotkeyHandler([
      [
        'mod',
        () => {
          ctrlHandler.close();
        },
      ],
    ]),
  );

  const handleSingleSelect = (node) => {
    setSelectedNodes([node]);
  };

  const handleMultiSelect = useCallback(
    (node) => {
      const selectedIds = selectedNodes.map((n) => n.id);

      // Ignore if the clicked node is already selected
      if (selectedIds.includes(node.id)) {
        return;
      }

      // Ignore if ancestor node already selected
      if (
        selectedIds.some((selectedId) => isAncestor(tree, selectedId, node.id))
      ) {
        return;
      }

      let updateNodes = Array.from(selectedNodes);

      updateNodes = updateNodes.filter((selectedNode) => {
        return !isAncestor(tree, node.id, selectedNode.id);
      });

      updateNodes = [...updateNodes, node];
      setSelectedNodes(updateNodes);
    },
    [selectedNodes, tree],
  );

  const handlePointerNode = (e, node) => {
    if (e.ctrlKey || e.metaKey) {
      handleMultiSelect(node);
    } else {
      handleSingleSelect(node);
    }
  };

  const handleDragStart = useCallback(
    (node) => {
      const isSelectedNode = selectedNodes.some((n) => n.id === node.id);
      setIsDragging(true);

      if (!isCtrlPressing && isSelectedNode) {
        return;
      }

      if (!isCtrlPressing) {
        setSelectedNodes([node]);
        return;
      }

      if (!selectedNodes.some((n) => n.id === node.id)) {
        setSelectedNodes([...selectedNodes, node]);
      }
    },
    [isCtrlPressing, selectedNodes],
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    ctrlHandler.close();
    setSelectedNodes([]);
  }, [ctrlHandler]);

  const handleDrop = useCallback(
    (newTree, options) => {
      const { dropTargetId } = options;

      setTree(
        newTree.map((node) => {
          if (
            selectedNodes.some((selectedNode) => selectedNode.id === node.id)
          ) {
            return {
              ...node,
              parent: dropTargetId,
            };
          }

          return node;
        }),
      );

      setSelectedNodes([]);
    },
    [selectedNodes],
  );

  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <Box onContextMenu={showMenu} h="100%">
        <Tree
          tree={tree}
          rootId={0}
          classes={{
            root: styles.treeRoot,
            listItem: styles.listItem,
          }}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          canDrop={(tree, options) => {
            if (
              selectedNodes.some(
                (selectedNode) => selectedNode.id === options.dropTargetId,
              )
            ) {
              return false;
            }
          }}
          dragPreviewRender={(
            monitorProps: DragLayerMonitorProps<NodeData>,
          ) => {
            if (selectedNodes.length > 1) {
              return <MultipleDragPreview sources={selectedNodes} />;
            }

            return <SingleDragPreview {...monitorProps} />;
          }}
          render={(node, options) => {
            const selected = selectedNodes.some(
              (selectedNode) => selectedNode.id === node.id,
            );

            return (
              <TreeNode
                node={node}
                {...options}
                isSelected={selected}
                isDragging={selected && isDragging}
                onClick={handlePointerNode}
              />
            );
          }}
        />
      </Box>
    </DndProvider>
  );
};
