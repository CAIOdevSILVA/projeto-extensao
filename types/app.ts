export type TaskStatus = 'backlog' | 'todo' | 'doing' | 'done';

export type TaskCategory =
  | 'Estoque'
  | 'Limpeza'
  | 'Atendimento'
  | 'Organização'
  | 'Divulgação'
  | 'Compras'
  | 'Financeiro'
  | 'Outros';

export type TaskPriority = 'Alta' | 'Média' | 'Baixa';

export type RecommendedDay =
  | 'Segunda-feira'
  | 'Terça-feira'
  | 'Quarta-feira'
  | 'Quinta-feira'
  | 'Sexta-feira'
  | 'Sábado'
  | 'Domingo'
  | 'Sem dia definido';

export type Task = {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  recommendedDay: RecommendedDay;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type ReviewAnswers = {
  workedWell: string;
  obstacles: string;
  improvements: string;
};

export type WeekHistory = {
  id: string;
  period: string;
  goal: string;
  plannedCount: number;
  completedCount: number;
  completionPercent: number;
  completedTasks: Task[];
  review: ReviewAnswers;
  finishedAt: string;
};

export type AppState = {
  initialized: boolean;
  weekPeriod: string;
  weeklyGoal: string;
  review: ReviewAnswers;
  tasks: Task[];
  history: WeekHistory[];
};
