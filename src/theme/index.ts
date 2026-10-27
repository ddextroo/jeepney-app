import { DefaultTheme } from 'expo-router';

import { palette } from './tokens';

export * from './tokens';

/** Navigation theme wired to the sky-blue palette. */
export const SkyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.sky500,
    background: palette.white,
    card: palette.white,
    text: palette.ink,
    border: palette.border,
    notification: palette.sky500,
  },
};
