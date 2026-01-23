import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Shield,
  User,
  Clock,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  FileText,
  UserPlus,
  UserMinus,
  Key,
  Settings,
  Trash2,
  Edit,
  Plus,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useAuditLogs, AuditLog } from '@/hooks/useAuditLogs';
import { useToast } from '@/hooks/use-toast';

const ACTION_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  permission_granted: { label: 'Cấp quyền', icon: <Key className="w-4 h-4" />, color: 'bg-green-500' },
  permission_revoked: { label: 'Thu hồi quyền', icon: <Key className="w-4 h-4" />, color: 'bg-red-500' },
  role_assigned: { label: 'Gán vai trò', icon: <UserPlus className="w-4 h-4" />, color: 'bg-blue-500' },
  role_removed: { label: 'Xóa vai trò', icon: <UserMinus className="w-4 h-4" />, color: 'bg-orange-500' },
  user_created: { label: 'Tạo người dùng', icon: <UserPlus className="w-4 h-4" />, color: 'bg-green-500' },
  user_deleted: { label: 'Xóa người dùng', icon: <Trash2 className="w-4 h-4" />, color: 'bg-red-500' },
  user_updated: { label: 'Cập nhật người dùng', icon: <Edit className="w-4 h-4" />, color: 'bg-yellow-500' },
  login: { label: 'Đăng nhập', icon: <User className="w-4 h-4" />, color: 'bg-blue-500' },
  logout: { label: 'Đăng xuất', icon: <User className="w-4 h-4" />, color: 'bg-gray-500' },
  create: { label: 'Tạo mới', icon: <Plus className="w-4 h-4" />, color: 'bg-green-500' },
  update: { label: 'Cập nhật', icon: <Edit className="w-4 h-4" />, color: 'bg-yellow-500' },
  delete: { label: 'Xóa', icon: <Trash2 className="w-4 h-4" />, color: 'bg-red-500' },
  view: { label: 'Xem', icon: <Eye className="w-4 h-4" />, color: 'bg-gray-500' },
};

const ENTITY_LABELS: Record<string, string> = {
  role_permission: 'Quyền vai trò',
  user_role: 'Vai trò người dùng',
  user: 'Người dùng',
  course: 'Khóa học',
  exam: 'Đề thi',
  flashcard: 'Flashcard',
  podcast: 'Podcast',
  question_set: 'Bộ câu hỏi',
  settings: 'Cài đặt',
};

const AuditLogItem = ({ log }: { log: AuditLog }) => {
  const [isOpen, setIsOpen] = useState(false);
  const actionInfo = ACTION_LABELS[log.action] || { 
    label: log.action, 
    icon: <FileText className="w-4 h-4" />, 
    color: 'bg-gray-500' 
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${actionInfo.color} text-white shrink-0`}>
              {actionInfo.icon}
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{actionInfo.label}</span>
                <Badge variant="outline" className="text-xs">
                  {ENTITY_LABELS[log.entity_type] || log.entity_type}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <User className="w-3 h-3" />
                <span>{log.user_name || log.user_email || 'Hệ thống'}</span>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>
                  {format(new Date(log.created_at), 'HH:mm:ss dd/MM/yyyy', { locale: vi })}
                </span>
              </div>
              {/* Quick preview of change */}
              {log.new_value && typeof log.new_value === 'object' && !Array.isArray(log.new_value) && (log.new_value as Record<string, unknown>).permission_name && (
                <div className="text-sm text-muted-foreground mt-1">
                  Quyền: <span className="font-medium">{String((log.new_value as Record<string, unknown>).permission_name)}</span>
                  {(log.new_value as Record<string, unknown>).role && (
                    <span> → Vai trò: <span className="font-medium">{String((log.new_value as Record<string, unknown>).role)}</span></span>
                  )}
                </div>
              )}
              {log.old_value && typeof log.old_value === 'object' && !Array.isArray(log.old_value) && (log.old_value as Record<string, unknown>).permission_name && 
               !(log.new_value && typeof log.new_value === 'object' && !Array.isArray(log.new_value) && (log.new_value as Record<string, unknown>).permission_name) && (
                <div className="text-sm text-muted-foreground mt-1">
                  Quyền: <span className="font-medium">{String((log.old_value as Record<string, unknown>).permission_name)}</span>
                  {(log.old_value as Record<string, unknown>).role && (
                    <span> ← Vai trò: <span className="font-medium">{String((log.old_value as Record<string, unknown>).role)}</span></span>
                  )}
                </div>
              )}
            </div>
            <div className="shrink-0">
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 pt-4 border-t space-y-3">
            {log.old_value && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Giá trị cũ:</p>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(log.old_value, null, 2)}
                </pre>
              </div>
            )}
            {log.new_value && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Giá trị mới:</p>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(log.new_value, null, 2)}
                </pre>
              </div>
            )}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Metadata:</p>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>ID: {log.id}</div>
              {log.entity_id && <div>Entity ID: {log.entity_id}</div>}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

const AuditLogs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = usePermissionsContext();
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const { logs, loading, error, refetch } = useAuditLogs({
    entityType: entityTypeFilter !== 'all' ? entityTypeFilter : undefined,
    action: actionFilter !== 'all' ? actionFilter : undefined,
    limit: 200,
  });

  // Redirect non-admins
  if (!roleLoading && !isAdmin) {
    navigate('/');
    toast({
      title: 'Không có quyền truy cập',
      description: 'Chỉ admin mới có thể xem audit logs',
      variant: 'destructive',
    });
    return null;
  }

  if (roleLoading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const uniqueEntityTypes = [...new Set(logs.map((l) => l.entity_type))];
  const uniqueActions = [...new Set(logs.map((l) => l.action))];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">
              Theo dõi các thay đổi quyền và hành động quan trọng trong hệ thống
            </p>
          </div>
        </div>
        <Button onClick={refetch} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{logs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Thay đổi quyền
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {logs.filter((l) => l.entity_type === 'role_permission').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Thay đổi vai trò
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {logs.filter((l) => l.entity_type === 'user_role').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {logs.filter((l) => {
                const today = new Date();
                const logDate = new Date(l.created_at);
                return logDate.toDateString() === today.toDateString();
              }).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <CardTitle className="text-base">Bộ lọc</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <label className="text-sm text-muted-foreground mb-1 block">
                Loại đối tượng
              </label>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {uniqueEntityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {ENTITY_LABELS[type] || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <label className="text-sm text-muted-foreground mb-1 block">
                Hành động
              </label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {ACTION_LABELS[action]?.label || action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={refetch} variant="outline" className="mt-4">
            Thử lại
          </Button>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="p-12 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Chưa có audit log nào</p>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-4">
            {logs.map((log) => (
              <AuditLogItem key={log.id} log={log} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default AuditLogs;
