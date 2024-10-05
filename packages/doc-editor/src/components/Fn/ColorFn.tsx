import type { BoxProps, ElementProps } from '@mantine/core';
import { ColorSwatch, useProps } from '@mantine/core';

import { useDocEditorContext } from '../DocEditorContext';
import { PrimitiveFn } from './PrimitiveFn';

export interface ColorFnProps extends BoxProps, ElementProps<'div'> {
  /** Color that will be set as text color, for example #ef457e */
  color: string;
}

const defaultProps: Partial<ColorFnProps> = {};

export const ColorFn = ({
  ref,
  ...props
}: ColorFnProps & {
  ref: React.RefObject<HTMLDivElement>;
}) => {
  const { color, ...others } = useProps('ColorFn', defaultProps, props);
  const { editor, labels } = useDocEditorContext();
  const currentColor = editor?.getAttributes('textStyle').color || null;
  const label = labels.colorFnLabel(color);

  return (
    <PrimitiveFn
      {...others}
      active={currentColor === color}
      aria-label={label}
      title={label}
      onClick={() => (editor?.chain() as any).focus().setColor(color).run()}
      ref={ref}
    >
      <ColorSwatch color={color} size={14} />
    </PrimitiveFn>
  );
};
