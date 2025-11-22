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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      counterfeit_reports: {
        Row: {
          batch_number: string | null
          created_at: string | null
          description: string
          drug_name: string
          id: string
          is_anonymous: boolean | null
          is_verified: boolean | null
          location_address: string
          location_city: string | null
          location_coordinates: unknown
          location_state: string | null
          manufacturer: string | null
          photo_urls: string[] | null
          purchase_location: string | null
          reporter_name: string | null
          reward_points: number | null
          severity: string | null
          status: string
          symptoms: string | null
          updated_at: string | null
          user_id: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          description: string
          drug_name: string
          id?: string
          is_anonymous?: boolean | null
          is_verified?: boolean | null
          location_address: string
          location_city?: string | null
          location_coordinates?: unknown
          location_state?: string | null
          manufacturer?: string | null
          photo_urls?: string[] | null
          purchase_location?: string | null
          reporter_name?: string | null
          reward_points?: number | null
          severity?: string | null
          status?: string
          symptoms?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          description?: string
          drug_name?: string
          id?: string
          is_anonymous?: boolean | null
          is_verified?: boolean | null
          location_address?: string
          location_city?: string | null
          location_coordinates?: unknown
          location_state?: string | null
          manufacturer?: string | null
          photo_urls?: string[] | null
          purchase_location?: string | null
          reporter_name?: string | null
          reward_points?: number | null
          severity?: string | null
          status?: string
          symptoms?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      drugs: {
        Row: {
          active_ingredient: string
          batch_no: string
          created_at: string | null
          dosage_form: string
          drug_id: string
          exp_date: string
          id: string
          manufacturer: string
          mfg_date: string
          name: string
          risk_level: Database["public"]["Enums"]["risk_level"]
          type: Database["public"]["Enums"]["drug_type"]
          updated_at: string | null
        }
        Insert: {
          active_ingredient: string
          batch_no: string
          created_at?: string | null
          dosage_form: string
          drug_id: string
          exp_date: string
          id?: string
          manufacturer: string
          mfg_date: string
          name: string
          risk_level?: Database["public"]["Enums"]["risk_level"]
          type?: Database["public"]["Enums"]["drug_type"]
          updated_at?: string | null
        }
        Update: {
          active_ingredient?: string
          batch_no?: string
          created_at?: string | null
          dosage_form?: string
          drug_id?: string
          exp_date?: string
          id?: string
          manufacturer?: string
          mfg_date?: string
          name?: string
          risk_level?: Database["public"]["Enums"]["risk_level"]
          type?: Database["public"]["Enums"]["drug_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      patient_history: {
        Row: {
          created_at: string | null
          dosage: string
          id: string
          medicine_name: string
          notes: string | null
          patient_id: string
          reminder_enabled: boolean | null
          reminder_frequency: string | null
          reminder_time: string | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dosage: string
          id?: string
          medicine_name: string
          notes?: string | null
          patient_id: string
          reminder_enabled?: boolean | null
          reminder_frequency?: string | null
          reminder_time?: string | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string
          id?: string
          medicine_name?: string
          notes?: string | null
          patient_id?: string
          reminder_enabled?: boolean | null
          reminder_frequency?: string | null
          reminder_time?: string | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          notification_preferences: Json | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          notification_preferences?: Json | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          notification_preferences?: Json | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scan_logs: {
        Row: {
          batch_no: string
          drug_id: string | null
          duplicate_flag: boolean | null
          id: string
          scan_id: string
          scanned_by: string | null
          status: Database["public"]["Enums"]["scan_status"]
          timestamp: string | null
        }
        Insert: {
          batch_no: string
          drug_id?: string | null
          duplicate_flag?: boolean | null
          id?: string
          scan_id: string
          scanned_by?: string | null
          status: Database["public"]["Enums"]["scan_status"]
          timestamp?: string | null
        }
        Update: {
          batch_no?: string
          drug_id?: string | null
          duplicate_flag?: boolean | null
          id?: string
          scan_id?: string
          scanned_by?: string | null
          status?: Database["public"]["Enums"]["scan_status"]
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scan_logs_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "drugs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          badges: Json | null
          created_at: string | null
          id: string
          level: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
          verified_reports_count: number | null
        }
        Insert: {
          badges?: Json | null
          created_at?: string | null
          id?: string
          level?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
          verified_reports_count?: number | null
        }
        Update: {
          badges?: Json | null
          created_at?: string | null
          id?: string
          level?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
          verified_reports_count?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "pharmacist" | "admin"
      drug_type: "authentic" | "counterfeit" | "expired"
      risk_level: "low" | "medium" | "high" | "critical"
      scan_status: "verified" | "counterfeit" | "expired" | "not_found"
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
      app_role: ["patient", "pharmacist", "admin"],
      drug_type: ["authentic", "counterfeit", "expired"],
      risk_level: ["low", "medium", "high", "critical"],
      scan_status: ["verified", "counterfeit", "expired", "not_found"],
    },
  },
} as const
