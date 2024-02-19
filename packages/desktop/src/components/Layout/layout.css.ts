import { rem } from '@mantine/core';
import { style } from '@vanilla-extract/css';

export const scrollbarThumb = style({
  ':hover': {
    backgroundColor: 'var(--mantine-color-gray-5)!important',
  },
  backgroundColor: 'var(--mantine-color-gray-3)!important',
});

export const scrollbar = style({
  ':hover': {
    width: rem(14),
  },
});

export const viewport = style({});

// export const root = style({
//   overflow: 'unset',
//   height: '100%',
// });

// Overwrite the mantine ScrollAreaViewport display:table.
// globalStyle(`${viewport} > div`, {
//   display: 'unset!important',
// });
