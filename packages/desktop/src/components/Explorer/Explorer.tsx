import { Box, Flex, ScrollArea } from '@mantine/core';
import { type NodeModel } from '@publish-kit/react-dnd-treeview';
import { type FC, Suspense } from 'react';

import { ScrollView } from '../ScrollView';
import { SkeletonList } from '../Skeletons';
import { ActionsBar } from './ActionsBar';
import { ExplorerTree } from './ExplorerTree';
import { type NodeData } from './types';

type NewType = NodeModel<NodeData>;

const initialData: NewType[] = [
  {
    id: 1,
    parent: 0,
    droppable: true,
    text: 'Folder 11111111111111111111111111111111111111111111111',
    data: {
      type: 'folder',
      size: 2.1,
      birthTime: '1',
      modifiedTime: '1',
    },
  },
  {
    id: 2,
    parent: 1,
    droppable: true,
    text: 'File 1-1',
    data: {
      type: 'publish-text',
      size: 0.5,
      birthTime: '1',
      modifiedTime: '1',
    },
  },
  {
    id: 3,
    parent: 1,
    droppable: false,
    text: 'File 1-2',
    data: {
      type: 'text',
      size: 4.8,
      birthTime: '1',
      modifiedTime: '1',
    },
  },
  {
    id: 4,
    parent: 0,
    droppable: true,
    text: 'Folder 2',
    data: {
      type: 'folder',
      size: 2.1,
      birthTime: '1',
      modifiedTime: '1',
    },
  },
  {
    id: 5,
    parent: 4,
    droppable: true,
    data: {
      type: 'folder',
      birthTime: '1',
      modifiedTime: '1',
      size: 2.1,
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
      size: 2.1,
      birthTime: '1',
      modifiedTime: '1',
    },
  },
  {
    id: 7,
    parent: 0,
    droppable: false,
    text: 'File 3',
    data: {
      type: 'image',
      size: 0.8,
      birthTime: '1',
      modifiedTime: '1',
    },
  },
  {
    id: 8,
    parent: 0,
    droppable: false,
    text: 'File 3',
    data: {
      type: 'image',
      size: 0.8,
      birthTime: '1',
      modifiedTime: '1',
    },
  },
  {
    id: 9,
    parent: 0,
    droppable: false,
    text: 'File 3',
    data: {
      type: 'image',
      size: 0.8,
      birthTime: '1',
      modifiedTime: '1',
    },
  },
  {
    id: 10,
    parent: 0,
    droppable: false,
    text: 'File 3',
    data: {
      type: 'image',
      size: 0.8,
      birthTime: '1',
      modifiedTime: '1',
    },
  },
  {
    id: 11,
    parent: 0,
    droppable: false,
    text: 'File 3',
    data: {
      type: 'image',
      size: 0.8,
      birthTime: '1',
      modifiedTime: '1',
    },
  },
  ...Array.from({ length: 100 }).map((v, i) => {
    return {
      id: i + 12,
      parent: 0,
      droppable: false,
      text: 'File ' + i,
      data: {
        type: 'image',
        size: 0.8,
        birthTime: '1',
        modifiedTime: '1',
      },
    } as const;
  }),
];

const mock = new Promise<typeof initialData>((resolve) =>
  setTimeout(() => {
    resolve(initialData);
  }, 1000),
);

const Content: FC<any> = function () {
  const data = initialData;

  // return (
  //   <Box px="md">
  //     <SkeletonList />
  //   </Box>
  // );
  return <ExplorerTree data={data} />;
};

export const Explorer: FC<any> = function () {
  return (
    <Box
      mod={{ react: 'Explorer' }}
      flex={1}
      h="100%"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <ActionsBar />

      <Suspense fallback={<Box>dsadsadas</Box>}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Content />
        </div>
      </Suspense>
    </Box>
  );
};

Explorer.displayName = '@publish/desktop/Explorer';
