import { ActionIcon, Box, rem, Tooltip } from '@mantine/core';
import { Transition } from '@mantine/core';
import { IconLayoutSidebarRightExpand } from '@tabler/icons-react';
import type { PropsWithChildren } from 'react';
import { forwardRef, useCallback } from 'react';

import { useDividerPanel } from '../DividerPanel';

interface SidebarHeaderProps extends PropsWithChildren {}

export const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  (props, ref) => {
    const { children } = props;
    const panel = useDividerPanel();

    const handleCollapse = useCallback(() => {
      panel?.collapse();
    }, [panel]);

    return (
      <Box pos="relative" component="nav" ref={ref} px={rem(18)} py="xs">
        <Transition
          mounted={panel?.expanded as boolean}
          transition="fade"
          duration={200}
          timingFunction="ease"
        >
          {(styles) => (
            <Tooltip openDelay={2000} label="Expand sidebar">
              <ActionIcon
                c="gray"
                style={{ ...styles }}
                onClick={handleCollapse}
              >
                <IconLayoutSidebarRightExpand />
              </ActionIcon>
            </Tooltip>
          )}
        </Transition>

        {children}
      </Box>
    );
  },
);

SidebarHeader.displayName = '@publish/desktop/SidebarHeader';