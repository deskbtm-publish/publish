import { Box, Flex } from '@mantine/core';
import { Suspense, use, useEffect, useRef, useState, type FC } from 'react';

import { ActionsBar } from './ActionsBar';
import { ExplorerTree } from './ExplorerTree';
import { useExplorer } from './use-explorer';


const initialData = [
  {
    id: 1,
    parent: 0,
    droppable: true,
    text: 'Folder 1',
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
    droppable: false,
    text: 'File 1-1',
    data: {
      type: 'csv',
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
];

const getLastId = (treeData) => {
  const reversedArray = [...treeData].sort((a, b) => {
    if (a.id < b.id) {
      return 1;
    } else if (a.id > b.id) {
      return -1;
    }

    return 0;
  });

  if (reversedArray.length > 0) {
    return reversedArray[0].id;
  }

  return 0;
};

const mock = new Promise<typeof initialData>((resolve) =>
  setTimeout(() => {
    resolve(initialData);
  }, 1000),
);

const Content: FC<any> = function () {
  const data = initialData;

  return <ExplorerTree data={data} />;
};

export const Explorer: FC<any> = function () {
  return (
    <Box flex={1}>
      <Flex direction="column" h="100%">
        <ActionsBar />

        <Suspense fallback={<Box>dsadsadas</Box>}>
          <Content />
        </Suspense>
      </Flex>
    </Box>
  );
};

Explorer.displayName = '@publish/desktop/Explorer';
