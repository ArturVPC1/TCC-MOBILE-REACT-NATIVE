import { format, parse } from 'date-fns';
import { Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { brToIso, maskDate } from '../../lib/text';
import { colors } from '../../theme';
import { DatePickerModal } from './DatePickerModal';
import { TextField, TextFieldProps } from './TextField';

/** Texto "dd/mm/aaaa" com máscara + date picker nativo ao tocar no ícone. */
export const DateField = React.forwardRef<any, TextFieldProps>(function DateField(props, ref) {
  const [open, setOpen] = useState(false);
  const current = (() => {
    const iso = brToIso(String(props.value ?? ''));
    return iso ? parse(iso, 'yyyy-MM-dd', new Date()) : new Date();
  })();
  return (
    <>
      <TextField
        ref={ref}
        placeholder="dd/mm/aaaa"
        keyboardType="number-pad"
        mask={maskDate}
        maxLength={10}
        rightElement={
          <Pressable onPress={() => setOpen(true)} accessibilityLabel="Abrir calendário" hitSlop={12}>
            <Calendar size={20} color={colors.placeholder} strokeWidth={1.75} />
          </Pressable>
        }
        {...props}
      />
      <DatePickerModal
        visible={open}
        value={current}
        onClose={() => setOpen(false)}
        onPick={(d) => props.onChangeText?.(format(d, 'dd/MM/yyyy'))}
      />
    </>
  );
});
