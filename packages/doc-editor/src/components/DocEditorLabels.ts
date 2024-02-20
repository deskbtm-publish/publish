export interface DocEditorLabels {
  /** DocEditor.Bold fn aria-label */
  boldFnLabel: string;

  /** DocEditor.Hr fn aria-label */
  hrFnLabel: string;

  /** DocEditor.Italic fn aria-label */
  italicFnLabel: string;

  /** DocEditor.Underline fn aria-label */
  underlineFnLabel: string;

  /** DocEditor.Strike fn aria-label */
  strikeFnLabel: string;

  /** DocEditor.ClearFormatting fn aria-label */
  clearFormattingFnLabel: string;

  /** DocEditor.Link fn aria-label */
  linkFnLabel: string;

  /** DocEditor.Unlink fn aria-label */
  unlinkFnLabel: string;

  /** DocEditor.BulletList fn aria-label */
  bulletListFnLabel: string;

  /** DocEditor.OrderedList fn aria-label */
  orderedListFnLabel: string;

  /** DocEditor.H1 fn aria-label */
  h1FnLabel: string;

  /** DocEditor.H2 fn aria-label */
  h2FnLabel: string;

  /** DocEditor.H3 fn aria-label */
  h3FnLabel: string;

  /** DocEditor.H4 fn aria-label */
  h4FnLabel: string;

  /** DocEditor.H5 fn aria-label */
  h5FnLabel: string;

  /** DocEditor.H6 fn aria-label */
  h6FnLabel: string;

  /** DocEditor.Blockquote fn aria-label */
  blockquoteFnLabel: string;

  /** DocEditor.AlignLeft fn aria-label */
  alignLeftFnLabel: string;

  /** DocEditor.AlignCenter fn aria-label */
  alignCenterFnLabel: string;

  /** DocEditor.AlignRight fn aria-label */
  alignRightFnLabel: string;

  /** DocEditor.AlignJustify fn aria-label */
  alignJustifyFnLabel: string;

  /** DocEditor.Code fn aria-label */
  codeFnLabel: string;

  /** DocEditor.CodeBlock fn aria-label */
  codeBlockFnLabel: string;

  /** DocEditor.Subscript fn aria-label */
  subscriptFnLabel: string;

  /** DocEditor.Superscript fn aria-label */
  superscriptFnLabel: string;

  /** DocEditor.ColorPicker fn aria-label */
  colorPickerFnLabel: string;

  /** DocEditor.UnsetColor fn aria-label */
  unsetColorFnLabel: string;

  /** DocEditor.Highlight fn aria-label */
  highlightFnLabel: string;

  /** DocEditor.Undo fn aria-label */
  undoFnLabel: string;

  /** DocEditor.Redo fn aria-label */
  redoFnLabel: string;

  /** A function go get DocEditor.Color fn aria-label based on color that fn applies */
  colorFnLabel: (color: string) => string;

  /** aria-label for link editor url input */
  linkEditorInputLabel: string;

  /** placeholder for link editor url input */
  linkEditorInputPlaceholder: string;

  /** Content of external button tooltip in link editor when the link was chosen to open in a new tab */
  linkEditorExternalLink: string;

  /** Content of external button tooltip in link editor when the link was chosen to open in the same tab */
  linkEditorInternalLink: string;

  /** Save button content in link editor */
  linkEditorSave: string;

  /** Cancel button title text in color picker fn */
  colorPickerCancel: string;

  /** Clear button title text in color picker fn */
  colorPickerClear: string;

  /** Color picker button title text in color picker fn */
  colorPickerColorPicker: string;

  /** Palette button title text in color picker fn */
  colorPickerPalette: string;

  /** Save button title text in color picker fn */
  colorPickerSave: string;

  copyFnLabel: string;

  /** aria-label for color palette colors */
  colorPickerColorLabel: (color: string) => string;
}
