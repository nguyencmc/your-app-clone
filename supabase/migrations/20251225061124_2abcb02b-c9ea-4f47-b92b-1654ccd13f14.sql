-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.is_admin(auth.uid()));

-- Update exams table: Add admin policies
CREATE POLICY "Admins can view all exams"
ON public.exams FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all exams"
ON public.exams FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete all exams"
ON public.exams FOR DELETE
USING (public.is_admin(auth.uid()));

-- Update courses table: Add admin policies
CREATE POLICY "Admins can view all courses"
ON public.courses FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all courses"
ON public.courses FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete all courses"
ON public.courses FOR DELETE
USING (public.is_admin(auth.uid()));

-- Update profiles table: Add admin policies
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Update exam_attempts table: Add admin policies
CREATE POLICY "Admins can view all attempts"
ON public.exam_attempts FOR SELECT
USING (public.is_admin(auth.uid()));

-- Update usage_logs table: Add admin policies
CREATE POLICY "Admins can view all logs"
ON public.usage_logs FOR SELECT
USING (public.is_admin(auth.uid()));

-- Update forum_posts table: Add admin policies
CREATE POLICY "Admins can update all posts"
ON public.forum_posts FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete all posts"
ON public.forum_posts FOR DELETE
USING (public.is_admin(auth.uid()));

-- Update forum_comments table: Add admin policies
CREATE POLICY "Admins can update all comments"
ON public.forum_comments FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete all comments"
ON public.forum_comments FOR DELETE
USING (public.is_admin(auth.uid()));

-- Create trigger to auto-assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_add_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();