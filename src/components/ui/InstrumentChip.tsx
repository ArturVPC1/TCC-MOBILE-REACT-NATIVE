import { SlidersHorizontal } from 'lucide-react-native';
import React, { useState } from 'react';
import { INSTRUMENTS } from '../../types/domain';
import { colors } from '../../theme';
import { Chip } from './Chip';
import { OptionSheet } from './OptionSheet';

/** Chip "Instrumento" que abre um sheet de seleção única (vazio = Todos). */
export function InstrumentChip({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Chip
        label={value || 'Instrumento'}
        selected={!!value}
        onPress={() => setOpen(true)}
        icon={<SlidersHorizontal size={16} color={value ? colors.primaryForeground : colors.foreground} strokeWidth={1.75} />}
      />
      <OptionSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Instrumento"
        options={[{ value: '', label: 'Todos' }, ...INSTRUMENTS]}
        value={value}
        onSelect={onChange}
      />
    </>
  );
}
