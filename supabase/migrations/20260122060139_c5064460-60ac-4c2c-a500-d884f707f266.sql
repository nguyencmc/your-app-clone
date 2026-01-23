-- Tạo storage bucket cho podcast audio
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('podcast-audio', 'podcast-audio', true, 104857600)
ON CONFLICT (id) DO NOTHING;

-- RLS policies cho podcast-audio bucket
CREATE POLICY "Public can view podcast audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'podcast-audio');

CREATE POLICY "Teachers and admins can upload podcast audio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'podcast-audio' 
  AND (
    public.has_role(auth.uid(), 'teacher') 
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Teachers and admins can update podcast audio"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'podcast-audio' 
  AND (
    public.has_role(auth.uid(), 'teacher') 
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Teachers and admins can delete podcast audio"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'podcast-audio' 
  AND (
    public.has_role(auth.uid(), 'teacher') 
    OR public.has_role(auth.uid(), 'admin')
  )
);