import { Factory, factory } from '@mantine/core';
import { useProps } from 'reactgets';

const defaultProps = {};

export interface TimelineProps {}

export type TimelineFactory = Factory<{
  props: TimelineProps;
  ref: HTMLDivElement;
}>;

export const Timeline = factory<TimelineFactory>((_props, ref) => {
  const props = useProps(defaultProps, _props);

  return <></>;
});
