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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_id: string
          created_at: string
          date: string
          guests: number
          id: string
          property_id: string
          slot: string
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          date: string
          guests: number
          id?: string
          property_id: string
          slot: string
          status?: string
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          date?: string
          guests?: number
          id?: string
          property_id?: string
          slot?: string
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          active: boolean
          banner_color: string
          created_at: string
          created_by: string | null
          description: string
          discount_type: string
          discount_value: number
          end_date: string | null
          id: string
          start_date: string
          target_audience: string[]
          target_properties: string[]
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          banner_color?: string
          created_at?: string
          created_by?: string | null
          description?: string
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          start_date?: string
          target_audience?: string[]
          target_properties?: string[]
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          banner_color?: string
          created_at?: string
          created_by?: string | null
          description?: string
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          start_date?: string
          target_audience?: string[]
          target_properties?: string[]
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          participant_1: string
          participant_2: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_1: string
          participant_2: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_1?: string
          participant_2?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          max_uses: number | null
          min_order: number
          user_specific_id: string | null
          uses: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_order?: number
          user_specific_id?: string | null
          uses?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_order?: number
          user_specific_id?: string | null
          uses?: number
        }
        Relationships: []
      }
      curations: {
        Row: {
          active: boolean
          badge: string | null
          created_at: string
          emoji: string
          gradient: string
          id: string
          includes: string[]
          mood: string[]
          name: string
          original_price: number | null
          price: number
          property_id: string
          slot: string
          sort_order: number
          tagline: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          active?: boolean
          badge?: string | null
          created_at?: string
          emoji?: string
          gradient?: string
          id?: string
          includes?: string[]
          mood?: string[]
          name: string
          original_price?: number | null
          price?: number
          property_id: string
          slot?: string
          sort_order?: number
          tagline?: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          active?: boolean
          badge?: string | null
          created_at?: string
          emoji?: string
          gradient?: string
          id?: string
          includes?: string[]
          mood?: string[]
          name?: string
          original_price?: number | null
          price?: number
          property_id?: string
          slot?: string
          sort_order?: number
          tagline?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      experience_packages: {
        Row: {
          active: boolean
          created_at: string
          emoji: string
          gradient: string
          id: string
          includes: string[]
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          emoji?: string
          gradient?: string
          id?: string
          includes?: string[]
          name: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          emoji?: string
          gradient?: string
          id?: string
          includes?: string[]
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      host_listings: {
        Row: {
          amenities: string[]
          base_price: number
          capacity: number
          category: string
          created_at: string
          description: string
          discount_label: string | null
          entry_instructions: string | null
          full_description: string
          highlights: string[] | null
          host_name: string | null
          id: string
          image_urls: string[]
          lat: number | null
          lng: number | null
          location: string
          name: string
          primary_category: string | null
          property_type: string | null
          rating: number | null
          review_count: number | null
          rules: Json | null
          slots: Json | null
          status: string
          tags: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          amenities?: string[]
          base_price?: number
          capacity?: number
          category?: string
          created_at?: string
          description?: string
          discount_label?: string | null
          entry_instructions?: string | null
          full_description?: string
          highlights?: string[] | null
          host_name?: string | null
          id?: string
          image_urls?: string[]
          lat?: number | null
          lng?: number | null
          location?: string
          name: string
          primary_category?: string | null
          property_type?: string | null
          rating?: number | null
          review_count?: number | null
          rules?: Json | null
          slots?: Json | null
          status?: string
          tags?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          amenities?: string[]
          base_price?: number
          capacity?: number
          category?: string
          created_at?: string
          description?: string
          discount_label?: string | null
          entry_instructions?: string | null
          full_description?: string
          highlights?: string[] | null
          host_name?: string | null
          id?: string
          image_urls?: string[]
          lat?: number | null
          lng?: number | null
          location?: string
          name?: string
          primary_category?: string | null
          property_type?: string | null
          rating?: number | null
          review_count?: number | null
          rules?: Json | null
          slots?: Json | null
          status?: string
          tags?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      identity_verifications: {
        Row: {
          document_type: string
          document_url: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          document_type?: string
          document_url: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          document_type?: string
          document_url?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          available: boolean
          category: string
          created_at: string
          emoji: string
          id: string
          low_stock_threshold: number
          name: string
          property_id: string | null
          sort_order: number
          stock: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          category?: string
          created_at?: string
          emoji?: string
          id?: string
          low_stock_threshold?: number
          name: string
          property_id?: string | null
          sort_order?: number
          stock?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          category?: string
          created_at?: string
          emoji?: string
          id?: string
          low_stock_threshold?: number
          name?: string
          property_id?: string | null
          sort_order?: number
          stock?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          points: number
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          points: number
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          points?: number
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string
          created_at: string
          icon: string | null
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string
          created_at?: string
          icon?: string | null
          id?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string
          icon?: string | null
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_emoji: string
          item_name: string
          order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_emoji?: string
          item_name: string
          order_id: string
          quantity?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          item_emoji?: string
          item_name?: string
          order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_name: string | null
          assigned_to: string | null
          booking_id: string | null
          created_at: string
          id: string
          property_id: string
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_name?: string | null
          assigned_to?: string | null
          booking_id?: string | null
          created_at?: string
          id?: string
          property_id: string
          status?: string
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_name?: string | null
          assigned_to?: string | null
          booking_id?: string | null
          created_at?: string
          id?: string
          property_id?: string
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          location: string | null
          loyalty_points: number
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          location?: string | null
          loyalty_points?: number
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          location?: string | null
          loyalty_points?: number
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      property_tags: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          reward_points: number
          user_id: string
          uses: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          reward_points?: number
          user_id: string
          uses?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          reward_points?: number
          user_id?: string
          uses?: number
        }
        Relationships: []
      }
      referral_uses: {
        Row: {
          code_id: string
          created_at: string
          credited: boolean
          id: string
          referred_user_id: string
          referrer_user_id: string
        }
        Insert: {
          code_id: string
          created_at?: string
          credited?: boolean
          id?: string
          referred_user_id: string
          referrer_user_id: string
        }
        Update: {
          code_id?: string
          created_at?: string
          credited?: boolean
          id?: string
          referred_user_id?: string
          referrer_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_uses_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      review_responses: {
        Row: {
          content: string
          created_at: string
          host_id: string
          id: string
          review_id: string
        }
        Insert: {
          content: string
          created_at?: string
          host_id: string
          id?: string
          review_id: string
        }
        Update: {
          content?: string
          created_at?: string
          host_id?: string
          id?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string | null
          content: string
          created_at: string
          id: string
          photo_urls: string[]
          property_id: string
          rating: number
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          booking_id?: string | null
          content?: string
          created_at?: string
          id?: string
          photo_urls?: string[]
          property_id: string
          rating: number
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          booking_id?: string | null
          content?: string
          created_at?: string
          id?: string
          photo_urls?: string[]
          property_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      spin_history: {
        Row: {
          id: string
          points_won: number
          prize_emoji: string
          prize_label: string
          spun_at: string
          user_id: string
        }
        Insert: {
          id?: string
          points_won?: number
          prize_emoji?: string
          prize_label: string
          spun_at?: string
          user_id: string
        }
        Update: {
          id?: string
          points_won?: number
          prize_emoji?: string
          prize_label?: string
          spun_at?: string
          user_id?: string
        }
        Relationships: []
      }
      staff_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string
          due_date: string | null
          id: string
          priority: string
          property_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string | null
          id?: string
          priority?: string
          property_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string | null
          id?: string
          priority?: string
          property_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tag_assignments: {
        Row: {
          created_at: string
          id: string
          tag_id: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag_id: string
          target_id: string
          target_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          tag_id?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "property_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      user_milestones: {
        Row: {
          achieved_at: string
          id: string
          milestone_id: string
          user_id: string
        }
        Insert: {
          achieved_at?: string
          id?: string
          milestone_id: string
          user_id: string
        }
        Update: {
          achieved_at?: string
          id?: string
          milestone_id?: string
          user_id?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      wishlists: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_loyalty_points: {
        Args: {
          _icon?: string
          _points: number
          _title: string
          _user_id: string
        }
        Returns: undefined
      }
      create_notification: {
        Args: {
          _body: string
          _icon?: string
          _title: string
          _type: string
          _user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      redeem_loyalty_points: {
        Args: {
          _icon?: string
          _points: number
          _title: string
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "ops_manager" | "host" | "staff"
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
      app_role: ["super_admin", "ops_manager", "host", "staff"],
    },
  },
} as const
