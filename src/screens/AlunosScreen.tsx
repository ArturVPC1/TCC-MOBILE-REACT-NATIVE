import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { Avatar, Badge, Card, Chip, EmptyState, ErrorState, FAB, ScreenHeader, SearchBar, Skeleton, Txt } from '../components/ui';
import { listStudents } from '../data/repository';
import { Student } from '../data/types';
import { formatNumber, normalize } from '../lib/text';
import { colors } from '../theme';

type Filter = 'todos' | 'ativo' | 'inativo';

function StudentRow({ s }: { s: Student }) {
  return (
    <Card shadow={false} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
      <Avatar name={s.name} />
      <View style={{ flex: 1 }}>
        <Txt variant="bodyStrong" numberOfLines={1}>{s.name}</Txt>
        <Txt variant="caption" numberOfLines={1}>{s.instrument} · {s.phone}</Txt>
      </View>
      <Badge label={s.status === 'ativo' ? 'Ativo' : 'Inativo'} variant={s.status === 'ativo' ? 'solid' : 'outline'} />
    </Card>
  );
}

export function AlunosScreen({ navigation }: { navigation: any }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({ queryKey: ['students'], queryFn: listStudents });

  const items = useMemo(() => {
    const q = normalize(query);
    return (data ?? []).filter((s) =>
      (filter === 'todos' || s.status === filter) &&
      (!q || normalize(`${s.name} ${s.email} ${s.instrument}`).includes(q)),
    );
  }, [data, query, filter]);

  const openForm = () => navigation.navigate('AlunoForm');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Alunos" subtitle={data ? `${formatNumber(data.length)} matriculados` : 'Carregando…'} />
      <View style={{ paddingHorizontal: 20, gap: 12, paddingBottom: 12 }}>
        <SearchBar placeholder="Buscar por nome ou instrumento" onSearch={setQuery} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label="Todos" selected={filter === 'todos'} onPress={() => setFilter('todos')} />
          <Chip label="Ativos" selected={filter === 'ativo'} onPress={() => setFilter('ativo')} />
          <Chip label="Inativos" selected={filter === 'inativo'} onPress={() => setFilter('inativo')} />
        </ScrollView>
      </View>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={68} radius={12} />)}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => <StudentRow s={item} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 96, gap: 12, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <EmptyState
              icon={<Users size={24} color={colors.muted} strokeWidth={1.75} />}
              title={query || filter !== 'todos' ? 'Nenhum aluno encontrado' : 'Nenhum aluno matriculado'}
              text={query || filter !== 'todos' ? 'Tente ajustar a busca ou o filtro.' : 'Matricule o primeiro aluno para começar.'}
              actionLabel={query || filter !== 'todos' ? undefined : 'Matricular aluno'}
              onAction={openForm}
            />
          }
        />
      )}
      <FAB label="Matricular aluno" onPress={openForm} />
    </View>
  );
}
