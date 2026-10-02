import React from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { cardShadow, colors, radius } from '../../theme';
import { Txt } from './Txt';

export function Card({ children, style, shadow = true }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; shadow?: boolean }) {
  return (
    <View style={[{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 16 }, shadow && cardShadow, style]}>
      {children}
    </View>
  );
}

export function KpiCard({ title, value, caption, icon, loading, onPress, compact }: {
  title: string; value: string; caption?: string; icon: React.ReactNode; loading?: boolean; onPress?: () => void; compact?: boolean;
}) {
  const body = (
    <Card style={{ minHeight: compact ? 96 : 120, padding: compact ? 12 : 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt variant="label" style={{ color: '#404040', fontWeight: '500', flexShrink: 1 }} numberOfLines={1}>{title}</Txt>
        {icon}
      </View>
      {loading ? (
        <View style={{ marginTop: 12, height: compact ? 30 : 38, width: 56, borderRadius: 6, backgroundColor: '#EDEDED' }} />
      ) : (
        <Txt variant="kpi" style={{ marginTop: 12, fontSize: compact ? 24 : 32, lineHeight: compact ? 30 : 38 }} maxFontSizeMultiplier={1.3}>{value}</Txt>
      )}
      {caption ? <Txt variant="caption">{caption}</Txt> : null}
    </Card>
  );
  return onPress ? (
    <Pressable style={({ pressed }) => [{ flex: 1 }, pressed && { opacity: 0.7 }]} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}: ${value}`}>
      {body}
    </Pressable>
  ) : (
    <View style={{ flex: 1 }}>{body}</View>
  );
}
