import type {
  BoxProps,
  CompoundStylesApiProps,
  ElementProps,
  Factory,
} from '@mantine/core';
import { Box, factory, useProps } from '@mantine/core';
import { EditorContent } from '@tiptap/react';

import { useDocEditorContext } from '../DocEditorContext';
import * as classes from '../DocEditor.module.css';
import { PublishTypographyStyle } from '../PublishTypographyStyle';

export type DocEditorContentStylesNames = 'root';
export interface DocEditorContentProps
  extends BoxProps,
    CompoundStylesApiProps<DocEditorContentFactory>,
    ElementProps<'div'> {}

export type DocEditorContentFactory = Factory<{
  props: DocEditorContentProps;
  ref: HTMLDivElement;
  stylesNames: DocEditorContentStylesNames;
  compound: true;
}>;

const defaultProps: Partial<DocEditorContentProps> = {};

export const DocEditorContent = factory<DocEditorContentFactory>(
  (_props, ref) => {
    const props = useProps('DocEditorContent', defaultProps, _props);
    const { classNames, className, style, styles, vars: _, ...others } = props;
    const ctx = useDocEditorContext();
    if (ctx.withTypographyStyles) {
      return (
        <PublishTypographyStyle
          {...ctx.getStyles('typographyStylesProvider', {
            className,
            style,
            styles,
            classNames,
          })}
          unstyled={ctx.unstyled}
          ref={ref}
        >
          <Box
            component={EditorContent}
            editor={ctx.editor}
            {...ctx.getStyles('content', { classNames, styles })}
            {...others}
          />
        </PublishTypographyStyle>
      );
    }

    return (
      <Box
        component={EditorContent}
        editor={ctx.editor}
        {...ctx.getStyles('content', { classNames, styles, className, style })}
        {...others}
      />
    );
  },
);

DocEditorContent.classes = classes;
DocEditorContent.displayName = '@publish/doc-editor/DocEditorContent';
