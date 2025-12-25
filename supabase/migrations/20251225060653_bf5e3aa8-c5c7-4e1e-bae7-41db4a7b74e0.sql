-- Create storage bucket for course images
INSERT INTO storage.buckets (id, name, public) VALUES ('course-images', 'course-images', true);

-- RLS policies for course-images bucket
CREATE POLICY "Anyone can view course images"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-images');

CREATE POLICY "Authenticated users can upload course images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-images');

CREATE POLICY "Users can update their own course images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'course-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own course images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-images' AND auth.uid()::text = (storage.foldername(name))[1]);