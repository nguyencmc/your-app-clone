-- Create audit_logs table to track important system actions
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs (any authenticated user can create their own logs)
CREATE POLICY "Authenticated users can create audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create function to log role_permissions changes
CREATE OR REPLACE FUNCTION public.log_role_permission_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  permission_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT name INTO permission_name FROM public.permissions WHERE id = NEW.permission_id;
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_value, metadata)
    VALUES (
      auth.uid(),
      'permission_granted',
      'role_permission',
      NEW.id::text,
      jsonb_build_object('role', NEW.role, 'permission_id', NEW.permission_id, 'permission_name', permission_name),
      jsonb_build_object('role', NEW.role)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT name INTO permission_name FROM public.permissions WHERE id = OLD.permission_id;
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_value, metadata)
    VALUES (
      auth.uid(),
      'permission_revoked',
      'role_permission',
      OLD.id::text,
      jsonb_build_object('role', OLD.role, 'permission_id', OLD.permission_id, 'permission_name', permission_name),
      jsonb_build_object('role', OLD.role)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for role_permissions changes
CREATE TRIGGER tr_log_role_permission_change
AFTER INSERT OR DELETE ON public.role_permissions
FOR EACH ROW
EXECUTE FUNCTION public.log_role_permission_change();

-- Create function to log user_roles changes
CREATE OR REPLACE FUNCTION public.log_user_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_value, metadata)
    VALUES (
      auth.uid(),
      'role_assigned',
      'user_role',
      NEW.user_id::text,
      jsonb_build_object('role', NEW.role, 'target_user_id', NEW.user_id),
      jsonb_build_object('target_user_id', NEW.user_id)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_value, metadata)
    VALUES (
      auth.uid(),
      'role_removed',
      'user_role',
      OLD.user_id::text,
      jsonb_build_object('role', OLD.role, 'target_user_id', OLD.user_id),
      jsonb_build_object('target_user_id', OLD.user_id)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for user_roles changes
CREATE TRIGGER tr_log_user_role_change
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.log_user_role_change();

-- Create a helper function to manually log actions from the application
CREATE OR REPLACE FUNCTION public.create_audit_log(
  _action TEXT,
  _entity_type TEXT,
  _entity_id TEXT DEFAULT NULL,
  _old_value JSONB DEFAULT NULL,
  _new_value JSONB DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, metadata)
  VALUES (auth.uid(), _action, _entity_type, _entity_id, _old_value, _new_value, _metadata)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;