import {
  getHotkeyHandler,
  useDisclosure,
  useLocalStorage,
  useWindowEvent,
} from '@mantine/hooks';
import { getDndBackendOptions } from '@publish/shared';
import type { NodeModel, TreeMethods } from '@publish-kit/react-dnd-treeview';
import {
  isAncestor,
  MultiBackend,
  Tree,
} from '@publish-kit/react-dnd-treeview';
import type { FC, MouseEvent } from 'react';
import { useCallback, useImperativeHandle, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

import { EXPLORER_EMPTY_ID } from '../context-menus';
import { useContextMenu } from '../ContextMenu';
import { ScrollView } from '../ScrollView';
import { DragPreview } from './DragPreview';
import { EXPLORER_STORAGE_KEY } from './ExplorerProvider';
import * as classes from './ExplorerTree.module.css';
import { ExplorerTreeNode } from './ExplorerTreeNode';
import type { NodeData } from './types';
import { useExplorer } from './use-explorer';

type TreeData = NodeModel<NodeData>[];

export interface ExplorerTreeProps {
  data: TreeData;
}

const getLastId = (treeData: TreeData) => {
  const reversedArray = [...treeData].sort((a, b) => {
    if (a.id < b.id) {
      return 1;
    } else if (a.id > b.id) {
      return -1;
    }

    return 0;
  });

  if (reversedArray.length > 0) {
    return Number(reversedArray[0].id);
  }

  return 0;
};

export const ExplorerTree: FC<ExplorerTreeProps> = function (props) {
  const { data } = props;
  const [tree, setTree] = useState<TreeData>(data);
  const [isCtrlPressing, ctrlHandler] = useDisclosure(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<TreeData>([]);
  const { treeRef } = useExplorer();
  const treeViewRef = useRef<TreeMethods>(null);
  const [allCollapsed, setAllCollapsed] = useLocalStorage<boolean>({
    key: EXPLORER_STORAGE_KEY,
  });
  const { show } = useContextMenu({
    id: EXPLORER_EMPTY_ID,
  });
  const showMenu = useCallback(
    (e: MouseEvent) => {
      show({ event: e });
    },
    [show],
  );
  const scrollRef = useRef(null);
  // const count1 = useMemo(() => getLastId(tree) + 1, [tree]);

  // const count = tree.length;

  // const virtualizer = useVirtualizer({
  //   count,
  //   getScrollElement: () => scrollRef.current,
  //   estimateSize: () => 35,
  // });
  // const items = virtualizer.getVirtualItems();

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

  useImperativeHandle(treeRef, () => {
    const expandAll = () => {
      treeViewRef.current?.openAll();
      setAllCollapsed(false);
    };

    const collapseAll = () => {
      treeViewRef.current?.closeAll();
      setAllCollapsed(true);
    };

    const addNode = (node: NodeModel<NodeData>) => {
      const lastId = getLastId(tree) + 1;

      if (!node.parent) {
        node.parent = 0;
      }

      setTree([...tree, { ...node, id: lastId }]);
    };

    return {
      toggleAll() {
        if (allCollapsed) {
          expandAll();
        } else {
          collapseAll();
        }
      },
      addNode,
      expandAll,
      collapseAll,
      allCollapsed,
    };
  }, [allCollapsed, setAllCollapsed, tree]);

  return (
    <DndProvider backend={MultiBackend} options={getDndBackendOptions()}>
      <ScrollView ref={scrollRef} h="100%" flex={1} onContextMenu={showMenu}>
        <Tree<NodeData>
          extraAcceptTypes={[NativeTypes.FILE]}
          tree={tree}
          ref={treeViewRef}
          listComponent="div"
          listItemComponent="div"
          initialOpen={!allCollapsed}
          rootId={0}
          classes={{
            root: classes.root,
          }}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          canDrop={handleDroppable}
          dragPreviewRender={(monitorProps) => {
            return <DragPreview nodes={selectedNodes} {...monitorProps} />;
          }}
          render={(node, options) => {
            // const item = items[index];
            const selected = selectedNodes.some(
              (selectedNode) => selectedNode.id === node.id,
            );

            // console.log(item, index, item?.index);
            return (
              <ExplorerTreeNode
                // key={item.key}
                // data-index={item.index}
                // ref={virtualizer.measureElement}
                {...options}
                node={node}
                isSelected={selected}
                isDragging={selected && isDragging}
                onClick={handlePointerNode}
              />
            );
          }}
        />
      </ScrollView>
    </DndProvider>
  );
};
