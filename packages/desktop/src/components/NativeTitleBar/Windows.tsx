import { Center, Group } from '@mantine/core';
import type { Nullish } from '@publish/shared';
import {
  IconWindowsClose,
  IconWindowsMaximize,
  IconWindowsMaximizeRestore,
  IconWindowsMinimize,
} from '@publish/shared';
import {
  type FC,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { IF } from 'reactgets';
import { useNativeWindow } from 'tauri-reactgets';

import * as classes from './NativeTitleBar.module.css';

export interface WindowsNativeTitleBarProps extends PropsWithChildren {
  label?: string;
}

export const WindowsNativeTitleBar: FC<WindowsNativeTitleBarProps> =
  function () {
    const { current } = useNativeWindow();
    const [isWindowMaximized, setWindowMaximized] = useState<boolean | Nullish>(
      null,
    );

    const updateWindowMaximized = useCallback(async () => {
      const r = await current?.isMaximized();
      setWindowMaximized(r);
    }, []);

    useEffect(() => {
      updateWindowMaximized();

      let unListen;
      const listen = async () => {
        unListen = await current?.onResized(updateWindowMaximized);
      };
      listen();

      return () => unListen?.();
    }, [current, isWindowMaximized, updateWindowMaximized]);

    return (
      <Group wrap="nowrap" data-os="windows" gap={0} className={classes.root}>
        <Center component="button" onClick={async () => current?.minimize()}>
          <IconWindowsMinimize />
        </Center>
        <Center
          component="button"
          onClick={async () => current?.toggleMaximize()}
        >
          <IF is={isWindowMaximized !== null}>
            {isWindowMaximized === true ? (
              <IconWindowsMaximizeRestore />
            ) : (
              <IconWindowsMaximize />
            )}
          </IF>
        </Center>
        <Center
          data-close
          component="button"
          onClick={async () => current?.hide()}
        >
          <IconWindowsClose />
        </Center>
      </Group>
    );
  };
