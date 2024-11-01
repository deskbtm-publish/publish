import { Flex, type FlexProps, rem } from '@mantine/core';
import { type FC, useMemo } from 'react';

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

  return (
    <Flex
      data-tauri-drag-region
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
