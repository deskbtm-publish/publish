import {
  Box,
  type BoxComponentProps,
  type PolymorphicComponentProps,
} from '@mantine/core';
import { memo } from 'react';

export type PanelProps = PolymorphicComponentProps<'div', BoxComponentProps>;

export const Panel = memo<PanelProps>(function (props) {
  return <Box {...props}>{props.children}</Box>;
});
