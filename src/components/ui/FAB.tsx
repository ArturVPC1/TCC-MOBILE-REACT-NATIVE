import { Plus } from 'lucide-react-native';
import React from 'react';
import { Pressable } from 'react-native';
import { cardShadow, colors } from '../../theme';

export function FAB({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={({ pressed }) => [{
        position: 'absolute', right: 20, bottom: 16, width: 56, height: 56, borderRadius: 28,
        backgroundColor: pressed ? colors.primaryPressed : colors.primary, alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
      }, cardShadow]}
    >
      <Plus size={24} color="#fff" strokeWidth={1.75} />
    </Pressable>
  );
}
