import type { Factory, ScrollAreaProps } from '@mantine/core';
import { factory, ScrollArea } from '@mantine/core';
import { useProps } from 'reactgets';

import * as classes from './ScrollView.module.css';

export interface ScrollViewProps extends ScrollAreaProps {}

export type ScrollViewFactory = Factory<{
  props: ScrollViewProps;
  ref: HTMLDivElement;
}>;

const defaultProps: Partial<ScrollViewProps> = {
  scrollbars: 'y',
  scrollbarSize: 10,
  type: 'hover',
};

export const ScrollView = factory<ScrollViewFactory>(function (_props, ref) {
  const props = useProps(defaultProps, _props);
  const { classNames, ...rests } = props;

  return (
    <ScrollArea.Autosize
      ref={ref}
      classNames={{
        root: classes.root,
        scrollbar: classes.scrollbar,
        thumb: classes.scrollbarThumb,
        ...classNames,
      }}
      {...rests}
    />
  );
});
