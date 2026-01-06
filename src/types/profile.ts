export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  email_notifications: boolean;
  student_submission_notifications: boolean;
  marketing_emails: boolean;
  language: string;
  theme: string;
  created_at: string;
  updated_at: string;
}
