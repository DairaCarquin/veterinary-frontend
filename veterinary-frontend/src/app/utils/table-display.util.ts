export interface TableBadgeValue {
  label: string;
  tone: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
}

export function booleanBadge(value: boolean, trueLabel = 'Activo', falseLabel = 'Inactivo'): TableBadgeValue {
  return {
    label: value ? trueLabel : falseLabel,
    tone: value ? 'success' : 'danger'
  };
}

export function appointmentStatusBadge(status: string | null | undefined): TableBadgeValue {
  const normalized = (status || '').toUpperCase();

  switch (normalized) {
    case 'PENDING':
      return { label: 'Pendiente', tone: 'warning' };
    case 'RESCHEDULED':
      return { label: 'Reprogramada', tone: 'info' };
    case 'IN_PROGRESS':
      return { label: 'En curso', tone: 'info' };
    case 'ATTENDED':
      return { label: 'Atendida', tone: 'success' };
    case 'PAID':
      return { label: 'Pagada', tone: 'success' };
    case 'CANCELLED':
      return { label: 'Cancelada', tone: 'danger' };
    default:
      return { label: normalized || 'Sin estado', tone: 'neutral' };
  }
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
}
