import type {
  BoxProps,
  ElementProps,
  Factory,
  StylesApiProps,
} from '@mantine/core';
import { Box, factory, useProps, useStyles } from '@mantine/core';

import * as classes from './PublishTypographyStyle.module.css';

export type PublishTypographyStyleStyleNames = 'root';

export interface PublishTypographyStyleProps
  extends BoxProps,
    StylesApiProps<PublishTypographyStyleFactory>,
    ElementProps<'div'> {}

export type PublishTypographyStyleFactory = Factory<{
  props: PublishTypographyStyleProps;
  ref: HTMLDivElement;
  stylesNames: PublishTypographyStyleStyleNames;
}>;

const defaultProps: Partial<PublishTypographyStyleProps> = {};

export const PublishTypographyStyle = factory<PublishTypographyStyleFactory>(
  (_props, ref) => {
    const props = useProps('PublishTypographyStyle', defaultProps, _props);
    const { classNames, className, style, styles, unstyled, ...others } = props;

    const getStyles = useStyles<PublishTypographyStyleFactory>({
      name: 'PublishTypographyStyle',
      classes,
      props,
      className,
      style,
      classNames,
      styles,
      unstyled,
    });

    return <Box ref={ref} {...getStyles('root')} {...others} />;
  },
);

PublishTypographyStyle.classes = classes;
PublishTypographyStyle.displayName =
  '@publish/doc-editor/PublishTypographyStyle';
