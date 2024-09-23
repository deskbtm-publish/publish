import type {
  BoxProps,
  ElementProps,
  Factory,
  StylesApiProps,
} from '@mantine/core';
import { Box, factory, useProps, useStyles } from '@mantine/core';
import type { Editor } from '@tiptap/react';
import React, { useMemo } from 'react';

import { DocEditorContent } from './Content/Content';
import { DocEditorProvider } from './DocEditor.context';
import * as classes from './DocEditor.module.css';
import * as fn from './Fn';
import { BubbleMenuGroup } from './Group';
import type { DocEditorLabels } from './labels';
import { DEFAULT_LABELS } from './labels';

export type DocEditorStylesNames =
  | 'linkEditorSave'
  | 'linkEditorDropdown'
  | 'root'
  | 'content'
  | 'typographyStylesProvider'
  | 'primitiveFn'
  | 'bubbleMenuGroup'
  | 'fnSection'
  | 'fnLabel'
  | 'linkEditor'
  | 'linkEditorInput'
  | 'linkEditorExternalFn';

export interface DocEditorProps
  extends BoxProps,
    StylesApiProps<DocEditorFactory>,
    ElementProps<'div'> {
  /** Tiptap editor instance */
  editor: Editor | null;

  /** Determines whether code highlight styles should be added, `true` by default */
  withCodeHighlightStyles?: boolean;

  /** Determines whether typography styles should be added, `true` by default */
  withTypographyStyles?: boolean;

  /** Labels that are used in fn */
  labels?: Partial<DocEditorLabels>;

  /** Child editor components */
  children: React.ReactNode;
}

export type DocEditorFactory = Factory<{
  props: DocEditorProps;
  ref: HTMLDivElement;
  stylesNames: DocEditorStylesNames;
  staticComponents: {
    Content: typeof DocEditorContent;
    Fn: typeof fn.PrimitiveFn;
    BubbleMenuGroup: typeof BubbleMenuGroup;
    Bold: typeof fn.BoldFn;
    Italic: typeof fn.ItalicFn;
    Strikethrough: typeof fn.StrikeThroughFn;
    Underline: typeof fn.UnderlineFn;
    ClearFormatting: typeof fn.ClearFormattingFn;
    H1: typeof fn.H1Fn;
    H2: typeof fn.H2Fn;
    H3: typeof fn.H3Fn;
    H4: typeof fn.H4Fn;
    H5: typeof fn.H5Fn;
    H6: typeof fn.H6Fn;
    BulletList: typeof fn.BulletListFn;
    OrderedList: typeof fn.OrderedListFn;
    Link: typeof fn.LinkFn;
    Unlink: typeof fn.UnlinkFn;
    Blockquote: typeof fn.BlockquoteFn;
    AlignLeft: typeof fn.AlignLeftFn;
    AlignRight: typeof fn.AlignRightFn;
    AlignCenter: typeof fn.AlignCenterFn;
    AlignJustify: typeof fn.AlignJustifyFn;
    Superscript: typeof fn.SuperscriptFn;
    Subscript: typeof fn.SubscriptFn;
    Code: typeof fn.CodeFn;
    CodeBlock: typeof fn.CodeBlockFn;
    ColorPicker: typeof fn.ColorPickerFn;
    Color: typeof fn.ColorFn;
    Highlight: typeof fn.HighlightFn;
    Hr: typeof fn.HrFn;
    UnsetColor: typeof fn.UnsetColorFn;
    Undo: typeof fn.UndoFn;
    Redo: typeof fn.RedoFn;
    Copy: typeof fn.CopyFn;
  };
}>;

const defaultProps: Partial<DocEditorProps> = {
  withCodeHighlightStyles: true,
  withTypographyStyles: true,
};

export const DocEditor = factory<DocEditorFactory>((_props, ref) => {
  const props = useProps('DocEditor', defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    vars,
    editor,
    withCodeHighlightStyles,
    withTypographyStyles,
    labels,
    children,
    ...others
  } = props;

  const getStyles = useStyles<DocEditorFactory>({
    name: 'DocEditor',
    classes,
    props,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
  });

  const mergedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );

  return (
    <DocEditorProvider
      value={{
        editor,
        getStyles,
        labels: mergedLabels,
        withCodeHighlightStyles,
        withTypographyStyles,
        unstyled,
      }}
    >
      <Box {...getStyles('root')} {...others} ref={ref}>
        {children}
      </Box>
    </DocEditorProvider>
  );
});

DocEditor.classes = classes;
DocEditor.displayName = '@mantine/tiptap/DocEditor';

// Generic components
DocEditor.Content = DocEditorContent;
DocEditor.Fn = fn.PrimitiveFn;
DocEditor.BubbleMenuGroup = BubbleMenuGroup;

// Fn components
DocEditor.Bold = fn.BoldFn;
DocEditor.Italic = fn.ItalicFn;
DocEditor.Strikethrough = fn.StrikeThroughFn;
DocEditor.Underline = fn.UnderlineFn;
DocEditor.ClearFormatting = fn.ClearFormattingFn;
DocEditor.H1 = fn.H1Fn;
DocEditor.H2 = fn.H2Fn;
DocEditor.H3 = fn.H3Fn;
DocEditor.H4 = fn.H4Fn;
DocEditor.H5 = fn.H5Fn;
DocEditor.H6 = fn.H6Fn;
DocEditor.BulletList = fn.BulletListFn;
DocEditor.OrderedList = fn.OrderedListFn;
DocEditor.Link = fn.LinkFn;
DocEditor.Unlink = fn.UnlinkFn;
DocEditor.Blockquote = fn.BlockquoteFn;
DocEditor.AlignLeft = fn.AlignLeftFn;
DocEditor.AlignRight = fn.AlignRightFn;
DocEditor.AlignCenter = fn.AlignCenterFn;
DocEditor.AlignJustify = fn.AlignJustifyFn;
DocEditor.Superscript = fn.SuperscriptFn;
DocEditor.Subscript = fn.SubscriptFn;
DocEditor.Code = fn.CodeFn;
DocEditor.CodeBlock = fn.CodeBlockFn;
DocEditor.ColorPicker = fn.ColorPickerFn;
DocEditor.Color = fn.ColorFn;
DocEditor.Highlight = fn.HighlightFn;
DocEditor.Hr = fn.HrFn;
DocEditor.UnsetColor = fn.UnsetColorFn;
DocEditor.Undo = fn.UndoFn;
DocEditor.Redo = fn.RedoFn;
DocEditor.Copy = fn.CopyFn;
