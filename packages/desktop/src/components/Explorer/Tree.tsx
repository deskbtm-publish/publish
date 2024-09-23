import { Box } from '@mantine/core';
import {
  getHotkeyHandler,
  useDisclosure,
  useWindowEvent,
} from '@mantine/hooks';
import { getDndBackendOptions } from '@publish/shared';
import type { NodeModel } from '@publish-kit/react-dnd-treeview';
import {
  isAncestor,
  MultiBackend,
  Tree,
} from '@publish-kit/react-dnd-treeview';
import type { FC, MouseEvent } from 'react';
import { useCallback, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

import { EXPLORER_EMPTY_ID } from '../context-menus';
import { useContextMenu } from '../ContextMenu';
// import { Dropzone } from '../Dropzone';
import { DragPreview } from './DragPreview';
import * as classes from './Explorer.module.css';
import { useExplorer } from './hooks';
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

export const ExplorerTree: FC<any> = function () {
  const [tree, setTree] = useState(initialData);
  const [isCtrlPressing, ctrlHandler] = useDisclosure(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<NodeModel<NodeData>[]>([]);
  const { treeRef, allCollapsed } = useExplorer();
  const { show } = useContextMenu({
    id: EXPLORER_EMPTY_ID,
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

  const handleDroppable = (_tree, options) => {
    if (
      selectedNodes.some(
        (selectedNode) => selectedNode.id === options.dropTargetId,
      )
    ) {
      return false;
    }
  };
  const handleDelete = useCallback(() => {}, []);
  const handleRename = useCallback((id: number, name: string) => {}, []);

  return (
    <DndProvider backend={MultiBackend} options={getDndBackendOptions()}>
      <Box h="100%" flex={1} onContextMenu={showMenu}>
        <Tree<NodeData>
          extraAcceptTypes={[NativeTypes.FILE]}
          tree={tree as any}
          ref={treeRef!}
          initialOpen={!allCollapsed}
          rootId={0}
          classes={{
            root: classes.root,
            listItem: classes.listItem,
          }}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          canDrop={handleDroppable}
          dragPreviewRender={(monitorProps) => {
            return <DragPreview nodes={selectedNodes} {...monitorProps} />;
          }}
          render={(node, options) => {
            const selected = selectedNodes.some(
              (selectedNode) => selectedNode.id === node.id,
            );

            return (
              <TreeNode
                {...options}
                onRename={handleRename}
                onDelete={function () {}}
                onCopy={function () {}}
                onPaste={function () {}}
                node={node}
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
