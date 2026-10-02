import { ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '../../theme';
import { OptionInput, OptionSheet, toOption } from './OptionSheet';
import { Txt } from './Txt';

interface Props {
  label?: string;
  value?: string;
  onChange: (v: string) => void;
  options: OptionInput[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  title?: string;
  disabled?: boolean;
}

export function SelectField({ label, value, onChange, options, placeholder = 'Selecione', error, required, title, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const found = options.map(toOption).find((o) => o.value === (value ?? ''));
  const shown = found && (found.value !== '' || options.some((o) => toOption(o).value === '')) ? found.label : '';

  return (
    <View>
      {label ? (
        <Txt variant="label" style={{ marginBottom: 6 }}>
          {label}
          {required ? <Txt variant="label" style={{ color: colors.muted }}>{' *'}</Txt> : null}
        </Txt>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[s.box, { borderColor: error ? colors.danger : colors.border }, disabled && { backgroundColor: colors.surfaceMuted }]}
      >
        <Txt variant="input" style={{ flex: 1, color: shown ? colors.foreground : colors.placeholder }} numberOfLines={1}>
          {shown || placeholder}
        </Txt>
        <ChevronDown size={20} color={colors.placeholder} strokeWidth={1.75} />
      </Pressable>
      {error ? <Txt variant="micro" style={{ color: colors.danger, marginTop: 4 }}>{error}</Txt> : null}
      <OptionSheet visible={open} onClose={() => setOpen(false)} title={title ?? label} options={options} value={value} onSelect={onChange} />
    </View>
  );
}

const s = StyleSheet.create({
  box: { height: 48, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface },
});
