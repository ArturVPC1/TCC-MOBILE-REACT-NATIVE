import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import React from 'react';
import { Platform, View } from 'react-native';
import { colors } from '../../theme';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { useActionSheet } from './Overlays';
import { useToast } from './Toast';
import { Txt } from './Txt';

const MAX_BYTES = 2 * 1024 * 1024;

interface Props { name: string; uri?: string; onChange: (uri: string | undefined) => void }

export function PhotoPicker({ name, uri, onChange }: Props) {
  const sheet = useActionSheet();
  const toast = useToast();

  const handle = (res: ImagePicker.ImagePickerResult) => {
    if (res.canceled) return;
    const a = res.assets[0]!;
    if (a.fileSize && a.fileSize > MAX_BYTES) { toast('A foto deve ter no máximo 2 MB.', 'error'); return; }
    onChange(a.uri);
  };
  const gallery = async () => handle(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.5, allowsEditing: true, aspect: [1, 1] }));
  const camera = async () => {
    const p = await ImagePicker.requestCameraPermissionsAsync();
    if (!p.granted) { toast('Permissão da câmera negada.', 'error'); return; }
    handle(await ImagePicker.launchCameraAsync({ quality: 0.5, allowsEditing: true, aspect: [1, 1] }));
  };

  const add = () => {
    if (Platform.OS === 'web') { gallery(); return; }
    sheet({ title: 'Foto', actions: [{ label: 'Tirar foto', onPress: camera }, { label: 'Escolher da galeria', onPress: gallery }] });
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      {uri || name.trim() ? (
        <Avatar name={name} size={80} photoUri={uri} />
      ) : (
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          <Camera size={28} color={colors.placeholder} strokeWidth={1.75} />
        </View>
      )}
      <View style={{ flex: 1, alignItems: 'flex-start', gap: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button label="Adicionar foto" variant="outline" size="sm" onPress={add} />
          {uri ? <Button label="Remover" variant="ghost" size="sm" onPress={() => onChange(undefined)} /> : null}
        </View>
        <Txt variant="micro" style={{ color: colors.muted }}>PNG ou JPG, até 2 MB.</Txt>
      </View>
    </View>
  );
}
