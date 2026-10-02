import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Music } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { Banner, Button, Card, TextField, useToast, Txt } from '../components/ui';
import { DEMO, useAuth } from '../data/auth';
import { ApiError } from '../services/api';
import { colors, fonts } from '../theme';

const schema = z.object({
  email: z.string().trim().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  password: z.string().min(1, 'Informe sua senha').min(6, 'A senha deve ter ao menos 6 caracteres'),
});
type Form = z.infer<typeof schema>;

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { signIn } = useAuth();
  const toast = useToast();
  const passRef = useRef<TextInput>(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (v) => {
    setError('');
    try {
      await signIn(v.email, v.password);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setError('E-mail ou senha incorretos.');
        setValue('password', '');
        setTimeout(() => passRef.current?.focus(), 100);
      } else {
        setError('Não foi possível conectar. Verifique sua internet.');
      }
    }
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingTop: insets.top + Math.max(48, height * 0.15) - 28, paddingBottom: insets.bottom + 20 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Music size={28} color="#fff" strokeWidth={1.75} />
          </View>
          <Txt variant="display" style={{ fontSize: 24, lineHeight: 30, marginTop: 12 }}>SONATA</Txt>
          <Txt variant="body" style={{ color: colors.muted }}>Para Escolas de Música</Txt>
        </View>

        <Card style={{ gap: 16, marginTop: 32, padding: 20, borderRadius: 16 }}>
          <View>
            <Txt variant="title">Entrar</Txt>
            <Txt variant="caption" style={{ marginTop: 2 }}>Acesse sua conta para continuar.</Txt>
          </View>

          <Controller control={control} name="email" render={({ field }) => (
            <TextField label="E-mail" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur}
              placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
              autoComplete="email" textContentType="emailAddress" returnKeyType="next" editable={!isSubmitting}
              onSubmitEditing={() => passRef.current?.focus()} error={errors.email?.message} />
          )} />

          <Controller control={control} name="password" render={({ field }) => (
            <TextField ref={passRef} label="Senha" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur}
              placeholder="••••••••" secureTextEntry={!show} autoCapitalize="none" autoComplete="password" textContentType="password"
              returnKeyType="go" editable={!isSubmitting} onSubmitEditing={onSubmit} error={errors.password?.message}
              rightElement={
                <Pressable onPress={() => setShow((s) => !s)} accessibilityLabel={show ? 'Ocultar senha' : 'Mostrar senha'} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -12 }}>
                  {show ? <EyeOff size={20} color={colors.placeholder} strokeWidth={1.75} /> : <Eye size={20} color={colors.placeholder} strokeWidth={1.75} />}
                </Pressable>
              } />
          )} />

          <Pressable onPress={() => toast('Recurso em breve')} accessibilityRole="link" style={{ alignSelf: 'flex-end' }}>
            <Txt variant="caption" style={{ fontFamily: fonts.medium, color: colors.foreground }}>Esqueci minha senha</Txt>
          </Pressable>

          {error ? <Banner text={error} /> : null}

          <Button label="Entrar" onPress={onSubmit} loading={isSubmitting} fullWidth />
        </Card>

        <Txt variant="caption" style={{ textAlign: 'center', marginTop: 16 }}>
          Protótipo · {DEMO.email} / {DEMO.password}
        </Txt>
        <View style={{ flex: 1 }} />
        <Txt variant="micro" style={{ color: colors.muted, textAlign: 'center', marginTop: 24 }}>© 2026 SONATA</Txt>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
