import { Json } from "@/integrations/supabase/types";

export interface UsageLog {
  id: string;
  user_id: string;
  action: string;
  details: string | null;
  metadata: Json;
  created_at: string;
}

export interface UsageStats {
  examsCreated: number;
  questionsGenerated: number;
  examsTaken: number;
}
