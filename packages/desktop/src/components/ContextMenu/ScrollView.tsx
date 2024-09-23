import type { Factory, ScrollAreaProps } from '@mantine/core';
import { factory, ScrollArea, useProps } from '@mantine/core';
import type { FC } from 'react';

import * as classes from './ContextMenu.module.css';

export interface ScrollViewProps extends ScrollAreaProps {}

export type ScrollViewFactory = Factory<{
  props: ScrollViewProps;
  ref: HTMLElement;
}>;

const defaultProps: Partial<ScrollViewProps> = {
  h: '100%',
  w: '100%',
  mah: '90vh',
  scrollbars: 'y',
  scrollbarSize: 5,
  type: 'hover',
};

export const ContextMenuScrollView: FC<ScrollViewProps> = factory(
  function (_props, ref) {
    const props = useProps('ContextMenuScrollView', defaultProps, _props);

    return (
      <ScrollArea.Autosize
        ref={ref}
        classNames={{
          thumb: classes.scrollbarThumb,
          scrollbar: classes.scrollbar,
        }}
        {...props}
      />
    );
  },
);
