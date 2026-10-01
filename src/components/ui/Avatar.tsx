import React from 'react';
import { Image, View } from 'react-native';
import { initials } from '../../lib/text';
import { colors } from '../../theme';
import { Txt } from './Txt';

export function Avatar({ name, size = 44, photoUri }: { name: string; size?: 32 | 36 | 44 | 80; photoUri?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={{ width: size, height: size }} />
      ) : (
        <Txt variant="label" style={{ fontSize: size * 0.36, lineHeight: size * 0.5 }}>{initials(name)}</Txt>
      )}
    </View>
  );
}
