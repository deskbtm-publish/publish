import type {
  BoxProps,
  CompoundStylesApiProps,
  ElementProps,
  Factory,
} from '@mantine/core';
import {
  Box,
  Center,
  factory,
  rem,
  UnstyledButton,
  useProps,
} from '@mantine/core';
import { ReactElement } from 'react';

import { useDocEditorContext } from '../DocEditor.context';
import * as classes from '../DocEditor.module.css';

export type PrimitiveFnStylesNames = 'primitiveFn';

export interface PrimitiveFnProps
  extends BoxProps,
    CompoundStylesApiProps<PrimitiveFnFactory>,
    ElementProps<'div'> {
  /** Determines whether the fn should have active state, false by default */
  active?: boolean;

  disabled?: boolean;
  /** Determines whether the fn can be interacted with, set `false` to make the fn to act as a label */
  interactive?: boolean;

  trailing?: string | ReactElement;

  label?: string;
  /** Compat vertical list*/
  fluid?: boolean;
}

export type PrimitiveFnFactory = Factory<{
  props: PrimitiveFnProps;
  ref: HTMLDivElement;
  stylesNames: PrimitiveFnStylesNames;
  compound: true;
}>;

const defaultProps: Partial<PrimitiveFnProps> = {
  interactive: true,
  fluid: false,
};

//TODO: keyboard controls the direction
export const PrimitiveFn = factory<PrimitiveFnFactory>((_props, ref) => {
  const props = useProps('PrimitiveFn', defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    vars: _,
    interactive,
    active,
    onMouseDown,
    disabled,
    fluid,
    label,
    trailing,
    children,
    ...others
  } = props;
  const ctx = useDocEditorContext();

  return (
    <UnstyledButton
      {...others}
      {...ctx.getStyles('primitiveFn', {
        className,
        style,
        classNames,
        styles,
        active: true,
      })}
      fz="sm"
      __vars={{
        '--_fn-hover-color-default': '#E9ECEF80',
        '--_fn-backdrop-color-default': '#ffffff80',
        '--_fn-backdrop-filter': 'saturate(180%) blur(10px)',
      }}
      component="div"
      tabIndex={interactive ? 0 : -1}
      data-interactive={interactive || undefined}
      data-disabled={disabled || undefined}
      data-fluid={fluid || undefined}
      data-active={active || undefined}
      aria-pressed={(active && interactive) || undefined}
      aria-hidden={!interactive || undefined}
      ref={ref}
      unstyled={ctx.unstyled}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
    >
      {children && <Center data-pos-left>{children}</Center>}
      {fluid && label && <Box flex="1">{label}</Box>}
      {fluid && trailing && (
        <Center fz={rem(10)} c="dimmed">
          {trailing}
        </Center>
      )}
    </UnstyledButton>
  );
});

PrimitiveFn.classes = classes;
PrimitiveFn.displayName = '@publish/doc-editor/PrimitiveFn';
