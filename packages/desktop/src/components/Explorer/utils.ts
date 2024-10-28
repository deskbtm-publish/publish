import { type MantineTheme, parseThemeColor } from '@mantine/core';

import { type NodeType } from './types';

// 'dark',
// 'gray',
// 'red',
// 'pink',
// 'grape',
// 'violet',
// 'indigo',
// 'blue',
// 'cyan',
// 'green',
// 'lime',
// 'yellow',
// 'orange',
// 'teal',
const builtInColors = {
  'publish-text': 'cyan',
};

export const getExplorerBuiltinColors = (
  type: NodeType,
  {
    theme,
  }: {
    theme: MantineTheme;
  },
) => {
  const c = builtInColors[type];
  const parsedThemeColor = parseThemeColor({ color: c, theme });
  const colors = theme.variantColorResolver({
    color: c,
    theme,
    variant: 'light',
  });

  return {
    hover: colors.hover,
    color:
      parsedThemeColor?.isThemeColor && parsedThemeColor?.shade === undefined
        ? `var(--mantine-color-${parsedThemeColor.color}-6)`
        : colors?.color,
  };
};
