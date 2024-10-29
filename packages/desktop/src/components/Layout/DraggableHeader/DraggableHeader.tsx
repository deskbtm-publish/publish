import { Flex, type FlexProps, rem } from '@mantine/core';
import { useEventListener } from '@mantine/hooks';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { type FC, useCallback, useMemo } from 'react';

export type DraggableHeaderProps = FlexProps;

export const DraggableHeader: FC<DraggableHeaderProps> = function (props) {
  const style = useMemo(
    () =>
      Object.assign(
        {},
        {
          overflow: 'hidden',
        },
        props.style,
      ),
    [props.style],
  );
  const drag = useCallback((e) => {
    const appWindow = getCurrentWindow();
    if (e.buttons === 1) {
      e.detail === 2 ? appWindow.toggleMaximize() : appWindow.startDragging();
    }
  }, []);
  const ref = useEventListener('mousedown', drag);

  return (
    <Flex
      // data-tauri-drag-region
      ref={ref}
      align="center"
      pos="relative"
      justify="space-between"
      component="nav"
      mih={rem(40)}
      // Fix tauri-drag-region can't resize window
      my={rem(6)}
      style={style}
      {...props}
    />
  );
};
DraggableHeader.displayName = '@publish/desktop/DraggableHeader';
