import { Platform } from 'react-native';

export const Colors = {
  // Editorial Evergreen Palette
  evergreen: '#153A2E',
  evergreenDark: '#0E271F',
  evergreenLight: '#E8F1EB',
  evergreenSurface: '#204C3E',
  evergreenMuted: '#2C5A4B',

  // Warm Paper & Parchment Palette
  paper: '#F8F6F0',
  paperLight: '#FCFBF8',
  paperCard: '#FFFFFF',
  paperWarm: '#F1EDE3',
  paperBorder: '#E2DBD0',
  paperBorderDark: '#D5CBBF',

  // Sage Botanical Palette
  sage: '#65846C',
  sageLight: '#E5EDE7',
  sageDark: '#46634D',
  sageBorder: '#C9D7CD',
  sageSubtle: '#F0F5F1',

  // Coral Pop Palette (Ribbons, Accents, Highlights)
  coral: '#DC644F',
  coralLight: '#FCECE8',
  coralDark: '#BC4B37',
  coralBorder: '#F5C8BF',

  // Editorial Ink & Typography Tones
  ink: '#162621',
  inkLight: '#394E46',
  inkMuted: '#5F746A',
  inkSubtle: '#8C9F96',
  inkFaint: '#B6C4BC',

  // Semantic & Backwards Compatible Aliases
  primary: '#153A2E',
  primaryDark: '#0E271F',
  primaryLight: '#E8F1EB',
  secondary: '#DC644F',
  accent: '#DC644F',
  success: '#517C61',
  danger: '#C64B3E',
  warning: '#C48448',
  background: '#F8F6F0',
  card: '#FFFFFF',
  text: '#162621',
  textMuted: '#5F746A',
  textLight: '#8C9F96',
  border: '#E2DBD0',
  borderFocus: '#153A2E',
  surface: '#EAEFEA',
  white: '#FFFFFF',
  black: '#000000',
  price: '#153A2E',
  lime: '#C7D9C5',
};

export const Fonts = {
  serif: Platform.select({ ios: 'Georgia', default: 'serif' }),
  mono: Platform.select({ ios: 'Courier New', default: 'monospace' }),
};
