import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { Txt } from './Txt';

type Show = (msg: string, kind?: 'ok' | 'error') => void;
const Ctx = createContext<Show>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState<{ t: string; kind: 'ok' | 'error' } | null>(null);
  const op = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback<Show>((t, kind = 'ok') => {
    clearTimeout(timer.current);
    setMsg({ t, kind });
    Animated.timing(op, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    timer.current = setTimeout(() => {
      Animated.timing(op, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setMsg(null));
    }, 3000);
  }, [op]);

  return (
    <Ctx.Provider value={show}>
      {children}
      {msg ? (
        <Animated.View pointerEvents="none" style={[s.toast, { opacity: op, bottom: 80 + insets.bottom, backgroundColor: msg.kind === 'error' ? colors.danger : colors.primary }]}>
          <Txt variant="label" style={{ color: '#fff' }}>{msg.t}</Txt>
        </Animated.View>
      ) : null}
    </Ctx.Provider>
  );
}

const s = StyleSheet.create({
  toast: { position: 'absolute', left: 20, right: 20, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
});
