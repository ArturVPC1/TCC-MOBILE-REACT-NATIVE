import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Avatar, Badge, Card, Txt } from '../ui';
import { LessonStatus } from '../../features/schedule/utils';
import { colors } from '../../theme';
import { Lesson, Student, Teacher } from '../../types/domain';

export const teacherShort = (t?: Teacher) => (t ? `${t.title ? t.title + ' ' : ''}${t.name.split(' ')[0]}` : undefined);
export const teacherFull = (t: Teacher) => `${t.title ? t.title + ' ' : ''}${t.name}`;

const STUDENT_BADGE = { ativo: ['Ativo', 'solid'], pendente: ['Pendente', 'soft'], inativo: ['Inativo', 'outline'] } as const;

export const StudentRow = React.memo(function StudentRow({ s, teacher, onPress, onLongPress }: {
  s: Student; teacher?: Teacher; onPress: () => void; onLongPress: () => void;
}) {
  const [label, variant] = STUDENT_BADGE[s.status];
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} accessibilityRole="button" style={({ pressed }) => pressed && { opacity: 0.7 }}>
      <Card shadow={false} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, minHeight: 72 }}>
        <Avatar name={s.name} photoUri={s.photoUri} />
        <View style={{ flex: 1 }}>
          <Txt variant="bodyStrong" numberOfLines={1}>{s.name}</Txt>
          <Txt variant="caption" numberOfLines={1}>{s.instrument} • {teacherShort(teacher) ?? 'Professor a definir'}</Txt>
        </View>
        <Badge label={label} variant={variant} />
      </Card>
    </Pressable>
  );
});

export const TeacherRow = React.memo(function TeacherRow({ t, onPress, onLongPress }: {
  t: Teacher; onPress: () => void; onLongPress: () => void;
}) {
  const n = t.studentsCount ?? 0;
  const shown = t.instruments.slice(0, 2);
  const extra = t.instruments.length - shown.length;
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} accessibilityRole="button" style={({ pressed }) => pressed && { opacity: 0.7 }}>
      <Card shadow={false} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, minHeight: 84 }}>
        <Avatar name={t.name} photoUri={t.photoUri} />
        <View style={{ flex: 1, gap: 4 }}>
          <Txt variant="bodyStrong" numberOfLines={1}>{teacherFull(t)}</Txt>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {shown.map((i) => <Tag key={i} label={i} />)}
            {extra > 0 ? <Tag label={`+${extra}`} /> : null}
          </View>
          <Txt variant="caption">{n} {n === 1 ? 'aluno' : 'alunos'}</Txt>
        </View>
        <Badge label={t.status === 'ativo' ? 'Ativo' : 'Inativo'} variant={t.status === 'ativo' ? 'solid' : 'outline'} />
      </Card>
    </Pressable>
  );
});

function Tag({ label }: { label: string }) {
  return (
    <View style={{ height: 22, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: colors.border, justifyContent: 'center' }}>
      <Txt variant="micro" maxFontSizeMultiplier={1.3}>{label}</Txt>
    </View>
  );
}

const LESSON_BADGE = { andamento: ['Em andamento', 'solid'], proxima: ['Próxima', 'soft'], concluida: ['Concluída', 'outline'] } as const;

export function LessonRow({ lesson, roomName, line2, status, onPress }: {
  lesson: Lesson; roomName: string; line2: string; status: LessonStatus; onPress: () => void;
}) {
  const [label, variant] = LESSON_BADGE[status];
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => pressed && { opacity: 0.7 }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, backgroundColor: colors.surface,
        borderWidth: status === 'andamento' ? 1.5 : 1, borderColor: status === 'andamento' ? colors.primary : colors.border,
      }}>
        <View style={{ width: 48 }}>
          <Txt variant="label" style={{ fontSize: 13 }}>{lesson.start}</Txt>
          <Txt variant="micro" style={{ color: colors.muted }}>{lesson.end}</Txt>
        </View>
        <View style={{ flex: 1 }}>
          <Txt variant="bodyStrong" numberOfLines={1}>{roomName} — {lesson.title}</Txt>
          <Txt variant="caption" numberOfLines={1}>{line2}</Txt>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Badge label={label} variant={variant} />
        </View>
        <ChevronRight size={18} color={colors.placeholder} strokeWidth={1.75} />
      </View>
    </Pressable>
  );
}
