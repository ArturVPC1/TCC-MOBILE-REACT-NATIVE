import React from 'react';
import { View } from 'react-native';
import { Chip } from './Chip';
import { OptionInput, toOption } from './OptionSheet';
import { Txt } from './Txt';
import { colors } from '../../theme';

interface Props {
  label?: string;
  required?: boolean;
  options: OptionInput[];
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
}

/** Seleção múltipla em chips que quebram linha. */
export function ChipGroup({ label, required, options, value, onChange, error }: Props) {
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <View>
      {label ? (
        <Txt variant="label" style={{ marginBottom: 8 }}>
          {label}
          {required ? <Txt variant="label" style={{ color: colors.muted }}>{' *'}</Txt> : null}
        </Txt>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => {
          const opt = toOption(o);
          return <Chip key={opt.value} label={opt.label} selected={value.includes(opt.value)} onPress={() => toggle(opt.value)} />;
        })}
      </View>
      {error ? <Txt variant="micro" style={{ color: colors.danger, marginTop: 6 }}>{error}</Txt> : null}
    </View>
  );
}
