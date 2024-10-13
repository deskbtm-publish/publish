import { Group, rem, UnstyledButton } from '@mantine/core';
import { useDisclosure, useHover, useWindowEvent } from '@mantine/hooks';
import type { Nullish } from '@publish/shared';
import {
  IconDarwinClose,
  IconDarwinFullscreen,
  IconDarwinMinimize,
  IconDarwinPlus,
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

export interface DarwinNativeTitleBarProps extends PropsWithChildren {
  label?: string;
}

export const DarwinNativeTitleBar: FC<DarwinNativeTitleBarProps> = function () {
  const { current } = useNativeWindow();
  const [isWindowMaximized, setWindowMaximized] = useState<boolean | Nullish>(
    null,
  );
  const [isAltPressing, altHandler] = useDisclosure(false);
  const updateWindowMaximized = useCallback(async () => {
    const r = await current?.isMaximized();
    setWindowMaximized(r);
  }, []);
  const { hovered, ref } = useHover();
  const fullscreen = useCallback(async () => {
    if (isAltPressing) {
      await current?.maximize();
    } else {
      const fullscreen = await current?.isFullscreen();
      await current?.setFullscreen(!fullscreen);
    }
  }, [current, isAltPressing]);

  useEffect(() => {
    updateWindowMaximized();

    let unListen;
    const listen = async () => {
      unListen = await current?.onResized(updateWindowMaximized);
    };
    listen();

    return () => unListen?.();
  }, [current, isWindowMaximized, updateWindowMaximized]);

  useWindowEvent('keydown', (event) => {
    if (event.key === 'Alt') {
      altHandler.open();
    }
  });

  useWindowEvent('keyup', (event) => {
    if (event.key === 'Alt') {
      altHandler.close();
    }
  });

  return (
    <Group
      ref={ref}
      wrap="nowrap"
      data-os="darwin"
      gap={rem(8)}
      className={classes.root}
    >
      <UnstyledButton onClick={async () => current?.close()}>
        <IF is={hovered}>
          <IconDarwinClose />
        </IF>
      </UnstyledButton>
      <UnstyledButton onClick={async () => current?.minimize()}>
        <IF is={hovered}>
          <IconDarwinMinimize />
        </IF>
      </UnstyledButton>
      <UnstyledButton data-close onClick={fullscreen}>
        <IF is={hovered}>
          {isAltPressing ? <IconDarwinPlus /> : <IconDarwinFullscreen />}
        </IF>
      </UnstyledButton>
    </Group>
  );
};
