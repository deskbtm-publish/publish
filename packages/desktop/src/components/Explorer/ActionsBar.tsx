import { ActionIcon, Flex, Group, rem, Tooltip } from '@mantine/core';
import { IconArrowAutofitHeight, IconFolderPlus } from '@tabler/icons-react';
import type { FC } from 'react';

import { useExplorer } from './use-explorer';

export const ActionsBar: FC<any> = function () {
  const explorer = useExplorer();
  return (
    <Flex
      align="center"
      pos="relative"
      justify="flex-end"
      component="nav"
      px={rem(18)}
    >
      <Group gap="xs">
        <Tooltip openDelay={800} label="New Folder" position="bottom">
          <ActionIcon
            size="md"
            c="gray.7"
            onClick={() => {
              explorer.toggle();
            }}
          >
            <IconFolderPlus size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip
          openDelay={800}
          label="Collapse folders in Explorer"
          position="bottom"
        >
          <ActionIcon
            size="md"
            c="gray.7"
            onClick={() => {
              explorer.toggle();
            }}
          >
            <IconArrowAutofitHeight size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Flex>
  );
};
