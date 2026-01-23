-- Create permissions table for granular permissions
CREATE TABLE public.permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create role_permissions mapping table
CREATE TABLE public.role_permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    role app_role NOT NULL,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (role, permission_id)
);

-- Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permissions table
CREATE POLICY "Permissions are viewable by everyone" 
ON public.permissions 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage permissions" 
ON public.permissions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for role_permissions table
CREATE POLICY "Role permissions are viewable by authenticated users" 
ON public.role_permissions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage role permissions" 
ON public.role_permissions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Insert default permissions
INSERT INTO public.permissions (name, description, category) VALUES
-- User Management
('users.view', 'Xem danh sách người dùng', 'users'),
('users.create', 'Tạo người dùng mới', 'users'),
('users.edit', 'Chỉnh sửa người dùng', 'users'),
('users.delete', 'Xóa người dùng', 'users'),
('users.manage_roles', 'Quản lý quyền người dùng', 'users'),

-- Exam Management
('exams.view', 'Xem đề thi', 'exams'),
('exams.create', 'Tạo đề thi', 'exams'),
('exams.edit', 'Chỉnh sửa đề thi', 'exams'),
('exams.edit_own', 'Chỉnh sửa đề thi của mình', 'exams'),
('exams.delete', 'Xóa đề thi', 'exams'),
('exams.delete_own', 'Xóa đề thi của mình', 'exams'),

-- Course Management
('courses.view', 'Xem khóa học', 'courses'),
('courses.create', 'Tạo khóa học', 'courses'),
('courses.edit', 'Chỉnh sửa khóa học', 'courses'),
('courses.edit_own', 'Chỉnh sửa khóa học của mình', 'courses'),
('courses.delete', 'Xóa khóa học', 'courses'),
('courses.delete_own', 'Xóa khóa học của mình', 'courses'),
('courses.publish', 'Xuất bản khóa học', 'courses'),

-- Podcast Management
('podcasts.view', 'Xem podcast', 'podcasts'),
('podcasts.create', 'Tạo podcast', 'podcasts'),
('podcasts.edit', 'Chỉnh sửa podcast', 'podcasts'),
('podcasts.edit_own', 'Chỉnh sửa podcast của mình', 'podcasts'),
('podcasts.delete', 'Xóa podcast', 'podcasts'),
('podcasts.delete_own', 'Xóa podcast của mình', 'podcasts'),

-- Flashcard Management
('flashcards.view', 'Xem flashcard', 'flashcards'),
('flashcards.create', 'Tạo flashcard', 'flashcards'),
('flashcards.edit', 'Chỉnh sửa flashcard', 'flashcards'),
('flashcards.edit_own', 'Chỉnh sửa flashcard của mình', 'flashcards'),
('flashcards.delete', 'Xóa flashcard', 'flashcards'),
('flashcards.delete_own', 'Xóa flashcard của mình', 'flashcards'),

-- Question Set Management
('question_sets.view', 'Xem bộ câu hỏi', 'question_sets'),
('question_sets.create', 'Tạo bộ câu hỏi', 'question_sets'),
('question_sets.edit', 'Chỉnh sửa bộ câu hỏi', 'question_sets'),
('question_sets.edit_own', 'Chỉnh sửa bộ câu hỏi của mình', 'question_sets'),
('question_sets.delete', 'Xóa bộ câu hỏi', 'question_sets'),
('question_sets.delete_own', 'Xóa bộ câu hỏi của mình', 'question_sets'),

-- Category Management
('categories.view', 'Xem danh mục', 'categories'),
('categories.create', 'Tạo danh mục', 'categories'),
('categories.edit', 'Chỉnh sửa danh mục', 'categories'),
('categories.delete', 'Xóa danh mục', 'categories'),

-- Admin Dashboard
('admin.dashboard', 'Truy cập trang quản trị Admin', 'admin'),
('admin.export_data', 'Xuất dữ liệu hệ thống', 'admin'),
('admin.view_stats', 'Xem thống kê hệ thống', 'admin'),

-- Teacher Dashboard
('teacher.dashboard', 'Truy cập trang quản trị Teacher', 'teacher');

-- Assign permissions to roles
-- Admin gets all permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin'::app_role, id FROM public.permissions;

-- Teacher permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'teacher'::app_role, id FROM public.permissions 
WHERE name IN (
    'teacher.dashboard',
    'exams.view', 'exams.create', 'exams.edit_own', 'exams.delete_own',
    'courses.view', 'courses.create', 'courses.edit_own', 'courses.delete_own', 'courses.publish',
    'podcasts.view', 'podcasts.create', 'podcasts.edit_own', 'podcasts.delete_own',
    'flashcards.view', 'flashcards.create', 'flashcards.edit_own', 'flashcards.delete_own',
    'question_sets.view', 'question_sets.create', 'question_sets.edit_own', 'question_sets.delete_own',
    'categories.view', 'categories.create'
);

-- Moderator permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'moderator'::app_role, id FROM public.permissions 
WHERE name IN (
    'users.view',
    'exams.view', 'exams.edit', 'exams.delete',
    'courses.view', 'courses.edit',
    'podcasts.view', 'podcasts.edit',
    'flashcards.view', 'flashcards.edit',
    'question_sets.view', 'question_sets.edit',
    'categories.view', 'categories.edit'
);

-- User permissions (basic)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'user'::app_role, id FROM public.permissions 
WHERE name IN (
    'exams.view',
    'courses.view',
    'podcasts.view',
    'flashcards.view', 'flashcards.create', 'flashcards.edit_own', 'flashcards.delete_own',
    'question_sets.view',
    'categories.view'
);

-- Create function to check permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
      AND p.name = _permission
  )
$$;

-- Create function to get all user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS TABLE(permission_name text, permission_category text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT p.name, p.category
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = _user_id
  ORDER BY p.category, p.name
$$;