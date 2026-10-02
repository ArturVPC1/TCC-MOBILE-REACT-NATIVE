import { CircleAlert } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { colors } from '../../theme';
import { Button } from './Button';
import { Txt } from './Txt';

export function EmptyState({ icon, title, text, actionLabel, onAction }: { icon: React.ReactNode; title: string; text?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={{ alignItems: 'center', padding: 32 }}>
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{icon}</View>
      <Txt variant="section" style={{ textAlign: 'center' }}>{title}</Txt>
      {text ? <Txt variant="caption" style={{ textAlign: 'center', maxWidth: 280, marginTop: 4, fontSize: 14 }}>{text}</Txt> : null}
      {actionLabel ? <View style={{ marginTop: 16 }}><Button label={actionLabel} onPress={onAction} variant="outline" size="sm" /></View> : null}
    </View>
  );
}

export function ErrorState({ onRetry, text = 'Não foi possível carregar os dados.' }: { onRetry: () => void; text?: string }) {
  return <EmptyState icon={<CircleAlert size={24} color={colors.muted} strokeWidth={1.75} />} title="Algo deu errado" text={text} actionLabel="Tentar novamente" onAction={onRetry} />;
}

export function Skeleton({ width, height, radius = 8, style }: { width?: number | `${number}%`; height: number; radius?: number; style?: object }) {
  const o = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(o, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(o, { toValue: 0.5, duration: 500, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, [o]);
  return <Animated.View style={[{ width: width ?? '100%', height, borderRadius: radius, backgroundColor: '#EDEDED', opacity: o }, style]} />;
}
