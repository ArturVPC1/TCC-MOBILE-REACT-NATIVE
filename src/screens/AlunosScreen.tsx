import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SearchX, Users } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { StudentRow } from '../components/rows/Rows';
import { Chip, EmptyState, ErrorState, FAB, InstrumentChip, ScreenHeader, SearchBar, Skeleton, useActionSheet, useConfirm, useToast } from '../components/ui';
import { formatNumber, normalize } from '../lib/text';
import { api } from '../services/api';
import { colors } from '../theme';
import { Student, StudentStatus } from '../types/domain';

type Filter = 'todos' | StudentStatus;
const PAGE = 20;

export function AlunosScreen({ navigation }: { navigation: any }) {
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const sheet = useActionSheet();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');
  const [instrument, setInstrument] = useState('');
  const [limit, setLimit] = useState(PAGE);

  const students = useQuery({ queryKey: ['students', { all: true }], queryFn: () => api.students.list({}).then((r) => r.items) });
  const teachers = useQuery({ queryKey: ['teachers', { all: true }], queryFn: () => api.teachers.list({}).then((r) => r.items) });
  const all = students.data ?? [];

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StudentStatus }) => api.students.setStatus(id, status),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['teachers'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast(v.status === 'inativo' ? 'Aluno inativado.' : 'Aluno reativado.');
    },
    onError: () => toast('Não foi possível atualizar o aluno.', 'error'),
  });

  const counts = useMemo(() => ({
    todos: all.length,
    ativo: all.filter((s) => s.status === 'ativo').length,
    pendente: all.filter((s) => s.status === 'pendente').length,
    inativo: all.filter((s) => s.status === 'inativo').length,
  }), [all]);

  const items = useMemo(() => {
    const q = normalize(query);
    return all.filter((s) =>
      (filter === 'todos' || s.status === filter) &&
      (!instrument || s.instrument === instrument) &&
      (!q || normalize(`${s.name} ${s.email ?? ''} ${s.instrument}`).includes(q)),
    );
  }, [all, query, filter, instrument]);

  const filtering = filter !== 'todos' || !!instrument || !!query;
  const subtitle = students.isLoading ? 'Carregando…'
    : filtering ? `Mostrando ${formatNumber(items.length)} de ${formatNumber(all.length)}`
    : `${formatNumber(all.length)} ${all.length === 1 ? 'aluno matriculado' : 'alunos matriculados'}`;

  const clear = () => { setFilter('todos'); setInstrument(''); setQuery(''); };
  const edit = useCallback((s: Student) => navigation.navigate('AlunoForm', { studentId: s.id }), [navigation]);

  const longPress = useCallback((s: Student) => {
    const inactive = s.status === 'inativo';
    sheet({
      title: s.name,
      actions: [
        { label: 'Editar', onPress: () => edit(s) },
        {
          label: inactive ? 'Reativar' : 'Inativar',
          destructive: !inactive,
          onPress: async () => {
            if (inactive) { setStatus.mutate({ id: s.id, status: 'ativo' }); return; }
            const ok = await confirm({
              title: `Inativar ${s.name}?`,
              message: 'O aluno deixa de aparecer nas aulas, mas o histórico é mantido.',
              confirmLabel: 'Inativar', destructive: true,
            });
            if (ok) setStatus.mutate({ id: s.id, status: 'inativo' });
          },
        },
      ],
    });
  }, [sheet, confirm, edit, setStatus]);

  const teacherOf = (s: Student) => teachers.data?.find((t) => t.id === s.teacherId);
  const openForm = () => navigation.navigate('AlunoForm');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Alunos" subtitle={subtitle} />
      <View style={{ gap: 12, paddingBottom: 12 }}>
        <View style={{ paddingHorizontal: 20 }}>
          <SearchBar placeholder="Buscar por nome, e-mail ou instrumento" onSearch={(q) => { setQuery(q); setLimit(PAGE); }} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
          <Chip label={`Todos (${counts.todos})`} selected={filter === 'todos'} onPress={() => setFilter('todos')} />
          <Chip label={`Ativos (${counts.ativo})`} selected={filter === 'ativo'} onPress={() => setFilter('ativo')} />
          <Chip label={`Pendentes (${counts.pendente})`} selected={filter === 'pendente'} onPress={() => setFilter('pendente')} />
          <Chip label={`Inativos (${counts.inativo})`} selected={filter === 'inativo'} onPress={() => setFilter('inativo')} />
          <InstrumentChip value={instrument} onChange={setInstrument} />
        </ScrollView>
      </View>

      {students.isError ? (
        <ErrorState onRetry={students.refetch} />
      ) : students.isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={72} radius={12} />)}
        </View>
      ) : (
        <FlatList
          data={items.slice(0, limit)}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => <StudentRow s={item} teacher={teacherOf(item)} onPress={() => edit(item)} onLongPress={() => longPress(item)} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 96, gap: 12, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          onEndReachedThreshold={0.4}
          onEndReached={() => items.length > limit && setLimit((l) => l + PAGE)}
          refreshControl={<RefreshControl refreshing={students.isRefetching} onRefresh={() => students.refetch()} />}
          ListEmptyComponent={
            filtering ? (
              <EmptyState icon={<SearchX size={24} color={colors.muted} strokeWidth={1.75} />} title="Nenhum resultado" text="Tente outro nome ou limpe os filtros." actionLabel="Limpar filtros" onAction={clear} />
            ) : (
              <EmptyState icon={<Users size={24} color={colors.muted} strokeWidth={1.75} />} title="Nenhum aluno matriculado" text="Matricule o primeiro aluno para começar a montar a agenda." actionLabel="Matricular aluno" onAction={openForm} />
            )
          }
        />
      )}
      <FAB label="Matricular novo aluno" onPress={openForm} />
    </View>
  );
}
