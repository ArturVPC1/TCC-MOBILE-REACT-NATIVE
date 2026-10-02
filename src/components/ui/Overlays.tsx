import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../../theme';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Txt } from './Txt';

/** Alert/ActionSheet próprios: funcionam igual em iOS, Android e web (Alert.alert não funciona na web). */
export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}
export interface SheetAction { label: string; destructive?: boolean; onPress: () => void }
export interface SheetOptions { title?: string; actions: SheetAction[] }

interface Ctx {
  confirm: (o: ConfirmOptions) => Promise<boolean>;
  actionSheet: (o: SheetOptions) => void;
}
const OverlayCtx = createContext<Ctx>(null as never);
export const useConfirm = () => useContext(OverlayCtx).confirm;
export const useActionSheet = () => useContext(OverlayCtx).actionSheet;

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [dlg, setDlg] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const [sheet, setSheet] = useState<SheetOptions | null>(null);

  const confirm = useCallback((o: ConfirmOptions) => new Promise<boolean>((res) => {
    resolver.current = res;
    setDlg(o);
  }), []);
  const answer = (v: boolean) => { resolver.current?.(v); resolver.current = null; setDlg(null); };
  const actionSheet = useCallback((o: SheetOptions) => setSheet(o), []);

  return (
    <OverlayCtx.Provider value={{ confirm, actionSheet }}>
      {children}
      <Modal visible={!!dlg} transparent animationType="fade" onRequestClose={() => answer(false)} statusBarTranslucent>
        <View style={s.overlay}>
          <View style={s.dialog}>
            <Txt variant="title">{dlg?.title}</Txt>
            {dlg?.message ? <Txt variant="body" style={{ color: colors.muted, marginTop: 8 }}>{dlg.message}</Txt> : null}
            <View style={{ gap: 8, marginTop: 20 }}>
              <Button
                label={dlg?.confirmLabel ?? 'Confirmar'}
                variant={dlg?.destructive ? 'danger' : 'primary'}
                onPress={() => answer(true)}
                fullWidth
              />
              <Button label={dlg?.cancelLabel ?? 'Cancelar'} variant="outline" onPress={() => answer(false)} fullWidth />
            </View>
          </View>
        </View>
      </Modal>
      <BottomSheet visible={!!sheet} onClose={() => setSheet(null)} title={sheet?.title}>
        <View style={{ gap: 8 }}>
          {sheet?.actions.map((a) => (
            <Button
              key={a.label}
              label={a.label}
              variant={a.destructive ? 'danger' : 'outline'}
              onPress={() => { setSheet(null); a.onPress(); }}
              fullWidth
            />
          ))}
          <Button label="Cancelar" variant="ghost" onPress={() => setSheet(null)} fullWidth />
        </View>
      </BottomSheet>
    </OverlayCtx.Provider>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 380, backgroundColor: colors.surface, borderRadius: 16, padding: 20 },
});
