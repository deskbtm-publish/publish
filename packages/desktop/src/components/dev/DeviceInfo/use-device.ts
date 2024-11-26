import { use } from 'react';

export const useDevice = () => {
  const devicePromise = new Promise<[string, any][]>((resolve) => {
    if (process.env.PUBLISH_BUILD_PLATFORM === 'web') {
      import('ua-parser-js').then(({ UAParser }) => {
        const parser = new UAParser(navigator.userAgent);
        const info = parser.getResult();

        resolve([
          ['Platform', 'Web'],
          ['OS', info.os.name + ' ' + info.os.version],
          ['Arch', info.cpu.architecture],
          ['Engine', info.engine.name],
          ['Browser', info.browser.name],
          ['Locale', navigator.language],
          ['Device', info.device.vendor],
        ]);
      });
    }

    if (process.env.PUBLISH_BUILD_PLATFORM === 'desktop') {
      import('@tauri-apps/plugin-os').then((os) => {
        Promise.all([
          os.type(),
          os.version(),
          os.arch(),
          os.locale(),
          os.hostname(),
        ]).then(([type, version, arch, locale, hostname]) => {
          resolve([
            ['Platform', 'Desktop'],
            ['OS', type + ' ' + version],
            ['Arch', arch],
            ['Locale', locale],
            ['Hostname', hostname],
          ]);
        });
      });
    }
  });
  return use(devicePromise);
};
