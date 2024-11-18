import type { PropsWithChildren, ReactElement } from 'react';
import React, { useRef } from 'react';

import { useContainerClassName, useDropRoot, useTreeContext } from './hooks';
import { Node } from './Node';
import { Placeholder } from './Placeholder';
import type { NodeModel } from './types';
import { compareItems, isDroppable } from './utils';

type Props = PropsWithChildren<{
  parentId: NodeModel['id'];
  depth: number;
}>;

export const Container = <T,>(props: Props): ReactElement => {
  const treeContext = useTreeContext<T>();
  const ref = useRef<HTMLLIElement>(null);
  const nodes = treeContext.tree.filter((l) => l.parent === props.parentId);

  let view = nodes;
  const sortCallback =
    typeof treeContext.sort === 'function' ? treeContext.sort : compareItems;

  if (treeContext.insertDroppableFirst) {
    let droppableNodes = nodes.filter((n) => n.droppable);
    let nonDroppableNodes = nodes.filter((n) => !n.droppable);

    if (treeContext.sort === false) {
      view = [...droppableNodes, ...nonDroppableNodes];
    } else {
      droppableNodes = droppableNodes.sort(sortCallback);
      nonDroppableNodes = nonDroppableNodes.sort(sortCallback);
      view = [...droppableNodes, ...nonDroppableNodes];
    }
  } else {
    if (treeContext.sort !== false) {
      view = nodes.sort(sortCallback);
    }
  }

  const [isOver, dragSource, drop] = useDropRoot<T>(ref);

  if (
    props.parentId === treeContext.rootId &&
    isDroppable<T>(dragSource, treeContext.rootId, treeContext)
  ) {
    drop(ref);
  }
  // const count = view.length;
  // const virtualizer = useVirtualizer({
  //   count,
  //   getScrollElement: () => ref.current,
  //   estimateSize: () => 35,
  // });
  const className = useContainerClassName(props.parentId, isOver);
  const rootProps = treeContext.rootProps || {};
  const Component = treeContext.listComponent;
  // const items = virtualizer.getVirtualItems();

  return (
    <Component ref={ref} role="list" {...rootProps} className={className}>
      {view.map((node, index) => {
        return (
          <React.Fragment key={node.id}>
            <Placeholder
              depth={props.depth}
              listCount={view.length}
              dropTargetId={props.parentId}
              index={index}
            />
            <Node index={index} id={node.id} depth={props.depth} />
          </React.Fragment>
        );
      })}
      <Placeholder
        depth={props.depth}
        listCount={view.length}
        dropTargetId={props.parentId}
      />
    </Component>
  );
};
