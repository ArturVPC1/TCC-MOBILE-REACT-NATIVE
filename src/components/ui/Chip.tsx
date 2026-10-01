import React from 'react';
import { Pressable } from 'react-native';
import { colors, fonts } from '../../theme';
import { Txt } from './Txt';

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={{
        height: 36, paddingHorizontal: 14, borderRadius: 9999, justifyContent: 'center',
        backgroundColor: selected ? colors.primary : colors.surface,
        borderWidth: selected ? 0 : 1, borderColor: colors.border,
      }}
    >
      <Txt variant="label" maxFontSizeMultiplier={1.3} style={{ fontFamily: fonts.medium, color: selected ? colors.primaryForeground : colors.foreground }}>
        {label}
      </Txt>
    </Pressable>
  );
}
