import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme';
import { Txt } from './Txt';

export function Banner({ text, kind = 'error' }: { text: string; kind?: 'error' | 'info' }) {
  const err = kind === 'error';
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        backgroundColor: err ? colors.dangerSoft : colors.surfaceMuted, borderRadius: 8, padding: 12, borderWidth: 1,
        borderColor: err ? 'rgba(220,38,38,0.2)' : colors.border,
      }}
    >
      <Txt variant="caption" style={{ color: err ? colors.danger : colors.foreground }}>{text}</Txt>
    </View>
  );
}
