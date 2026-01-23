import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { vi } from 'date-fns/locale';

interface DueBadgeProps {
  dueAt: string | null;
}

export function DueBadge({ dueAt }: DueBadgeProps) {
  if (!dueAt) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Mới
      </Badge>
    );
  }

  const dueDate = new Date(dueAt);
  const isDue = isPast(dueDate);

  if (isDue) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Đến hạn
      </Badge>
    );
  }

  if (isToday(dueDate)) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Hôm nay
      </Badge>
    );
  }

  if (isTomorrow(dueDate)) {
    return (
      <Badge variant="outline" className="text-yellow-600">
        Ngày mai
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-green-600 flex items-center gap-1">
      <CheckCircle className="w-3 h-3" />
      {format(dueDate, 'dd/MM', { locale: vi })}
    </Badge>
  );
}
