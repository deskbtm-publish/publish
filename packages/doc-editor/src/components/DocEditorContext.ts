import type { GetStylesApi } from '@mantine/core';
import { createSafeContext } from '@mantine/core';
import type { Editor } from '@tiptap/react';

import type { DocEditorFactory } from './DocEditor';
import type { DocEditorLabels } from './labels';

interface DocEditorContext {
  getStyles: GetStylesApi<DocEditorFactory>;
  editor: Editor | null;
  labels: DocEditorLabels;
  withCodeHighlightStyles: boolean | undefined;
  withTypographyStyles: boolean | undefined;
  unstyled: boolean | undefined;
}

export const [DocEditorProvider, useDocEditorContext] =
  createSafeContext<DocEditorContext>(
    'DocEditor component was not found in tree',
  );
