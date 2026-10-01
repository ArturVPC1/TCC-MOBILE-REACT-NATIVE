import { Calendar } from 'lucide-react-native';
import React from 'react';
import { maskDate } from '../../lib/text';
import { colors } from '../../theme';
import { TextField, TextFieldProps } from './TextField';

/** Campo de data com máscara dd/mm/aaaa. Valor mantido como texto "dd/mm/aaaa" (converta com brToIso). */
export function DateField(props: TextFieldProps) {
  return (
    <TextField
      placeholder="dd/mm/aaaa"
      keyboardType="number-pad"
      mask={maskDate}
      maxLength={10}
      rightElement={<Calendar size={20} color={colors.placeholder} strokeWidth={1.75} />}
      {...props}
    />
  );
}
