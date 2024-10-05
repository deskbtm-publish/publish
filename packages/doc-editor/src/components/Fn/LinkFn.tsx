import type {
  BoxProps,
  CompoundStylesApiProps,
  Factory,
  PopoverProps,
} from '@mantine/core';
import {
  Button,
  factory,
  Popover,
  rem,
  TextInput,
  Tooltip,
  UnstyledButton,
  useProps,
  useResolvedStylesApi,
} from '@mantine/core';
import { useDisclosure, useInputState } from '@mantine/hooks';
import { IconExternalLink, IconLink } from '@tabler/icons-react';
import React, { useState } from 'react';

import { useDocEditorContext } from '../DocEditorContext';
import * as classes from '../DocEditor.module.css';
import type { PrimitiveFnProps } from './PrimitiveFn';
import { PrimitiveFn } from './PrimitiveFn';

export type LinkFnStylesNames =
  | 'fn'
  | 'linkEditor'
  | 'linkEditorDropdown'
  | 'linkEditorSave'
  | 'linkEditorInput'
  | 'linkEditorExternalFn';

export type LinkFnFactory = Factory<{
  props: LinkFnProps;
  ref: HTMLDivElement;
  stylesNames: LinkFnStylesNames;
  compound: true;
}>;

export interface LinkFnProps
  extends BoxProps,
    Omit<PrimitiveFnProps, 'classNames' | 'styles' | 'vars'>,
    CompoundStylesApiProps<LinkFnFactory> {
  /** Props passed down to Popover component */
  popoverProps?: Partial<PopoverProps>;

  /** Determines whether external link fn tooltip should be disabled, `false` by default */
  disableTooltips?: boolean;

  /** Initial state for determining whether the link should be an external, `false` by default */
  initialExternal?: boolean;
}

// const LinkIcon: PrimitiveFnProps['icon'] = (props) => <IconLink {...props} />;

const defaultProps: Partial<LinkFnProps> = {};

export const LinkFn = factory<LinkFnFactory>((_props, ref) => {
  const props = useProps('LinkFn', defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    vars: _,
    popoverProps,
    disableTooltips,
    initialExternal,
    ...others
  } = props;

  const ctx = useDocEditorContext();

  const stylesApiProps = { classNames, styles };

  const [url, setUrl] = useInputState('');
  const [external, setExternal] = useState(initialExternal);
  const [opened, { open, close }] = useDisclosure(false);

  const handleOpen = () => {
    open();
    const linkData = ctx.editor?.getAttributes('link');
    setUrl(linkData?.href || '');
    setExternal(linkData?.target === '_blank');
  };

  const handleClose = () => {
    close();
    setUrl('');
    setExternal(initialExternal);
  };

  const setLink = () => {
    handleClose();
    url === ''
      ? ctx.editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      : ctx.editor
          ?.chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: url, target: external ? '_blank' : null })
          .run();
  };

  const handleInputKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setLink();
    }
  };

  const { resolvedClassNames, resolvedStyles } =
    useResolvedStylesApi<LinkFnFactory>({
      classNames,
      styles,
      props,
    });

  return (
    <Popover
      trapFocus
      withinPortal
      opened={opened}
      onClose={handleClose}
      zIndex={10000}
      {...popoverProps}
    >
      <Popover.Target>
        <PrimitiveFn
          {...others}
          aria-label={ctx.labels.linkFnLabel}
          title={ctx.labels.linkFnLabel}
          onClick={handleOpen}
          active={ctx.editor?.isActive('link')}
          ref={ref}
          classNames={resolvedClassNames}
          styles={resolvedStyles}
          className={className}
          style={style}
        >
          <IconLink style={{ width: rem(20), height: rem(20) }} />
        </PrimitiveFn>
      </Popover.Target>

      <Popover.Dropdown
        p="xs"
        {...ctx.getStyles('linkEditorDropdown', stylesApiProps)}
      >
        <div {...ctx.getStyles('linkEditor', stylesApiProps)}>
          <TextInput
            placeholder={ctx.labels.linkEditorInputPlaceholder}
            aria-label={ctx.labels.linkEditorInputLabel}
            type="url"
            value={url}
            onChange={setUrl}
            classNames={{
              input: ctx.getStyles('linkEditorInput', stylesApiProps).className,
            }}
            onKeyDown={handleInputKeydown}
            rightSection={
              <Tooltip
                label={
                  external
                    ? ctx.labels.linkEditorExternalLink
                    : ctx.labels.linkEditorInternalLink
                }
                events={{ hover: true, focus: true, touch: true }}
                withinPortal
                withArrow
                disabled={disableTooltips}
                zIndex={10000}
              >
                <UnstyledButton
                  onClick={() => setExternal((e) => !e)}
                  data-active={external || undefined}
                  {...ctx.getStyles('linkEditorExternalFn', stylesApiProps)}
                >
                  <IconExternalLink
                    style={{ width: rem(14), height: rem(14) }}
                  />
                </UnstyledButton>
              </Tooltip>
            }
          />

          <Button
            variant="default"
            onClick={setLink}
            {...ctx.getStyles('linkEditorSave', stylesApiProps)}
          >
            {ctx.labels.linkEditorSave}
          </Button>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
});

LinkFn.classes = classes;
LinkFn.displayName = '@publish/doc-editor/LinkFn';
