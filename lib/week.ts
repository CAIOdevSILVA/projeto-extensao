const formatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function getCurrentWeekPeriod(date = new Date()) {
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);

  const day = current.getDay();
  const distanceFromMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(current);
  monday.setDate(current.getDate() + distanceFromMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return `${formatter.format(monday)} - ${formatter.format(sunday)}`;
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
