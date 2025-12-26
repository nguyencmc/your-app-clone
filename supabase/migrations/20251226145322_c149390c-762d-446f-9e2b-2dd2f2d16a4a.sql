-- Create course_students table
CREATE TABLE public.course_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_students ENABLE ROW LEVEL SECURITY;

-- Create policies - course owner can manage students
CREATE POLICY "Users can view students in their courses"
ON public.course_students
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_students.course_id
    AND courses.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add students to their courses"
ON public.course_students
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_students.course_id
    AND courses.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update students in their courses"
ON public.course_students
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_students.course_id
    AND courses.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete students from their courses"
ON public.course_students
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_students.course_id
    AND courses.user_id = auth.uid()
  )
);

-- Admin policies
CREATE POLICY "Admins can view all course students"
ON public.course_students
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all course students"
ON public.course_students
FOR ALL
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_course_students_updated_at
BEFORE UPDATE ON public.course_students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();