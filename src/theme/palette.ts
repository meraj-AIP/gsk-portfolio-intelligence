import type { PaletteOptions } from '@mui/material/styles';

type Tint = { bg: string; fg: string };

declare module '@mui/material/styles' {
  interface Palette {
    condition: { attention: string; breached: string; met: string; reported: string; unknown: string; confirmed: string };
    nav: { background: string; text: string; active: string; surface: string; muted: string };
    brand: { navy: string; navyDark: string; accent: string; accentHover: string; canvas: string; borderSubtle: string; borderProminent: string; hover: string };
    tint: { success: Tint; warning: Tint; danger: Tint; info: Tint; neutral: Tint; accent: Tint };
  }
  interface PaletteOptions {
    condition?: Palette['condition'];
    nav?: Palette['nav'];
    brand?: Palette['brand'];
    tint?: Palette['tint'];
  }
}

/**
 * Tokens from the customer's reference design (BioPrecision Enterprise): deep navy institutional ground, one
 * orange accent kept for primary actions and the active stage, crisp slate borders and four clinical status tones.
 */
export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: { main: '#132943', light: '#334863', dark: '#0B1320', contrastText: '#FFFFFF' },
  secondary: { main: '#F36633', light: '#FF6F3B', dark: '#AC3500', contrastText: '#FFFFFF' },
  background: { default: '#F8FAFC', paper: '#FFFFFF' },
  text: { primary: '#1B1C1E', secondary: '#64748B', disabled: '#94A3B8' },
  divider: '#E2E8F0',
  success: { main: '#0D9488', contrastText: '#FFFFFF' },
  warning: { main: '#D97706', contrastText: '#FFFFFF' },
  error: { main: '#E11D48', contrastText: '#FFFFFF' },
  info: { main: '#0284C7', contrastText: '#FFFFFF' },
  condition: {
    attention: '#D97706',
    breached: '#E11D48',
    met: '#0D9488',
    reported: '#0284C7',
    unknown: '#94A3B8',
    confirmed: '#334863',
  },
  nav: { background: '#0B1320', text: '#7C91B0', active: '#FFFFFF', surface: '#132943', muted: '#B3C8E9' },
  brand: {
    navy: '#132943', navyDark: '#0B1320', accent: '#F36633', accentHover: '#FF5B00', canvas: '#F8FAFC',
    borderSubtle: '#E2E8F0', borderProminent: '#CBD5E1', hover: '#F1F5F9',
  },
  tint: {
    success: { bg: '#CCFBF1', fg: '#0F766E' },
    warning: { bg: '#FEF3C7', fg: '#B45309' },
    danger: { bg: '#FFE4E6', fg: '#BE123C' },
    info: { bg: '#E0F2FE', fg: '#0369A1' },
    neutral: { bg: '#F1F5F9', fg: '#475569' },
    accent: { bg: '#FFF1EB', fg: '#AC3500' },
  },
};
