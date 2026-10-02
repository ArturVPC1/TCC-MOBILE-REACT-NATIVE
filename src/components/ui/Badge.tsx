import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme';
import { Txt } from './Txt';

export function Badge({ label, variant = 'soft' }: { label: string; variant?: 'solid' | 'soft' | 'outline' }) {
  const bg = variant === 'solid' ? colors.primary : variant === 'soft' ? colors.secondary : 'transparent';
  const fg = variant === 'solid' ? colors.primaryForeground : variant === 'soft' ? colors.foreground : colors.muted;
  return (
    <View style={{ height: 24, paddingHorizontal: 10, borderRadius: 6, justifyContent: 'center', backgroundColor: bg, borderWidth: variant === 'solid' ? 0 : 1, borderColor: colors.border }}>
      <Txt variant="micro" maxFontSizeMultiplier={1.3} style={{ color: fg, fontWeight: '600' }}>{label}</Txt>
    </View>
  );
}
