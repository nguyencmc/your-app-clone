import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Award, Download, Share2, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Certificate {
  id: string;
  certificate_number: string;
  issued_at: string;
  completion_date: string;
  final_score: number | null;
}

interface CourseCertificateProps {
  courseId: string;
  courseTitle: string;
  creatorName: string | null;
  progressPercentage: number;
  onCertificateIssued?: () => void;
}

export const CourseCertificate = ({
  courseId,
  courseTitle,
  creatorName,
  progressPercentage,
  onCertificateIssued,
}: CourseCertificateProps) => {
  const { user } = useAuth();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name: string | null } | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchCertificate();
      fetchUserProfile();
    }
  }, [user, courseId]);

  const fetchCertificate = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("course_certificates")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setCertificate(data);
    } catch (error) {
      console.error("Error fetching certificate:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();
    
    setUserProfile(data);
  };

  const generateCertificateNumber = () => {
    const date = format(new Date(), "yyyyMMdd");
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${date}-${random}`;
  };

  const issueCertificate = async () => {
    if (!user || progressPercentage < 100) return;

    setIssuing(true);
    try {
      const certNumber = generateCertificateNumber();
      
      const { data, error } = await supabase
        .from("course_certificates")
        .insert({
          course_id: courseId,
          user_id: user.id,
          certificate_number: certNumber,
          completion_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      
      setCertificate(data);
      toast.success("Chúc mừng! Bạn đã nhận được chứng chỉ hoàn thành khóa học!");
      onCertificateIssued?.();
    } catch (error: any) {
      console.error("Error issuing certificate:", error);
      toast.error("Không thể cấp chứng chỉ: " + error.message);
    } finally {
      setIssuing(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    
    try {
      // Use html2canvas to create image
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = `certificate-${certificate?.certificate_number}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Đã tải chứng chỉ!");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.error("Không thể tải chứng chỉ. Vui lòng thử lại.");
    }
  };

  const shareCertificate = async () => {
    const verifyUrl = `${window.location.origin}/verify-certificate/${certificate?.certificate_number}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Chứng chỉ hoàn thành: ${courseTitle}`,
          text: `Tôi đã hoàn thành khóa học "${courseTitle}" trên AI-Exam.cloud!`,
          url: verifyUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(verifyUrl);
      toast.success("Đã sao chép link xác minh chứng chỉ!");
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not completed yet
  if (progressPercentage < 100 && !certificate) {
    return (
      <div className="bg-muted/50 rounded-xl p-6 text-center">
        <Award className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <h3 className="font-semibold mb-2">Chứng chỉ hoàn thành</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Hoàn thành tất cả bài học để nhận chứng chỉ
        </p>
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="w-32 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span>{progressPercentage}%</span>
        </div>
      </div>
    );
  }

  // Completed but no certificate yet
  if (progressPercentage >= 100 && !certificate) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
        <Award className="w-16 h-16 mx-auto mb-3 text-yellow-500" />
        <h3 className="font-bold text-lg mb-2">🎉 Chúc mừng bạn đã hoàn thành khóa học!</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Nhấn nút bên dưới để nhận chứng chỉ hoàn thành
        </p>
        <Button onClick={issueCertificate} disabled={issuing} size="lg">
          {issuing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang tạo chứng chỉ...
            </>
          ) : (
            <>
              <Award className="w-4 h-4 mr-2" />
              Nhận chứng chỉ
            </>
          )}
        </Button>
      </div>
    );
  }

  // Has certificate
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold">Đã hoàn thành khóa học!</h3>
          <p className="text-sm text-muted-foreground">
            Cấp ngày: {format(new Date(certificate!.issued_at), "dd/MM/yyyy", { locale: vi })}
          </p>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full mb-3">
            <Award className="w-4 h-4 mr-2" />
            Xem chứng chỉ
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chứng chỉ hoàn thành</DialogTitle>
          </DialogHeader>
          
          {/* Certificate Preview */}
          <div 
            ref={certificateRef}
            className="bg-white p-8 border-8 border-double border-yellow-500 rounded-lg"
            style={{ aspectRatio: "1.414" }}
          >
            <div className="h-full flex flex-col items-center justify-between text-center">
              <div>
                <Award className="w-16 h-16 text-yellow-500 mx-auto mb-2" />
                <h1 className="text-3xl font-serif font-bold text-gray-800 mb-1">
                  CHỨNG CHỈ HOÀN THÀNH
                </h1>
                <p className="text-gray-500">Certificate of Completion</p>
              </div>

              <div className="py-6">
                <p className="text-gray-600 mb-2">Chứng nhận rằng</p>
                <h2 className="text-2xl font-bold text-primary mb-2">
                  {userProfile?.full_name || user?.email?.split("@")[0] || "Học viên"}
                </h2>
                <p className="text-gray-600 mb-4">đã hoàn thành xuất sắc khóa học</p>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  "{courseTitle}"
                </h3>
                {creatorName && (
                  <p className="text-gray-500">Giảng viên: {creatorName}</p>
                )}
              </div>

              <div className="w-full">
                <div className="flex justify-between items-end">
                  <div className="text-left">
                    <p className="text-xs text-gray-400">Mã chứng chỉ</p>
                    <p className="text-sm font-mono">{certificate?.certificate_number}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-1">
                      <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <p className="text-xs font-semibold">AI-Exam.cloud</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Ngày cấp</p>
                    <p className="text-sm">
                      {format(new Date(certificate!.issued_at), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <Button onClick={downloadCertificate} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Tải về
            </Button>
            <Button onClick={shareCertificate} variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Chia sẻ
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="text-xs text-muted-foreground text-center">
        Mã chứng chỉ: <span className="font-mono">{certificate?.certificate_number}</span>
      </div>
    </div>
  );
};
