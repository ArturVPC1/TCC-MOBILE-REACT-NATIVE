import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Music } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { Button, Card, TextField, Txt } from '../components/ui';
import { DEMO, useAuth } from '../data/auth';
import { colors } from '../theme';

const schema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('E-mail inválido.'),
  password: z.string().min(1, 'Informe a senha.'),
});
type Form = z.infer<typeof schema>;

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (v) => {
    setError('');
    try { await signIn(v.email, v.password); } catch (e) { setError((e as Error).message); }
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Music size={28} color="#fff" strokeWidth={1.75} />
          </View>
          <Txt variant="display" style={{ marginTop: 16 }}>SONATA</Txt>
          <Txt variant="body" style={{ color: colors.muted }}>Para Escolas de Música</Txt>
        </View>

        <Card style={{ gap: 16 }}>
          <View>
            <Txt variant="title">Entrar</Txt>
            <Txt variant="caption" style={{ marginTop: 2 }}>Acesse com sua conta de administrador.</Txt>
          </View>

          <Controller control={control} name="email" render={({ field }) => (
            <TextField label="E-mail" required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur}
              placeholder="admin@exemplo.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
              textContentType="username" error={errors.email?.message} />
          )} />

          <Controller control={control} name="password" render={({ field }) => (
            <TextField label="Senha" required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur}
              placeholder="Sua senha" secureTextEntry={!show} autoCapitalize="none" textContentType="password"
              onSubmitEditing={onSubmit} error={errors.password?.message}
              rightElement={
                <Pressable onPress={() => setShow((s) => !s)} accessibilityLabel={show ? 'Ocultar senha' : 'Mostrar senha'} hitSlop={12}>
                  {show ? <EyeOff size={20} color={colors.placeholder} strokeWidth={1.75} /> : <Eye size={20} color={colors.placeholder} strokeWidth={1.75} />}
                </Pressable>
              } />
          )} />

          {error ? (
            <View style={{ backgroundColor: colors.dangerSoft, borderRadius: 8, padding: 12 }}>
              <Txt variant="caption" style={{ color: colors.danger }}>{error}</Txt>
            </View>
          ) : null}

          <Button label="Entrar" onPress={onSubmit} loading={isSubmitting} fullWidth />
        </Card>

        <Txt variant="caption" style={{ textAlign: 'center', marginTop: 16 }}>
          Protótipo · use {DEMO.email} / {DEMO.password}
        </Txt>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
