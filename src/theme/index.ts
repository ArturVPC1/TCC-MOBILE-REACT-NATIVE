import { TextStyle } from 'react-native';

export const colors = {
  background: '#FCFCFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F4F4F5',
  border: '#E5E5E5',
  borderStrong: '#D4D4D4',
  foreground: '#0A0A0A',
  muted: '#6B6B6B',
  placeholder: '#8A8A8A',
  primary: '#111111',
  primaryForeground: '#FFFFFF',
  primaryPressed: '#2A2A2A',
  secondary: '#F4F4F5',
  secondaryForeground: '#111111',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  overlay: 'rgba(0,0,0,0.4)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };
export const radius = { sm: 6, md: 8, lg: 12, xl: 16, full: 9999 };

const f = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semi: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const type: Record<string, TextStyle> = {
  display: { fontFamily: f.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.5, color: colors.foreground },
  title: { fontFamily: f.bold, fontSize: 20, lineHeight: 26, color: colors.foreground },
  section: { fontFamily: f.semi, fontSize: 16, lineHeight: 22, color: colors.foreground },
  body: { fontFamily: f.regular, fontSize: 15, lineHeight: 22, color: colors.foreground },
  bodyStrong: { fontFamily: f.semi, fontSize: 15, lineHeight: 22, color: colors.foreground },
  label: { fontFamily: f.semi, fontSize: 14, lineHeight: 20, color: colors.foreground },
  caption: { fontFamily: f.regular, fontSize: 13, lineHeight: 18, color: colors.muted },
  micro: { fontFamily: f.medium, fontSize: 12, lineHeight: 16, color: colors.foreground },
  kpi: { fontFamily: f.bold, fontSize: 32, lineHeight: 38, color: colors.foreground },
  input: { fontFamily: f.regular, fontSize: 16, lineHeight: 22, color: colors.foreground },
};

export const fonts = f;

export const cardShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;
