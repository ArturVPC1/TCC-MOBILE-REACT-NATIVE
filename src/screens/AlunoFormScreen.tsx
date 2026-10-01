import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { differenceInYears, parseISO } from 'date-fns';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { z } from 'zod';
import { Button, DateField, FormFooter, FormHeader, SelectField, TextField, Txt, useToast } from '../components/ui';
import { createStudent } from '../data/repository';
import { INSTRUMENTS } from '../data/types';
import { brToIso, maskPhone, onlyDigits } from '../lib/text';
import { colors } from '../theme';

const schema = z
  .object({
    name: z.string().trim().min(3, 'Informe o nome completo.'),
    email: z.string().trim().min(1, 'Informe o e-mail.').email('E-mail inválido.'),
    phone: z.string().refine((v) => [10, 11].includes(onlyDigits(v).length), 'Telefone inválido.'),
    birthDate: z.string().refine((v) => {
      const iso = brToIso(v);
      return !!iso && parseISO(iso) <= new Date();
    }, 'Data inválida.'),
    instrument: z.string().min(1, 'Selecione o instrumento.'),
    guardian: z.string().trim().optional(),
    notes: z.string().max(500).optional(),
  })
  .superRefine((v, ctx) => {
    const iso = brToIso(v.birthDate);
    if (iso && differenceInYears(new Date(), parseISO(iso)) < 18 && !v.guardian?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['guardian'], message: 'Informe o responsável (aluno menor de 18 anos).' });
    }
  });
type Form = z.infer<typeof schema>;

export function AlunoFormScreen({ navigation }: { navigation: any }) {
  const qc = useQueryClient();
  const toast = useToast();
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const { control, handleSubmit, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', birthDate: '', instrument: '', guardian: '', notes: '' },
  });

  const birthIso = brToIso(watch('birthDate'));
  const isMinor = !!birthIso && differenceInYears(new Date(), parseISO(birthIso)) < 18;

  const m = useMutation({
    mutationFn: (v: Form) => createStudent({
      name: v.name.trim(), email: v.email.trim(), phone: v.phone, birthDate: brToIso(v.birthDate)!,
      instrument: v.instrument, guardian: v.guardian?.trim() || undefined, notes: v.notes?.trim() || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast('Aluno matriculado com sucesso.');
      navigation.goBack();
    },
    onError: () => toast('Não foi possível matricular o aluno.', 'error'),
  });

  const submit = handleSubmit((v) => m.mutate(v));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FormHeader title="Matricular aluno" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
          <Txt variant="section">Dados do aluno</Txt>
          <Controller control={control} name="name" render={({ field }) => (
            <TextField label="Nome completo" required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur}
              autoCapitalize="words" returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()} error={errors.name?.message} />
          )} />
          <Controller control={control} name="email" render={({ field }) => (
            <TextField ref={emailRef} label="E-mail" required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur}
              keyboardType="email-address" autoCapitalize="none" returnKeyType="next" onSubmitEditing={() => phoneRef.current?.focus()} error={errors.email?.message} />
          )} />
          <Controller control={control} name="phone" render={({ field }) => (
            <TextField ref={phoneRef} label="Telefone" required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur}
              mask={maskPhone} keyboardType="phone-pad" placeholder="(11) 91234-5678" maxLength={15} error={errors.phone?.message} />
          )} />
          <Controller control={control} name="birthDate" render={({ field }) => (
            <DateField label="Data de nascimento" required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.birthDate?.message} />
          )} />

          <Txt variant="section" style={{ marginTop: 8 }}>Matrícula</Txt>
          <Controller control={control} name="instrument" render={({ field }) => (
            <SelectField label="Instrumento" required options={INSTRUMENTS} value={field.value} onChange={field.onChange} error={errors.instrument?.message} />
          )} />
          {isMinor || errors.guardian ? (
            <Controller control={control} name="guardian" render={({ field }) => (
              <TextField label="Responsável" required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur}
                autoCapitalize="words" helper="Obrigatório para alunos menores de 18 anos." error={errors.guardian?.message} />
            )} />
          ) : null}
          <Controller control={control} name="notes" render={({ field }) => (
            <TextField label="Observações" multiline maxLength={500} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} />
          )} />
        </ScrollView>
      </KeyboardAvoidingView>
      <FormFooter>
        <Button label="Cancelar" variant="outline" onPress={() => navigation.goBack()} disabled={m.isPending} />
        <Button label="Matricular" onPress={submit} loading={m.isPending} />
      </FormFooter>
    </View>
  );
}
