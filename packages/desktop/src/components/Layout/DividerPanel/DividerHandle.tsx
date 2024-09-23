import { Box, Center } from '@mantine/core';

import * as classes from './DividerPanel.module.css';
import type { DividerProps } from './use-resizable';

export interface DividerHandleProps extends DividerProps {
  isDragging: boolean;
}

export const DividerHandle = ({
  ref,
  isDragging,
  ...props
}: DividerHandleProps & {
  ref?: React.RefObject<HTMLDivElement>;
}) => {
  return (
    <Box ref={ref} className={classes.divider} {...props}>
      <Center h="100%">
        <Box
          className={classes.handle}
          data-dragging={isDragging ? true : undefined}
        />
      </Center>
    </Box>
  );
};

DividerHandle.displayName = '@publish/desktop/DividerHandle';
