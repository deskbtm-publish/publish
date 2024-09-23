import type { Factory, ScrollAreaProps } from '@mantine/core';
import { factory, ScrollArea, useProps } from '@mantine/core';
import type { FC } from 'react';

import * as classes from './ScrollView.module.css';

export interface ScrollViewProps extends ScrollAreaProps {}

export type ScrollViewFactory = Factory<{
  props: ScrollViewProps;
  ref: HTMLElement;
}>;

const defaultProps: Partial<ScrollViewProps> = {
  h: '100%',
  w: '100%',
  mah: '100%',
  scrollbars: 'y',
  scrollbarSize: 10,
  type: 'hover',
};

export const ScrollView: FC<ScrollViewProps> = factory(function (_props, ref) {
  const props = useProps('ScrollView', defaultProps, _props);

  return (
    <ScrollArea.Autosize
      ref={ref}
      classNames={{
        root: classes.root,
        scrollbar: classes.scrollbar,
        thumb: classes.scrollbarThumb,
      }}
      {...props}
    />
  );
});
