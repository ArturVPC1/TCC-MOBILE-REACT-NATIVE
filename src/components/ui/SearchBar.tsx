import { Search, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { colors, type } from '../../theme';

/** Debounce de 300 ms. */
export function SearchBar({ onSearch, placeholder = 'Buscar' }: { onSearch: (q: string) => void; placeholder?: string }) {
  const [text, setText] = useState('');
  useEffect(() => {
    const t = setTimeout(() => onSearch(text), 300);
    return () => clearTimeout(t);
  }, [text, onSearch]);
  return (
    <View style={{ height: 44, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
      <Search size={18} color={colors.placeholder} strokeWidth={1.75} />
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        accessibilityLabel={placeholder}
        style={[type.input, { flex: 1, marginLeft: 8, paddingVertical: 0 }, { outlineStyle: 'none' } as never]}
      />
      {text ? (
        <Pressable onPress={() => setText('')} accessibilityLabel="Limpar busca" hitSlop={12}>
          <X size={18} color={colors.placeholder} strokeWidth={1.75} />
        </Pressable>
      ) : null}
    </View>
  );
}
