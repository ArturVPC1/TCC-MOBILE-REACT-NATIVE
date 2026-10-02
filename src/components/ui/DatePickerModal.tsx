import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import React from 'react';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';

interface Props {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onPick: (d: Date) => void;
}

/** Date picker nativo (iOS dentro de um sheet, Android como diálogo do sistema). */
export function DatePickerModal({ visible, value, onClose, onPick }: Props) {
  if (!visible) return null;
  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        mode="date"
        value={value}
        onChange={(e, d) => { onClose(); if (e.type === 'set' && d) onPick(d); }}
      />
    );
  }
  return (
    <BottomSheet visible onClose={onClose} title="Selecionar data">
      <DateTimePicker mode="date" display="inline" value={value} onChange={(_, d) => d && onPick(d)} locale="pt-BR" />
      <Button label="Fechar" variant="outline" onPress={onClose} fullWidth />
    </BottomSheet>
  );
}
