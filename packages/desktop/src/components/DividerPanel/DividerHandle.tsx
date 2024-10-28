import { Box, Center } from '@mantine/core';

import * as classes from './DividerPanel.module.css';
import type { DividerProps } from './use-resizable';

export interface DividerHandleProps extends DividerProps {
  isDragging: boolean;
}

export const DividerHandle = ({
  isDragging,
  ...props
}: DividerHandleProps & {
  ref?: React.RefObject<HTMLDivElement>;
}) => {
  return (
    <Box className={classes.divider} {...props}>
      <Box
        h="100%"
        className={classes.handle}
        data-dragging={isDragging ? true : undefined}
      />
    </Box>
  );
};

DividerHandle.displayName = '@publish/desktop/DividerHandle';
