import type { Factory, ScrollAreaProps } from '@mantine/core';
import { factory } from '@mantine/core';
import { useProps } from 'reactgets';

import { ScrollAreaAutosize } from './ScrollAreaAutoSize.mantine';
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
  const { classNames, ...rest } = props;

  return (
    <ScrollAreaAutosize
      ref={ref}
      classNames={{
        scrollbar: classes.scrollbar,
        thumb: classes.scrollbarThumb,
        ...classNames,
      }}
      {...rest}
      type="always"
      style={{ width: '100%' }}
    />
  );
});
