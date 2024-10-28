import './theme/global.module.css';

import { Box, Divider, rem } from '@mantine/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { BubbleMenu, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';

import { DocEditor } from '../components';
import {
  Clipboard,
  DragHandle,
  Embed,
  FileInput,
  SlashCommands,
  TaskList,
  UploadImage,
} from '../extensions';
import { ExtensionConfigs } from './configs';
import { ExtraListFn } from './ExtraListFn';

export const PublishDocEditor = function () {
  const editor = useEditor({
    editorProps: {
      attributes: {
        spellcheck: 'false',
      },
    },
    extensions: [
      Link.configure({
        openOnClick: true,
      }),
      UploadImage,
      FileInput.configure(ExtensionConfigs.fileInput),
      TextStyle,
      Underline,
      DragHandle,
      Clipboard,
      Color,
      TaskList,
      Embed,
      Table.configure(ExtensionConfigs.table),
      TableRow,
      TableHeader,
      TableCell,
      StarterKit.configure(ExtensionConfigs.starterKit),
      CodeBlockLowlight.configure(ExtensionConfigs.codeBlockLowlight),
      TaskItem.configure(ExtensionConfigs.taskItem),
      SlashCommands.configure(ExtensionConfigs.slashCommands),
      Placeholder.configure(ExtensionConfigs.placeholder),
      Markdown.configure(ExtensionConfigs.markdown),
    ],
  });

  return (
    <Box m="0 auto" px="xl" maw="var(--publish-doc-editor-max-width)">
      <DocEditor editor={editor}>
        {editor && (
          <BubbleMenu
            tippyOptions={{
              maxWidth: 'unset',
            }}
            updateDelay={500}
            editor={editor}
          >
            <DocEditor.BubbleMenuGroup>
              <ExtraListFn />
              <Divider my={rem(4)} variant="dashed" orientation="vertical" />
              <DocEditor.Bold />
              <DocEditor.Underline />
              <DocEditor.Strikethrough />
              <DocEditor.Italic />
              <DocEditor.Link />
              <DocEditor.ClearFormatting />
              <DocEditor.ColorPicker />
              <DocEditor.Code />
              <Divider my={rem(4)} variant="dashed" orientation="vertical" />
              <DocEditor.Copy />
            </DocEditor.BubbleMenuGroup>
          </BubbleMenu>
        )}
        <DocEditor.Content />
      </DocEditor>
    </Box>
  );
};
