import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Maximize, Shield, Eye, EyeOff } from "lucide-react";

interface AntiCheatOverlayProps {
  showFullscreenPrompt: boolean;
  warningCount: number;
  maxWarnings: number;
  isFullscreen: boolean;
  isTabVisible: boolean;
  onEnterFullscreen: () => void;
  onDismissPrompt: () => void;
  onContinueWithoutFullscreen?: () => void;
}

export function AntiCheatOverlay({
  showFullscreenPrompt,
  warningCount,
  maxWarnings,
  isFullscreen,
  isTabVisible,
  onEnterFullscreen,
  onDismissPrompt,
  onContinueWithoutFullscreen,
}: AntiCheatOverlayProps) {
  if (!showFullscreenPrompt && isTabVisible) {
    return null;
  }

  // Tab switch warning overlay
  if (!isTabVisible) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-yellow-500/50 bg-card">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
              <EyeOff className="h-8 w-8 text-yellow-500" />
            </div>
            <CardTitle className="text-xl text-yellow-500">
              Phát hiện chuyển tab!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Bạn vừa rời khỏi trang thi. Hành động này đã được ghi nhận.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="destructive" className="text-sm">
                Cảnh báo: {warningCount}/{maxWarnings}
              </Badge>
            </div>
            {warningCount >= maxWarnings - 1 && (
              <p className="text-sm text-red-500 font-medium">
                ⚠️ Bài thi sẽ tự động nộp nếu vi phạm thêm lần nữa!
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Quay lại trang thi để tiếp tục...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fullscreen prompt overlay
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-primary/20 bg-card">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Chế độ chống gian lận</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Bài thi này yêu cầu chế độ toàn màn hình để đảm bảo tính công bằng.
          </p>

          <div className="space-y-3 bg-secondary/30 rounded-lg p-4">
            <h4 className="font-medium text-sm">Quy định thi:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Maximize className="h-4 w-4 text-primary" />
                Duy trì chế độ toàn màn hình
              </li>
              <li className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                Không chuyển tab hoặc cửa sổ
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Tối đa {maxWarnings} lần cảnh báo trước khi tự động nộp bài
              </li>
            </ul>
          </div>

          {warningCount > 0 && (
            <div className="flex items-center justify-center">
              <Badge variant="destructive">
                Đã vi phạm: {warningCount}/{maxWarnings}
              </Badge>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={onEnterFullscreen} className="w-full" size="lg">
              <Maximize className="h-4 w-4 mr-2" />
              Vào chế độ toàn màn hình
            </Button>
            {onContinueWithoutFullscreen && (
              <Button
                variant="ghost"
                onClick={() => {
                  onDismissPrompt();
                  onContinueWithoutFullscreen();
                }}
                className="text-muted-foreground text-sm"
              >
                Tiếp tục không cần toàn màn hình
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
