import {
  Box,
  BoxComponentProps,
  PolymorphicComponentProps,
} from '@mantine/core';
import { memo } from 'react';

export type PanelProps = PolymorphicComponentProps<'div', BoxComponentProps>;

// eslint-disable-next-line react/display-name
export const Panel = memo<PanelProps>(function (props) {
  return <Box {...props}>{props.children}</Box>;
});
