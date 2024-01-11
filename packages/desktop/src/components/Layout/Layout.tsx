import { ActionIcon, Box, Container, rem, Tooltip } from '@mantine/core';
import { IconLayoutSidebarLeftExpand } from '@tabler/icons-react';
import type { PropsWithChildren } from 'react';
import { type FC, useCallback, useEffect, useRef } from 'react';
import { Outlet } from 'react-router';

import { EXPLORER_MENU_ID } from '../context-menus';
import { useContextMenu } from '../ContextMenu';
import { DividerPanel, useDividerPanel } from './DividerPanel';
import { PrimitiveSidebar } from './Sidebar';
export interface DashboardLayoutProps extends PropsWithChildren {}

const WorkspaceLayout: FC<DashboardLayoutProps> = () => {
  return (
    <Container p="0" fluid h="100dvh">
      <DividerPanel hideDividerCollapsed initial={278} min={208} max={608}>
        <DividerPanel.Leading>
          <PrimitiveSidebar />
        </DividerPanel.Leading>
        <DividerPanel.Trailing>
          <Header />
        </DividerPanel.Trailing>
      </DividerPanel>
    </Container>
  );
};

function Header() {
  const panel = useDividerPanel();
  const { show } = useContextMenu({
    id: EXPLORER_MENU_ID,
  });

  const intervalRef = useRef(new Map());

  useEffect(() => {
    console.log(intervalRef);
  });

  const handleExpand = useCallback(() => {
    panel?.expand();
  }, [panel]);

  return (
    <Box
      pos="relative"
      ref={intervalRef}
      component="nav"
      px={rem(18)}
      py="xs"
      pl={0}
    >
      {panel?.collapsed && (
        <Tooltip openDelay={2000} label="Collapse sidebar">
          <ActionIcon c="gray" onClick={handleExpand}>
            <IconLayoutSidebarLeftExpand />
          </ActionIcon>
        </Tooltip>
      )}
    </Box>
  );
}

export const Component = function () {
  return (
    <>
      <WorkspaceLayout>
        <Outlet />
      </WorkspaceLayout>
    </>
  );
};
