import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { differenceInYears, parseISO } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { z } from 'zod';
import { FChips, FDate, FSegment, FSelect, FText } from '../components/form/Fields';
import { Banner, Button, FormFooter, FormHeader, PhotoPicker, Skeleton, Txt, useConfirm, useToast } from '../components/ui';
import { useFormScroll } from '../lib/formScroll';
import { EMAIL_RE, ageFromIso, brToIso, isoToBr, maskPhone, onlyDigits, phoneDigitsOk, todayBr } from '../lib/text';
import { api } from '../services/api';
import { colors } from '../theme';
import { INSTRUMENTS, Student } from '../types/domain';

const schema = z
  .object({
    photoUri: z.string().optional(),
    name: z.string().trim().min(3, 'Informe o nome completo'),
    birthDate: z.string(),
    phone: z.string(),
    email: z.string(),
    guardianName: z.string(),
    guardianPhone: z.string(),
    instrument: z.string().min(1, 'Selecione o instrumento'),
    classId: z.string(),
    teacherId: z.string(),
    enrolledAt: z.string(),
    status: z.enum(['ativo', 'pendente', 'inativo']),
    notes: z.string().max(500, 'Máximo de 500 caracteres'),
  })
  .superRefine((v, ctx) => {
    const add = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
    const iso = brToIso(v.birthDate);
    let age: number | null = null;
    if (!iso) add('birthDate', 'Informe uma data válida');
    else if (parseISO(iso) > new Date()) add('birthDate', 'A data não pode ser futura');
    else {
      age = ageFromIso(iso);
      if (age > 100) add('birthDate', 'Informe uma data válida');
    }
    if (age !== null && age >= 18 && !phoneDigitsOk(v.phone)) add('phone', 'Informe um telefone válido');
    else if (v.phone && !phoneDigitsOk(v.phone)) add('phone', 'Informe um telefone válido');
    if (v.email.trim() && !EMAIL_RE.test(v.email.trim())) add('email', 'E-mail inválido');
    if (age !== null && age < 18) {
      if (!v.guardianName.trim()) add('guardianName', 'Informe o responsável');
      if (!phoneDigitsOk(v.guardianPhone)) add('guardianPhone', 'Informe o telefone do responsável');
    }
    if (!brToIso(v.enrolledAt)) add('enrolledAt', 'Informe a data da matrícula');
  });
type Form = z.infer<typeof schema>;

const ORDER = ['name', 'birthDate', 'phone', 'email', 'guardianName', 'guardianPhone', 'instrument', 'classId', 'teacherId', 'enrolledAt', 'notes'];
const DEFAULTS: Form = {
  photoUri: undefined, name: '', birthDate: '', phone: '', email: '', guardianName: '', guardianPhone: '',
  instrument: '', classId: '', teacherId: '', enrolledAt: todayBr(), status: 'ativo', notes: '',
};

const toForm = (s: Student): Form => ({
  photoUri: s.photoUri, name: s.name, birthDate: isoToBr(s.birthDate), phone: maskPhone(s.phone ?? ''), email: s.email ?? '',
  guardianName: s.guardianName ?? '', guardianPhone: maskPhone(s.guardianPhone ?? ''), instrument: s.instrument,
  classId: s.classId ?? '', teacherId: s.teacherId ?? '', enrolledAt: isoToBr(s.enrolledAt), status: s.status, notes: s.notes ?? '',
});

const toPayload = (v: Form): Omit<Student, 'id'> => ({
  photoUri: v.photoUri, name: v.name.trim(), birthDate: brToIso(v.birthDate)!, phone: onlyDigits(v.phone) || undefined,
  email: v.email.trim() || undefined, guardianName: v.guardianName.trim() || undefined,
  guardianPhone: onlyDigits(v.guardianPhone) || undefined, instrument: v.instrument, classId: v.classId || undefined,
  teacherId: v.teacherId || undefined, enrolledAt: brToIso(v.enrolledAt)!, status: v.status, notes: v.notes.trim() || undefined,
});

export function AlunoFormScreen({ navigation, route }: { navigation: any; route: any }) {
  const studentId: string | undefined = route.params?.studentId;
  const editing = !!studentId;
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const skipGuard = useRef(false);
  const [failure, setFailure] = useState('');
  const fs = useFormScroll(ORDER);

  const { control, handleSubmit, watch, setValue, reset, formState: { isDirty } } = useForm<Form>({
    resolver: zodResolver(schema), defaultValues: DEFAULTS, mode: 'onBlur',
  });

  const student = useQuery({ queryKey: ['student', studentId], queryFn: () => api.students.get(studentId!), enabled: editing });
  useEffect(() => { if (student.data) reset(toForm(student.data)); }, [student.data, reset]);

  const [name, birth, instrument, photoUri] = watch(['name', 'birthDate', 'instrument', 'photoUri']);
  const birthIso = brToIso(birth);
  const age = birthIso ? ageFromIso(birthIso) : null;
  const isMinor = age !== null && age >= 0 && age < 18;

  const classes = useQuery({ queryKey: ['classes', instrument], queryFn: () => api.classes.listByInstrument(instrument), enabled: !!instrument });
  const teachers = useQuery({
    queryKey: ['teachers', { instrument, status: 'ativo' }],
    queryFn: () => api.teachers.list({ instrument, status: 'ativo' }).then((r) => r.items),
    enabled: !!instrument,
  });

  // Descartar alterações não salvas
  useEffect(() => navigation.addListener('beforeRemove', (e: any) => {
    if (skipGuard.current || !isDirty) return;
    e.preventDefault();
    confirm({ title: 'Descartar alterações?', message: 'Os dados preenchidos serão perdidos.', confirmLabel: 'Descartar', cancelLabel: 'Continuar editando', destructive: true })
      .then((ok) => { if (ok) { skipGuard.current = true; navigation.dispatch(e.data.action); } });
  }), [navigation, isDirty, confirm]);

  const done = (msg: string) => {
    ['students', 'student', 'teachers', 'dashboard'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
    toast(msg);
    skipGuard.current = true;
    navigation.goBack();
  };

  const save = useMutation({
    mutationFn: (v: Form) => (editing ? api.students.update(studentId!, toPayload(v)) : api.students.create(toPayload(v))),
    onSuccess: () => done(editing ? 'Alterações salvas.' : 'Aluno matriculado com sucesso.'),
    onError: () => setFailure('Não foi possível salvar. Tente novamente.'),
  });

  const deactivate = async () => {
    const ok = await confirm({ title: `Inativar ${student.data?.name ?? 'aluno'}?`, message: 'O aluno deixa de aparecer nas aulas, mas o histórico é mantido.', confirmLabel: 'Inativar', destructive: true });
    if (!ok) return;
    try { await api.students.setStatus(studentId!, 'inativo'); done('Aluno inativado.'); }
    catch { setFailure('Não foi possível inativar. Tente novamente.'); }
  };

  const submit = handleSubmit((v) => { setFailure(''); save.mutate(v); }, (errs) => fs.toFirstError(errs));
  const w = (k: string, children: React.ReactNode) => <View {...fs.anchor(k)}>{children}</View>;

  const turmaOptions = [{ value: '', label: 'Aula individual' }, ...(classes.data ?? []).map((c) => ({ value: c.id, label: c.name }))];
  const teacherOptions = [{ value: '', label: 'A definir' }, ...(teachers.data ?? []).map((t) => ({ value: t.id, label: `${t.title ? t.title + ' ' : ''}${t.name}` }))];
  const statusOptions = editing
    ? [{ value: 'ativo', label: 'Ativo' }, { value: 'pendente', label: 'Pendente' }, { value: 'inativo', label: 'Inativo' }]
    : [{ value: 'ativo', label: 'Ativo' }, { value: 'pendente', label: 'Pendente' }];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FormHeader title={editing ? 'Editar aluno' : 'Matricular aluno'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {editing && student.isLoading ? (
          <View style={{ padding: 20, gap: 16 }}>{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={48} />)}</View>
        ) : (
          <ScrollView ref={fs.scroll} contentContainerStyle={{ padding: 20, paddingBottom: 112, gap: 20 }} keyboardShouldPersistTaps="handled">
            {failure ? <Banner text={failure} /> : null}

            <PhotoPicker name={name} uri={photoUri} onChange={(u) => setValue('photoUri', u, { shouldDirty: true })} />

            <Txt variant="section" style={{ marginTop: 8 }}>Dados pessoais</Txt>
            {w('name', <FText control={control} name="name" inputRef={fs.inputRef('name')} label="Nome completo" required placeholder="Ex.: Ana Silva" autoCapitalize="words" />)}
            {w('birthDate', <FDate control={control} name="birthDate" inputRef={fs.inputRef('birthDate')} label="Data de nascimento" required helper={age !== null && age >= 0 && age <= 100 ? `Idade: ${age} ${age === 1 ? 'ano' : 'anos'}` : undefined} />)}
            {w('phone', <FText control={control} name="phone" inputRef={fs.inputRef('phone')} label="Telefone" required={!isMinor} mask={maskPhone} keyboardType="phone-pad" placeholder="(11) 91234-5678" maxLength={15} />)}
            {w('email', <FText control={control} name="email" inputRef={fs.inputRef('email')} label="E-mail" keyboardType="email-address" autoCapitalize="none" />)}

            {isMinor ? (
              <>
                <Txt variant="section" style={{ marginTop: 8 }}>Responsável</Txt>
                <Banner kind="info" text="Aluno menor de idade: informe um responsável." />
                {w('guardianName', <FText control={control} name="guardianName" inputRef={fs.inputRef('guardianName')} label="Nome do responsável" required autoCapitalize="words" />)}
                {w('guardianPhone', <FText control={control} name="guardianPhone" inputRef={fs.inputRef('guardianPhone')} label="Telefone do responsável" required mask={maskPhone} keyboardType="phone-pad" placeholder="(11) 91234-5678" maxLength={15} />)}
              </>
            ) : null}

            <Txt variant="section" style={{ marginTop: 8 }}>Matrícula</Txt>
            {w('instrument', <FSelect control={control} name="instrument" label="Instrumento" required options={INSTRUMENTS}
              onValue={() => { setValue('classId', ''); setValue('teacherId', ''); }} />)}
            {w('classId', <FSelect control={control} name="classId" label="Turma / curso" options={turmaOptions} disabled={!instrument} placeholder="Aula individual" />)}
            {w('teacherId', <FSelect control={control} name="teacherId" label="Professor" options={teacherOptions} disabled={!instrument} placeholder="A definir" />)}
            {w('enrolledAt', <FDate control={control} name="enrolledAt" inputRef={fs.inputRef('enrolledAt')} label="Data da matrícula" required />)}
            <FSegment control={control} name="status" label="Status" options={statusOptions} />

            <Txt variant="section" style={{ marginTop: 8 }}>Observações</Txt>
            {w('notes', <FText control={control} name="notes" inputRef={fs.inputRef('notes')} multiline maxLength={500} />)}

            {editing && student.data?.status !== 'inativo' ? (
              <Button label="Inativar aluno" variant="danger" onPress={deactivate} fullWidth />
            ) : null}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
      <FormFooter>
        <Button label="Cancelar" variant="outline" onPress={() => navigation.goBack()} disabled={save.isPending} />
        <Button label={editing ? 'Salvar alterações' : 'Matricular aluno'} onPress={submit} loading={save.isPending} />
      </FormFooter>
    </View>
  );
}
