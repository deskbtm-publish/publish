import { Container } from '@mantine/core';
import { PublishDocEditor } from '@publish/doc-editor/preset/index.ts';
import type { PropsWithChildren } from 'react';
import { type FC } from 'react';
import { Outlet } from 'react-router';

import { DividerPanel } from '../DividerPanel';
import { ExplorerProvider } from '../Explorer';
import { ScrollView } from '../ScrollView';
import { GlobalHeader } from './GlobalHeader';
import { PrimitiveSidebar } from './Sidebar';

export interface DashboardLayoutProps extends PropsWithChildren {}

const WorkspaceLayout: FC<DashboardLayoutProps> = () => {
  return (
    <ExplorerProvider>
      <Container p="0" fluid h="100dvh">
        <DividerPanel hideDividerCollapsed initial={278} min={208} max={608}>
          <DividerPanel.Leading h="100%">
            <PrimitiveSidebar />
          </DividerPanel.Leading>
          <DividerPanel.Trailing>
            <GlobalHeader />
            <ScrollView>
              <PublishDocEditor />
            </ScrollView>
          </DividerPanel.Trailing>
        </DividerPanel>
      </Container>
    </ExplorerProvider>
  );
};

export const Component = function () {
  return (
    <>
      <WorkspaceLayout>
        <Outlet />
      </WorkspaceLayout>
    </>
  );
};
