import {
  ActionIcon,
  Flex,
  Group,
  Menu,
  rem,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowAutofitHeight,
  IconArrowsLeftRight,
  IconDots,
  IconFolderPlus,
  IconMessageCircle,
  IconPhoto,
  IconSearch,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';
import type { FC } from 'react';

import { useExplorer } from './use-explorer';

export const ActionsBar: FC<any> = function () {
  const { treeRef } = useExplorer();

  return (
    <Flex
      align="center"
      pos="relative"
      justify="flex-end"
      component="nav"
      px={rem(18)}
    >
      <Group gap="xs">
        <Tooltip openDelay={800} label="New Binder" position="bottom">
          <ActionIcon
            size="md"
            c="gray.7"
            onClick={() => {
              treeRef.current?.addNode({
                text: Math.random().toString(36).substring(7),
                droppable: true,
                data: {
                  type: 'publish-text',
                  size: 2.1,
                  birthTime: '1',
                  modifiedTime: '1',
                },
              });
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
              treeRef.current?.toggleAll();
            }}
          >
            <IconArrowAutofitHeight size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip openDelay={800} label="More actions" position="bottom">
          <Menu
            trigger="click"
            position="bottom-start"
            withArrow
            offset={{ crossAxis: 6 }}
          >
            <Menu.Target>
              <ActionIcon size="md" c="gray.7">
                <IconDots size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Application</Menu.Label>
              <Menu.Item
                leftSection={
                  <IconSettings style={{ width: rem(14), height: rem(14) }} />
                }
              >
                Settings
              </Menu.Item>
              <Menu.Item
                leftSection={
                  <IconMessageCircle
                    style={{ width: rem(14), height: rem(14) }}
                  />
                }
              >
                Messages
              </Menu.Item>
              <Menu.Item
                leftSection={
                  <IconPhoto style={{ width: rem(14), height: rem(14) }} />
                }
              >
                Gallery
              </Menu.Item>
              <Menu.Item
                leftSection={
                  <IconSearch style={{ width: rem(14), height: rem(14) }} />
                }
                rightSection={
                  <Text size="xs" c="dimmed">
                    ⌘K
                  </Text>
                }
              >
                Search
              </Menu.Item>

              <Menu.Divider />

              <Menu.Label>Danger zone</Menu.Label>
              <Menu.Item
                leftSection={
                  <IconArrowsLeftRight
                    style={{ width: rem(14), height: rem(14) }}
                  />
                }
              >
                Transfer my data
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={
                  <IconTrash style={{ width: rem(14), height: rem(14) }} />
                }
              >
                Delete my account
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Tooltip>
      </Group>
    </Flex>
  );
};
