import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { colors, fonts, radius } from '../../theme';
import { Txt } from './Txt';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'md' | 'sm';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Button({ label, onPress, variant = 'primary', size = 'md', icon, loading, disabled, fullWidth }: Props) {
  const off = disabled || loading;
  const fg = variant === 'primary' ? colors.primaryForeground : variant === 'danger' ? colors.danger : colors.foreground;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      onPress={off ? undefined : onPress}
      style={({ pressed }) => [
        s.base,
        { height: size === 'md' ? 48 : 36 },
        fullWidth && { alignSelf: 'stretch' },
        variant === 'primary' && { backgroundColor: pressed ? colors.primaryPressed : colors.primary },
        variant === 'secondary' && { backgroundColor: pressed ? colors.border : colors.secondary },
        variant === 'outline' && { borderWidth: 1, borderColor: colors.border, backgroundColor: pressed ? colors.surfaceMuted : 'transparent' },
        variant === 'ghost' && { backgroundColor: pressed ? colors.surfaceMuted : 'transparent' },
        variant === 'danger' && { borderWidth: 1, borderColor: colors.danger, backgroundColor: pressed ? colors.dangerSoft : 'transparent' },
        off && { opacity: 0.5 },
      ]}
    >
      <View style={s.row}>
        {loading ? <ActivityIndicator size="small" color={fg} style={{ marginRight: 8 }} /> : icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
        <Txt variant="bodyStrong" style={{ color: fg, fontFamily: fonts.semi }} numberOfLines={1} maxFontSizeMultiplier={1.3}>
          {label}
        </Txt>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: { borderRadius: radius.md, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
});
