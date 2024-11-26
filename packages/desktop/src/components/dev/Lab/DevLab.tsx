import { ActionIcon, Drawer } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconFlask } from '@tabler/icons-react';
import { type FC } from 'react';

import { ExperimentDashboard } from './ExperimentDashboard';

export interface DevLabProps {}

export const DevLab: FC<DevLabProps> = function () {
  const [opened, setOpen] = useLocalStorage({
    key: '__experiment_drawer_opened',
    defaultValue: false,
  });

  return (
    kDevMode && (
      <>
        <Drawer
          position="top"
          offset={8}
          radius="md"
          title="Development lab"
          opened={opened}
          onClose={() => setOpen(false)}
          size="100%"
        >
          <ExperimentDashboard />
        </Drawer>

        <ActionIcon
          radius="xl"
          size="xl"
          variant="light"
          aria-label="Lab"
          onClick={() => setOpen(!opened)}
          pos="fixed"
          color="blue"
          style={{ bottom: 10, right: 100, zIndex: 99999 }}
        >
          <IconFlask style={{ width: '70%', height: '70%' }} />
        </ActionIcon>
      </>
    )
  );
};

DevLab.displayName = '@publish/desktop/DevLab';
