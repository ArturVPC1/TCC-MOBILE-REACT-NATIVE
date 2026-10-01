import { Check, ChevronDown, Search } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { normalize } from '../../lib/text';
import { colors, radius, type } from '../../theme';
import { BottomSheet } from './BottomSheet';
import { Txt } from './Txt';

interface Props {
  label?: string;
  value?: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  title?: string;
}

export function SelectField({ label, value, onChange, options, placeholder = 'Selecione', error, required, title }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const filtered = useMemo(() => (q ? options.filter((o) => normalize(o).includes(normalize(q))) : options), [q, options]);

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
        onPress={() => setOpen(true)}
        style={[s.box, { borderColor: error ? colors.danger : colors.border }]}
      >
        <Txt variant="input" style={{ flex: 1, color: value ? colors.foreground : colors.placeholder }} numberOfLines={1}>
          {value || placeholder}
        </Txt>
        <ChevronDown size={20} color={colors.placeholder} strokeWidth={1.75} />
      </Pressable>
      {error ? <Txt variant="micro" style={{ color: colors.danger, marginTop: 4 }}>{error}</Txt> : null}

      <BottomSheet visible={open} onClose={() => { setOpen(false); setQ(''); }} title={title ?? label}>
        {options.length > 8 ? (
          <View style={[s.search]}>
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
          keyExtractor={(i) => i}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { onChange(item); setOpen(false); setQ(''); }}
              style={({ pressed }) => [s.row, pressed && { backgroundColor: colors.surfaceMuted }]}
            >
              <Txt variant="body" style={{ flex: 1 }}>{item}</Txt>
              {item === value ? <Check size={20} color={colors.primary} strokeWidth={1.75} /> : null}
            </Pressable>
          )}
          ListEmptyComponent={<Txt variant="caption" style={{ padding: 16, textAlign: 'center' }}>Nenhum resultado</Txt>}
        />
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  box: { height: 48, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface },
  row: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  search: { height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
});
