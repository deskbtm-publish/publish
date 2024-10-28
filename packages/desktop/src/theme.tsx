import type { CSSVariablesResolver } from '@mantine/core';
import { createTheme, rem } from '@mantine/core';

export const resolver: CSSVariablesResolver = (theme) => ({
  variables: {
    '--publish-doc-editor-max-width': rem(888),
  },
  light: {
    '--publish-color-contextmenu-hover': theme.other.contextMenuHoverLight,
    '--publish-color-contextmenu-border': theme.other.contextMenuBorder,
    // Tauri window:transparent not supports backdrop-filter
    // https://github.com/tauri-apps/tauri/issues/6876
    '--publish-backdrop-color-default':
      process.env.PUBLISH_BUILD_PLATFORM === 'desktop'
        ? '#ffffff'
        : '#ffffff80',
    '--publish-backdrop-filter': 'saturate(180%) blur(10px)',
  },
  dark: {
    '--publish-color-contextmenu-hover': theme.other.contextMenuHoverLight,
    '--publish-color-contextmenu-border': theme.other.contextMenuBorder,
  },
});

export const theme = createTheme({
  fontFamily: `Inter,-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial,
    sans-serif, Apple Color Emoji, Segoe UI Emoji, system-ui`,
  components: {
    ActionIcon: {
      defaultProps: {
        variant: 'transparent',
      },
    },
    ScrollArea: {
      styles: {
        thumb: {
          borderRadius: 0,
        },
      },
    },
    Tooltip: {
      styles: {
        tooltip: {
          '--tooltip-radius': 'var(--mantine-radius-default)',
          fontSize: 'var(--mantine-font-size-xs)',
        },
      },
    },
  },
  other: {
    contextMenuHoverLight: '#B4B4B43F',
    contextMenuHoverDark: '#FFFFFF4a',
    contextMenuBorder: '0 0 0 1px var(--mantine-color-gray-2)',
    gradients: {
      peach: { from: '#ed6ea0', to: '#ec8c69', deg: 35 },
      success: { from: '#16BC88', to: '#009C63', deg: 35 },
    },
  },
});
