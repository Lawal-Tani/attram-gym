export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      challenge_templates: {
        Row: {
          category: string
          challenge_type: string
          created_at: string | null
          description: string
          difficulty: string
          duration_days: number
          id: string
          is_active: boolean | null
          is_recurring: boolean | null
          requirements: string[] | null
          reward_points: number
          target_value: number
          title: string
          unit: string
          updated_at: string | null
        }
        Insert: {
          category: string
          challenge_type: string
          created_at?: string | null
          description: string
          difficulty: string
          duration_days: number
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          requirements?: string[] | null
          reward_points?: number
          target_value: number
          title: string
          unit: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          challenge_type?: string
          created_at?: string | null
          description?: string
          difficulty?: string
          duration_days?: number
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          requirements?: string[] | null
          reward_points?: number
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          category: string
          challenge_type: string
          created_at: string | null
          current_value: number
          description: string
          difficulty: string
          end_date: string
          id: string
          is_active: boolean | null
          is_completed: boolean | null
          reward_points: number
          start_date: string
          target_value: number
          title: string
          unit: string
          updated_at: string | null
        }
        Insert: {
          category: string
          challenge_type: string
          created_at?: string | null
          current_value?: number
          description: string
          difficulty: string
          end_date: string
          id?: string
          is_active?: boolean | null
          is_completed?: boolean | null
          reward_points?: number
          start_date: string
          target_value: number
          title: string
          unit: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          challenge_type?: string
          created_at?: string | null
          current_value?: number
          description?: string
          difficulty?: string
          end_date?: string
          id?: string
          is_active?: boolean | null
          is_completed?: boolean | null
          reward_points?: number
          start_date?: string
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      exercise_videos: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          exercise_name: string
          id: string
          thumbnail_url: string | null
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          exercise_name: string
          id?: string
          thumbnail_url?: string | null
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          exercise_name?: string
          id?: string
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string
          equipment: string | null
          id: string
          name: string
          order_index: number
          reps: string
          rest_time: string
          sets: string
          workout_plan_id: string | null
        }
        Insert: {
          created_at?: string
          equipment?: string | null
          id?: string
          name: string
          order_index?: number
          reps: string
          rest_time: string
          sets: string
          workout_plan_id?: string | null
        }
        Update: {
          created_at?: string
          equipment?: string | null
          id?: string
          name?: string
          order_index?: number
          reps?: string
          rest_time?: string
          sets?: string
          workout_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_entries: {
        Row: {
          created_at: string
          date: string | null
          duration_minutes: number | null
          exercise_name: string
          id: string
          reps: number | null
          sets: number | null
          user_id: string | null
          weight: number | null
          workout_type: string | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          duration_minutes?: number | null
          exercise_name: string
          id?: string
          reps?: number | null
          sets?: number | null
          user_id?: string | null
          weight?: number | null
          workout_type?: string | null
        }
        Update: {
          created_at?: string
          date?: string | null
          duration_minutes?: number | null
          exercise_name?: string
          id?: string
          reps?: number | null
          sets?: number | null
          user_id?: string | null
          weight?: number | null
          workout_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          progress: number | null
          unlocked: boolean | null
          unlocked_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          progress?: number | null
          unlocked?: boolean | null
          unlocked_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          progress?: number | null
          unlocked?: boolean | null
          unlocked_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          is_completed: boolean | null
          progress: number
          started_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: number
          started_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: number
          started_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          best_streak: number | null
          current_streak: number | null
          experience: number | null
          experience_to_next: number | null
          id: string
          last_workout_date: string | null
          level: number | null
          total_duration_minutes: number | null
          total_workouts: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          best_streak?: number | null
          current_streak?: number | null
          experience?: number | null
          experience_to_next?: number | null
          id?: string
          last_workout_date?: string | null
          level?: number | null
          total_duration_minutes?: number | null
          total_workouts?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          best_streak?: number | null
          current_streak?: number | null
          experience?: number | null
          experience_to_next?: number | null
          id?: string
          last_workout_date?: string | null
          level?: number | null
          total_duration_minutes?: number | null
          total_workouts?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          equipment_access: string[] | null
          experience_years: number | null
          fitness_level: string | null
          goal: string
          id: string
          injuries: string | null
          limitations: string[] | null
          membership_expiry: string | null
          name: string
          payment_method: string | null
          preferred_duration: string | null
          role: string
          start_date: string | null
          subscription_plan: string | null
          updated_at: string
          workout_frequency: string | null
        }
        Insert: {
          created_at?: string
          equipment_access?: string[] | null
          experience_years?: number | null
          fitness_level?: string | null
          goal: string
          id: string
          injuries?: string | null
          limitations?: string[] | null
          membership_expiry?: string | null
          name: string
          payment_method?: string | null
          preferred_duration?: string | null
          role?: string
          start_date?: string | null
          subscription_plan?: string | null
          updated_at?: string
          workout_frequency?: string | null
        }
        Update: {
          created_at?: string
          equipment_access?: string[] | null
          experience_years?: number | null
          fitness_level?: string | null
          goal?: string
          id?: string
          injuries?: string | null
          limitations?: string[] | null
          membership_expiry?: string | null
          name?: string
          payment_method?: string | null
          preferred_duration?: string | null
          role?: string
          start_date?: string | null
          subscription_plan?: string | null
          updated_at?: string
          workout_frequency?: string | null
        }
        Relationships: []
      }
      workout_completions: {
        Row: {
          completed_date: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          user_id: string | null
          workout_plan_id: string | null
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          user_id?: string | null
          workout_plan_id?: string | null
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          user_id?: string | null
          workout_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_completions_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          created_at: string
          day_of_week: string
          fitness_level: string | null
          goal_type: string
          id: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          day_of_week: string
          fitness_level?: string | null
          goal_type: string
          id?: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          day_of_week?: string
          fitness_level?: string | null
          goal_type?: string
          id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
