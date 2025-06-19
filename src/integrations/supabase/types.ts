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
      exercises: {
        Row: {
          created_at: string
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
      user_stats: {
        Row: {
          best_streak: number | null
          current_streak: number | null
          id: string
          last_workout_date: string | null
          total_duration_minutes: number | null
          total_workouts: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          best_streak?: number | null
          current_streak?: number | null
          id?: string
          last_workout_date?: string | null
          total_duration_minutes?: number | null
          total_workouts?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          best_streak?: number | null
          current_streak?: number | null
          id?: string
          last_workout_date?: string | null
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
          goal: string
          id: string
          membership_expiry: string | null
          name: string
          role: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          goal: string
          id: string
          membership_expiry?: string | null
          name: string
          role?: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          goal?: string
          id?: string
          membership_expiry?: string | null
          name?: string
          role?: string
          start_date?: string | null
          updated_at?: string
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
          goal_type: string
          id: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          day_of_week: string
          goal_type: string
          id?: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          day_of_week?: string
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
