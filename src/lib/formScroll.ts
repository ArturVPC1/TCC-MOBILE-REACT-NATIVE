import { useRef } from 'react';
import { LayoutChangeEvent, ScrollView, TextInput } from 'react-native';

/** Rola até o primeiro campo com erro (na ordem de `order`) e foca se for um TextInput. */
export function useFormScroll(order: string[]) {
  const scroll = useRef<ScrollView>(null);
  const ys = useRef<Record<string, number>>({});
  const inputs = useRef<Record<string, TextInput | null>>({});

  const anchor = (name: string) => ({
    onLayout: (e: LayoutChangeEvent) => { ys.current[name] = e.nativeEvent.layout.y; },
  });
  const inputRef = (name: string) => (r: TextInput | null) => { inputs.current[name] = r; };
  const toFirstError = (errors: Record<string, unknown>) => {
    const first = order.find((k) => k in errors);
    if (!first) return;
    scroll.current?.scrollTo({ y: Math.max(0, (ys.current[first] ?? 0) - 16), animated: true });
    setTimeout(() => inputs.current[first]?.focus?.(), 250);
  };
  return { scroll, anchor, inputRef, toFirstError };
}
