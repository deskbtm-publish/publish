import { rem, useProps } from '@mantine/core';
import { Editor } from '@tiptap/core';
import { forwardRef } from 'react';
import React from 'react';

import { useDocEditorContext } from '../DocEditor.context';
import { DocEditorLabels } from '../labels';
import { PrimitiveFn, PrimitiveFnProps } from './PrimitiveFn';

export interface FnFactoryProps {
  label: keyof DocEditorLabels;
  icon: React.FC<{ style: React.CSSProperties }>;
  trailing?: string | React.ReactElement;
  isActive?: { name: string; attributes?: Record<string, unknown> | string };
  isDisabled?: (editor: Editor | null) => boolean;
  operation: { name: string; attributes?: Record<string, unknown> | string };
}

const defaultProps: Partial<PrimitiveFnProps> = {
  interactive: true,
  fluid: false,
};

export function fnFactory({
  label,
  isActive,
  trailing = '',
  operation,
  icon,
  isDisabled,
}: FnFactoryProps) {
  return forwardRef<HTMLDivElement, PrimitiveFnProps>((_props, ref) => {
    const props = useProps('PrimitiveFn', defaultProps, _props);
    const { editor, labels } = useDocEditorContext();
    const _label = labels[label] as string;
    const title = trailing ? `${_label} - ${trailing}` : _label;
    const _icon = React.createElement(icon, {
      style: {
        width: rem(20),
        height: rem(20),
        color: 'var(--mantine-color-dark-5)',
      },
    });

    return (
      <PrimitiveFn
        {...props}
        title={title}
        label={_label}
        trailing={trailing}
        active={
          isActive?.name
            ? editor?.isActive(isActive.name, isActive.attributes)
            : false
        }
        ref={ref}
        onClick={() =>
          editor?.chain().focus()[operation.name](operation.attributes).run()
        }
        disabled={isDisabled?.(editor) || false}
      >
        {props.children || _icon}
      </PrimitiveFn>
    );
  });
}
