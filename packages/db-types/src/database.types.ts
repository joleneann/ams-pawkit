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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string
          id: number
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          attached_kit_id: string | null
          audience_count: number | null
          audience_filter: Json
          clinic_id: string
          composed_message_text_en: string
          composed_message_text_mr: string | null
          created_at: string
          id: string
          sent_at: string | null
          topic_en: string
          topic_mr: string | null
          updated_at: string
          vet_id: string
        }
        Insert: {
          attached_kit_id?: string | null
          audience_count?: number | null
          audience_filter?: Json
          clinic_id: string
          composed_message_text_en: string
          composed_message_text_mr?: string | null
          created_at?: string
          id?: string
          sent_at?: string | null
          topic_en: string
          topic_mr?: string | null
          updated_at?: string
          vet_id: string
        }
        Update: {
          attached_kit_id?: string | null
          audience_count?: number | null
          audience_filter?: Json
          clinic_id?: string
          composed_message_text_en?: string
          composed_message_text_mr?: string | null
          created_at?: string
          id?: string
          sent_at?: string | null
          topic_en?: string
          topic_mr?: string | null
          updated_at?: string
          vet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_vet_id_fkey"
            columns: ["vet_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_broadcasts_attached_kit"
            columns: ["attached_kit_id"]
            isOneToOne: false
            referencedRelation: "health_kits"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts_read: {
        Row: {
          broadcast_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          broadcast_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          broadcast_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_read_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_read_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          gst: string | null
          id: string
          license: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          gst?: string | null
          id?: string
          license?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          gst?: string | null
          id?: string
          license?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      follow_up_windows: {
        Row: {
          closed_at: string | null
          closed_reason: string | null
          closes_at: string
          created_at: string
          id: string
          opened_at: string
          pet_id: string
          thread_id: string
          visit_id: string
          window_days: number
        }
        Insert: {
          closed_at?: string | null
          closed_reason?: string | null
          closes_at: string
          created_at?: string
          id?: string
          opened_at?: string
          pet_id: string
          thread_id: string
          visit_id: string
          window_days: number
        }
        Update: {
          closed_at?: string | null
          closed_reason?: string | null
          closes_at?: string
          created_at?: string
          id?: string
          opened_at?: string
          pet_id?: string
          thread_id?: string
          visit_id?: string
          window_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_windows_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_windows_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      health_kits: {
        Row: {
          body_en: string
          body_mr: string | null
          clinic_id: string
          cover_image_url: string | null
          created_at: string
          escalation_en: string | null
          escalation_mr: string | null
          id: string
          key_points_en: Json
          key_points_mr: Json | null
          public_slug: string | null
          published: boolean
          published_at: string | null
          share_count: number
          title_en: string
          title_mr: string | null
          updated_at: string
          vet_id: string
          warning_signs_en: string | null
          warning_signs_mr: string | null
        }
        Insert: {
          body_en: string
          body_mr?: string | null
          clinic_id: string
          cover_image_url?: string | null
          created_at?: string
          escalation_en?: string | null
          escalation_mr?: string | null
          id?: string
          key_points_en?: Json
          key_points_mr?: Json | null
          public_slug?: string | null
          published?: boolean
          published_at?: string | null
          share_count?: number
          title_en: string
          title_mr?: string | null
          updated_at?: string
          vet_id: string
          warning_signs_en?: string | null
          warning_signs_mr?: string | null
        }
        Update: {
          body_en?: string
          body_mr?: string | null
          clinic_id?: string
          cover_image_url?: string | null
          created_at?: string
          escalation_en?: string | null
          escalation_mr?: string | null
          id?: string
          key_points_en?: Json
          key_points_mr?: Json | null
          public_slug?: string | null
          published?: boolean
          published_at?: string | null
          share_count?: number
          title_en?: string
          title_mr?: string | null
          updated_at?: string
          vet_id?: string
          warning_signs_en?: string | null
          warning_signs_mr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_kits_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_kits_vet_id_fkey"
            columns: ["vet_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoice_line_items: {
        Row: {
          id: string
          invoice_id: string
          item_code: string | null
          item_name: string
          item_type: string
          line_total_inr: number
          qty: number
          unit_price_inr: number
        }
        Insert: {
          id?: string
          invoice_id: string
          item_code?: string | null
          item_name: string
          item_type: string
          line_total_inr: number
          qty?: number
          unit_price_inr: number
        }
        Update: {
          id?: string
          invoice_id?: string
          item_code?: string | null
          item_name?: string
          item_type?: string
          line_total_inr?: number
          qty?: number
          unit_price_inr?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          gst_inr: number | null
          household_id: string
          id: string
          invoice_number: string
          issued_date: string
          paid_at: string
          pet_id: string
          status: string
          subtotal_inr: number
          total_inr: number
          updated_at: string
          visit_id: string | null
        }
        Insert: {
          created_at?: string
          gst_inr?: number | null
          household_id: string
          id?: string
          invoice_number: string
          issued_date?: string
          paid_at?: string
          pet_id: string
          status?: string
          subtotal_inr: number
          total_inr: number
          updated_at?: string
          visit_id?: string | null
        }
        Update: {
          created_at?: string
          gst_inr?: number | null
          household_id?: string
          id?: string
          invoice_number?: string
          issued_date?: string
          paid_at?: string
          pet_id?: string
          status?: string
          subtotal_inr?: number
          total_inr?: number
          updated_at?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          ai_drafted_reply: string | null
          attachment_type: string | null
          attachment_url: string | null
          body: string | null
          bucket: string | null
          bucket_assigned_at: string | null
          created_at: string
          household_id: string
          id: string
          pet_id: string | null
          read_at: string | null
          replied_at: string | null
          replied_by: string | null
          sender_id: string | null
          sender_type: string
          thread_id: string
        }
        Insert: {
          ai_drafted_reply?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          body?: string | null
          bucket?: string | null
          bucket_assigned_at?: string | null
          created_at?: string
          household_id: string
          id?: string
          pet_id?: string | null
          read_at?: string | null
          replied_at?: string | null
          replied_by?: string | null
          sender_id?: string | null
          sender_type: string
          thread_id: string
        }
        Update: {
          ai_drafted_reply?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          body?: string | null
          bucket?: string | null
          bucket_assigned_at?: string | null
          created_at?: string
          household_id?: string
          id?: string
          pet_id?: string | null
          read_at?: string | null
          replied_at?: string | null
          replied_by?: string | null
          sender_id?: string | null
          sender_type?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_replied_by_fkey"
            columns: ["replied_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          age_years_at_entry: number | null
          algorithm_confidence: number | null
          algorithm_match_primary: string | null
          algorithm_match_secondary: string | null
          allergies: string[] | null
          avatar_url: string | null
          birthday: string | null
          breed: string | null
          chronic_conditions: string[] | null
          clinic_id: string
          clinical_lock: boolean
          created_at: string
          current_medications: string[] | null
          deceased: boolean
          deceased_at: string | null
          fur_match_primary: string | null
          fur_match_secondary: string | null
          household_id: string
          id: string
          is_auto_pair: boolean
          microchip_id: string | null
          name: string
          regular_vet_id: string | null
          sex: string | null
          species: string
          updated_at: string
          user_override_at: string | null
          weight_kg: number | null
        }
        Insert: {
          age_years_at_entry?: number | null
          algorithm_confidence?: number | null
          algorithm_match_primary?: string | null
          algorithm_match_secondary?: string | null
          allergies?: string[] | null
          avatar_url?: string | null
          birthday?: string | null
          breed?: string | null
          chronic_conditions?: string[] | null
          clinic_id: string
          clinical_lock?: boolean
          created_at?: string
          current_medications?: string[] | null
          deceased?: boolean
          deceased_at?: string | null
          fur_match_primary?: string | null
          fur_match_secondary?: string | null
          household_id: string
          id?: string
          is_auto_pair?: boolean
          microchip_id?: string | null
          name: string
          regular_vet_id?: string | null
          sex?: string | null
          species: string
          updated_at?: string
          user_override_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          age_years_at_entry?: number | null
          algorithm_confidence?: number | null
          algorithm_match_primary?: string | null
          algorithm_match_secondary?: string | null
          allergies?: string[] | null
          avatar_url?: string | null
          birthday?: string | null
          breed?: string | null
          chronic_conditions?: string[] | null
          clinic_id?: string
          clinical_lock?: boolean
          created_at?: string
          current_medications?: string[] | null
          deceased?: boolean
          deceased_at?: string | null
          fur_match_primary?: string | null
          fur_match_secondary?: string | null
          household_id?: string
          id?: string
          is_auto_pair?: boolean
          microchip_id?: string | null
          name?: string
          regular_vet_id?: string | null
          sex?: string | null
          species?: string
          updated_at?: string
          user_override_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pets_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pets_regular_vet_id_fkey"
            columns: ["regular_vet_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          clinic_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          household_id: string | null
          id: string
          phone: string | null
          preferred_language: string
          role: string
          updated_at: string
          vet_license: string | null
        }
        Insert: {
          avatar_url?: string | null
          clinic_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          household_id?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string
          role: string
          updated_at?: string
          vet_license?: string | null
        }
        Update: {
          avatar_url?: string | null
          clinic_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          household_id?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string
          role?: string
          updated_at?: string
          vet_license?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccinations: {
        Row: {
          administered_date: string
          batch_number: string | null
          created_at: string
          id: string
          next_due_date: string | null
          notes: string | null
          pet_id: string
          updated_at: string
          vaccine_type: string
          visit_id: string | null
        }
        Insert: {
          administered_date: string
          batch_number?: string | null
          created_at?: string
          id?: string
          next_due_date?: string | null
          notes?: string | null
          pet_id: string
          updated_at?: string
          vaccine_type: string
          visit_id?: string | null
        }
        Update: {
          administered_date?: string
          batch_number?: string | null
          created_at?: string
          id?: string
          next_due_date?: string | null
          notes?: string | null
          pet_id?: string
          updated_at?: string
          vaccine_type?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          chief_complaint: string | null
          created_at: string
          diagnosis: string | null
          id: string
          pet_id: string
          soap_note: string | null
          updated_at: string
          vet_id: string | null
          visit_date: string
          visit_type: string
        }
        Insert: {
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          id?: string
          pet_id: string
          soap_note?: string | null
          updated_at?: string
          vet_id?: string | null
          visit_date: string
          visit_type: string
        }
        Update: {
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          id?: string
          pet_id?: string
          soap_note?: string | null
          updated_at?: string
          vet_id?: string | null
          visit_date?: string
          visit_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_vet_id_fkey"
            columns: ["vet_id"]
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
      days_ago: { Args: { n: number }; Returns: string }
      days_ahead: { Args: { n: number }; Returns: string }
      months_ago: { Args: { n: number }; Returns: string }
      reset_all_data: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
