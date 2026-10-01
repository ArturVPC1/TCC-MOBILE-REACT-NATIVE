import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { cardShadow, colors, radius } from '../../theme';
import { Txt } from './Txt';

export function Card({ children, style, shadow = true }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; shadow?: boolean }) {
  return (
    <View style={[{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 16 }, shadow && cardShadow, style]}>
      {children}
    </View>
  );
}

export function KpiCard({ title, value, caption, icon, loading }: { title: string; value: string; caption: string; icon: React.ReactNode; loading?: boolean }) {
  return (
    <Card style={{ minHeight: 120, flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt variant="label" style={{ color: '#404040', fontWeight: '500' }}>{title}</Txt>
        {icon}
      </View>
      {loading ? (
        <View style={{ marginTop: 12, height: 38, width: 56, borderRadius: 6, backgroundColor: '#EDEDED' }} />
      ) : (
        <Txt variant="kpi" style={{ marginTop: 12 }} maxFontSizeMultiplier={1.3}>{value}</Txt>
      )}
      <Txt variant="caption">{caption}</Txt>
    </Card>
  );
}
