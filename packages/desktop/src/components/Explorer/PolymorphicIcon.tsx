import type { ThemeIconProps } from '@mantine/core';
import { ThemeIcon } from '@mantine/core';
import { IconText } from '@publish/shared';
import {
  IconFileText,
  IconFolder,
  IconFolderOpen,
  IconPhoto,
} from '@tabler/icons-react';
import type { FC } from 'react';
import { useProps } from 'reactgets/hooks/use-props';

import type { NodeType } from './types';

export interface PolymorphicIconProps extends ThemeIconProps {
  type?: NodeType;
  size?: number;
  opened?: boolean;
}

const defaultProps = {
  size: 21,
  c: 'gray.7',
};

export const PolymorphicIcon: FC<PolymorphicIconProps> = (_props) => {
  const {
    type,
    size,
    opened,
    variant: _,
    ...rest
  } = useProps(defaultProps, _props) as Required<PolymorphicIconProps>;

  let icon;
  switch (type) {
    case 'image':
      icon = <IconPhoto />;
      break;
    case 'text':
      icon = <IconFileText />;
      break;
    case 'publish-text':
      icon = <IconText />;
      break;
    case 'folder':
      icon = opened ? <IconFolderOpen /> : <IconFolder />;
      break;
    default:
      icon = <IconText />;
      break;
  }

  return (
    <ThemeIcon size={size} variant="transparent" {...rest}>
      {icon}
    </ThemeIcon>
  );
};
