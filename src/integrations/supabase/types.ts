export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string
          category: string
          created_at: string
          description: string
          display_order: number | null
          icon: string
          id: string
          name: string
          points_reward: number
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          badge_color?: string
          category?: string
          created_at?: string
          description: string
          display_order?: number | null
          icon?: string
          id?: string
          name: string
          points_reward?: number
          requirement_type: string
          requirement_value?: number
        }
        Update: {
          badge_color?: string
          category?: string
          created_at?: string
          description?: string
          display_order?: number | null
          icon?: string
          id?: string
          name?: string
          points_reward?: number
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      book_bookmarks: {
        Row: {
          book_id: string | null
          created_at: string
          id: string
          position: number
          title: string | null
          user_id: string
        }
        Insert: {
          book_id?: string | null
          created_at?: string
          id?: string
          position: number
          title?: string | null
          user_id: string
        }
        Update: {
          book_id?: string | null
          created_at?: string
          id?: string
          position?: number
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_bookmarks_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_categories: {
        Row: {
          book_count: number | null
          created_at: string
          description: string | null
          display_order: number | null
          icon_url: string | null
          id: string
          is_featured: boolean | null
          name: string
          slug: string
        }
        Insert: {
          book_count?: number | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          slug: string
        }
        Update: {
          book_count?: number | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      book_chapters: {
        Row: {
          book_id: string | null
          chapter_order: number | null
          created_at: string
          id: string
          position: number
          title: string
        }
        Insert: {
          book_id?: string | null
          chapter_order?: number | null
          created_at?: string
          id?: string
          position: number
          title: string
        }
        Update: {
          book_id?: string | null
          chapter_order?: number | null
          created_at?: string
          id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_highlights: {
        Row: {
          book_id: string | null
          color: string | null
          created_at: string
          end_position: number
          highlighted_text: string
          id: string
          start_position: number
          user_id: string
        }
        Insert: {
          book_id?: string | null
          color?: string | null
          created_at?: string
          end_position: number
          highlighted_text: string
          id?: string
          start_position: number
          user_id: string
        }
        Update: {
          book_id?: string | null
          color?: string | null
          created_at?: string
          end_position?: number
          highlighted_text?: string
          id?: string
          start_position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_highlights_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_notes: {
        Row: {
          book_id: string | null
          content: string
          created_at: string
          id: string
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id?: string | null
          content: string
          created_at?: string
          id?: string
          position: number
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string | null
          content?: string
          created_at?: string
          id?: string
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_notes_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author_name: string | null
          category_id: string | null
          content: string | null
          cover_url: string | null
          created_at: string
          creator_id: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_featured: boolean | null
          page_count: number | null
          rating: number | null
          read_count: number | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          category_id?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_featured?: boolean | null
          page_count?: number | null
          rating?: number | null
          read_count?: number | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          category_id?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_featured?: boolean | null
          page_count?: number | null
          rating?: number | null
          read_count?: number | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "book_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      course_answers: {
        Row: {
          content: string
          created_at: string
          id: string
          is_accepted: boolean | null
          is_instructor_answer: boolean | null
          question_id: string
          updated_at: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_accepted?: boolean | null
          is_instructor_answer?: boolean | null
          question_id: string
          updated_at?: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_accepted?: boolean | null
          is_instructor_answer?: boolean | null
          question_id?: string
          updated_at?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "course_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_categories: {
        Row: {
          course_count: number | null
          created_at: string
          description: string | null
          display_order: number | null
          icon_url: string | null
          id: string
          is_featured: boolean | null
          name: string
          slug: string
        }
        Insert: {
          course_count?: number | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          slug: string
        }
        Update: {
          course_count?: number | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      course_certificates: {
        Row: {
          certificate_number: string
          completion_date: string
          course_id: string | null
          created_at: string
          final_score: number | null
          id: string
          issued_at: string
          user_id: string
        }
        Insert: {
          certificate_number: string
          completion_date?: string
          course_id?: string | null
          created_at?: string
          final_score?: number | null
          id?: string
          issued_at?: string
          user_id: string
        }
        Update: {
          certificate_number?: string
          completion_date?: string
          course_id?: string | null
          created_at?: string
          final_score?: number | null
          id?: string
          issued_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          content_type: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_preview: boolean | null
          lesson_order: number | null
          section_id: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          lesson_order?: number | null
          section_id?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          lesson_order?: number | null
          section_id?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      course_questions: {
        Row: {
          content: string
          course_id: string | null
          created_at: string
          id: string
          is_answered: boolean | null
          lesson_id: string | null
          title: string
          updated_at: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string
          id?: string
          is_answered?: boolean | null
          lesson_id?: string | null
          title: string
          updated_at?: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string
          id?: string
          is_answered?: boolean | null
          lesson_id?: string | null
          title?: string
          updated_at?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          comment: string | null
          course_id: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sections: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          section_order: number | null
          title: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          section_order?: number | null
          title: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          section_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_test_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          correct_answers: number | null
          id: string
          passed: boolean | null
          score: number | null
          started_at: string
          test_id: string | null
          total_questions: number | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          correct_answers?: number | null
          id?: string
          passed?: boolean | null
          score?: number | null
          started_at?: string
          test_id?: string | null
          total_questions?: number | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          correct_answers?: number | null
          id?: string
          passed?: boolean | null
          score?: number | null
          started_at?: string
          test_id?: string | null
          total_questions?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_test_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "course_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      course_test_questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string | null
          option_d: string | null
          option_e: string | null
          option_f: string | null
          option_g: string | null
          option_h: string | null
          question_image: string | null
          question_order: number | null
          question_text: string
          test_id: string | null
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c?: string | null
          option_d?: string | null
          option_e?: string | null
          option_f?: string | null
          option_g?: string | null
          option_h?: string | null
          question_image?: string | null
          question_order?: number | null
          question_text: string
          test_id?: string | null
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string | null
          option_d?: string | null
          option_e?: string | null
          option_f?: string | null
          option_g?: string | null
          option_h?: string | null
          question_image?: string | null
          question_order?: number | null
          question_text?: string
          test_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "course_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      course_tests: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_required: boolean | null
          lesson_id: string | null
          max_attempts: number | null
          pass_percentage: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_required?: boolean | null
          lesson_id?: string | null
          max_attempts?: number | null
          pass_percentage?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_required?: boolean | null
          lesson_id?: string | null
          max_attempts?: number | null
          pass_percentage?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_tests_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      course_wishlists: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_wishlists_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          category_id: string | null
          created_at: string
          creator_id: string | null
          creator_name: string | null
          description: string | null
          duration_hours: number | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_official: boolean | null
          is_published: boolean | null
          language: string | null
          lesson_count: number | null
          level: string | null
          original_price: number | null
          preview_video_url: string | null
          price: number | null
          rating: number | null
          rating_count: number | null
          requirements: string[] | null
          slug: string | null
          student_count: number | null
          subcategory: string | null
          term_count: number | null
          title: string
          topic: string | null
          updated_at: string
          view_count: number | null
          what_you_learn: string[] | null
        }
        Insert: {
          category?: string
          category_id?: string | null
          created_at?: string
          creator_id?: string | null
          creator_name?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_official?: boolean | null
          is_published?: boolean | null
          language?: string | null
          lesson_count?: number | null
          level?: string | null
          original_price?: number | null
          preview_video_url?: string | null
          price?: number | null
          rating?: number | null
          rating_count?: number | null
          requirements?: string[] | null
          slug?: string | null
          student_count?: number | null
          subcategory?: string | null
          term_count?: number | null
          title: string
          topic?: string | null
          updated_at?: string
          view_count?: number | null
          what_you_learn?: string[] | null
        }
        Update: {
          category?: string
          category_id?: string | null
          created_at?: string
          creator_id?: string | null
          creator_name?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_official?: boolean | null
          is_published?: boolean | null
          language?: string | null
          lesson_count?: number | null
          level?: string | null
          original_price?: number | null
          preview_video_url?: string | null
          price?: number | null
          rating?: number | null
          rating_count?: number | null
          requirements?: string[] | null
          slug?: string | null
          student_count?: number | null
          subcategory?: string | null
          term_count?: number | null
          title?: string
          topic?: string | null
          updated_at?: string
          view_count?: number | null
          what_you_learn?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          answers: Json | null
          completed_at: string
          correct_answers: number | null
          created_at: string
          exam_id: string | null
          id: string
          score: number | null
          time_spent_seconds: number | null
          total_questions: number | null
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          completed_at?: string
          correct_answers?: number | null
          created_at?: string
          exam_id?: string | null
          id?: string
          score?: number | null
          time_spent_seconds?: number | null
          total_questions?: number | null
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          completed_at?: string
          correct_answers?: number | null
          created_at?: string
          exam_id?: string | null
          id?: string
          score?: number | null
          time_spent_seconds?: number | null
          total_questions?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_categories: {
        Row: {
          attempt_count: number | null
          created_at: string
          display_order: number | null
          exam_count: number | null
          icon_url: string | null
          id: string
          is_featured: boolean | null
          name: string
          question_count: number | null
          rating: number | null
          slug: string
          subcategory_count: number | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string
          display_order?: number | null
          exam_count?: number | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          question_count?: number | null
          rating?: number | null
          slug: string
          subcategory_count?: number | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string
          display_order?: number | null
          exam_count?: number | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          question_count?: number | null
          rating?: number | null
          slug?: string
          subcategory_count?: number | null
        }
        Relationships: []
      }
      exams: {
        Row: {
          attempt_count: number | null
          category_id: string | null
          created_at: string
          creator_id: string | null
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          is_featured: boolean | null
          pass_rate: number | null
          question_count: number | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number | null
          category_id?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          pass_rate?: number | null
          question_count?: number | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number | null
          category_id?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          pass_rate?: number | null
          question_count?: number | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "exam_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_decks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          tags: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          tags?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcard_reviews: {
        Row: {
          due_at: string
          ease: number
          flashcard_id: string
          id: string
          interval_days: number
          last_grade: number | null
          repetitions: number
          reviewed_at: string | null
          user_id: string
        }
        Insert: {
          due_at?: string
          ease?: number
          flashcard_id: string
          id?: string
          interval_days?: number
          last_grade?: number | null
          repetitions?: number
          reviewed_at?: string | null
          user_id: string
        }
        Update: {
          due_at?: string
          ease?: number
          flashcard_id?: string
          id?: string
          interval_days?: number
          last_grade?: number | null
          repetitions?: number
          reviewed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "user_flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_sets: {
        Row: {
          card_count: number | null
          category: string | null
          created_at: string
          creator_id: string | null
          description: string | null
          id: string
          is_public: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          card_count?: number | null
          category?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          card_count?: number | null
          category?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          back_text: string
          card_order: number | null
          created_at: string
          front_text: string
          id: string
          set_id: string | null
        }
        Insert: {
          back_text: string
          card_order?: number | null
          created_at?: string
          front_text: string
          id?: string
          set_id?: string | null
        }
        Update: {
          back_text?: string
          card_order?: number | null
          created_at?: string
          front_text?: string
          id?: string
          set_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_attachments: {
        Row: {
          created_at: string
          display_order: number | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          lesson_id: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          lesson_id?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          lesson_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_attachments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_notes: {
        Row: {
          content: string
          course_id: string | null
          created_at: string
          id: string
          lesson_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_notes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_bookmarks: {
        Row: {
          created_at: string
          id: string
          label: string | null
          podcast_id: string
          time_seconds: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          podcast_id: string
          time_seconds: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          podcast_id?: string
          time_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_bookmarks_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon_url: string | null
          id: string
          is_featured: boolean | null
          name: string
          podcast_count: number | null
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          podcast_count?: number | null
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          podcast_count?: number | null
          slug?: string
        }
        Relationships: []
      }
      podcasts: {
        Row: {
          audio_url: string | null
          category_id: string | null
          created_at: string
          creator_id: string | null
          description: string | null
          difficulty: string | null
          duration_seconds: number | null
          episode_number: number | null
          host_name: string | null
          id: string
          is_featured: boolean | null
          listen_count: number | null
          slug: string
          thumbnail_url: string | null
          title: string
          transcript: string | null
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          category_id?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          difficulty?: string | null
          duration_seconds?: number | null
          episode_number?: number | null
          host_name?: string | null
          id?: string
          is_featured?: boolean | null
          listen_count?: number | null
          slug: string
          thumbnail_url?: string | null
          title: string
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          category_id?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          difficulty?: string | null
          duration_seconds?: number | null
          episode_number?: number | null
          host_name?: string | null
          id?: string
          is_featured?: boolean | null
          listen_count?: number | null
          slug?: string
          thumbnail_url?: string | null
          title?: string
          transcript?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcasts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "podcast_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_attempts: {
        Row: {
          created_at: string
          exam_session_id: string | null
          id: string
          is_correct: boolean
          mode: string
          question_id: string
          selected: Json
          time_spent_sec: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          exam_session_id?: string | null
          id?: string
          is_correct: boolean
          mode: string
          question_id: string
          selected: Json
          time_spent_sec?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          exam_session_id?: string | null
          id?: string
          is_correct?: boolean
          mode?: string
          question_id?: string
          selected?: Json
          time_spent_sec?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_attempts_exam_session_id_fkey"
            columns: ["exam_session_id"]
            isOneToOne: false
            referencedRelation: "practice_exam_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "practice_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_exam_sessions: {
        Row: {
          correct: number | null
          duration_sec: number
          id: string
          score: number | null
          set_id: string | null
          started_at: string
          status: string | null
          submitted_at: string | null
          total: number | null
          user_id: string
        }
        Insert: {
          correct?: number | null
          duration_sec: number
          id?: string
          score?: number | null
          set_id?: string | null
          started_at?: string
          status?: string | null
          submitted_at?: string | null
          total?: number | null
          user_id: string
        }
        Update: {
          correct?: number | null
          duration_sec?: number
          id?: string
          score?: number | null
          set_id?: string | null
          started_at?: string
          status?: string | null
          submitted_at?: string | null
          total?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_exam_sessions_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "question_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_questions: {
        Row: {
          answer: Json
          choices: Json
          created_at: string
          difficulty: number | null
          explanation: string | null
          id: string
          prompt: string
          question_order: number | null
          set_id: string
          tags: string[] | null
          type: string | null
        }
        Insert: {
          answer: Json
          choices?: Json
          created_at?: string
          difficulty?: number | null
          explanation?: string | null
          id?: string
          prompt: string
          question_order?: number | null
          set_id: string
          tags?: string[] | null
          type?: string | null
        }
        Update: {
          answer?: Json
          choices?: Json
          created_at?: string
          difficulty?: number | null
          explanation?: string | null
          id?: string
          prompt?: string
          question_order?: number | null
          set_id?: string
          tags?: string[] | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_questions_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "question_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          expires_at: string | null
          full_name: string | null
          id: string
          level: number | null
          points: number | null
          total_correct_answers: number | null
          total_exams_taken: number | null
          total_questions_answered: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          full_name?: string | null
          id?: string
          level?: number | null
          points?: number | null
          total_correct_answers?: number | null
          total_exams_taken?: number | null
          total_questions_answered?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          full_name?: string | null
          id?: string
          level?: number | null
          points?: number | null
          total_correct_answers?: number | null
          total_exams_taken?: number | null
          total_questions_answered?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      question_sets: {
        Row: {
          course_id: string | null
          created_at: string
          creator_id: string | null
          description: string | null
          id: string
          is_published: boolean | null
          level: string | null
          question_count: number | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          level?: string | null
          question_count?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          level?: string | null
          question_count?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_sets_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string
          creator_id: string | null
          exam_id: string | null
          explanation: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string | null
          option_d: string | null
          option_e: string | null
          option_f: string | null
          option_g: string | null
          option_h: string | null
          question_order: number | null
          question_text: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          creator_id?: string | null
          exam_id?: string | null
          explanation?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c?: string | null
          option_d?: string | null
          option_e?: string | null
          option_f?: string | null
          option_g?: string | null
          option_h?: string | null
          question_order?: number | null
          question_text: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          creator_id?: string | null
          exam_id?: string | null
          explanation?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string | null
          option_d?: string | null
          option_e?: string | null
          option_f?: string | null
          option_g?: string | null
          option_h?: string | null
          question_order?: number | null
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_resources: {
        Row: {
          created_at: string
          description: string | null
          group_id: string
          id: string
          resource_id: string | null
          resource_type: string | null
          resource_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_id: string
          id?: string
          resource_id?: string | null
          resource_type?: string | null
          resource_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          group_id?: string
          id?: string
          resource_id?: string | null
          resource_type?: string | null
          resource_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_resources_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          category: string | null
          cover_image_url: string | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          is_public: boolean | null
          max_members: number | null
          member_count: number | null
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          max_members?: number | null
          member_count?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          max_members?: number | null
          member_count?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_book_progress: {
        Row: {
          book_id: string | null
          completed_at: string | null
          created_at: string
          current_position: number | null
          id: string
          is_completed: boolean | null
          last_read_at: string | null
          total_time_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id?: string | null
          completed_at?: string | null
          created_at?: string
          current_position?: number | null
          id?: string
          is_completed?: boolean | null
          last_read_at?: string | null
          total_time_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string | null
          completed_at?: string | null
          created_at?: string
          current_position?: number | null
          id?: string
          is_completed?: boolean | null
          last_read_at?: string | null
          total_time_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_book_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string | null
          enrolled_at: string
          id: string
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string
          id?: string
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string
          id?: string
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_progress: {
        Row: {
          completed_at: string | null
          course_id: string | null
          created_at: string
          id: string
          is_completed: boolean | null
          last_watched_at: string | null
          lesson_id: string | null
          updated_at: string
          user_id: string
          watch_time_seconds: number | null
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string | null
          lesson_id?: string | null
          updated_at?: string
          user_id: string
          watch_time_seconds?: number | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string | null
          lesson_id?: string | null
          updated_at?: string
          user_id?: string
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_course_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_flashcard_progress: {
        Row: {
          created_at: string
          flashcard_id: string | null
          id: string
          is_remembered: boolean | null
          last_reviewed_at: string | null
          review_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          flashcard_id?: string | null
          id?: string
          is_remembered?: boolean | null
          last_reviewed_at?: string | null
          review_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          flashcard_id?: string | null
          id?: string
          is_remembered?: boolean | null
          last_reviewed_at?: string | null
          review_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_flashcard_progress_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_flashcards: {
        Row: {
          back: string
          created_at: string
          deck_id: string
          front: string
          hint: string | null
          id: string
          source_id: string | null
          source_type: string | null
        }
        Insert: {
          back: string
          created_at?: string
          deck_id: string
          front: string
          hint?: string | null
          id?: string
          source_id?: string | null
          source_type?: string | null
        }
        Update: {
          back?: string
          created_at?: string
          deck_id?: string
          front?: string
          hint?: string | null
          id?: string
          source_id?: string | null
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_podcast_progress: {
        Row: {
          completed: boolean | null
          created_at: string
          current_time_seconds: number
          id: string
          last_played_at: string | null
          podcast_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          current_time_seconds?: number
          id?: string
          last_played_at?: string | null
          podcast_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          current_time_seconds?: number
          id?: string
          last_played_at?: string | null
          podcast_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_podcast_progress_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_smart_recommendations: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          recommendations: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          recommendations: Json
          user_id: string
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          recommendations?: Json
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_certificate_number: { Args: never; Returns: string }
      get_leaderboard: {
        Args: { limit_count?: number }
        Returns: {
          avatar_url: string
          full_name: string
          level: number
          points: number
          rank: number
          total_correct_answers: number
          total_exams_taken: number
          user_id: string
          username: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_expired: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "teacher"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "teacher"],
    },
  },
} as const
