import { Card } from '@mantine/core';
import { type FC } from 'react';

import { useDevice } from './use-device';

export interface DeviceInfoProps {}

export const DeviceInfo: FC<DeviceInfoProps> = function () {
  const info = useDevice();

  return (
    <Card padding="lg" shadow="sm" radius="md" h={200} withBorder>
      {info.map((v) => {
        return (
          <div key={v[0]}>
            <b>{v[0]}:</b> {v[1]}
          </div>
        );
      })}
    </Card>
  );
};

DeviceInfo.displayName = '@publish/desktop/DeviceInfo';
