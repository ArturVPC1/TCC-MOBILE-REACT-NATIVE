import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseISO } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { z } from 'zod';
import { FChips, FDate, FSegment, FText } from '../components/form/Fields';
import { Banner, Button, FormFooter, FormHeader, PhotoPicker, Skeleton, Txt, useConfirm, useToast } from '../components/ui';
import { useFormScroll } from '../lib/formScroll';
import { EMAIL_RE, brToIso, isoToBr, maskPhone, onlyDigits, phoneDigitsOk, todayBr } from '../lib/text';
import { ApiError, api } from '../services/api';
import { colors } from '../theme';
import { INSTRUMENTS, Teacher, WEEKDAYS } from '../types/domain';

const schema = z
  .object({
    photoUri: z.string().optional(),
    title: z.enum(['Prof.', 'Profa.', '']),
    name: z.string().trim().min(3, 'Informe o nome completo'),
    email: z.string().trim().regex(EMAIL_RE, 'Informe um e-mail válido'),
    phone: z.string().refine(phoneDigitsOk, 'Informe um telefone válido'),
    birthDate: z.string(),
    instruments: z.array(z.string()).min(1, 'Selecione ao menos um instrumento'),
    qualification: z.string(),
    startDate: z.string().refine((v) => !!brToIso(v), 'Informe a data de início'),
    availableDays: z.array(z.string()),
    preferredRoomIds: z.array(z.string()),
    status: z.enum(['ativo', 'inativo']),
    notes: z.string().max(500, 'Máximo de 500 caracteres'),
  })
  .superRefine((v, ctx) => {
    if (!v.birthDate) return;
    const iso = brToIso(v.birthDate);
    if (!iso) ctx.addIssue({ code: 'custom', path: ['birthDate'], message: 'Informe uma data válida' });
    else if (parseISO(iso) > new Date()) ctx.addIssue({ code: 'custom', path: ['birthDate'], message: 'A data não pode ser futura' });
  });
type Form = z.infer<typeof schema>;

const ORDER = ['name', 'email', 'phone', 'birthDate', 'instruments', 'qualification', 'startDate', 'notes'];
const DEFAULTS: Form = {
  photoUri: undefined, title: '', name: '', email: '', phone: '', birthDate: '', instruments: [], qualification: '',
  startDate: todayBr(), availableDays: [], preferredRoomIds: [], status: 'ativo', notes: '',
};

const toForm = (t: Teacher): Form => ({
  photoUri: t.photoUri, title: t.title ?? '', name: t.name, email: t.email, phone: maskPhone(t.phone),
  birthDate: t.birthDate ? isoToBr(t.birthDate) : '', instruments: t.instruments, qualification: t.qualification ?? '',
  startDate: isoToBr(t.startDate), availableDays: t.availableDays ?? [], preferredRoomIds: t.preferredRoomIds ?? [],
  status: t.status, notes: t.notes ?? '',
});

const toPayload = (v: Form): Omit<Teacher, 'id' | 'studentsCount'> => ({
  photoUri: v.photoUri, title: v.title || undefined, name: v.name.trim(), email: v.email.trim(), phone: onlyDigits(v.phone),
  birthDate: v.birthDate ? brToIso(v.birthDate)! : undefined, instruments: v.instruments,
  qualification: v.qualification.trim() || undefined, startDate: brToIso(v.startDate)!,
  availableDays: v.availableDays.length ? (v.availableDays as Teacher['availableDays']) : undefined,
  preferredRoomIds: v.preferredRoomIds.length ? v.preferredRoomIds : undefined, status: v.status, notes: v.notes.trim() || undefined,
});

export function ProfessorFormScreen({ navigation, route }: { navigation: any; route: any }) {
  const teacherId: string | undefined = route.params?.teacherId;
  const editing = !!teacherId;
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const skipGuard = useRef(false);
  const [failure, setFailure] = useState('');
  const fs = useFormScroll(ORDER);

  const { control, handleSubmit, watch, setValue, setError, reset, formState: { isDirty } } = useForm<Form>({
    resolver: zodResolver(schema), defaultValues: DEFAULTS, mode: 'onBlur',
  });

  const teacher = useQuery({ queryKey: ['teacher', teacherId], queryFn: () => api.teachers.get(teacherId!), enabled: editing });
  useEffect(() => { if (teacher.data) reset(toForm(teacher.data)); }, [teacher.data, reset]);
  const rooms = useQuery({ queryKey: ['rooms'], queryFn: api.rooms.list });

  const [name, photoUri] = watch(['name', 'photoUri']);

  useEffect(() => navigation.addListener('beforeRemove', (e: any) => {
    if (skipGuard.current || !isDirty) return;
    e.preventDefault();
    confirm({ title: 'Descartar alterações?', message: 'Os dados preenchidos serão perdidos.', confirmLabel: 'Descartar', cancelLabel: 'Continuar editando', destructive: true })
      .then((ok) => { if (ok) { skipGuard.current = true; navigation.dispatch(e.data.action); } });
  }), [navigation, isDirty, confirm]);

  const done = (msg: string) => {
    ['teachers', 'teacher', 'students', 'dashboard'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
    toast(msg);
    skipGuard.current = true;
    navigation.goBack();
  };

  const save = useMutation({
    mutationFn: (v: Form) => (editing ? api.teachers.update(teacherId!, toPayload(v)) : api.teachers.create(toPayload(v))),
    onSuccess: () => done(editing ? 'Alterações salvas.' : 'Professor cadastrado com sucesso.'),
    onError: (e) => {
      if (e instanceof ApiError && e.code === 'duplicate_email') {
        setError('email', { message: e.fieldErrors?.email ?? 'Já existe um professor com este e-mail.' });
        fs.toFirstError({ email: true });
      } else setFailure('Não foi possível salvar. Tente novamente.');
    },
  });

  const blockedInactive = (n: number) => `Este professor tem ${n} alunos ativos. Reatribua-os antes de inativar.`;

  const onValid = (v: Form) => {
    setFailure('');
    const n = teacher.data?.studentsCount ?? 0;
    if (editing && v.status === 'inativo' && teacher.data?.status === 'ativo' && n > 0) { setFailure(blockedInactive(n)); return; }
    save.mutate(v);
  };

  const deactivate = async () => {
    const n = teacher.data?.studentsCount ?? 0;
    if (n > 0) { setFailure(blockedInactive(n)); return; }
    const ok = await confirm({ title: `Inativar ${teacher.data?.name ?? 'professor'}?`, message: 'O professor deixa de aparecer na matrícula de novos alunos.', confirmLabel: 'Inativar', destructive: true });
    if (!ok) return;
    try { await api.teachers.setStatus(teacherId!, 'inativo'); done('Professor inativado.'); }
    catch (e) { setFailure(e instanceof ApiError ? e.message : 'Não foi possível inativar. Tente novamente.'); }
  };

  const submit = handleSubmit(onValid, (errs) => fs.toFirstError(errs));
  const w = (k: string, children: React.ReactNode) => <View {...fs.anchor(k)}>{children}</View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FormHeader title={editing ? 'Editar professor' : 'Cadastrar professor'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {editing && teacher.isLoading ? (
          <View style={{ padding: 20, gap: 16 }}>{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={48} />)}</View>
        ) : (
          <ScrollView ref={fs.scroll} contentContainerStyle={{ padding: 20, paddingBottom: 112, gap: 20 }} keyboardShouldPersistTaps="handled">
            {failure ? <Banner text={failure} /> : null}

            <PhotoPicker name={name} uri={photoUri} onChange={(u) => setValue('photoUri', u, { shouldDirty: true })} />

            <Txt variant="section" style={{ marginTop: 8 }}>Dados pessoais</Txt>
            <FSegment control={control} name="title" label="Tratamento" options={[{ value: 'Prof.', label: 'Prof.' }, { value: 'Profa.', label: 'Profa.' }, { value: '', label: 'Nenhum' }]} />
            {w('name', <FText control={control} name="name" inputRef={fs.inputRef('name')} label="Nome completo" required autoCapitalize="words" />)}
            {w('email', <FText control={control} name="email" inputRef={fs.inputRef('email')} label="E-mail" required keyboardType="email-address" autoCapitalize="none" />)}
            {w('phone', <FText control={control} name="phone" inputRef={fs.inputRef('phone')} label="Telefone" required mask={maskPhone} keyboardType="phone-pad" placeholder="(11) 91234-5678" maxLength={15} />)}
            {w('birthDate', <FDate control={control} name="birthDate" inputRef={fs.inputRef('birthDate')} label="Data de nascimento" />)}

            <Txt variant="section" style={{ marginTop: 8 }}>Atuação</Txt>
            {w('instruments', <FChips control={control} name="instruments" label="Instrumentos que leciona" required options={INSTRUMENTS} />)}
            {w('qualification', <FText control={control} name="qualification" inputRef={fs.inputRef('qualification')} label="Formação / especialização" placeholder="Ex.: Bacharelado em Música" />)}
            {w('startDate', <FDate control={control} name="startDate" inputRef={fs.inputRef('startDate')} label="Data de início" required />)}
            <FChips control={control} name="availableDays" label="Dias disponíveis" options={WEEKDAYS} />
            {(rooms.data?.length ?? 0) > 0 ? (
              <FChips control={control} name="preferredRoomIds" label="Salas preferidas" options={(rooms.data ?? []).map((r) => ({ value: r.id, label: r.name }))} />
            ) : null}

            {editing ? <FSegment control={control} name="status" label="Status" options={[{ value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }]} /> : null}

            <Txt variant="section" style={{ marginTop: 8 }}>Observações</Txt>
            {w('notes', <FText control={control} name="notes" inputRef={fs.inputRef('notes')} multiline maxLength={500} />)}

            {editing && teacher.data?.status !== 'inativo' ? (
              <Button label="Inativar professor" variant="danger" onPress={deactivate} fullWidth />
            ) : null}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
      <FormFooter>
        <Button label="Cancelar" variant="outline" onPress={() => navigation.goBack()} disabled={save.isPending} />
        <Button label={editing ? 'Salvar alterações' : 'Cadastrar professor'} onPress={submit} loading={save.isPending} />
      </FormFooter>
    </View>
  );
}
