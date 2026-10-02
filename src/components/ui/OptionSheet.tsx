import { Check, Search } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { normalize } from '../../lib/text';
import { colors, type } from '../../theme';
import { BottomSheet } from './BottomSheet';
import { Txt } from './Txt';

export interface Option { value: string; label: string }
export type OptionInput = string | Option;
export const toOption = (o: OptionInput): Option => (typeof o === 'string' ? { value: o, label: o } : o);

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: OptionInput[];
  value?: string;
  onSelect: (v: string) => void;
}

/** Lista de opções em BottomSheet (seleção única), com busca quando há mais de 8 opções. */
export function OptionSheet({ visible, onClose, title, options, value, onSelect }: Props) {
  const [q, setQ] = useState('');
  const opts = useMemo(() => options.map(toOption), [options]);
  const filtered = useMemo(() => (q ? opts.filter((o) => normalize(o.label).includes(normalize(q))) : opts), [q, opts]);
  const close = () => { setQ(''); onClose(); };

  return (
    <BottomSheet visible={visible} onClose={close} title={title}>
      {opts.length > 8 ? (
        <View style={s.search}>
          <Search size={18} color={colors.placeholder} strokeWidth={1.75} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Buscar"
            placeholderTextColor={colors.placeholder}
            style={[type.input, { flex: 1, marginLeft: 8 }, { outlineStyle: 'none' } as never]}
          />
        </View>
      ) : null}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.value || '__empty'}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => { onSelect(item.value); close(); }}
            style={({ pressed }) => [s.row, pressed && { backgroundColor: colors.surfaceMuted }]}
          >
            <Txt variant="body" style={{ flex: 1 }}>{item.label}</Txt>
            {item.value === value ? <Check size={20} color={colors.primary} strokeWidth={1.75} /> : null}
          </Pressable>
        )}
        ListEmptyComponent={<Txt variant="caption" style={{ padding: 16, textAlign: 'center' }}>Nenhum resultado</Txt>}
      />
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  row: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  search: { height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
});
