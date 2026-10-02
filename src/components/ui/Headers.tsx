import { ArrowLeft, LogOut, Music } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../data/auth';
import { colors } from '../../theme';
import { Avatar } from './Avatar';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Txt } from './Txt';

export function UserMenuButton() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  if (!user) return null;
  const close = () => { setOpen(false); setConfirm(false); };
  return (
    <>
      <Pressable onPress={() => setOpen(true)} accessibilityLabel="Menu do usuário" hitSlop={8}>
        <Avatar name={user.name} size={36} />
      </Pressable>
      <BottomSheet visible={open} onClose={close} title={confirm ? 'Deseja sair?' : undefined}>
        {confirm ? (
          <View style={{ gap: 12 }}>
            <Button label="Sair" variant="danger" icon={<LogOut size={18} color={colors.danger} strokeWidth={1.75} />} onPress={() => { close(); signOut(); }} fullWidth />
            <Button label="Cancelar" variant="outline" onPress={close} fullWidth />
          </View>
        ) : (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Avatar name={user.name} size={44} />
              <View>
                <Txt variant="bodyStrong">{user.name}</Txt>
                <Txt variant="caption">{user.email}</Txt>
              </View>
            </View>
            <Button label="Sair" variant="outline" icon={<LogOut size={18} color={colors.foreground} strokeWidth={1.75} />} onPress={() => setConfirm(true)} fullWidth />
          </View>
        )}
      </BottomSheet>
    </>
  );
}

export function ScreenHeader({ title, subtitle, brand }: { title: string; subtitle?: string; brand?: boolean }) {
  const insets = useSafeAreaInsets();
  const titleBlock = (
    <View style={{ flex: 1, paddingRight: 12 }}>
      <Txt variant="display">{title}</Txt>
      {subtitle ? <Txt variant="body" style={{ color: colors.muted, marginTop: 4 }}>{subtitle}</Txt> : null}
    </View>
  );
  if (brand) {
    return (
      <View style={{ paddingHorizontal: 20, paddingTop: insets.top, paddingBottom: 12 }}>
        <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Music size={18} color="#fff" strokeWidth={1.75} />
            </View>
            <Txt variant="section">SONATA</Txt>
          </View>
          <UserMenuButton />
        </View>
        {titleBlock}
      </View>
    );
  }
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 12, paddingBottom: 12, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      {titleBlock}
      <UserMenuButton />
    </View>
  );
}

export function FormHeader({ title, onBack }: { title: string; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
        <Pressable onPress={onBack} accessibilityLabel="Voltar" style={s.back}>
          <ArrowLeft size={24} color={colors.foreground} strokeWidth={1.75} />
        </Pressable>
        <Txt variant="section" style={{ fontSize: 18 }}>{title}</Txt>
      </View>
    </View>
  );
}

export function FormFooter({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, padding: 16, paddingBottom: 16 + insets.bottom, flexDirection: 'row', gap: 12 }}>
      {React.Children.map(children, (c) => <View style={{ flex: 1 }}>{c}</View>)}
    </View>
  );
}

const s = StyleSheet.create({ back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' } });
