import type { ThemeIconProps } from '@mantine/core';
import { ThemeIcon } from '@mantine/core';
import { IconFileText, IconFolder, IconPhoto } from '@tabler/icons-react';
import type { FC } from 'react';
import { useProps } from 'reactgets/hooks/use-props';

import type { NodeType } from './types';

export interface PolymorphicIconProps extends ThemeIconProps {
  type?: NodeType;
  size?: number;
}

const defaultProps = {
  size: 21,
  c: 'gray.7',
};

export const PolymorphicIcon: FC<PolymorphicIconProps> = (_props) => {
  const {
    type,
    size,
    variant: _,
    ...rest
  } = useProps(defaultProps, _props) as Required<PolymorphicIconProps>;

  let icon;
  switch (type) {
    case 'image':
      icon = <IconPhoto />;
      break;
    case 'file-text':
      icon = <IconFileText />;
      break;
    case 'folder':
      icon = <IconFolder />;
      break;
    default:
      icon = <IconFileText />;
      break;
  }

  return (
    <ThemeIcon size={size} variant="transparent" {...rest}>
      {icon}
    </ThemeIcon>
  );
};
