import React from 'react';
import { Pressable } from 'react-native';
import { colors, fonts } from '../../theme';
import { Txt } from './Txt';

export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: React.ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={{
        height: 36, paddingHorizontal: 14, borderRadius: 9999, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: selected ? colors.primary : colors.surface,
        borderWidth: selected ? 0 : 1, borderColor: colors.border,
      }}
    >
      {icon}
      <Txt variant="label" maxFontSizeMultiplier={1.3} style={{ fontFamily: fonts.medium, color: selected ? colors.primaryForeground : colors.foreground }}>
        {label}
      </Txt>
    </Pressable>
  );
}
