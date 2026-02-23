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
      analytics_cache: {
        Row: {
          key: string
          source: string
          updated_at: string
          value: number
        }
        Insert: {
          key: string
          source?: string
          updated_at?: string
          value: number
        }
        Update: {
          key?: string
          source?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          channel: string
          html_body: string | null
          id: string
          is_active: boolean
          name: string
          subject: string
          template_key: string
          text_body: string | null
          updated_at: string
          updated_by: string | null
          variables: Json
          version: number
        }
        Insert: {
          channel?: string
          html_body?: string | null
          id?: string
          is_active?: boolean
          name?: string
          subject: string
          template_key: string
          text_body?: string | null
          updated_at?: string
          updated_by?: string | null
          variables?: Json
          version?: number
        }
        Update: {
          channel?: string
          html_body?: string | null
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          template_key?: string
          text_body?: string | null
          updated_at?: string
          updated_by?: string | null
          variables?: Json
          version?: number
        }
        Relationships: []
      }
      invoice_details: {
        Row: {
          invoice_address: string
          invoice_city: string
          invoice_email: string
          invoice_name: string
          invoice_vat: string
          invoice_zip: string
          registration_id: string
          updated_at: string | null
        }
        Insert: {
          invoice_address: string
          invoice_city: string
          invoice_email: string
          invoice_name: string
          invoice_vat: string
          invoice_zip: string
          registration_id: string
          updated_at?: string | null
        }
        Update: {
          invoice_address?: string
          invoice_city?: string
          invoice_email?: string
          invoice_name?: string
          invoice_vat?: string
          invoice_zip?: string
          registration_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_details_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_logs: {
        Row: {
          channel: string
          created_at: string
          error: string | null
          id: string
          payment_url: string | null
          provider: string
          provider_message_id: string | null
          registration_id: string
          status: string
          template_key: string
          updated_at: string
        }
        Insert: {
          channel?: string
          created_at?: string
          error?: string | null
          id?: string
          payment_url?: string | null
          provider: string
          provider_message_id?: string | null
          registration_id: string
          status?: string
          template_key: string
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          error?: string | null
          id?: string
          payment_url?: string | null
          provider?: string
          provider_message_id?: string | null
          registration_id?: string
          status?: string
          template_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_logs_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          eupago_ref: string | null
          event_type: string
          id: string
          idempotency_key: string
          payload: Json
          processed_at: string | null
          received_at: string
          registration_id: string | null
        }
        Insert: {
          eupago_ref?: string | null
          event_type: string
          id?: string
          idempotency_key: string
          payload?: Json
          processed_at?: string | null
          received_at?: string
          registration_id?: string | null
        }
        Update: {
          eupago_ref?: string | null
          event_type?: string
          id?: string
          idempotency_key?: string
          payload?: Json
          processed_at?: string | null
          received_at?: string
          registration_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          created_at: string | null
          do_not_contact: boolean
          duvida: string | null
          edit_token: string | null
          edit_token_created_at: string | null
          email: string
          eupago_ref: string | null
          eupago_transaction_id: string | null
          first_name: string | null
          followup_stage: number
          gender_override: string | null
          gift_code: string | null
          gifted_at: string | null
          id: string
          invoice_sent: boolean
          is_gift: boolean
          last_followup_at: string | null
          last_name: string | null
          last_payment_link: string | null
          last_payment_link_sent_at: string | null
          name: string
          next_followup_at: string | null
          order_id: string | null
          paid_at: string | null
          payment_link_created_at: string | null
          plan_selected: string | null
          premium_granted_at: string | null
          premium_granted_by: string | null
          premium_unlocked: boolean | null
          referral_code: string
          referred_by: string | null
          registration_source: string
          role: string | null
          sources: string | null
          step_reached: number | null
          team_size: string | null
          upgrade_clicked_at: string | null
          webinar: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string | null
          do_not_contact?: boolean
          duvida?: string | null
          edit_token?: string | null
          edit_token_created_at?: string | null
          email: string
          eupago_ref?: string | null
          eupago_transaction_id?: string | null
          first_name?: string | null
          followup_stage?: number
          gender_override?: string | null
          gift_code?: string | null
          gifted_at?: string | null
          id?: string
          invoice_sent?: boolean
          is_gift?: boolean
          last_followup_at?: string | null
          last_name?: string | null
          last_payment_link?: string | null
          last_payment_link_sent_at?: string | null
          name: string
          next_followup_at?: string | null
          order_id?: string | null
          paid_at?: string | null
          payment_link_created_at?: string | null
          plan_selected?: string | null
          premium_granted_at?: string | null
          premium_granted_by?: string | null
          premium_unlocked?: boolean | null
          referral_code: string
          referred_by?: string | null
          registration_source?: string
          role?: string | null
          sources?: string | null
          step_reached?: number | null
          team_size?: string | null
          upgrade_clicked_at?: string | null
          webinar?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string | null
          do_not_contact?: boolean
          duvida?: string | null
          edit_token?: string | null
          edit_token_created_at?: string | null
          email?: string
          eupago_ref?: string | null
          eupago_transaction_id?: string | null
          first_name?: string | null
          followup_stage?: number
          gender_override?: string | null
          gift_code?: string | null
          gifted_at?: string | null
          id?: string
          invoice_sent?: boolean
          is_gift?: boolean
          last_followup_at?: string | null
          last_name?: string | null
          last_payment_link?: string | null
          last_payment_link_sent_at?: string | null
          name?: string
          next_followup_at?: string | null
          order_id?: string | null
          paid_at?: string | null
          payment_link_created_at?: string | null
          plan_selected?: string | null
          premium_granted_at?: string | null
          premium_granted_by?: string | null
          premium_unlocked?: boolean | null
          referral_code?: string
          referred_by?: string | null
          registration_source?: string
          role?: string | null
          sources?: string | null
          step_reached?: number | null
          team_size?: string | null
          upgrade_clicked_at?: string | null
          webinar?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
