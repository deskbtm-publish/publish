import { Card } from '@mantine/core';
import { type FC } from 'react';
import { suspend } from 'suspend-react';

const deviceInfoSymbol = Symbol();

export interface DeviceInfoProps {}

export const DeviceInfo: FC<DeviceInfoProps> = function () {
  const info = suspend(async () => {
    let deviceInfo: [string, any][] = [];

    if (process.env.PUBLISH_BUILD_PLATFORM === 'web') {
      const uaParser = await import('ua-parser-js');
      const UAParser = uaParser.default.UAParser;
      const parser = new UAParser(navigator.userAgent);
      const info = parser.getResult();

      deviceInfo = [
        ['Platform', 'Web'],
        ['OS', info.os.name + ' ' + info.os.version],
        ['Arch', info.cpu.architecture],
        ['Engine', info.engine.name],
        ['Browser', info.browser.name],
        ['Locale', navigator.language],
        ['Device', info.device.vendor],
      ];
    }

    if (process.env.PUBLISH_BUILD_PLATFORM === 'desktop') {
      const os = await import('@tauri-apps/plugin-os');
      const [type, version, arch, locale, hostname] = await Promise.all([
        os.type(),
        os.version(),
        os.arch(),
        os.locale(),
        os.hostname(),
      ]);

      deviceInfo = [
        ['Platform', 'Desktop'],
        ['OS', type + ' ' + version],
        ['Arch', arch],
        ['Locale', locale],
        ['Hostname', hostname],
      ];
    }

    deviceInfo = deviceInfo.filter((v) => {
      return !!v[1];
    });

    return deviceInfo;
  }, [deviceInfoSymbol]);

  return (
    <Card padding="lg" shadow="sm" radius="md" withBorder>
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
