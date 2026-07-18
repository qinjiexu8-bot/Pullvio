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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      download_artifacts: {
        Row: {
          checksum_sha256: string | null
          content_disposition: string | null
          content_type: string
          created_at: string
          expires_at: string | null
          job_id: string
          storage_bucket: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          checksum_sha256?: string | null
          content_disposition?: string | null
          content_type: string
          created_at?: string
          expires_at?: string | null
          job_id: string
          storage_bucket: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          checksum_sha256?: string | null
          content_disposition?: string | null
          content_type?: string
          created_at?: string
          expires_at?: string | null
          job_id?: string
          storage_bucket?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "download_artifacts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "download_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      download_jobs: {
        Row: {
          anonymous_subject: string | null
          attempt_count: number
          batch_id: string | null
          batch_position: number | null
          cancellation_requested_at: string | null
          completed_at: string | null
          created_at: string
          failure_code: string | null
          file_size_bytes: number | null
          history_expires_at: string | null
          id: string
          idempotency_key: string | null
          lease_expires_at: string | null
          max_attempts: number
          media_kind: string
          network_subject: string | null
          original_duration_seconds: number | null
          plan_code: string
          priority: number
          queue_message_sent_at: string | null
          requested_format: string
          requested_quality: string
          source_host: string
          source_platform: string
          source_url: string
          started_at: string | null
          status: string
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          user_id: string | null
          worker_id: string | null
        }
        Insert: {
          anonymous_subject?: string | null
          attempt_count?: number
          batch_id?: string | null
          batch_position?: number | null
          cancellation_requested_at?: string | null
          completed_at?: string | null
          created_at?: string
          failure_code?: string | null
          file_size_bytes?: number | null
          history_expires_at?: string | null
          id?: string
          idempotency_key?: string | null
          lease_expires_at?: string | null
          max_attempts?: number
          media_kind?: string
          network_subject?: string | null
          original_duration_seconds?: number | null
          plan_code?: string
          priority?: number
          queue_message_sent_at?: string | null
          requested_format?: string
          requested_quality?: string
          source_host: string
          source_platform?: string
          source_url: string
          started_at?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
          worker_id?: string | null
        }
        Update: {
          anonymous_subject?: string | null
          attempt_count?: number
          batch_id?: string | null
          batch_position?: number | null
          cancellation_requested_at?: string | null
          completed_at?: string | null
          created_at?: string
          failure_code?: string | null
          file_size_bytes?: number | null
          history_expires_at?: string | null
          id?: string
          idempotency_key?: string | null
          lease_expires_at?: string | null
          max_attempts?: number
          media_kind?: string
          network_subject?: string | null
          original_duration_seconds?: number | null
          plan_code?: string
          priority?: number
          queue_message_sent_at?: string | null
          requested_format?: string
          requested_quality?: string
          source_host?: string
          source_platform?: string
          source_url?: string
          started_at?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
          worker_id?: string | null
        }
        Relationships: []
      }
      media_runtime_config: {
        Row: {
          accepting_jobs: boolean
          anonymous_active_limit: number
          anonymous_burst_limit: number
          anonymous_success_limit: number
          authenticated_active_limit: number
          authenticated_burst_limit: number
          id: boolean
          network_burst_limit: number
          updated_at: string
        }
        Insert: {
          accepting_jobs?: boolean
          anonymous_active_limit?: number
          anonymous_burst_limit?: number
          anonymous_success_limit?: number
          authenticated_active_limit?: number
          authenticated_burst_limit?: number
          id?: boolean
          network_burst_limit?: number
          updated_at?: string
        }
        Update: {
          accepting_jobs?: boolean
          anonymous_active_limit?: number
          anonymous_burst_limit?: number
          anonymous_success_limit?: number
          authenticated_active_limit?: number
          authenticated_burst_limit?: number
          id?: boolean
          network_burst_limit?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          locale: string
          theme: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          locale?: string
          theme?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          locale?: string
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_code: string
          provider: string
          provider_customer_id: string | null
          provider_price_id: string | null
          provider_subscription_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_code?: string
          provider?: string
          provider_customer_id?: string | null
          provider_price_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_code?: string
          provider?: string
          provider_customer_id?: string | null
          provider_price_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_daily: {
        Row: {
          bytes_output: number
          jobs_failed: number
          jobs_started: number
          jobs_succeeded: number
          plan_code: string
          processing_seconds: number
          quota_limit: number | null
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          bytes_output?: number
          jobs_failed?: number
          jobs_started?: number
          jobs_succeeded?: number
          plan_code?: string
          processing_seconds?: number
          quota_limit?: number | null
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          bytes_output?: number
          jobs_failed?: number
          jobs_started?: number
          jobs_succeeded?: number
          plan_code?: string
          processing_seconds?: number
          quota_limit?: number | null
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          locale: string
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          locale?: string
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          locale?: string
          source?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_media_job: {
        Args: {
          p_job_id: string
          p_lease_seconds?: number
          p_worker_id: string
        }
        Returns: {
          attempt_count: number
          job_id: string
          max_attempts: number
          media_kind: string
          requested_format: string
          requested_quality: string
          result_code: string
          source_host: string
          source_platform: string
          source_url: string
        }[]
      }
      complete_media_job: {
        Args: {
          p_artifact_expires_at: string
          p_checksum_sha256: string
          p_content_disposition: string
          p_content_type: string
          p_duration_seconds: number
          p_file_size_bytes: number
          p_job_id: string
          p_processing_seconds: number
          p_storage_bucket: string
          p_storage_path: string
          p_thumbnail_url: string
          p_title: string
          p_worker_id: string
        }
        Returns: boolean
      }
      fail_media_job: {
        Args: {
          p_failure_code: string
          p_job_id: string
          p_processing_seconds?: number
          p_retryable: boolean
          p_worker_id: string
        }
        Returns: string
      }
      fail_undispatched_media_job: {
        Args: { p_job_id: string }
        Returns: boolean
      }
      heartbeat_media_job: {
        Args: {
          p_job_id: string
          p_lease_seconds?: number
          p_worker_id: string
        }
        Returns: boolean
      }
      mark_media_job_dispatched: {
        Args: { p_job_id: string }
        Returns: boolean
      }
      media_job_should_cancel: {
        Args: { p_job_id: string; p_worker_id: string }
        Returns: boolean
      }
      reserve_media_job: {
        Args: {
          p_anonymous_subject: string
          p_idempotency_key: string
          p_media_kind: string
          p_network_subject: string
          p_requested_format: string
          p_requested_quality: string
          p_source_host: string
          p_source_platform: string
          p_source_url: string
          p_user_id: string
        }
        Returns: {
          is_duplicate: boolean
          job_created_at: string
          job_id: string
          job_status: string
          quota_limit: number
          quota_remaining: number
          result_code: string
        }[]
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
