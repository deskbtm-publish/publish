import type {
  BoxProps,
  CompoundStylesApiProps,
  ElementProps,
  Factory,
} from '@mantine/core';
import { Box, factory, useProps } from '@mantine/core';

import * as classes from '../DocEditor.module.css';
import { useDocEditorContext } from '../DocEditorContext';

export type BubbleMenuGroupStylesNames = 'bubbleMenuGroup';
export interface BubbleMenuGroupProps
  extends BoxProps,
    CompoundStylesApiProps<BubbleMenuGroupFactory>,
    ElementProps<'div'> {}

export type BubbleMenuGroupFactory = Factory<{
  props: BubbleMenuGroupProps;
  ref: HTMLDivElement;
  stylesNames: BubbleMenuGroupStylesNames;
  compound: true;
}>;

const defaultProps: Partial<BubbleMenuGroupProps> = {};

export const BubbleMenuGroup = factory<BubbleMenuGroupFactory>(
  (_props, ref) => {
    const props = useProps('BubbleMenuGroup', defaultProps, _props);
    const { classNames, className, style, styles, vars: _, ...others } = props;
    const ctx = useDocEditorContext();
    return (
      <Box
        ref={ref}
        {...ctx.getStyles('bubbleMenuGroup', {
          className,
          style,
          styles,
          classNames,
        })}
        {...others}
      />
    );
  },
);

BubbleMenuGroup.classes = classes;
BubbleMenuGroup.displayName = '@publish/doc-editor/BubbleMenuGroup';
