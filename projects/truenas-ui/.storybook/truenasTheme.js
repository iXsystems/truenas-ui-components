import { create } from 'storybook/theming/create';

const truenasColors = {
  yellow: '#DED142',
  orange: '#E68D37',
  red: '#CE2929',
  magenta: '#C006C7',
  violet: '#7617D8',
  /* Drawn as TEXT by Storybook, not only as a fill: `colorSecondary` below is
     `theme.color.secondary`, which addon-docs uses for every link on a docs
     page and for the argstable's expand controls. #0095D5 measured 4.39:1 on
     `appContentBg` (#282828) — short of the 4.5:1 body-text minimum, and
     invisible as a failure for as long as docs pages were rendering in
     Storybook's light theme anyway (#293).

     #0099db is `--tn-primary-text` from themes.css, which that file tuned as
     the smallest hue-preserving lightness step clearing 4.5:1 on --tn-bg1 and
     --tn-bg2 — #1E1E1E and #282828, the same pair `appBg` and `appContentBg`
     declare below. The value that was already right for these two surfaces,
     rather than a second one derived the same way.

     4.62:1 on appContentBg, 5.22:1 on appBg. `#007db3` in the note this
     replaces was the fix for a LIGHT background and is 3.22:1 here. */
  blue: '#0099db',
  cyan: '#00d0d6',
  green: '#71BF44',
  pink: '#ffc0cb',
  aqua: '#00ffff',
  tomato: '#ff6347',
  teal: '#008080',
  slategray: '#708090',
  salmon: '#fa8072',
}

export default create({
  base: 'dark',
  // Typography
  fontBase: '"Open Sans", sans-serif',
  fontCode: 'monospace',

  brandTitle: 'TrueNAS UI Storybook',
  brandUrl: 'https://truenas.com',
  // brandImage: 'https://raw.githubusercontent.com/truenas/webui/refs/heads/release/25.04-RC.1/src/assets/icons/custom/truenas-logo-color.svg',
  brandImage: 'truenas-logo-color.svg',
  brandTarget: '_self',


  // Colors
  colorPrimary: truenasColors.magenta, // '#0095d5',
  colorSecondary: truenasColors.blue, // '#e68d37',

  // UI
  appBg: '#1e1e1e',
  appContentBg: '#282828',
  appPreviewBg: '#333333',
  appBorderColor: '#454545',
  appBorderRadius: 4,

  // Text colors
  textColor: '#dedede',
  textInverseColor: '#333333',

  // Toolbar default and active colors
  barTextColor: '#9E9E9E',
  barSelectedColor: '#585C6D',
  barHoverColor: '#585C6D',
  barBg: '#282828',

  // Form colors
  inputBg: '#1e1e1e',
  inputBorder: '#10162F',
  inputTextColor: '#dedede',
  inputBorderRadius: 2,
});


