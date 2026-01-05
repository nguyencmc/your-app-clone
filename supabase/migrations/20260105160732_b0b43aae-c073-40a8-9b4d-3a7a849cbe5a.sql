-- Create documentation categories table
CREATE TABLE public.documentation_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'book',
  color TEXT NOT NULL DEFAULT 'from-primary/20 to-primary/5',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documentation articles table
CREATE TABLE public.documentation_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.documentation_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  summary TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documentation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentation_articles ENABLE ROW LEVEL SECURITY;

-- Everyone can view documentation (public content)
CREATE POLICY "Anyone can view documentation categories"
ON public.documentation_categories
FOR SELECT
USING (true);

CREATE POLICY "Anyone can view documentation articles"
ON public.documentation_articles
FOR SELECT
USING (true);

-- Only admins can manage documentation
CREATE POLICY "Admins can manage documentation categories"
ON public.documentation_categories
FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage documentation articles"
ON public.documentation_articles
FOR ALL
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_documentation_articles_updated_at
BEFORE UPDATE ON public.documentation_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial documentation categories
INSERT INTO public.documentation_categories (name, description, icon, color, display_order) VALUES
('Getting Started', 'Learn the basics of ExamAi and create your first exam', 'book', 'from-primary/20 to-primary/5', 1),
('Creating Exams', 'Detailed guide on creating and customizing exams', 'file-text', 'from-teal-500/20 to-teal-500/5', 2),
('Video Tutorials', 'Watch step-by-step video guides', 'video', 'from-rose-500/20 to-rose-500/5', 3),
('API Reference', 'Technical documentation for developers', 'code', 'from-purple-500/20 to-purple-500/5', 4);

-- Seed initial documentation articles
INSERT INTO public.documentation_articles (category_id, title, slug, content, summary, display_order, is_featured) VALUES
((SELECT id FROM public.documentation_categories WHERE name = 'Getting Started'), 
 'Quick Start Guide', 
 'quick-start-guide',
 '# Quick Start Guide\n\nWelcome to ExamAi! This guide will help you get started with creating your first exam.\n\n## Step 1: Create an Account\n\nSign up using your email or Google account.\n\n## Step 2: Create Your First Course\n\nNavigate to Courses and click "Create Course".\n\n## Step 3: Create an Exam\n\nUse our AI-powered exam creator to generate questions automatically.',
 'Get started with ExamAi in minutes',
 1, true),

((SELECT id FROM public.documentation_categories WHERE name = 'Getting Started'),
 'Understanding the Dashboard',
 'understanding-dashboard',
 '# Understanding the Dashboard\n\nThe dashboard is your central hub for managing all your exams and courses.\n\n## Main Features\n\n- **Quick Stats**: View your exam statistics at a glance\n- **Recent Exams**: Access your most recent exams\n- **Course Overview**: See all your courses',
 'Navigate the ExamAi dashboard like a pro',
 2, false),

((SELECT id FROM public.documentation_categories WHERE name = 'Creating Exams'),
 'How to create multiple choice questions',
 'create-multiple-choice',
 '# Creating Multiple Choice Questions\n\nMultiple choice questions are the most common type of exam questions.\n\n## Using AI Generation\n\n1. Enter your topic\n2. Select difficulty level\n3. Choose number of questions\n4. Let AI generate questions for you\n\n## Manual Creation\n\nYou can also create questions manually by entering the question text and options.',
 'Learn to create effective multiple choice questions',
 1, true),

((SELECT id FROM public.documentation_categories WHERE name = 'Creating Exams'),
 'Setting up exam time limits',
 'exam-time-limits',
 '# Setting Up Exam Time Limits\n\nTime limits help ensure fair testing conditions.\n\n## Configuring Time Limits\n\n1. Go to exam settings\n2. Enable time limit\n3. Set duration in minutes\n\n## Best Practices\n\n- Allow 1-2 minutes per multiple choice question\n- Add buffer time for reading instructions',
 'Configure time limits for your exams',
 2, false),

((SELECT id FROM public.documentation_categories WHERE name = 'Creating Exams'),
 'Grading exams with AI',
 'ai-grading',
 '# AI-Powered Grading\n\nLet AI handle the grading for faster results.\n\n## Automatic Grading\n\nMultiple choice and true/false questions are graded automatically.\n\n## AI Essay Grading\n\nOur AI can also grade essay questions based on rubrics you define.',
 'Automate grading with AI assistance',
 3, true),

((SELECT id FROM public.documentation_categories WHERE name = 'Creating Exams'),
 'Managing student submissions',
 'manage-submissions',
 '# Managing Student Submissions\n\nTrack and review all student submissions in one place.\n\n## Viewing Submissions\n\nAccess the Exam Management page to see all submissions.\n\n## Reviewing Answers\n\nClick on any submission to review individual answers.',
 'Track and manage student exam submissions',
 4, false),

((SELECT id FROM public.documentation_categories WHERE name = 'Creating Exams'),
 'Exporting exam results',
 'export-results',
 '# Exporting Exam Results\n\nExport your exam data for external analysis.\n\n## Export Formats\n\n- CSV for spreadsheet analysis\n- PDF for official records\n- JSON for API integration',
 'Export exam data in various formats',
 5, false),

((SELECT id FROM public.documentation_categories WHERE name = 'Creating Exams'),
 'Customizing question difficulty',
 'question-difficulty',
 '# Customizing Question Difficulty\n\nSet appropriate difficulty levels for your questions.\n\n## Difficulty Levels\n\n- **Easy**: Basic recall questions\n- **Medium**: Application and understanding\n- **Hard**: Analysis and evaluation',
 'Balance question difficulty for better assessments',
 6, false),

((SELECT id FROM public.documentation_categories WHERE name = 'Video Tutorials'),
 'Getting Started Video Series',
 'getting-started-videos',
 '# Getting Started Video Series\n\nWatch our comprehensive video series to learn ExamAi.\n\n## Episode 1: Introduction\n\nLearn about the platform and its features.\n\n## Episode 2: Creating Your First Exam\n\nStep-by-step guide to creating an exam.',
 'Video tutorials for beginners',
 1, true),

((SELECT id FROM public.documentation_categories WHERE name = 'API Reference'),
 'API Overview',
 'api-overview',
 '# API Overview\n\nIntegrate ExamAi with your existing systems.\n\n## Authentication\n\nAll API requests require authentication using API keys.\n\n## Endpoints\n\n- `/api/exams` - Manage exams\n- `/api/courses` - Manage courses\n- `/api/results` - Access results',
 'Technical overview of the ExamAi API',
 1, true);