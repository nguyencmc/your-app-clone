import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AntiCheatBadgeProps {
  isEnabled: boolean;
  warningCount: number;
  maxWarnings: number;
  isFullscreen: boolean;
}

export function AntiCheatBadge({
  isEnabled,
  warningCount,
  maxWarnings,
  isFullscreen,
}: AntiCheatBadgeProps) {
  if (!isEnabled) return null;

  const hasWarnings = warningCount > 0;
  const isHighRisk = warningCount >= maxWarnings - 1;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge
              variant={hasWarnings ? "destructive" : "outline"}
              className={`flex items-center gap-1.5 ${
                !hasWarnings
                  ? "bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30"
                  : isHighRisk
                  ? "animate-pulse"
                  : ""
              }`}
            >
              {hasWarnings ? (
                <AlertTriangle className="h-3.5 w-3.5" />
              ) : (
                <Shield className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {hasWarnings
                  ? `${warningCount}/${maxWarnings}`
                  : isFullscreen
                  ? "Bảo mật"
                  : "Anti-cheat"}
              </span>
              <span className="sm:hidden">
                {hasWarnings ? `${warningCount}/${maxWarnings}` : ""}
              </span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">Chế độ chống gian lận</p>
            <p className="text-xs text-muted-foreground">
              {hasWarnings
                ? `Bạn đã vi phạm ${warningCount} lần. Còn ${
                    maxWarnings - warningCount
                  } lần trước khi bài thi tự động nộp.`
                : "Không phát hiện vi phạm. Tiếp tục làm bài."}
            </p>
            {!isFullscreen && (
              <p className="text-xs text-yellow-500">
                ⚠️ Chưa ở chế độ toàn màn hình
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
