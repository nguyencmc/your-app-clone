export interface Course {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  subject: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseStudent {
  id: string;
  course_id: string;
  student_name: string;
  student_email: string;
  status: string;
  created_at: string;
  updated_at: string;
}
