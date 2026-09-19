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
      acquisition_costs: {
        Row: {
          amount: number
          category: string
          cost_date: string
          created_at: string
          description: string
          id: string
          platform: string
          updated_at: string
          webinar: string
        }
        Insert: {
          amount: number
          category?: string
          cost_date?: string
          created_at?: string
          description?: string
          id?: string
          platform: string
          updated_at?: string
          webinar?: string
        }
        Update: {
          amount?: number
          category?: string
          cost_date?: string
          created_at?: string
          description?: string
          id?: string
          platform?: string
          updated_at?: string
          webinar?: string
        }
        Relationships: []
      }
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
      course_activity: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          edition: string | null
          id: number
          previous_status: string | null
          registration_id: string | null
          status: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          edition?: string | null
          id?: never
          previous_status?: string | null
          registration_id?: string | null
          status?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          edition?: string | null
          id?: never
          previous_status?: string | null
          registration_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_activity_edition_fkey"
            columns: ["edition"]
            isOneToOne: false
            referencedRelation: "course_editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_activity_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "course_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      course_campaigns: {
        Row: {
          actor_id: string
          body: string
          channel: string
          created_at: string
          due_at: string
          edition: string
          id: string
          recipient_ids: string[]
          subject: string
        }
        Insert: {
          actor_id: string
          body: string
          channel: string
          created_at?: string
          due_at: string
          edition: string
          id: string
          recipient_ids: string[]
          subject?: string
        }
        Update: {
          actor_id?: string
          body?: string
          channel?: string
          created_at?: string
          due_at?: string
          edition?: string
          id?: string
          recipient_ids?: string[]
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_campaigns_edition_fkey"
            columns: ["edition"]
            isOneToOne: false
            referencedRelation: "course_editions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_costs: {
        Row: {
          amount: number
          category: string
          cost_date: string
          description: string
          edition: string
          id: string
          platform: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          cost_date: string
          description?: string
          edition: string
          id?: string
          platform: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          cost_date?: string
          description?: string
          edition?: string
          id?: string
          platform?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_costs_edition_fkey"
            columns: ["edition"]
            isOneToOne: false
            referencedRelation: "course_editions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_editions: {
        Row: {
          automation_enabled: boolean
          capacity: number
          early_net_cents: number
          early_until: string | null
          ends_at: string
          id: string
          invoicing_enabled: boolean
          label: string
          net_cents: number
          operations: Json
          sales_enabled: boolean
          sms_enabled: boolean
          starts_at: string
          vat_percent: number
        }
        Insert: {
          automation_enabled?: boolean
          capacity?: number
          early_net_cents: number
          early_until?: string | null
          ends_at: string
          id: string
          invoicing_enabled?: boolean
          label: string
          net_cents: number
          operations?: Json
          sales_enabled?: boolean
          sms_enabled?: boolean
          starts_at: string
          vat_percent?: number
        }
        Update: {
          automation_enabled?: boolean
          capacity?: number
          early_net_cents?: number
          early_until?: string | null
          ends_at?: string
          id?: string
          invoicing_enabled?: boolean
          label?: string
          net_cents?: number
          operations?: Json
          sales_enabled?: boolean
          sms_enabled?: boolean
          starts_at?: string
          vat_percent?: number
        }
        Relationships: []
      }
      course_email_templates: {
        Row: {
          body: string
          edition: string
          subject: string
          template: string
          updated_at: string
        }
        Insert: {
          body: string
          edition: string
          subject: string
          template: string
          updated_at?: string
        }
        Update: {
          body?: string
          edition?: string
          subject?: string
          template?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_email_templates_edition_fkey"
            columns: ["edition"]
            isOneToOne: false
            referencedRelation: "course_editions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_events: {
        Row: {
          course_id: string
          created_at: string
          edition: string | null
          id: string
          name: string
          session_id: string
        }
        Insert: {
          course_id?: string
          created_at?: string
          edition?: string | null
          id: string
          name: string
          session_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          edition?: string | null
          id?: string
          name?: string
          session_id?: string
        }
        Relationships: []
      }
      course_invoices: {
        Row: {
          billing: Json
          document_id: string | null
          emailed_at: string | null
          finalized_at: string | null
          registration_id: string
          state: string
          updated_at: string
        }
        Insert: {
          billing?: Json
          document_id?: string | null
          emailed_at?: string | null
          finalized_at?: string | null
          registration_id: string
          state?: string
          updated_at?: string
        }
        Update: {
          billing?: Json
          document_id?: string | null
          emailed_at?: string | null
          finalized_at?: string | null
          registration_id?: string
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_invoices_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "course_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      course_jobs: {
        Row: {
          attempts: number
          campaign_id: string | null
          completed_at: string | null
          created_at: string
          due_at: string
          error_code: string | null
          first_attempt_at: string | null
          id: string
          kind: string
          lease: string | null
          locked_at: string | null
          payload: Json | null
          provider_id: string | null
          registration_id: string
          state: string
          template: string
        }
        Insert: {
          attempts?: number
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          due_at: string
          error_code?: string | null
          first_attempt_at?: string | null
          id?: string
          kind: string
          lease?: string | null
          locked_at?: string | null
          payload?: Json | null
          provider_id?: string | null
          registration_id: string
          state?: string
          template: string
        }
        Update: {
          attempts?: number
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          due_at?: string
          error_code?: string | null
          first_attempt_at?: string | null
          id?: string
          kind?: string
          lease?: string | null
          locked_at?: string | null
          payload?: Json | null
          provider_id?: string | null
          registration_id?: string
          state?: string
          template?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_jobs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "course_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_jobs_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "course_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      course_payments: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          net_cents: number
          paid_at: string | null
          paid_transaction: string | null
          payment_url: string | null
          provider_transaction: string | null
          registration_id: string
          state: string
          vat_percent: number
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          net_cents: number
          paid_at?: string | null
          paid_transaction?: string | null
          payment_url?: string | null
          provider_transaction?: string | null
          registration_id: string
          state?: string
          vat_percent: number
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          net_cents?: number
          paid_at?: string | null
          paid_transaction?: string | null
          payment_url?: string | null
          provider_transaction?: string | null
          registration_id?: string
          state?: string
          vat_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "course_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      course_registrations: {
        Row: {
          after_session: string
          analytics_session: string | null
          attribution: Json
          before_session: string
          course_id: string
          created_at: string
          do_not_contact: boolean
          edition: string
          email: string
          id: string
          marketing_consent: boolean
          name: string
          next_followup_at: string | null
          notes: string
          paid_at: string | null
          phone: string
          privacy_version: string
          request_id: string
          resource_token: string
          sms_consent: boolean
          status: string
          terms_version: string
          updated_at: string
        }
        Insert: {
          after_session?: string
          analytics_session?: string | null
          attribution?: Json
          before_session?: string
          course_id?: string
          created_at?: string
          do_not_contact?: boolean
          edition: string
          email: string
          id?: string
          marketing_consent?: boolean
          name: string
          next_followup_at?: string | null
          notes?: string
          paid_at?: string | null
          phone?: string
          privacy_version: string
          request_id: string
          resource_token?: string
          sms_consent?: boolean
          status?: string
          terms_version?: string
          updated_at?: string
        }
        Update: {
          after_session?: string
          analytics_session?: string | null
          attribution?: Json
          before_session?: string
          course_id?: string
          created_at?: string
          do_not_contact?: boolean
          edition?: string
          email?: string
          id?: string
          marketing_consent?: boolean
          name?: string
          next_followup_at?: string | null
          notes?: string
          paid_at?: string | null
          phone?: string
          privacy_version?: string
          request_id?: string
          resource_token?: string
          sms_consent?: boolean
          status?: string
          terms_version?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_registrations_edition_fkey"
            columns: ["edition"]
            isOneToOne: false
            referencedRelation: "course_editions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_resources: {
        Row: {
          available_at: string
          description: string
          edition: string
          enabled: boolean
          id: string
          kind: string
          title: string
          url: string
        }
        Insert: {
          available_at?: string
          description?: string
          edition: string
          enabled?: boolean
          id?: string
          kind: string
          title: string
          url: string
        }
        Update: {
          available_at?: string
          description?: string
          edition?: string
          enabled?: boolean
          id?: string
          kind?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_resources_edition_fkey"
            columns: ["edition"]
            isOneToOne: false
            referencedRelation: "course_editions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sms_templates: {
        Row: {
          body: string
          edition: string
          template: string
          updated_at: string
        }
        Insert: {
          body: string
          edition: string
          template: string
          updated_at?: string
        }
        Update: {
          body?: string
          edition?: string
          template?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sms_templates_edition_fkey"
            columns: ["edition"]
            isOneToOne: false
            referencedRelation: "course_editions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_tasks: {
        Row: {
          due_at: string
          id: string
          registration_id: string
          stage: string
          state: string
          task_key: string
        }
        Insert: {
          due_at: string
          id?: string
          registration_id: string
          stage: string
          state?: string
          task_key: string
        }
        Update: {
          due_at?: string
          id?: string
          registration_id?: string
          stage?: string
          state?: string
          task_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_tasks_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "course_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      course_worker_health: {
        Row: {
          last_run_at: string
          result: string
          worker: string
        }
        Insert: {
          last_run_at: string
          result: string
          worker: string
        }
        Update: {
          last_run_at?: string
          result?: string
          worker?: string
        }
        Relationships: []
      }
      email_send_logs: {
        Row: {
          email_key: string
          error_message: string | null
          fname: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          resend_id: string | null
          sent_at: string | null
          status: string
          webinar: string
        }
        Insert: {
          email_key: string
          error_message?: string | null
          fname?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          resend_id?: string | null
          sent_at?: string | null
          status: string
          webinar: string
        }
        Update: {
          email_key?: string
          error_message?: string | null
          fname?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          resend_id?: string | null
          sent_at?: string | null
          status?: string
          webinar?: string
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
          attended_live_at: string | null
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
          group_payment_ref: string | null
          id: string
          invoice_document_id: string | null
          invoice_sent: boolean
          is_gift: boolean
          last_followup_at: string | null
          last_name: string | null
          last_payment_link: string | null
          last_payment_link_sent_at: string | null
          lost_at: string | null
          lost_reason: string | null
          name: string
          next_followup_at: string | null
          order_id: string | null
          paid_amount: number | null
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
          attended_live_at?: string | null
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
          group_payment_ref?: string | null
          id?: string
          invoice_document_id?: string | null
          invoice_sent?: boolean
          is_gift?: boolean
          last_followup_at?: string | null
          last_name?: string | null
          last_payment_link?: string | null
          last_payment_link_sent_at?: string | null
          lost_at?: string | null
          lost_reason?: string | null
          name: string
          next_followup_at?: string | null
          order_id?: string | null
          paid_amount?: number | null
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
          attended_live_at?: string | null
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
          group_payment_ref?: string | null
          id?: string
          invoice_document_id?: string | null
          invoice_sent?: boolean
          is_gift?: boolean
          last_followup_at?: string | null
          last_name?: string | null
          last_payment_link?: string | null
          last_payment_link_sent_at?: string | null
          lost_at?: string | null
          lost_reason?: string | null
          name?: string
          next_followup_at?: string | null
          order_id?: string | null
          paid_amount?: number | null
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
      scheduled_sends: {
        Row: {
          channel: string
          created_at: string
          html_body: string | null
          id: string
          metadata: Json | null
          recipients: Json
          scheduled_at: string
          status: string
          subject: string | null
          text_body: string | null
          updated_at: string
        }
        Insert: {
          channel?: string
          created_at?: string
          html_body?: string | null
          id?: string
          metadata?: Json | null
          recipients?: Json
          scheduled_at: string
          status?: string
          subject?: string | null
          text_body?: string | null
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          html_body?: string | null
          id?: string
          metadata?: Json | null
          recipients?: Json
          scheduled_at?: string
          status?: string
          subject?: string | null
          text_body?: string | null
          updated_at?: string
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
      webinar_settings: {
        Row: {
          color: string
          created_at: string | null
          cutoff_date: string | null
          emoji: string
          event_date: string | null
          label: string
          landing_visitors: number | null
          live_avg_duration: string | null
          live_date: string | null
          live_likes: number | null
          live_new_subs: number | null
          live_peak_viewers: number | null
          live_views: number | null
          price_bundle: number | null
          price_masterclass: number | null
          price_premium: number | null
          updated_at: string | null
          webinar: string
        }
        Insert: {
          color?: string
          created_at?: string | null
          cutoff_date?: string | null
          emoji?: string
          event_date?: string | null
          label: string
          landing_visitors?: number | null
          live_avg_duration?: string | null
          live_date?: string | null
          live_likes?: number | null
          live_new_subs?: number | null
          live_peak_viewers?: number | null
          live_views?: number | null
          price_bundle?: number | null
          price_masterclass?: number | null
          price_premium?: number | null
          updated_at?: string | null
          webinar: string
        }
        Update: {
          color?: string
          created_at?: string | null
          cutoff_date?: string | null
          emoji?: string
          event_date?: string | null
          label?: string
          landing_visitors?: number | null
          live_avg_duration?: string | null
          live_date?: string | null
          live_likes?: number | null
          live_new_subs?: number | null
          live_peak_viewers?: number | null
          live_views?: number | null
          price_bundle?: number | null
          price_masterclass?: number | null
          price_premium?: number | null
          updated_at?: string | null
          webinar?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_course_job: { Args: { job_kind: string }; Returns: Json }
      claim_course_payment: {
        Args: { expected_amount: number; payload: Json }
        Returns: Json
      }
      configure_course_channels: {
        Args: { edition_id: string; invoicing: boolean; sms: boolean }
        Returns: undefined
      }
      configure_course_edition: {
        Args: { edition_id: string; enabled: boolean; settings: Json }
        Returns: undefined
      }
      configure_course_operation: {
        Args: {
          edition_id: string
          enabled: boolean
          invoicing: boolean
          settings: Json
          sms: boolean
        }
        Returns: undefined
      }
      confirm_course_payment: {
        Args: {
          paid_cents: number
          payment_currency: string
          payment_state: string
          payment_uuid: string
          transaction_id: string
        }
        Returns: undefined
      }
      course_admin_required: { Args: never; Returns: undefined }
      course_edition_metrics: { Args: { edition_id?: string }; Returns: Json }
      course_job_eligible: {
        Args: { j: Database["public"]["Tables"]["course_jobs"]["Row"] }
        Returns: boolean
      }
      course_job_eligible_base: {
        Args: { j: Database["public"]["Tables"]["course_jobs"]["Row"] }
        Returns: boolean
      }
      course_metrics: { Args: never; Returns: Json }
      course_operation_counts: { Args: { edition_id?: string }; Returns: Json }
      course_period_metrics: {
        Args: { edition_id?: string; since?: string }
        Returns: Json
      }
      course_quote: { Args: { edition_id: string }; Returns: Json }
      delete_course_cost: { Args: { cost_id: string }; Returns: undefined }
      ensure_admin_role: { Args: never; Returns: undefined }
      finish_course_job: {
        Args: {
          external_id?: string
          job_id: string
          job_lease: string
          outcome: string
          reason?: string
        }
        Returns: undefined
      }
      finish_course_task: { Args: { task_uuid: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      ingest_course_request: { Args: { payload: Json }; Returns: undefined }
      manage_course_job: {
        Args: { action: string; job_uuid: string }
        Returns: undefined
      }
      prepare_course_job: {
        Args: { frozen_payload: Json; job_id: string; job_lease: string }
        Returns: boolean
      }
      queue_course_campaign: {
        Args: {
          body: string
          campaign_uuid: string
          channel: string
          edition_id: string
          recipients: string[]
          scheduled_at: string
          subject: string
        }
        Returns: number
      }
      read_course_resources: { Args: { access_token: string }; Returns: Json }
      record_course_invoice: {
        Args: { external_document_id: string; request_uuid: string }
        Returns: undefined
      }
      save_course_billing: {
        Args: { details: Json; request_token: string }
        Returns: undefined
      }
      save_course_cost: {
        Args: {
          cost_amount: number
          cost_category: string
          cost_day: string
          cost_description: string
          cost_id: string
          cost_platform: string
          edition_id: string
        }
        Returns: string
      }
      save_course_email_template: {
        Args: {
          edition_id: string
          email_body: string
          email_subject: string
          expected_updated_at: string
          template_key: string
        }
        Returns: string
      }
      save_course_resource: {
        Args: {
          active: boolean
          available: string
          edition_id: string
          resource_description: string
          resource_id: string
          resource_kind: string
          resource_title: string
          resource_url: string
        }
        Returns: string
      }
      save_course_sms_template: {
        Args: {
          edition_id: string
          expected_updated_at: string
          sms_body: string
          template_key: string
        }
        Returns: string
      }
      set_course_contact_pause: {
        Args: { paused: boolean; request_uuid: string }
        Returns: undefined
      }
      set_course_session: {
        Args: { phase: string; request_uuid: string; session_state: string }
        Returns: undefined
      }
      update_course_request: {
        Args: {
          followup: string
          new_notes: string
          new_status: string
          request_uuid: string
        }
        Returns: undefined
      }
      update_course_request_checked: {
        Args: {
          expected_followup: string
          expected_notes: string
          expected_status: string
          followup: string
          new_notes: string
          new_status: string
          request_uuid: string
        }
        Returns: undefined
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
