import type { RecommendedDay, ReviewAnswers, Task, TaskCategory, TaskPriority, TaskStatus } from '@/types/app';

export const CATEGORIES: TaskCategory[] = [
  'Estoque',
  'Limpeza',
  'Atendimento',
  'Organização',
  'Divulgação',
  'Compras',
  'Financeiro',
  'Outros',
];

export const PRIORITIES: TaskPriority[] = ['Alta', 'Média', 'Baixa'];

export const RECOMMENDED_DAYS: RecommendedDay[] = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
  'Sem dia definido',
];

export const STATUSES: { label: string; value: TaskStatus }[] = [
  { label: 'Backlog', value: 'backlog' },
  { label: 'A fazer', value: 'todo' },
  { label: 'Em andamento', value: 'doing' },
  { label: 'Concluído', value: 'done' },
];

export const INITIAL_GOAL = 'Preparar o salão para os atendimentos de sábado e domingo.';

export const EMPTY_REVIEW: ReviewAnswers = {
  workedWell: '',
  obstacles: '',
  improvements: '',
};

const now = new Date().toISOString();

export const INITIAL_TASKS: Task[] = [
  ['Conferir estoque de shampoo', 'Estoque', 'Alta', 'Segunda-feira'],
  ['Verificar tinturas disponíveis', 'Estoque', 'Alta', 'Segunda-feira'],
  ['Comprar luvas descartáveis', 'Compras', 'Média', 'Terça-feira'],
  ['Lavar e organizar as toalhas', 'Organização', 'Alta', 'Quinta-feira'],
  ['Higienizar os equipamentos', 'Limpeza', 'Alta', 'Sexta-feira'],
  ['Confirmar os horários das clientes', 'Atendimento', 'Alta', 'Sexta-feira'],
  ['Divulgar horários disponíveis no WhatsApp', 'Divulgação', 'Média', 'Quinta-feira'],
  ['Organizar materiais de atendimento', 'Organização', 'Alta', 'Sexta-feira'],
  ['Limpar e preparar o espaço', 'Limpeza', 'Alta', 'Sexta-feira'],
  ['Registrar produtos que precisam ser repostos', 'Estoque', 'Média', 'Domingo'],
].map(([title, category, priority, recommendedDay], index) => ({
  id: `initial-${index + 1}`,
  title,
  description: '',
  category: category as TaskCategory,
  priority: priority as TaskPriority,
  recommendedDay: recommendedDay as RecommendedDay,
  status: 'backlog',
  createdAt: now,
  updatedAt: now,
}));
