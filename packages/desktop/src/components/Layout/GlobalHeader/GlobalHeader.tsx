import { ActionIcon, Flex, Tooltip } from '@mantine/core';
import { IconLayoutSidebarLeftExpand } from '@publish/shared';
import type { FC } from 'react';
import { useCallback } from 'react';
import { IF } from 'reactgets';
import { useTauriOS } from 'tauri-reactgets';

import { WindowsNativeTitleBar } from '../../NativeTitleBar';
import { useDividerPanel } from '../DividerPanel';
import { DraggableHeader } from '../DraggableHeader';

export interface GlobalHeaderProps {}

export const GlobalHeader: FC<GlobalHeaderProps> = () => {
  const panel = useDividerPanel();
  const os = useTauriOS();

  const handleExpand = useCallback(() => {
    panel?.expand();
  }, [panel]);

  return (
    <Flex
      style={{
        position: 'sticky',
        top: 0,
        borderBottom: '1px solid var(--mantine-color-gray-2)',
      }}
    >
      <DraggableHeader w="100%" pos="relative">
        <IF is={panel?.collapsed}>
          <Tooltip openDelay={1200} label="Collapse sidebar">
            <ActionIcon ml={18} c="gray.7" onClick={handleExpand}>
              <IconLayoutSidebarLeftExpand />
            </ActionIcon>
          </Tooltip>
        </IF>
      </DraggableHeader>
      <IF is={os.type === 'windows'}>
        <WindowsNativeTitleBar />
      </IF>
    </Flex>
  );
};
