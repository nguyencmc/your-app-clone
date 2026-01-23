import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Headphones, 
  ArrowLeft,
  Save,
  Upload,
  FileText,
  Clock,
  Plus,
  Trash2,
  Info,
  FileAudio,
  ImageIcon,
  Loader2,
  X,
  Music,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { createAuditLog } from '@/hooks/useAuditLogs';

interface PodcastCategory {
  id: string;
  name: string;
}

const PodcastEditor = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const { isAdmin, hasPermission, loading: roleLoading } = usePermissionsContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const [categories, setCategories] = useState<PodcastCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Podcast fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [hostName, setHostName] = useState('The Best Study');
  const [episodeNumber, setEpisodeNumber] = useState(1);

  const canCreate = hasPermission('podcasts.create');
  const canEdit = hasPermission('podcasts.edit');
  const hasAccess = isEditing ? (canEdit || hasPermission('podcasts.edit_own')) : canCreate;

  useEffect(() => {
    if (!roleLoading && !hasAccess) {
      navigate('/');
    }
  }, [hasAccess, roleLoading, navigate]);

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchPodcast();
    }
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('podcast_categories').select('id, name');
    setCategories(data || []);
  };

  const fetchPodcast = async () => {
    setLoading(true);
    
    const { data: podcast, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !podcast) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy podcast",
        variant: "destructive",
      });
      navigate('/admin/podcasts');
      return;
    }

    setTitle(podcast.title);
    setSlug(podcast.slug);
    setDescription(podcast.description || '');
    setCategoryId(podcast.category_id || '');
    setDifficulty(podcast.difficulty || 'intermediate');
    setAudioUrl(podcast.audio_url || '');
    setThumbnailUrl(podcast.thumbnail_url || '');
    setTranscript(podcast.transcript || '');
    setHostName(podcast.host_name || 'The Best Study');
    setEpisodeNumber(podcast.episode_number || 1);
    
    const totalSeconds = podcast.duration_seconds || 0;
    setDurationMinutes(Math.floor(totalSeconds / 60));
    setDurationSeconds(totalSeconds % 60);
    
    setLoading(false);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEditing) {
      setSlug(generateSlug(value));
    }
  };

  // Upload audio file
  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
      toast({
        title: "Lỗi",
        description: "Chỉ hỗ trợ file audio (MP3, WAV, OGG, M4A, AAC)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "File audio không được vượt quá 100MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingAudio(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `podcasts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('podcast-audio')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('podcast-audio')
        .getPublicUrl(filePath);

      setAudioUrl(publicUrl);

      // Try to get audio duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        const totalSeconds = Math.floor(audio.duration);
        setDurationMinutes(Math.floor(totalSeconds / 60));
        setDurationSeconds(totalSeconds % 60);
        URL.revokeObjectURL(audio.src);
      };

      toast({
        title: "Thành công",
        description: "Đã upload file audio",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Lỗi upload",
        description: error.message || "Không thể upload file audio",
        variant: "destructive",
      });
    } finally {
      setUploadingAudio(false);
      setUploadProgress(0);
      if (audioInputRef.current) {
        audioInputRef.current.value = '';
      }
    }
  };

  // Upload thumbnail
  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Lỗi",
        description: "Chỉ hỗ trợ file ảnh",
        variant: "destructive",
      });
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "File ảnh không được vượt quá 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingThumbnail(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `thumbnails/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('podcast-audio')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('podcast-audio')
        .getPublicUrl(fileName);

      setThumbnailUrl(publicUrl);

      toast({
        title: "Thành công",
        description: "Đã upload thumbnail",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Lỗi upload",
        description: error.message || "Không thể upload thumbnail",
        variant: "destructive",
      });
    } finally {
      setUploadingThumbnail(false);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề và slug",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const totalDurationSeconds = (durationMinutes * 60) + durationSeconds;

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('podcasts')
          .update({
            title,
            slug,
            description: description || null,
            category_id: categoryId || null,
            difficulty,
            duration_seconds: totalDurationSeconds,
            audio_url: audioUrl || null,
            thumbnail_url: thumbnailUrl || null,
            transcript: transcript || null,
            host_name: hostName,
            episode_number: episodeNumber,
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('podcasts')
          .insert({
            title,
            slug,
            description: description || null,
            category_id: categoryId || null,
            difficulty,
            duration_seconds: totalDurationSeconds,
            audio_url: audioUrl || null,
            thumbnail_url: thumbnailUrl || null,
            transcript: transcript || null,
            host_name: hostName,
            episode_number: episodeNumber,
            creator_id: user?.id,
          });

        if (error) throw error;
      }

      // Create audit log
      await createAuditLog(
        isEditing ? 'update' : 'create',
        'podcast',
        id,
        isEditing ? { title, slug } : null,
        { title, slug, difficulty, duration_seconds: (durationMinutes * 60) + durationSeconds }
      );

      toast({
        title: "Thành công",
        description: isEditing ? "Đã cập nhật podcast" : "Đã tạo podcast mới",
      });

      navigate('/admin/podcasts');
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu podcast",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin/podcasts">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Headphones className="w-8 h-8 text-pink-500" />
                {isEditing ? 'Chỉnh sửa podcast' : 'Tạo podcast mới'}
              </h1>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Đang lưu...' : 'Lưu podcast'}
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Basic Info */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Nhập tiêu đề podcast"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ten-podcast"
                />
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả về podcast"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Danh mục</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Độ khó</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Người mới</SelectItem>
                      <SelectItem value="intermediate">Trung cấp</SelectItem>
                      <SelectItem value="advanced">Nâng cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Tên host"
                  />
                </div>

                <div>
                  <Label htmlFor="episode">Số tập</Label>
                  <Input
                    id="episode"
                    type="number"
                    value={episodeNumber}
                    onChange={(e) => setEpisodeNumber(parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </div>
              </div>

              <div>
                <Label>Thời lượng</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-20"
                  />
                  <span className="text-muted-foreground">phút</span>
                  <Input
                    type="number"
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 0)}
                    min={0}
                    max={59}
                    className="w-20"
                  />
                  <span className="text-muted-foreground">giây</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media & Content */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Media & Nội dung
              </CardTitle>
              <CardDescription>
                Upload file audio hoặc nhập URL trực tiếp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio Upload */}
              <div className="space-y-3">
                <Label>File Audio *</Label>
                
                {/* Upload area */}
                <div
                  onClick={() => !uploadingAudio && audioInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                    ${uploadingAudio ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
                  `}
                >
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  
                  {uploadingAudio ? (
                    <div className="space-y-3">
                      <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Đang upload...</p>
                      <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                    </div>
                  ) : (
                    <>
                      <FileAudio className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Click để upload file audio</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        MP3, WAV, OGG, M4A, AAC (tối đa 100MB)
                      </p>
                    </>
                  )}
                </div>

                {/* Current audio preview */}
                {audioUrl && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <FileAudio className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Audio đã upload</p>
                      <audio controls className="w-full mt-2 h-8">
                        <source src={audioUrl} />
                      </audio>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setAudioUrl('')}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Or use URL */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">hoặc nhập URL</span>
                  </div>
                </div>

                <Input
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                />
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-3">
                <Label>Thumbnail</Label>
                
                <div className="flex gap-4">
                  {/* Thumbnail preview */}
                  <div
                    onClick={() => !uploadingThumbnail && thumbnailInputRef.current?.click()}
                    className={`
                      w-32 h-32 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-colors overflow-hidden
                      ${uploadingThumbnail ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                    `}
                  >
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                    
                    {uploadingThumbnail ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : thumbnailUrl ? (
                      <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mt-1">Upload</p>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <Input
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Ảnh thumbnail hiển thị cho podcast (khuyến nghị 400x400px)
                    </p>
                    {thumbnailUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setThumbnailUrl('')}
                        className="text-destructive"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Xóa thumbnail
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transcript Section */}
          <Card className="border-border/50 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Transcript với Timestamps
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Nhập transcript với timestamps để đồng bộ hiển thị chữ theo audio
                  </CardDescription>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="font-medium mb-2">Định dạng Transcript:</p>
                    <p className="text-xs mb-2">Mỗi dòng có thể bắt đầu với timestamp:</p>
                    <code className="text-xs bg-muted p-1 rounded block mb-1">[00:00] Xin chào các bạn</code>
                    <code className="text-xs bg-muted p-1 rounded block mb-1">[00:05] Đây là bài học hôm nay</code>
                    <code className="text-xs bg-muted p-1 rounded block">[01:30] Cảm ơn đã theo dõi</code>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick timestamp buttons */}
              <div className="flex flex-wrap gap-2 pb-2">
                <Badge variant="outline" className="text-xs">
                  Định dạng: [MM:SS] Nội dung
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const mins = durationMinutes.toString().padStart(2, '0');
                    const secs = durationSeconds.toString().padStart(2, '0');
                    setTranscript(prev => prev + (prev ? '\n' : '') + `[${mins}:${secs}] `);
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Thêm timestamp cuối
                </Button>
              </div>

              {/* Transcript input */}
              <Textarea
                id="transcript"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={`[00:00] Xin chào các bạn, đây là podcast học tiếng Anh
[00:05] Hôm nay chúng ta sẽ học về chủ đề...
[00:15] Từ vựng đầu tiên là "vocabulary"
[00:30] Nghĩa là từ vựng trong tiếng Việt
[01:00] Hãy cùng luyện tập phát âm...`}
                className="min-h-[300px] font-mono text-sm"
              />

              {/* Transcript preview */}
              {transcript && (
                <div className="mt-4">
                  <Label className="mb-2 block">Xem trước Transcript</Label>
                  <div className="border rounded-lg p-4 bg-muted/50 max-h-[200px] overflow-y-auto">
                    {transcript.split('\n').map((line, index) => {
                      const timestampMatch = line.match(/^\[(\d{1,2}):(\d{2})\]/);
                      if (timestampMatch) {
                        const time = timestampMatch[0];
                        const content = line.replace(timestampMatch[0], '').trim();
                        return (
                          <div key={index} className="flex gap-2 mb-2">
                            <Badge variant="secondary" className="shrink-0 font-mono">
                              <Clock className="w-3 h-3 mr-1" />
                              {time.replace('[', '').replace(']', '')}
                            </Badge>
                            <span className="text-sm">{content}</span>
                          </div>
                        );
                      }
                      return line.trim() ? (
                        <p key={index} className="text-sm text-muted-foreground mb-2">{line}</p>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{transcript.split('\n').filter(l => l.trim()).length} dòng</span>
                <span>{transcript.length} ký tự</span>
                <span>
                  {transcript.match(/\[\d{1,2}:\d{2}\]/g)?.length || 0} timestamps
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PodcastEditor;
