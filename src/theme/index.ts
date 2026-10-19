import { createTheme } from '@mui/material/styles';
import { lightPalette } from './palette';

declare module '@mui/material/styles' {
  interface TypographyVariants { metric: React.CSSProperties; label: React.CSSProperties }
  interface TypographyVariantsOptions { metric?: React.CSSProperties; label?: React.CSSProperties }
}
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides { metric: true; label: true }
}

const NAVY = '#132943';
const SLATE = '#64748B';
const BORDER = '#E2E8F0';
const BORDER_STRONG = '#CBD5E1';
const ACCENT_RING = '0 0 0 3px rgba(243, 102, 51, 0.15)';
const ELEVATION_1 = '0 1px 3px 0 rgba(19, 41, 67, 0.05), 0 1px 2px -1px rgba(19, 41, 67, 0.03)';
const ELEVATION_2 = '0 4px 12px -2px rgba(19, 41, 67, 0.08), 0 2px 6px -2px rgba(19, 41, 67, 0.04)';
const ELEVATION_3 = '0 12px 28px -4px rgba(19, 41, 67, 0.12), 0 8px 10px -6px rgba(19, 41, 67, 0.06)';

/** Type scale, shapes and elevation follow the reference design system; every screen inherits them from here. */
export const theme = createTheme({
  palette: lightPalette,
  shape: { borderRadius: 8 },
  spacing: 8,
  typography: {
    fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
    fontSize: 14,
    h1: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.29, letterSpacing: '-0.02em', color: NAVY },
    h2: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.015em', color: NAVY },
    h3: { fontSize: '1.0625rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.01em', color: NAVY },
    h4: { fontSize: '0.9375rem', fontWeight: 600, color: NAVY },
    subtitle1: { fontSize: '0.9375rem', fontWeight: 600, color: NAVY },
    subtitle2: { fontSize: '0.8125rem', fontWeight: 600, color: SLATE },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.54 },
    caption: { fontSize: '0.75rem', color: SLATE },
    overline: { fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1.27, textTransform: 'uppercase', color: SLATE },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    metric: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.22, letterSpacing: '-0.025em', color: NAVY, fontFeatureSettings: '"tnum"' },
    label: { fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.33, letterSpacing: '0.02em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { fontFeatureSettings: '"tnum"', WebkitFontSmoothing: 'antialiased' },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': { animationDuration: '0.01ms !important', animationIterationCount: '1 !important', transitionDuration: '0.01ms !important', scrollBehavior: 'auto !important' },
        },
      },
    },
    MuiTypography: { defaultProps: { variantMapping: { metric: 'span', label: 'span' } } },
    MuiButton: {
      defaultProps: { disableElevation: true, size: 'small' },
      styleOverrides: {
        root: {
          borderRadius: 4, minHeight: 34, paddingInline: 14,
          variants: [
            { props: { variant: 'contained', color: 'primary' }, style: { '&:hover': { backgroundColor: '#0B1320' } } },
            { props: { variant: 'contained', color: 'secondary' }, style: { '&:hover': { backgroundColor: '#FF5B00' } } },
            { props: { variant: 'outlined', color: 'primary' }, style: { borderColor: BORDER_STRONG, color: NAVY, '&:hover': { backgroundColor: '#F1F5F9', borderColor: BORDER_STRONG } } },
            { props: { variant: 'text', color: 'primary' }, style: { color: NAVY } },
          ],
        },
      },
    },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 4 } } },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: `1px solid ${BORDER}`, boxShadow: ELEVATION_1 } },
    },
    MuiCard: { styleOverrides: { root: { borderRadius: 8, transition: 'box-shadow 150ms, border-color 150ms', '&:hover': { boxShadow: ELEVATION_2, borderColor: BORDER_STRONG } } } },
    MuiMenu: { styleOverrides: { paper: { boxShadow: ELEVATION_2 } } },
    MuiPopover: { styleOverrides: { paper: { boxShadow: ELEVATION_2 } } },
    MuiDialog: { styleOverrides: { paper: { border: 'none', boxShadow: ELEVATION_3 } } },
    MuiDrawer: { styleOverrides: { paper: { border: 'none', boxShadow: ELEVATION_3 } } },
    MuiBackdrop: { styleOverrides: { root: { backgroundColor: 'rgba(11, 19, 32, 0.4)', backdropFilter: 'blur(4px)' }, invisible: { backgroundColor: 'transparent', backdropFilter: 'none' } } },
    MuiChip: {
      defaultProps: { size: 'small' },
      styleOverrides: { root: { borderRadius: 9999, fontWeight: 600, fontSize: '0.75rem' }, outlined: { borderColor: BORDER_STRONG } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: '12px 16px', fontSize: '0.8125rem', borderBottomColor: BORDER },
        head: { fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: SLATE, backgroundColor: '#F8FAFC', whiteSpace: 'nowrap' },
        sizeSmall: { padding: '8px 12px' },
      },
    },
    MuiTableRow: { styleOverrides: { hover: { '&:hover': { backgroundColor: '#F8FAFC !important' } } } },
    MuiTab: { styleOverrides: { root: { minHeight: 44, paddingTop: 8, paddingBottom: 8, fontWeight: 600, color: SLATE, '&.Mui-selected': { color: NAVY } } } },
    MuiTabs: { styleOverrides: { root: { minHeight: 44 }, indicator: { backgroundColor: '#F36633', height: 2 } } },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiSelect: { defaultProps: { size: 'small' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 4, backgroundColor: '#FFFFFF', '& .MuiOutlinedInput-notchedOutline': { borderColor: BORDER_STRONG }, '&.Mui-focused': { boxShadow: ACCENT_RING }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#F36633', borderWidth: 1 } },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { '&.Mui-focused': { color: NAVY } } } },
    MuiToggleButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', borderColor: BORDER, color: SLATE, '&.Mui-selected': { color: NAVY, backgroundColor: '#FFFFFF' } } } },
    MuiLinearProgress: { styleOverrides: { root: { height: 4, borderRadius: 9999, backgroundColor: '#EFEDF0' }, bar: { borderRadius: 9999 } } },
    MuiTooltip: { defaultProps: { arrow: true }, styleOverrides: { tooltip: { backgroundColor: NAVY, fontSize: '0.75rem' }, arrow: { color: NAVY } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 8, fontSize: '0.8125rem' } } },
    MuiLink: { defaultProps: { underline: 'hover' }, styleOverrides: { root: { color: NAVY, fontWeight: 500 } } },
  },
});
