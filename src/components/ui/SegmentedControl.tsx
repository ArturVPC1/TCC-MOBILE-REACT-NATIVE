import React from 'react';
import { Pressable, View } from 'react-native';
import { cardShadow, colors } from '../../theme';
import { Txt } from './Txt';

interface Props<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, label }: Props<T>) {
  return (
    <View>
      {label ? <Txt variant="label" style={{ marginBottom: 6 }}>{label}</Txt> : null}
      <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: 10, padding: 4 }}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(o.value)}
              style={[{ flex: 1, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, active && { backgroundColor: colors.surface }, active && cardShadow]}
            >
              <Txt variant="label" maxFontSizeMultiplier={1.3} style={{ color: active ? colors.foreground : colors.muted, fontWeight: active ? '600' : '500' }}>
                {o.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
