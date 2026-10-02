import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GraduationCap, SearchX } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { TeacherRow } from '../components/rows/Rows';
import { Chip, EmptyState, ErrorState, FAB, InstrumentChip, ScreenHeader, SearchBar, Skeleton, useActionSheet, useConfirm, useToast } from '../components/ui';
import { formatNumber, normalize } from '../lib/text';
import { ApiError, api } from '../services/api';
import { colors } from '../theme';
import { Teacher, TeacherStatus } from '../types/domain';

type Filter = 'todos' | TeacherStatus;
const PAGE = 20;

export function ProfessoresScreen({ navigation }: { navigation: any }) {
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const sheet = useActionSheet();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');
  const [instrument, setInstrument] = useState('');
  const [limit, setLimit] = useState(PAGE);

  const teachers = useQuery({ queryKey: ['teachers', { all: true }], queryFn: () => api.teachers.list({}).then((r) => r.items) });
  const all = teachers.data ?? [];

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TeacherStatus }) => api.teachers.setStatus(id, status),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['teachers'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast(v.status === 'inativo' ? 'Professor inativado.' : 'Professor reativado.');
    },
    onError: (e) => toast(e instanceof ApiError ? e.message : 'Não foi possível atualizar o professor.', 'error'),
  });

  const counts = useMemo(() => ({
    todos: all.length,
    ativo: all.filter((t) => t.status === 'ativo').length,
    inativo: all.filter((t) => t.status === 'inativo').length,
  }), [all]);

  const items = useMemo(() => {
    const q = normalize(query);
    return all.filter((t) =>
      (filter === 'todos' || t.status === filter) &&
      (!instrument || t.instruments.includes(instrument)) &&
      (!q || normalize(`${t.name} ${t.instruments.join(' ')}`).includes(q)),
    );
  }, [all, query, filter, instrument]);

  const filtering = filter !== 'todos' || !!instrument || !!query;
  const subtitle = teachers.isLoading ? 'Carregando…'
    : filtering ? `Mostrando ${formatNumber(items.length)} de ${formatNumber(all.length)}`
    : `${formatNumber(all.length)} ${all.length === 1 ? 'professor cadastrado' : 'professores cadastrados'}`;

  const clear = () => { setFilter('todos'); setInstrument(''); setQuery(''); };
  const edit = useCallback((t: Teacher) => navigation.navigate('ProfessorForm', { teacherId: t.id }), [navigation]);
  const openForm = () => navigation.navigate('ProfessorForm');

  const longPress = useCallback((t: Teacher) => {
    const inactive = t.status === 'inativo';
    sheet({
      title: t.name,
      actions: [
        { label: 'Editar', onPress: () => edit(t) },
        {
          label: inactive ? 'Reativar' : 'Inativar',
          destructive: !inactive,
          onPress: async () => {
            if (inactive) { setStatus.mutate({ id: t.id, status: 'ativo' }); return; }
            const n = t.studentsCount ?? 0;
            if (n > 0) { toast(`Este professor tem ${n} alunos ativos. Reatribua-os antes de inativar.`, 'error'); return; }
            const ok = await confirm({ title: `Inativar ${t.name}?`, message: 'O professor deixa de aparecer na matrícula de novos alunos.', confirmLabel: 'Inativar', destructive: true });
            if (ok) setStatus.mutate({ id: t.id, status: 'inativo' });
          },
        },
      ],
    });
  }, [sheet, confirm, edit, setStatus, toast]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Professores" subtitle={subtitle} />
      <View style={{ gap: 12, paddingBottom: 12 }}>
        <View style={{ paddingHorizontal: 20 }}>
          <SearchBar placeholder="Buscar por nome ou instrumento" onSearch={(q) => { setQuery(q); setLimit(PAGE); }} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
          <Chip label={`Todos (${counts.todos})`} selected={filter === 'todos'} onPress={() => setFilter('todos')} />
          <Chip label={`Ativos (${counts.ativo})`} selected={filter === 'ativo'} onPress={() => setFilter('ativo')} />
          <Chip label={`Inativos (${counts.inativo})`} selected={filter === 'inativo'} onPress={() => setFilter('inativo')} />
          <InstrumentChip value={instrument} onChange={setInstrument} />
        </ScrollView>
      </View>

      {teachers.isError ? (
        <ErrorState onRetry={teachers.refetch} />
      ) : teachers.isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={84} radius={12} />)}
        </View>
      ) : (
        <FlatList
          data={items.slice(0, limit)}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => <TeacherRow t={item} onPress={() => edit(item)} onLongPress={() => longPress(item)} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 96, gap: 12, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          onEndReachedThreshold={0.4}
          onEndReached={() => items.length > limit && setLimit((l) => l + PAGE)}
          refreshControl={<RefreshControl refreshing={teachers.isRefetching} onRefresh={() => teachers.refetch()} />}
          ListEmptyComponent={
            filtering ? (
              <EmptyState icon={<SearchX size={24} color={colors.muted} strokeWidth={1.75} />} title="Nenhum resultado" text="Tente outro nome ou limpe os filtros." actionLabel="Limpar filtros" onAction={clear} />
            ) : (
              <EmptyState icon={<GraduationCap size={24} color={colors.muted} strokeWidth={1.75} />} title="Nenhum professor cadastrado" text="Cadastre professores para vinculá-los a alunos e aulas." actionLabel="Cadastrar professor" onAction={openForm} />
            )
          }
        />
      )}
      <FAB label="Cadastrar novo professor" onPress={openForm} />
    </View>
  );
}
